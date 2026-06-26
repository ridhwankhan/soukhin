import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, MessageSquare, ShoppingBag, X } from 'lucide-react';
import { fetchAdminNotifications, markMessageRead, AdminNotification } from '../../lib/notificationService';

export default function NotificationPanel() {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminNotifications();
      setNotifications(data.slice(0, 20));
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleNotificationClick = async (notification: AdminNotification) => {
    if (notification.type === 'message' && notification.isUnread) {
      try {
        await markMessageRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isUnread: false } : n))
        );
      } catch {
        // ignore
      }
    }
    setOpen(false);
    navigate(notification.link);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) loadNotifications();
        }}
        className="relative p-2 hover:bg-[#F5F0E8] rounded-full"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-[#666666]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#C2704A] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-[#F5F0E8] z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#F5F0E8]">
              <h3 className="font-semibold text-[#2D2D2D]">Notifications</h3>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-[#F5F0E8] rounded">
                <X className="w-4 h-4 text-[#666666]" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center text-sm text-[#666666]">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-[#666666]">No notifications</div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={`${notification.type}-${notification.id}`}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left px-4 py-3 border-b border-[#F5F0E8] hover:bg-[#F8F6F3] transition-colors ${
                      notification.isUnread ? 'bg-[#1B4332]/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-full h-fit ${
                        notification.type === 'order' ? 'bg-blue-100' : 'bg-amber-100'
                      }`}>
                        {notification.type === 'order' ? (
                          <ShoppingBag className="w-4 h-4 text-blue-600" />
                        ) : (
                          <MessageSquare className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#2D2D2D] truncate">{notification.title}</p>
                        <p className="text-xs text-[#666666] line-clamp-2">{notification.body}</p>
                        <p className="text-[10px] text-[#999999] mt-1">
                          {new Date(notification.createdAt).toLocaleString('en-GB')}
                        </p>
                      </div>
                      {notification.isUnread && (
                        <span className="w-2 h-2 bg-[#C2704A] rounded-full mt-2 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="px-4 py-2 border-t border-[#F5F0E8] bg-[#F8F6F3]">
              <Link
                to="/admin/messages"
                onClick={() => setOpen(false)}
                className="text-xs text-[#1B4332] hover:underline"
              >
                View all messages →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
