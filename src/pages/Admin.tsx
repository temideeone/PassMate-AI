import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Users, 
  CreditCard, 
  BarChart3, 
  ShieldAlert, 
  Search, 
  Filter, 
  Activity,
  Database,
  TrendingUp,
  PieChart,
  Calendar,
  Download,
  ChevronRight,
  RefreshCw,
  Plus,
  Loader2,
  Ban,
  Sparkles,
  MoreVertical,
  Server,
  Cpu,
  Terminal,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, auth } from "../firebase";
import localConfig from "../../firebase-applet-config.json";
import { collection, getDocs, query, orderBy, limit, doc, updateDoc, where } from "firebase/firestore";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  subscriptionStatus: string;
  createdAt: any;
  role?: string;
}

interface SupportTicket {
  id: string;
  uid: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<"users" | "subscriptions" | "exams" | "support" | "analytics" | "system" | "backend">("analytics");
  const [backendHealth, setBackendHealth] = useState<{ status: string; checkedAt: string } | null>(null);
  const [checkingBackend, setCheckingBackend] = useState(false);

  const checkBackendStatus = async () => {
    setCheckingBackend(true);
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        setBackendHealth({ status: data.status || "healthy", checkedAt: new Date().toLocaleTimeString() });
      } else {
        setBackendHealth({ status: "error", checkedAt: new Date().toLocaleTimeString() });
      }
    } catch (e) {
      setBackendHealth({ status: "offline", checkedAt: new Date().toLocaleTimeString() });
    } finally {
      setCheckingBackend(false);
    }
  };

  useEffect(() => {
    if (activeTab === "backend" && !backendHealth) {
      checkBackendStatus();
    }
  }, [activeTab]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<{
    growth: any[];
    subjects: any[];
    features: any[];
  }>({ growth: [], subjects: [], features: [] });

  const [queryConfig, setQueryConfig] = useState({
    collection: "users",
    email: "",
    status: ""
  });

  const [stats, setStats] = useState([
    { label: "Total Users", value: "0", icon: <Users className="w-5 h-5 text-indigo-600" />, color: "bg-indigo-50" },
    { label: "Active Subs", value: "0", icon: <CreditCard className="w-5 h-5 text-emerald-600" />, color: "bg-emerald-50" },
    { label: "Firestore Reads", value: "0", icon: <Database className="w-5 h-5 text-amber-600" />, color: "bg-amber-50" },
    { label: "Total Revenue", value: "₦0", icon: <BarChart3 className="w-5 h-5 text-purple-600" />, color: "bg-purple-50" },
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Users
      const usersQ = query(collection(db, "users"), limit(500));
      const usersSnapshot = await getDocs(usersQ);
      const userData = usersSnapshot.docs
        .map(doc => doc.data() as UserProfile)
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      setUsers(userData);

      // Fetch Exams
      const examsQ = query(collection(db, "exam_results"), limit(500));
      const examsSnapshot = await getDocs(examsQ);
      const examData = examsSnapshot.docs.map(doc => doc.data());
      const totalExams = examsSnapshot.size;

      // Fetch Analytics Events for feature usage
      const analyticsQ = query(collection(db, "analytics_events"), orderBy("timestamp", "desc"), limit(200));
      const analyticsSnapshot = await getDocs(analyticsQ);
      const eventData = analyticsSnapshot.docs.map(doc => doc.data());

      // Fetch Tickets
      const ticketsQ = query(collection(db, "support_tickets"), orderBy("createdAt", "desc"), limit(50));
      const ticketsSnapshot = await getDocs(ticketsQ);
      const ticketData = ticketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportTicket));
      setTickets(ticketData);

      // Aggregate Growth Data (Signups per day for last 7 days)
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const growthChart = last7Days.map(day => ({
        name: day.split('-').slice(1).join('/'),
        users: userData.filter(u => {
          const dateStr = typeof u.createdAt === 'string' ? u.createdAt : 
                         (u.createdAt?.toDate ? u.createdAt.toDate().toISOString() : 
                         (u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000).toISOString() : String(u.createdAt || "")));
          return dateStr.startsWith(day);
        }).length
      }));

      // Aggregate Subject Data
      const subjectCounts: Record<string, number> = {};
      examData.forEach((ex: any) => {
        const topic = ex.examType || 'Unknown';
        subjectCounts[topic] = (subjectCounts[topic] || 0) + 1;
      });
      const subjectChart = Object.entries(subjectCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Aggregate Feature Usage
      const featureCounts: Record<string, number> = {};
      eventData.forEach((ev: any) => {
        const name = ev.event || 'Unknown';
        featureCounts[name] = (featureCounts[name] || 0) + 1;
      });
      const featureChart = Object.entries(featureCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setAnalyticsData({
        growth: growthChart,
        subjects: subjectChart,
        features: featureChart
      });

      // Calculate Stats Client-Side
      const totalUsers = userData.length;
      const premiumUsers = userData.filter(u => u.subscriptionStatus === 'premium').length;
      const revenue = premiumUsers * 2500;
      
      const estReads = (totalUsers * 10) + (totalExams * 15) + (ticketData.length * 5) + (eventData.length * 2);
      const usagePercent = Math.min(Math.round((estReads / 50000) * 100), 100);

      const statsData = {
        totalUsers,
        premiumUsers,
        estReads,
        revenue,
        usagePercent,
        totalExams
      };

      setAdminStats(statsData);
      setStats([
        { label: "Total Users", value: totalUsers.toString(), icon: <Users className="w-5 h-5 text-indigo-600" />, color: "bg-indigo-50" },
        { label: "Active Subs", value: premiumUsers.toString(), icon: <CreditCard className="w-5 h-5 text-emerald-600" />, color: "bg-emerald-50" },
        { label: "Est. Reads", value: estReads.toLocaleString(), icon: <Database className="w-5 h-5 text-amber-600" />, color: "bg-amber-50" },
        { label: "Total Revenue", value: `₦${revenue.toLocaleString()}`, icon: <BarChart3 className="w-5 h-5 text-purple-600" />, color: "bg-purple-50" },
      ]);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunQuery = async () => {
    setQueryLoading(true);
    try {
      let q = query(collection(db, queryConfig.collection as any), limit(50));
      
      if (queryConfig.email) {
        q = query(collection(db, queryConfig.collection as any), where("email", "==", queryConfig.email), limit(50));
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQueryResults(data);
    } catch (error) {
      console.error("Query error:", error);
    } finally {
      setQueryLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleRole = async (uid: string, currentRole: string | undefined) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await updateDoc(doc(db, "users", uid), { role: newRole });
      setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleUpdateTicketStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "support_tickets", id), { status: newStatus });
      setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full transition-colors duration-300">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${stat.color} dark:bg-opacity-20`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex space-x-1 bg-gray-50 dark:bg-gray-900/50 p-1 rounded-xl overflow-x-auto no-scrollbar">
            {(["analytics", "backend", "users", "subscriptions", "exams", "support", "system"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all capitalize whitespace-nowrap ${
                  activeTab === tab ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                {tab === "backend" ? "Backend & Server" : tab}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            <button 
              onClick={() => fetchData()}
              disabled={loading}
              className="p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button className="p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <Filter className="w-5 h-5" />
            </button>
            {activeTab === "exams" && (
              <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm">
                <Plus className="w-4 h-4" />
                <span>Add Exam</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : activeTab === "system" ? (
            <div className="p-8 max-w-4xl">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Database Recovery Helper</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 font-medium">
                  If your study history is missing, it's likely because you're connected to a different database instance than before.
                  Use this tool to identify where your data is.
                </p>

                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-indigo-100 dark:border-indigo-700">
                    <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">Connected Database</h4>
                    <p className="text-sm font-mono font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 p-2 rounded-lg break-all">
                      {db.app.options.projectId === localConfig.projectId ? localConfig.firestoreDatabaseId : "Environment Variable Override"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800">
                      <h4 className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-2">Expected Data?</h4>
                      <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed mb-4">
                        If you expect data but see nothing, we are likely connected to a fresh database.
                        Your history might be in the <strong>(default)</strong> database.
                      </p>
                      <button 
                        onClick={() => {
                          const url = new URL(window.location.href);
                          url.searchParams.set('force_db', '(default)');
                          window.location.href = url.toString();
                        }}
                        className="w-full py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors"
                      >
                        Try (default) Database Now
                      </button>
                    </div>
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                      <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">Recommendation</h4>
                      <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed mb-4">
                        If the button above works, permanently fix it by adding an environment variable.
                      </p>
                      <div className="p-2 bg-white dark:bg-gray-800 rounded border border-emerald-200 dark:border-emerald-700 text-[10px] font-mono">
                        Key: VITE_FIREBASE_DATABASE_ID<br/>
                        Value: default
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="font-bold text-gray-900 dark:text-white">Debug Info</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-gray-400 uppercase font-black tracking-tighter mb-1">Project ID</p>
                    <p className="font-mono text-gray-900 dark:text-white">{db.app.options.projectId}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-gray-400 uppercase font-black tracking-tighter mb-1">Auth Email</p>
                    <p className="font-mono text-gray-900 dark:text-white">{auth.currentUser?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "backend" ? (
            <div className="p-8 max-w-5xl space-y-8">
              {/* Server Overview Header */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">Node.js Express Server</span>
                  </div>
                  <h3 className="text-2xl font-black">Backend Services & Architecture</h3>
                  <p className="text-slate-300 text-sm mt-1 max-w-xl">
                    Your application runs a full-stack container on port 3000, powering authenticated AI tutoring, study scheduling, Paystack webhooks, and secure Firebase integrations.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <button
                    onClick={checkBackendStatus}
                    disabled={checkingBackend}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${checkingBackend ? 'animate-spin' : ''}`} />
                    Test Ping
                  </button>
                  <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-mono font-bold text-emerald-300">
                      {backendHealth?.status ? `Status: ${backendHealth.status.toUpperCase()}` : "Active (Port 3000)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Endpoints Matrix */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-500" />
                  Live API Endpoints & Handlers
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { method: "POST", path: "/api/ai/chat", desc: "Generates real-time AI tutor responses using Google Gemini models.", auth: "Rate-limited (60/15m)" },
                    { method: "POST", path: "/api/ai/questions", desc: "Generates customized exam practice questions by topic & difficulty.", auth: "Rate-limited" },
                    { method: "POST", path: "/api/ai/schedule", desc: "Generates tailored study plans based on student exam schedule.", auth: "Rate-limited" },
                    { method: "POST", path: "/api/ai/document-exam", desc: "Extracts questions directly from user-uploaded PDFs or documents.", auth: "Rate-limited" },
                    { method: "POST", path: "/api/paystack/webhook", desc: "Listens for verified payment charges to automatically activate subscriptions.", auth: "HMAC Signed" },
                    { method: "POST", path: "/api/email/welcome", desc: "Dispatches onboarding and trial emails via Resend service.", auth: "Rate-limited" },
                    { method: "GET", path: "/api/health", desc: "Container liveness and readiness health check probe.", auth: "Public" },
                  ].map((ep, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/80 rounded-2xl">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black ${ep.method === 'POST' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'}`}>
                            {ep.method}
                          </span>
                          <span className="text-xs font-mono font-bold text-gray-900 dark:text-white">{ep.path}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                          {ep.auth}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">{ep.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Server Configuration & Security */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
                    <Cpu className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Runtime</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Node.js + TSX Engine</p>
                  <p className="text-xs text-gray-500 mt-1">Bound to 0.0.0.0:3000 behind reverse proxy</p>
                </div>

                <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
                    <Database className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Database Link</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{localConfig.firestoreDatabaseId || "(default)"}</p>
                  <p className="text-xs text-gray-500 mt-1">Firebase Admin SDK Singleton</p>
                </div>

                <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">AI Integration</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Google Gen AI SDK</p>
                  <p className="text-xs text-gray-500 mt-1">Gemini 3 Flash with automatic fallback</p>
                </div>
              </div>
            </div>
          ) : activeTab === "analytics" ? (
            <div className="p-6 sm:p-8 space-y-10">
              {/* Usage Progress */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 dark:bg-gray-900/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Database className="w-4 h-4 text-amber-500" />
                      Firestore Free Tier Usage
                    </h3>
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                      {adminStats?.usagePercent ?? 0}% Used
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden mb-4">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${adminStats?.usagePercent ?? 0}%` }}
                      className={`h-full ${(adminStats?.usagePercent ?? 0) > 80 ? 'bg-rose-500' : 'bg-amber-500'}`}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Estimated reads: <span className="font-bold text-gray-900 dark:text-white">{(adminStats?.estReads ?? 0).toLocaleString()}</span> / 50,000 daily free limit.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      Revenue Projection
                    </h3>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                      Monthly
                    </span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-black text-gray-900 dark:text-white">₦{(adminStats?.revenue ?? 0).toLocaleString()}</span>
                    <span className="text-xs text-emerald-500 font-bold mb-1 flex items-center">
                      <ChevronRight className="w-3 h-3 rotate-[-90deg]" />
                      +15%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Based on {adminStats?.premiumUsers ?? 0} active premium subscribers.
                  </p>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    User Growth
                  </h3>
                  <div className="h-[250px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%" minWidth={40} minHeight={40}>
                      <AreaChart data={analyticsData.growth}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="users" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-purple-600" />
                    Popular Subjects
                  </h3>
                  <div className="h-[250px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%" minWidth={40} minHeight={40}>
                      <BarChart data={analyticsData.subjects}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                        <Tooltip 
                          cursor={{fill: '#f8fafc'}}
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {analyticsData.subjects.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'][index % 5]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Feature Popularity
                  </h3>
                  <div className="h-[250px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%" minWidth={40} minHeight={40}>
                      <BarChart data={analyticsData.features} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} width={80} />
                        <Tooltip 
                          cursor={{fill: '#f8fafc'}}
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Advanced Query Interface */}
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
                <div className="p-5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Search className="w-4 h-4 text-indigo-600" />
                    Advanced Data Query
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Collection</label>
                      <select 
                        value={queryConfig.collection}
                        onChange={(e) => setQueryConfig({...queryConfig, collection: e.target.value})}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      >
                        <option value="users">Users</option>
                        <option value="exam_results">Exam Results</option>
                        <option value="support_tickets">Support Tickets</option>
                        <option value="analytics_events">Usage Events (NEW)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Filter by Email</label>
                      <input 
                        type="text" 
                        placeholder="user@example.com"
                        value={queryConfig.email}
                        onChange={(e) => setQueryConfig({...queryConfig, email: e.target.value})}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <button 
                        onClick={handleRunQuery}
                        disabled={queryLoading}
                        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {queryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Run Query
                      </button>
                    </div>
                  </div>

                  {queryResults.length > 0 && (
                    <div className="mt-6 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                      <div className="max-h-80 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 font-bold uppercase tracking-wider">
                            <tr>
                              <th className="px-4 py-3">ID</th>
                              <th className="px-4 py-3">Summary</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {queryResults.map((res) => (
                              <tr key={res.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                                  {res.id.substring(0, 12)}...
                                </td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                  <div className="flex flex-col">
                                    <span className="font-medium text-gray-900 dark:text-white truncate max-w-[300px]">
                                      {res.email || res.event || res.subject || "System Record"}
                                    </span>
                                    <span className="text-[10px] opacity-70">
                                      {res.createdAt || res.timestamp || res.date || "Unknown Date"}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button 
                                    onClick={() => setSelectedRecord(res)}
                                    className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-black uppercase text-[10px] hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                  >
                                    Inspect Data
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Record Detail Modal */}
              <AnimatePresence>
                {selectedRecord && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 max-h-[85vh] flex flex-col overflow-hidden"
                    >
                      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900/40">
                        <div>
                          <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">Record Inspector</h2>
                          <p className="text-xs text-gray-500 font-medium">Internal System Trace ID: {selectedRecord.id}</p>
                        </div>
                        <button 
                          onClick={() => setSelectedRecord(null)}
                          className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-400 hover:text-rose-500"
                        >
                          <Ban className="w-5 h-5 rotate-45" />
                        </button>
                      </div>
                      
                      <div className="p-6 overflow-y-auto">
                        <div className="space-y-4">
                          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/30">
                            <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">Live Data Payload</h4>
                            <pre className="text-xs font-mono text-gray-800 dark:text-gray-200 overflow-x-auto p-3 bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 leading-relaxed">
                              {JSON.stringify(selectedRecord, null, 2)}
                            </pre>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Created At</h4>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {selectedRecord.createdAt || selectedRecord.timestamp || selectedRecord.date || "N/A"}
                              </p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Identity UID</h4>
                              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {selectedRecord.uid || "System/Anonymous"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                        <button 
                          onClick={() => setSelectedRecord(null)}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
                        >
                          Close Inspector
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          ) : activeTab === "support" ? (
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No support tickets found.
                    </td>
                  </tr>
                ) : tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{ticket.userName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{ticket.subject}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{ticket.message}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                        ticket.status === 'open' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {ticket.status === 'open' ? (
                          <button 
                            onClick={() => handleUpdateTicketStatus(ticket.id, 'closed')}
                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            Mark as Closed
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleUpdateTicketStatus(ticket.id, 'open')}
                            className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:underline"
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {(activeTab === "subscriptions" ? users.filter(u => u.subscriptionStatus === 'premium') : users).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      {activeTab === "subscriptions" ? "No premium users found." : "No users found."}
                    </td>
                  </tr>
                ) : (activeTab === "subscriptions" ? users.filter(u => u.subscriptionStatus === 'premium') : users).map((user) => (
                  <tr key={user.uid} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {user.name ? user.name.split(' ').map(n => n[0]).join('') : "U"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                        user.subscriptionStatus === 'premium' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {user.subscriptionStatus || 'free'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleRole(user.uid, user.role)}
                        className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                          user.role === 'admin' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                        }`}
                      >
                        {user.role || 'user'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Ban User">
                          <Ban className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
          <p>Showing {users.length} users</p>
          <div className="flex space-x-2">
            <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50" disabled>Previous</button>
            <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
