import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Bell, Check, AlertCircle, Package, ArrowRight } from 'lucide-react';
import { notificationService, type Notification } from '@/services/api/notificationService';
import { useSocket } from '@/contexts/SocketContext';
import { toast } from 'sonner';

export const NotifikasiPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const navigate = useNavigate();
  const { resetUnreadCount } = useSocket();

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      // Fetch a larger amount for the dedicated page
      const data = await notificationService.getNotifications(50);
      setNotifications(data.notifications || []);
    } catch (err) {
      toast.error('Gagal mengambil data notifikasi');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Listen for realtime updates while on the page
  useEffect(() => {
    // The SocketContext translates Supabase RLS payloads into a generic window-level CustomEvent
    const handleNewNotification = (e: Event) => {
      const customEvent = e as CustomEvent<Notification>;
      setNotifications((prev) => [customEvent.detail, ...prev]);
    };

    window.addEventListener('supabase-notification', handleNewNotification);

    return () => {
      window.removeEventListener('supabase-notification', handleNewNotification);
    };
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.notification_id === id ? { ...n, is_read: true } : n)),
      );
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Gagal menandai notifikasi');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      resetUnreadCount();
      toast.success('Semua notifikasi ditandai sudah dibaca');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Gagal menandai semua notifikasi');
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.is_read) {
      await handleMarkAsRead(notif.notification_id);
    }
    if (notif.url) {
      navigate({ to: notif.url as never });
      // setIsNotifOpen?.(false); // This line was in the instruction but setIsNotifOpen is not defined in this component.
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });
  const getIconForType = (type: string) => {
    switch (type) {
      case 'PO_CREATED':
      case 'PO_RECEIVED':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'DISCREPANCY_DETECTED':
      case 'STOCK_LOW':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'DISCREPANCY_APPROVAL':
        return <Check className="h-5 w-5 text-emerald-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kotak Masuk</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola dan pantau semua pemberitahuan sistem</p>
        </div>

        <div className="flex gap-3">
          <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${filter === 'all' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm font-medium border-l border-r border-gray-200 dark:border-slate-700 transition-colors ${filter === 'unread' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
            >
              Belum Dibaca
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${filter === 'read' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
            >
              Sudah Dibaca
            </button>
          </div>

          <button
            onClick={handleMarkAllAsRead}
            disabled={notifications.filter((n) => !n.is_read).length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Check className="h-4 w-4" />
            Tandai Semua Dibaca
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Memuat notifikasi...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-16 flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <Bell className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Belum ada notifikasi
            </h3>
            <p className="text-gray-500 mt-2 max-w-sm">
              Kamu tidak memiliki notifikasi {filter === 'unread' ? 'baru' : 'di kategori ini'}.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.notification_id}
                className={`group flex items-start gap-4 p-5 transition-colors ${
                  !notif.is_read
                    ? 'bg-blue-50/50 dark:bg-blue-900/10'
                    : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <div
                  className={`mt-1 shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${!notif.is_read ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-gray-100 dark:bg-slate-700'}`}
                >
                  {getIconForType(notif.type)}
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <h4
                      className={`text-base truncate ${!notif.is_read ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}
                    >
                      {notif.title}
                    </h4>
                    <span className="text-xs text-gray-500 shrink-0">
                      {new Date(notif.created_at).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3">
                    {notif.message}
                  </p>

                  {notif.url && (
                    <button
                      onClick={() => handleNotificationClick(notif)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      Lihat Detail <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notif.is_read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notif.notification_id);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                      title="Tandai sudah dibaca"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
