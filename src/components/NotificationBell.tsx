'use client';

import { useState, useEffect } from 'react';
import { Bell, Settings, X, Check, CheckCircle2 } from 'lucide-react';
import { requestPushPermission } from '@/lib/fcm';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { getMessaging, onMessage } from 'firebase/messaging';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export default function NotificationBell() {
  const [user] = useAuthState(auth);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    // Load local history
    const saved = localStorage.getItem('cognizance_notifications');
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {}
    }
    
    // Check permission state safely
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
    }
  }, []);

  // Listen for foreground FCM messages
  useEffect(() => {
    if (typeof window === 'undefined' || !hasPermission) return;
    
    import('firebase/messaging').then(({ isSupported, getMessaging, onMessage }) => {
      isSupported().then(supported => {
        if (supported) {
          import('@/lib/firebase').then(({ app }) => {
            const messaging = getMessaging(app);
            onMessage(messaging, (payload) => {
              const newNotif: NotificationItem = {
                id: payload.messageId || Date.now().toString(),
                title: payload.notification?.title || 'System Alert',
                body: payload.notification?.body || '',
                timestamp: new Date().toISOString(),
                read: false,
              };
              
              setNotifications(prev => {
                const updated = [newNotif, ...prev];
                localStorage.setItem('cognizance_notifications', JSON.stringify(updated));
                return updated;
              });
            });
          });
        }
      });
    });
  }, [hasPermission]);

  // Silently sync device token if permission was previously granted
  useEffect(() => {
    if (hasPermission && user?.uid) {
      requestPushPermission(user.uid).catch(console.error);
    }
  }, [hasPermission, user?.uid]);

  const enableNotifications = async () => {
    setIsInitializing(true);
    const token = await requestPushPermission(user?.uid);
    if (token) {
      setHasPermission(true);
    }
    setIsInitializing(false);
  };

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('cognizance_notifications', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setNotifications([]);
    localStorage.removeItem('cognizance_notifications');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl relative transition-colors"
      >
        <Bell className="w-5 h-5 text-white/80" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[9px] font-bold text-black border-2 border-[#09090b]">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-80 sm:w-96 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-black/20">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-500" /> Notifications
            </h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-white/40 hover:text-white transition-colors" title="Mark all as read">
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Opt-in banner */}
          {!hasPermission && (
            <div className="p-4 bg-emerald-900/10 border-b border-emerald-500/20 text-center">
              <p className="text-xs text-white/70 mb-3">Enable neural alerts for real-time skill retention warnings.</p>
              <button 
                onClick={enableNotifications}
                disabled={isInitializing}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
              >
                {isInitializing ? 'Connecting...' : 'Synchronize Device'}
              </button>
            </div>
          )}

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-white/40 flex flex-col items-center gap-2">
                <Bell className="w-8 h-8 opacity-20" />
                <span className="text-xs uppercase tracking-widest font-bold">No active signals</span>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((n) => (
                  <div key={n.id} className={`p-4 transition-colors ${n.read ? 'bg-transparent' : 'bg-white/[0.02]'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.read ? 'bg-white/10' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`} />
                      <div>
                        <p className={`text-sm ${n.read ? 'text-white/60' : 'text-white font-medium'}`}>{n.title}</p>
                        <p className="text-xs text-white/40 mt-1 leading-relaxed">{n.body}</p>
                        <span className="text-[10px] text-white/30 uppercase tracking-widest mt-2 block font-medium">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 border-t border-white/5 bg-black/20 text-center">
              <button onClick={clearHistory} className="text-[10px] font-bold text-white/30 hover:text-white/80 uppercase tracking-widest transition-colors py-1 px-3">
                Clear Archive
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
