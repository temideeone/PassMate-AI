import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, updateDoc, doc, limit, writeBatch, getDocs } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { Bell, X, Check, Trash2, Info, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'ai';
  read: boolean;
  createdAt: any;
  uid: string;
}

export default function NotificationCenter({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'notifications'),
        where('uid', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      setNotifications(fetched);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user, isOpen]);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    const batch = writeBatch(db);
    notifications.filter(n => !n.read).forEach(n => {
      batch.update(doc(db, 'notifications', n.id), { read: true });
    });
    try {
      await batch.commit();
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      // For now, we'll just mark as read or we could actually delete
      // await deleteDoc(doc(db, 'notifications', id));
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'success': return <Check className="w-4 h-4 text-emerald-500" />;
      case 'ai': return <Sparkles className="w-4 h-4 text-indigo-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20, x: 20 }}
            className="fixed top-20 right-4 sm:right-8 w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl shadow-2xl z-50 border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">You have {unreadCount} unread messages</p>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title="Mark all as read"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                )}
                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <div className="p-10 text-center text-gray-500">Loading...</div>
              ) : notifications.length > 0 ? (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-4 flex gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative group ${!n.read ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                    onClick={() => !n.read && markAsRead(n.id)}
                  >
                    <div className={`mt-1 p-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 flex-shrink-0`}>
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className={`text-sm font-bold ${!n.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          {(() => {
                            if (!n.createdAt) return 'Just now';
                            try {
                              // Handle Firestore Timestamp
                              if (n.createdAt.seconds) {
                                return format(new Date(n.createdAt.seconds * 1000), 'MMM d, h:mm a');
                              }
                              // Handle ISO string or Date object
                              return format(new Date(n.createdAt), 'MMM d, h:mm a');
                            } catch (e) {
                              return 'Just now';
                            }
                          })()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                    {!n.read && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-600 rounded-full" />
                    )}
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">All caught up!</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">No new notifications at the moment.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
              <button className="w-full py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                View All Notifications
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
