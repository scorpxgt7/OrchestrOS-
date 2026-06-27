import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, ShieldAlert, CheckCircle2, AlertTriangle, Settings } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'critical';
  timestamp: Date;
  read: boolean;
}

export function NotificationCenter({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Agent Auto-Scaled',
      message: 'Support Agent cluster automatically scaled up to handle +20% ticket volume.',
      type: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: false
    },
    {
      id: '2',
      title: 'Policy Violation Blocked',
      message: 'Marketing Agent attempted to post to a restricted social channel.',
      type: 'warning',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false
    },
    {
      id: '3',
      title: 'Workflow Completed',
      message: 'Q3 Financial Report drafted and sent for human review.',
      type: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'success');
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'critical': return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      default: return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="fixed top-16 right-4 sm:right-8 w-[380px] max-w-[calc(100vw-32px)] bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl shadow-2xl z-[51] overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-base)] bg-[var(--bg-base)]">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[var(--text-primary)]" />
                <h3 className="font-bold text-[var(--text-primary)]">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={markAllRead}
                  className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Mark all read
                </button>
                <button onClick={onClose} className="p-1 hover:bg-[var(--bg-surface)] rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`p-4 rounded-lg mb-2 transition-colors flex gap-4 ${notification.read ? 'opacity-75 hover:bg-[var(--bg-base)]' : 'bg-blue-500/5 hover:bg-blue-500/10'}`}
                >
                  <div className="shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold mb-1 ${notification.read ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
                      {notification.title}
                    </h4>
                    <p className="text-sm text-[var(--text-tertiary)] leading-relaxed mb-2">
                      {notification.message}
                    </p>
                    <div className="text-xs text-[var(--text-muted)] font-mono">
                      {Math.floor((Date.now() - notification.timestamp.getTime()) / 60000)} mins ago
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="shrink-0">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    </div>
                  )}
                </div>
              ))}
              
              {notifications.length === 0 && (
                <div className="p-8 text-center text-[var(--text-tertiary)] flex flex-col items-center">
                  <Bell className="w-8 h-8 mb-3 opacity-20" />
                  <p className="text-sm">You're all caught up!</p>
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-[var(--border-base)] bg-[var(--bg-base)] flex justify-center">
              <button 
                className="text-xs font-bold text-blue-500 flex items-center gap-1 hover:text-blue-400 transition-colors"
                onClick={() => {
                  showToast('Opening notification settings...', 'info');
                }}
              >
                <Settings className="w-3.5 h-3.5" />
                Notification Settings
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
