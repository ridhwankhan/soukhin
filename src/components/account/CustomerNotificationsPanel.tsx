import { useEffect, useState } from 'react';
import { Bell, Ticket, Tag } from 'lucide-react';
import {
  fetchMyNotifications,
  markNotificationRead,
  getUnreadNotificationCount,
} from '../../lib/customerNotificationService';
import { CustomerNotification } from '../../types';

function typeIcon(type: CustomerNotification['notificationType']) {
  if (type === 'voucher') return Ticket;
  if (type === 'promo') return Tag;
  return Bell;
}

export default function CustomerNotificationsPanel() {
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [list, count] = await Promise.all([
        fetchMyNotifications(),
        getUnreadNotificationCount(),
      ]);
      setNotifications(list);
      setUnreadCount(count);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleRead = async (n: CustomerNotification) => {
    if (!n.isRead) {
      await markNotificationRead(n.id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  };

  if (loading) {
    return (
      <div className="bg-elevated rounded-lg shadow-sm p-6">
        <p className="text-sm text-ink-secondary">Loading notifications…</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="bg-elevated rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-accent" />
        <h2 className="font-semibold text-ink">Notifications</h2>
        {unreadCount > 0 && (
          <span className="px-2 py-0.5 text-xs font-medium bg-accent text-white rounded-full">
            {unreadCount} new
          </span>
        )}
      </div>
      <div className="space-y-3">
        {notifications.map((n) => {
          const Icon = typeIcon(n.notificationType);
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => void handleRead(n)}
              className={`w-full text-left p-4 rounded border transition-colors ${
                n.isRead ? 'border-line bg-canvas' : 'border-accent/30 bg-accent/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-ink">{n.title}</p>
                  <p className="text-sm text-ink-secondary mt-1 whitespace-pre-wrap">{n.body}</p>
                  {n.couponCode && (
                    <p className="mt-2 inline-block px-2 py-1 bg-elevated border border-line rounded font-mono text-sm text-accent">
                      {n.couponCode}
                    </p>
                  )}
                  <p className="text-xs text-ink-muted mt-2">
                    {new Date(n.createdAt).toLocaleDateString('en-GB')}
                    {n.sentBy && ` · from ${n.sentBy}`}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
