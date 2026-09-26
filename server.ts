import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import crypto from "crypto";
import fs from "fs";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { getFirestore } from "firebase-admin/firestore";
import { GoogleGenAI } from "@google/genai";
import { Resend } from "resend";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Firebase Admin Initialization (Singleton pattern)
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
if (!fs.existsSync(firebaseConfigPath)) {
  console.error("firebase-applet-config.json not found");
  process.exit(1);
}
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf8"));

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: firebaseConfig.projectId,
    });
    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
  }
}

const db = getFirestore(firebaseConfig.firestoreDatabaseId || "(default)");

// 2. Validation Schemas
const HistoryMessageSchema = z.object({
  role: z.enum(["user", "assistant", "model"]).or(z.string()),
  content: z.string().max(10000).optional(),
  parts: z.array(z.object({
    text: z.string().optional(),
    inlineData: z.any().optional(),
  })).optional(),
});

const ChatSchema = z.object({
  message: z.string().min(1).max(5000),
  history: z.array(HistoryMessageSchema).max(50).default([]),
  file: z.object({
    data: z.string().max(10000000), // ~7MB base64
    mimeType: z.string()
  }).optional()
});

const QuestionsSchema = z.object({
  topic: z.string().min(1).max(200),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  count: z.number().int().min(1).max(50).default(5)
});

const ScheduleSchema = z.object({
  exams: z.array(z.any()).default([]),
  preferences: z.string().max(1000).optional().default("Focus on morning sessions, 1 hour each.")
});

const DocumentExamSchema = z.object({
  fileBase64: z.string().min(1).max(10000000), // ~7MB base64
  mimeType: z.string().min(1),
  count: z.number().int().min(1).max(50).default(5)
});

const WelcomeEmailSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email()
});

// 3. Main Server
async function startServer() {
  const app = express();
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === "production";

  // Trust Cloud Run / reverse proxy for accurate IP and rate-limiting
  app.set("trust proxy", 1);

  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: isProd ? undefined : false,
  }));
  
  app.use(cors({
    origin: isProd ? (process.env.APP_URL || []) : "*",
    methods: ["GET", "POST"],
  }));

  // Rate Limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, forwardedHeader: false },
    message: { error: "Too many requests." }
  });

  const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    validate: { xForwardedForHeader: false, forwardedHeader: false },
    message: { error: "AI quota reached. Please wait 15 minutes." }
  });

  const emailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 10,
    validate: { xForwardedForHeader: false, forwardedHeader: false },
    message: { error: "Too many email requests. Try again later." }
  });

  app.use("/api/", apiLimiter);
  app.use("/api/ai/", aiLimiter);
  app.use("/api/email/", emailLimiter);

  // 4. Paystack Webhook (Raw Body required for signature verification)
  app.post("/api/paystack/webhook", express.raw({ type: "application/json" }), async (req: any, res) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) return res.sendStatus(500);

    const signature = req.headers["x-paystack-signature"];
    const hash = crypto.createHmac("sha512", secret).update(req.body).digest("hex");

    if (hash !== signature) {
      return res.sendStatus(400);
    }

    try {
      const event = JSON.parse(req.body.toString());
      if (event.event === "charge.success") {
        const { customer, metadata, reference } = event.data;
        const uid = metadata?.uid;

        if (uid) {
          await db.collection("users").doc(uid).update({
            subscriptionStatus: "premium",
            subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            lastPaymentRef: reference
          });
          if (!isProd) console.log(`User ${uid} upgraded to premium via webhook`);
        }
      }
      res.sendStatus(200);
    } catch (err) {
      if (!isProd) console.error("Webhook processing error:", err);
      res.sendStatus(500);
    }
  });

  // General Body Parsers
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

  const getGeminiKey = () => {
    const key = (
      process.env.CUSTOM_GEMINI_API_KEY ||
      process.env.MY_GEMINI_KEY ||
      process.env.USER_GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GEMINI_API_KEY
    )?.trim();
    if (!key || key.includes("YOUR_") || key.length < 10) {
      throw new Error("AI configuration missing.");
    }
    return key;
  };

  const formatAiError = (error: any, fallbackMessage: string) => {
    const errorStr = typeof error?.message === "string" ? error.message : JSON.stringify(error || "");
    if (errorStr.includes("API_KEY_INVALID") || errorStr.includes("API key not valid")) {
      return "The configured Gemini API key is invalid or expired. Please update GEMINI_API_KEY in Settings > Secrets.";
    }
    if (errorStr.includes("RESOURCE_EXHAUSTED") || errorStr.includes("quota")) {
      return "Gemini API rate limit or quota exceeded. Please wait a moment and try again.";
    }
    if (errorStr.includes("503") || errorStr.includes("high demand") || errorStr.includes("UNAVAILABLE")) {
      return "The AI model is temporarily experiencing high demand. Please try again in a few moments.";
    }
    if (errorStr.includes("timed out")) {
      return "AI request timed out. Please try again.";
    }
    return error?.message || fallbackMessage;
  };

  const withTimeout = async <T>(promise: Promise<T>, timeoutMs = 35000): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error("AI request timed out")), timeoutMs))
    ]);
  };

  const generateWithFallback = async (ai: GoogleGenAI, config: any) => {
    // Use modern Gemini 3 series models: gemini-3.6-flash (workhorse) and gemini-3.8-flash
    const models = ["gemini-3.6-flash", "gemini-3.8-flash"];
    let lastError: any = null;

    for (const model of models) {
      try {
        const result = await withTimeout(ai.models.generateContent({
          ...config,
          model,
        }));
        return result;
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || "");
        const isTransient = msg.includes("503") ||
                            msg.includes("404") ||
                            msg.includes("high demand") ||
                            msg.includes("UNAVAILABLE") ||
                            msg.includes("RESOURCE_EXHAUSTED") ||
                            msg.includes("temporarily unavailable") ||
                            msg.includes("timed out");
        if (isTransient) {
          console.warn(`[AI] Model ${model} encountered transient or availability issue (${msg.slice(0, 120)}). Trying fallback...`);
          await new Promise((resolve) => setTimeout(resolve, 800));
          continue;
        }
        throw err;
      }
    }
    throw lastError;
  };

  // 5. AI Endpoints
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const validated = ChatSchema.parse(req.body);
      const apiKey = getGeminiKey();
      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = "You are PassMate AI, a helpful and encouraging EdTech tutor. Your goal is to help students understand complex concepts, practice for exams, and stay motivated.";
      const userParts: any[] = [{ text: validated.message }];
      
      if (validated.file) {
        userParts.push({
          inlineData: {
            data: validated.file.data,
            mimeType: validated.file.mimeType
          }
        });
      }

      const contents = [
        ...validated.history.map((msg: any) => {
          const role = (msg.role === "assistant" || msg.role === "model") ? "model" : "user";
          const text = typeof msg.content === "string" ? msg.content : (msg.parts?.[0]?.text || "");
          return {
            role,
            parts: [{ text }]
          };
        }),
        { role: "user", parts: userParts }
      ];

      const result = await generateWithFallback(ai, {
        contents,
        config: {
          systemInstruction: { parts: [{ text: systemInstruction }] },
          temperature: 0.7,
        }
      });

      res.json({ text: result.text });
    } catch (error: any) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: "Invalid request data", details: error.issues });
      if (!isProd) console.error("Chat Error:", error);
      res.status(500).json({ error: formatAiError(error, "AI tutor is currently unavailable.") });
    }
  });

  app.post("/api/ai/questions", async (req, res) => {
    try {
      const { topic, difficulty, count } = QuestionsSchema.parse(req.body);
      const apiKey = getGeminiKey();
      const ai = new GoogleGenAI({ apiKey });

      const result = await generateWithFallback(ai, {
        contents: [{ parts: [{ text: `Generate ${count} ${difficulty} multiple-choice questions for: ${topic}.` }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                question: { type: "STRING" },
                options: { type: "ARRAY", items: { type: "STRING" } },
                correctAnswer: { type: "STRING" },
                explanation: { type: "STRING" }
              },
              required: ["question", "options", "correctAnswer", "explanation"]
            }
          }
        }
      });
      res.json(JSON.parse(result.text || "[]"));
    } catch (error: any) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: "Invalid request data", details: error.issues });
      if (!isProd) console.error("Questions Error:", error);
      res.status(500).json({ error: formatAiError(error, "Failed to generate questions.") });
    }
  });

  app.post("/api/ai/schedule", async (req, res) => {
    try {
      const { exams, preferences } = ScheduleSchema.parse(req.body);
      const apiKey = getGeminiKey();
      const ai = new GoogleGenAI({ apiKey });

      const examsContext = Array.isArray(exams) && exams.length > 0
        ? `Upcoming exams/topics to prepare for: ${JSON.stringify(exams)}`
        : `No specific upcoming exams submitted. Build a comprehensive, balanced 7-day study and revision schedule covering key subject areas.`;

      const prompt = `Create a 7-day study schedule. ${examsContext}. Student preferences: ${preferences || "Focus on morning sessions, 1 hour each."}.
Generate daily schedule items. Each item must have:
- title: string describing the study block or exam
- date: YYYY-MM-DD date string within the next 7 days
- type: "exam" or "reminder"
- color: "bg-indigo-500", "bg-rose-500", "bg-emerald-500", "bg-amber-500", or "bg-purple-500"`;

      const result = await generateWithFallback(ai, {
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                date: { type: "STRING" },
                type: { type: "STRING", enum: ["exam", "reminder"] },
                color: { type: "STRING" }
              },
              required: ["title", "date", "type", "color"]
            }
          }
        }
      });
      res.json(JSON.parse(result.text || "[]"));
    } catch (error: any) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: "Invalid request data", details: error.issues });
      if (!isProd) console.error("Schedule Error:", error);
      res.status(500).json({ error: formatAiError(error, "Failed to generate schedule.") });
    }
  });

  app.post("/api/ai/document-exam", async (req, res) => {
    try {
      const { fileBase64, mimeType, count } = DocumentExamSchema.parse(req.body);
      const apiKey = getGeminiKey();
      const ai = new GoogleGenAI({ apiKey });

      const result = await generateWithFallback(ai, {
        contents: [{
          parts: [
            { inlineData: { data: fileBase64, mimeType: mimeType } },
            { text: `Generate ${count} questions from this document.` }
          ]
        }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                question: { type: "STRING" },
                options: { type: "ARRAY", items: { type: "STRING" } },
                correctAnswer: { type: "STRING" },
                explanation: { type: "STRING" }
              },
              required: ["question", "options", "correctAnswer", "explanation"]
            }
          }
        }
      });
      res.json(JSON.parse(result.text || "[]"));
    } catch (error: any) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: "Invalid request data", details: error.issues });
      if (!isProd) console.error("Document Exam Error:", error);
      res.status(500).json({ error: formatAiError(error, "Failed to process document.") });
    }
  });

  // 6. Emails
  app.post("/api/email/welcome", async (req, res) => {
    try {
      const { name, email } = WelcomeEmailSchema.parse(req.body);
      if (!resend) return res.status(503).json({ error: "Email service unavailable" });

      const appUrl = process.env.APP_URL || "https://passmate.ai";
      const { error } = await resend.emails.send({
        from: "PassMate AI <welcome@resend.dev>",
        to: [email],
        subject: `Welcome to PassMate AI, ${name}!`,
        html: `<p>Welcome, ${name}! Your trial is active. <a href="${appUrl}">Login here</a></p>`
      });

      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: error.issues });
      if (!isProd) console.error("Email Error:", error);
      res.status(500).json({ error: "Failed to send welcome email." });
    }
  });

  // 7. Security: Restrict Debug Endpoints
  if (!isProd) {
    app.get("/api/debug/key", (req, res) => {
      try {
        const key = getGeminiKey();
        res.json({ status: "found", length: key.length });
      } catch (e) {
        res.json({ status: "missing" });
      }
    });
  }

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // 8. Frontend Integration
  if (!isProd) {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Critical server failure:", err);
  process.exit(1);
});
