import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  MessageSquare, 
  GraduationCap, 
  CreditCard, 
  User, 
  LogOut,
  BookOpen,
  CheckCircle,
  Bell,
  Search,
  Menu,
  X,
  Calendar,
  Sun,
  Moon,
  Sparkles,
  ArrowRight,
  FileText,
  ShieldAlert,
  Database,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { signOut } from "firebase/auth";
import { auth, db, getIsOffline } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import NotificationCenter from "./NotificationCenter";
import StudyReminder from "./StudyReminder";
import SubscriptionReminder from "./SubscriptionReminder";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [firestoreOffline, setFirestoreOffline] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  useEffect(() => {
    // Check if firestore is offline every few seconds
    const interval = setInterval(() => {
      setFirestoreOffline(getIsOffline());
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  const { theme, toggleTheme } = useTheme();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchUnreadCount = async () => {
      try {
        const q = query(
          collection(db, 'notifications'), 
          where('uid', '==', user.uid), 
          where('read', '==', false)
        );
        const snapshot = await getDocs(q);
        setUnreadCount(snapshot.docs.length);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s instead of live stream to avoid assertion errors

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const isAdmin = useMemo(() => {
    const email = user?.email?.toLowerCase();
    const result = profile?.role === "admin" || email === "dayosamuel54@gmail.com";
    if (user) {
      console.log(`[Layout] isAdmin: ${result} | Email: ${email} | Role: ${profile?.role}`);
    }
    return result;
  }, [profile, user]);

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "AI Chat", href: "/chat", icon: <MessageSquare className="w-5 h-5" /> },
    { name: "Practice", href: "/exams", icon: <GraduationCap className="w-5 h-5" /> },
    { name: "Document Analysis", href: "/document-exam", icon: <FileText className="w-5 h-5" /> },
    { name: "Study Planner", href: "/planner", icon: <Calendar className="w-5 h-5" /> },
    { name: "Subscription", href: "/subscription", icon: <CreditCard className="w-5 h-5" /> },
    { name: "Support", href: "/support", icon: <MessageSquare className="w-5 h-5" /> },
    { name: "Profile", href: "/profile", icon: <User className="w-5 h-5" /> },
  ];

  if (isAdmin) {
    navLinks.push({ name: "Admin", href: "/admin", icon: <ShieldAlert className="w-5 h-5" /> });
  }

  const searchResults = [
    { title: "Calculus Practice", type: "Exam", href: "/exams?topic=calculus" },
    { title: "AI Tutor Chat", type: "Feature", href: "/chat" },
    { title: "Study Schedule", type: "Planner", href: "/planner" },
    { title: "Biology Notes", type: "Topic", href: "/chat?q=biology" },
  ].filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-300">
      <StudyReminder />
      <SubscriptionReminder />
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden lg:flex flex-col fixed h-full">
        <div className="p-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="relative">
              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <CheckCircle className="w-4 h-4 text-green-500 absolute -top-1 -right-1 bg-white dark:bg-gray-800 rounded-full" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">PassMate AI</span>
          </Link>
        </div>

        <nav className="flex-grow px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                location.pathname === link.href
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }`}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-xl font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow lg:ml-64 flex flex-col min-h-screen">
        {/* Connection Warning Banner */}
        {firestoreOffline && (
          <div className="bg-rose-600 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-2 z-50 sticky top-0 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
              <span>Database Connection Issue (Offline)</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  const url = new URL(window.location.href);
                  // Remove the force_db param to fallback to local config's named DB
                  url.searchParams.delete('force_db');
                  window.location.href = url.toString();
                }}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[10px] uppercase font-black tracking-widest transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" />
                Reset to App Settings
              </button>
              <button 
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('force_db', '(default)');
                  window.location.href = url.toString();
                }}
                className="px-3 py-1 bg-black/20 hover:bg-black/30 rounded-lg text-[10px] uppercase font-black tracking-widest transition-colors flex items-center gap-1.5"
              >
                <Database className="w-3 h-3" />
                Try (default) DB
              </button>
            </div>
          </div>
        )}
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10 transition-colors duration-300">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 mr-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center relative" ref={searchRef}>
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg w-64 md:w-96">
                <Search className="w-4 h-4 text-gray-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search topics, exams..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  className="bg-transparent border-none focus:ring-0 text-sm w-full dark:text-white dark:placeholder-gray-400" 
                />
              </div>
              
              {/* Search Results Dropdown */}
              <AnimatePresence>
                {isSearchOpen && searchQuery.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
                  >
                    <div className="p-2">
                      {searchResults.length > 0 ? (
                        searchResults.map((result, i) => (
                          <Link
                            key={i}
                            to={result.href}
                            onClick={() => {
                              setIsSearchOpen(false);
                              setSearchQuery("");
                            }}
                            className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                <Search className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{result.title}</p>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold">{result.type}</p>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                          </Link>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400">No results found for "{searchQuery}"</p>
                          <button 
                            onClick={() => navigate(`/chat?q=${searchQuery}`)}
                            className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            Ask AI Tutor about this
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 text-[10px] text-white flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {isAdmin && (
              <Link 
                to="/admin" 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 rounded-full text-xs font-bold transition-all shadow-xs"
                title="Admin Control Center & Backend"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">Admin Center</span>
              </Link>
            )}
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
              {profile?.name ? profile.name.substring(0, 2).toUpperCase() : "PM"}
            </div>
          </div>
        </header>

        <NotificationCenter isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />

        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 py-8 px-4 sm:px-8 transition-colors duration-300">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">PassMate AI</span>
            </div>
            <div className="flex flex-wrap justify-center space-x-6">
              <Link to="/terms" className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</Link>
              <Link to="/cookies" className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Cookie Policy</Link>
              <Link to="/support" className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Support</Link>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">© 2026 PassMate AI. All rights reserved.</p>
          </div>
        </footer>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 z-50 lg:hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="relative">
                    <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    <CheckCircle className="w-4 h-4 text-green-500 absolute -top-1 -right-1 bg-white dark:bg-gray-800 rounded-full" />
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">PassMate AI</span>
                </Link>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-grow px-4 space-y-1 overflow-y-auto custom-scrollbar">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                      location.pathname === link.href
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </Link>
                ))}
              </nav>

              <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 w-full text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-xl font-medium transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
