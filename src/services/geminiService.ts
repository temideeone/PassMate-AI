export const getTutorResponse = async (
  message: string, 
  history: any[] = [],
  file?: { data: string; mimeType: string }
) => {
  try {
    const formattedHistory = (history || []).map((item) => {
      const role = item.role === "assistant" || item.role === "model" ? "model" : "user";
      let content = typeof item.content === "string" ? item.content : "";
      if (!content && Array.isArray(item.parts) && item.parts.length > 0) {
        content = item.parts[0]?.text || "";
      }
      return {
        role,
        content,
        parts: [{ text: content }]
      };
    });

    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        message: message?.trim() || "Hello", 
        history: formattedHistory, 
        file 
      }),
    });

    const bodyText = await response.text();
    let data: any = null;
    try {
      data = JSON.parse(bodyText);
    } catch (e) {
      // Not JSON
    }

    if (!response.ok) {
      const errorMsg = data?.error || bodyText || "Failed to get AI response";
      throw new Error(errorMsg);
    }

    return data?.text || bodyText || "I'm sorry, I couldn't parse the AI response.";
  } catch (error: any) {
    console.error("AI Tutor error:", error);
    throw error;
  }
};

export const generatePracticeQuestions = async (topic: string, difficulty: string = "medium", count: number = 5) => {
  try {
    const response = await fetch("/api/ai/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, difficulty, count }),
    });
    
    const bodyText = await response.text();
    let data: any = null;
    try {
      data = JSON.parse(bodyText);
    } catch (e) {
      // Not JSON
    }

    if (!response.ok) {
      const errorMsg = data?.error || bodyText || "Failed to generate questions";
      throw new Error(errorMsg);
    }
    
    return data || [];
  } catch (error) {
    console.error("Practice Questions error:", error);
    throw error;
  }
};

export const generateAISchedule = async (exams: any[], preferences: string = "") => {
  try {
    const response = await fetch("/api/ai/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exams, preferences }),
    });

    const bodyText = await response.text();
    let data: any = null;
    try {
      data = JSON.parse(bodyText);
    } catch (e) {
      // Not JSON
    }

    if (!response.ok) {
      const errorMsg = data?.error || bodyText || "Failed to generate schedule";
      throw new Error(errorMsg);
    }

    return data || [];
  } catch (error) {
    console.error("Schedule error:", error);
    throw error;
  }
};

export const generateExamFromDocument = async (fileBase64: string, mimeType: string, count: number = 5) => {
  try {
    const response = await fetch("/api/ai/document-exam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileBase64, mimeType, count }),
    });

    const bodyText = await response.text();
    let data: any = null;
    try {
      data = JSON.parse(bodyText);
    } catch (e) {
      // Not JSON
    }

    if (!response.ok) {
      const errorMsg = data?.error || bodyText || "Failed to generate document exam";
      throw new Error(errorMsg);
    }

    return data || [];
  } catch (error) {
    console.error("Document Exam error:", error);
    throw error;
  }
};
