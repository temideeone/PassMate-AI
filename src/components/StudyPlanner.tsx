import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, where, orderBy, deleteDoc, doc, Timestamp, getDocs } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { Calendar, Plus, Trash2, Clock, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import UpgradeModal from './UpgradeModal';

interface StudyItem {
  id: string;
  title: string;
  date: string;
  type: 'exam' | 'reminder';
  color: string;
  uid: string;
}

export default function StudyPlanner({ limit }: { limit?: number }) {
  const { user, profile, isTrialActive } = useAuth();
  const [items, setItems] = useState<StudyItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const isPremium = profile?.subscriptionStatus === 'premium' || profile?.role === 'admin';
  const canModifyPlanner = isPremium || isTrialActive;
  
  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<'exam' | 'reminder'>('reminder');
  const [color, setColor] = useState('bg-indigo-500');

  const colors = [
    { name: 'Indigo', value: 'bg-indigo-500' },
    { name: 'Rose', value: 'bg-rose-500' },
    { name: 'Emerald', value: 'bg-emerald-500' },
    { name: 'Amber', value: 'bg-amber-500' },
    { name: 'Purple', value: 'bg-purple-500' },
  ];

  const fetchItems = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'study_schedule'),
        where('uid', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      const fetchedItems = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()) as StudyItem[];
      
      setItems(fetchedItems);
    } catch (error) {
      console.error("Error fetching study schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert("You must be logged in to save events.");
      return;
    }

    if (!canModifyPlanner) {
      setIsUpgradeModalOpen(true);
      return;
    }
    
    if (!title || !date) {
      alert("Please fill in all required fields.");
      return;
    }

    const data = {
      uid: user.uid,
      title,
      date: new Date(date).toISOString(),
      type,
      color,
      createdAt: new Date().toISOString()
    };
    
    try {
      await addDoc(collection(db, 'study_schedule'), data);
      setTitle('');
      setDate('');
      setIsModalOpen(false);
      fetchItems(); // Refresh after add
    } catch (error: any) {
      console.error("Error adding study item:", error);
      alert("Failed to save event. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!canModifyPlanner) {
      setIsUpgradeModalOpen(true);
      return;
    }
    try {
      await deleteDoc(doc(db, 'study_schedule', id));
      fetchItems(); // Refresh after delete
    } catch (error) {
      console.error("Error deleting study item:", error);
    }
  };

  const displayedItems = limit ? items.slice(0, limit) : items;

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl" />)}
    </div>;
  }

  return (
    <div className="space-y-4 transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Study Schedule</h3>
        {!limit && (
          <button 
            onClick={() => {
              if (!canModifyPlanner) setIsUpgradeModalOpen(true);
              else setIsModalOpen(true);
            }}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayedItems.length > 0 ? (
          displayedItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.title}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                    {item.type} • {format(new Date(item.date), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
              {!limit && (
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-2xl">
            <Calendar className="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
            <p className="text-xs text-gray-400 dark:text-gray-500">No upcoming events</p>
          </div>
        )}

        {limit && items.length > limit && (
          <Link to="/planner" className="block text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline mt-2">
            View All Schedule
          </Link>
        )}

        {limit && (
          <button 
            onClick={() => {
              if (!canModifyPlanner) setIsUpgradeModalOpen(true);
              else setIsModalOpen(true);
            }}
            className="w-full py-2 mt-2 text-sm font-bold text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl hover:border-gray-200 dark:hover:border-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Reminder
          </button>
        )}
      </div>

      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
      />

      {/* Add Item Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Study Event</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleAdd} className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Event Title</label>
                  <input 
                    type="text" 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Calculus Final, Chemistry Study"
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white dark:placeholder-gray-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Type</label>
                    <select 
                      value={type}
                      onChange={(e) => setType(e.target.value as 'exam' | 'reminder')}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    >
                      <option value="reminder">Reminder</option>
                      <option value="exam">Exam</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Date & Time</label>
                    <input 
                      type="datetime-local" 
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Label Color</label>
                  <div className="flex gap-3">
                    {colors.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setColor(c.value)}
                        className={`w-8 h-8 rounded-full ${c.value} transition-transform ${color === c.value ? 'scale-125 ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500' : 'hover:scale-110'}`}
                      />
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
                >
                  Save Event
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
