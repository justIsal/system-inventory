import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from '@tanstack/react-router';
import { LogOut, ChevronLeft, ChevronRight, Bell, User as UserIcon } from 'lucide-react';
import { Modal } from '@/components/molecules/Modal';
import { useSocket } from '@/contexts/SocketContext';
import { notificationService, type Notification } from '@/services/api/notificationService';
import { toast } from 'sonner';

export interface SidebarMenuItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

export interface SidebarMenuGroup {
  label?: string;
  items: SidebarMenuItem[];
}

export interface DropdownMenuItem {
  name: string;
  path?: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

export interface DashboardLayoutProps {
  theme: 'admin' | 'staff';
  sidebarTitle: string;
  sidebarSubtitle?: string;
  sidebarMenu: SidebarMenuGroup[];
  baseRoute: string;
  headerTitle: string;
  userInitials: string;
  userName: string;
  userRole: string;
  dropdownItems: DropdownMenuItem[];
  onLogout: () => void;
  logoutIcon: React.ReactNode;
  logoutTitle: string;
  logoutDescription: string;
  logoutWarningText: string;
  logoutConfirmText: string;
}

export const DashboardLayout = ({
  theme,
  sidebarTitle,
  sidebarSubtitle,
  sidebarMenu,
  baseRoute,
  headerTitle,
  userName,
  userRole,
  dropdownItems,
  onLogout,
  logoutIcon,
  logoutTitle,
  logoutDescription,
  logoutWarningText,
  logoutConfirmText,
}: DashboardLayoutProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const {
    incrementUnreadCount,
    decrementUnreadCount,
    setUnreadCount,
    unreadNotifications,
    resetUnreadCount,
  } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Initial fetch of unread notifications
    const getNotifications = async () => {
      try {
        const data = await notificationService.getNotifications(10);
        setNotifications(data.notifications || []);
        if (data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount);
        }
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
    };
    getNotifications();
  }, [setUnreadCount]);

  const markRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => {
          if (n.notification_id === id && !n.is_read) {
            decrementUnreadCount();
            return { ...n, is_read: true };
          }
          return n;
        }),
      );
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const handleNewNotification = (e: Event) => {
      const customEvent = e as CustomEvent<Notification>;
      const notif = customEvent.detail;

      setNotifications((prev) => [notif, ...prev].slice(0, 10)); // keep last 10
      incrementUnreadCount();

      // Show toast
      toast(notif.title, {
        description: notif.message,
        action: {
          label: 'Lihat',
          onClick: () => {
            if (notif.url) {
              navigate({ to: notif.url as never });
              markRead(notif.notification_id);
            }
          },
        },
      });
    };

    window.addEventListener('supabase-notification', handleNewNotification);

    return () => {
      window.removeEventListener('supabase-notification', handleNewNotification);
    };
  }, [incrementUnreadCount, navigate]);

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      resetUnreadCount();
      setIsNotifOpen(false);
    } catch {
      // ignore
    }
  };

  const themeClasses = {
    admin: {
      wrapperBg: 'bg-slate-50 dark:bg-slate-900',
      sidebarBg: 'bg-[#1c2434] dark:bg-slate-950',
      sidebarBorder: 'border-[#293143] dark:border-slate-800',
      sidebarTitle: 'text-white',
      sidebarSubtitle: 'text-slate-400',
      linkActiveBg: 'bg-[#333a48] dark:bg-slate-800',
      linkActiveIconText: 'text-red-400',
      linkHoverBg: 'hover:bg-[#333a48] dark:hover:bg-slate-800 hover:border-top border-red-400',
      linkHoverText: 'text-[#8a99af] hover:text-white',
      dropdownHover:
        'hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-400',
      sidebarToggleHover: 'hover:bg-[#333a48] dark:hover:bg-slate-800',
      sidebarLabel: 'text-[#8a99af]',
    },
    staff: {
      wrapperBg: 'bg-slate-50 dark:bg-slate-900',
      sidebarBg: 'bg-[#1c2434] dark:bg-slate-950',
      sidebarBorder: 'border-[#293143] dark:border-slate-800',
      sidebarTitle: 'text-white',
      sidebarSubtitle: 'text-slate-400',
      linkActiveBg: 'bg-[#333a48] dark:bg-slate-800',
      linkActiveIconText: 'text-red-400',
      linkHoverBg: 'hover:bg-[#333a48] dark:hover:bg-slate-800 hover:border-top border-red-400',
      linkHoverText: 'text-[#8a99af] hover:text-white',
      dropdownHover:
        'hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-400',
      sidebarToggleHover: 'hover:bg-[#333a48] dark:hover:bg-slate-800',
      sidebarLabel: 'text-[#8a99af]',
    },
  };

  const currentTheme = themeClasses[theme];

  const headerButtonStyle =
    'h-10 w-10 flex items-center justify-center rounded-xl border border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:outline-none transition-colors shadow-sm bg-white dark:bg-slate-800';

  return (
    <div className={`flex min-h-screen ${currentTheme.wrapperBg}`}>
      <aside
        className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} flex flex-col shadow-xl z-20 text-white transition-all duration-300 ease-in-out print:hidden ${currentTheme.sidebarBg}`}
      >
        <div
          className={`h-[73px] flex items-center justify-between border-b ${currentTheme.sidebarBorder} ${isSidebarCollapsed ? 'px-0 justify-center' : 'px-6 py-4'}`}
        >
          {!isSidebarCollapsed && (
            <div className="overflow-hidden flex-1">
              <h2
                className={`text-2xl font-bold tracking-wider truncate ${currentTheme.sidebarTitle}`}
              >
                {sidebarTitle}
              </h2>
              {sidebarSubtitle && (
                <p className={`text-xs mt-1 uppercase truncate ${currentTheme.sidebarSubtitle}`}>
                  {sidebarSubtitle}
                </p>
              )}
            </div>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`p-1.5 rounded-md border ${currentTheme.sidebarBorder} transition-colors ${currentTheme.sidebarToggleHover} ${isSidebarCollapsed ? 'border-transparent' : ''}`}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-5 w-5 text-[#8a99af]" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-[#8a99af]" />
            )}
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-3 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {sidebarMenu.map((group, groupIdx) => (
            <div key={groupIdx} className="flex flex-col space-y-1">
              {group.label && !isSidebarCollapsed && (
                <div
                  className={` py-2 text-[11px] font-bold tracking-wider uppercase ${currentTheme.sidebarLabel}`}
                >
                  {group.label}
                </div>
              )}
              {group.label && isSidebarCollapsed && (
                <div className={`mx-auto w-6 border-t ${currentTheme.sidebarBorder} `} />
              )}
              {group.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path as never}
                  activeProps={{
                    className: `active font-semibold text-white ${currentTheme.linkActiveBg}`,
                  }}
                  activeOptions={{ exact: item.path === baseRoute }}
                  className={`group flex items-center ${isSidebarCollapsed ? 'justify-center ' : 'gap-2 '} rounded-md transition-colors ${currentTheme.linkHoverText} ${currentTheme.linkHoverBg}`}
                  title={isSidebarCollapsed ? item.name : undefined}
                >
                  <div
                    className={`shrink-0 p-2 rounded-md transition-colors group-[.active]:bg-white group-[.active]:text-[#1c2434]`}
                  >
                    {item.icon}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="truncate whitespace-nowrap text-sm font-medium">
                      {item.name}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <main
        className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 print:h-auto print:overflow-visible ${currentTheme.wrapperBg}`}
      >
        <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-800 px-8 h-[73px] flex justify-between items-center relative z-10 print:hidden transition-colors">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{headerTitle}</h1>

          <div className="flex items-center gap-3">
            {/* Notification Button */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={headerButtonStyle}
                title="Notifications"
              >
                <Bell className="h-5 w-5 stroke-[2px] " />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white transform translate-x-1/4 -translate-y-1/4"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              <div
                className={`fixed inset-0 z-10 ${isNotifOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
                onClick={() => setIsNotifOpen(false)}
              ></div>
              <div
                className={`absolute z-999 right-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-100 dark:border-slate-700  overflow-hidden transition-all duration-300 origin-top-right ${isNotifOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Notifications
                  </h3>
                  <button
                    onClick={markAllRead}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer font-medium"
                  >
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications?.length > 0 ? (
                    notifications?.map((notif) => (
                      <div
                        key={notif.notification_id}
                        onClick={() => {
                          if (!notif.is_read) markRead(notif.notification_id);
                          if (notif.url) {
                            navigate({ to: notif.url as never });
                            setIsNotifOpen(false);
                          }
                        }}
                        className={`p-4 border-b border-gray-50 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${!notif.is_read ? 'bg-blue-50/30 dark:bg-blue-900/20' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4
                            className={`text-sm ${!notif.is_read ? 'font-semibold text-gray-900 dark:text-gray-100' : 'font-medium text-gray-700 dark:text-gray-300'}`}
                          >
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-gray-400 dark:text-slate-500 whitespace-nowrap ml-2">
                            {new Date(notif.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-sm text-gray-500 dark:text-slate-400">
                      No new notifications
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-gray-100 dark:border-slate-700 text-center bg-gray-50 dark:bg-slate-800/50">
                  <Link
                    to={`/${theme}/notifikasi`}
                    onClick={() => setIsNotifOpen(false)}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            </div>

            {/* User Menu Button */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={headerButtonStyle}
                title="User Profile"
              >
                <UserIcon className="h-5 w-5 stroke-[2px]" />
              </button>

              <div
                className={`fixed inset-0 z-10 ${isDropdownOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
                onClick={() => setIsDropdownOpen(false)}
              ></div>
              <div
                className={`absolute right-0 mt-3 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-100 dark:border-slate-700 py-1 z-20 overflow-hidden transition-all duration-300 origin-top-right ${isDropdownOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{userName}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">
                    {userRole}
                  </p>
                </div>

                <div className="py-1">
                  {dropdownItems.map((item, index) => (
                    <div key={index}>
                      {item.path ? (
                        <Link
                          to={item.path as never}
                          onClick={() => setIsDropdownOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors ${currentTheme.dropdownHover}`}
                        >
                          <span className="text-gray-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {item.icon}
                          </span>{' '}
                          {item.name}
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            if (item.onClick) item.onClick();
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors text-gray-700 dark:text-gray-300 ${currentTheme.dropdownHover}`}
                        >
                          <span className="text-gray-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {item.icon}
                          </span>{' '}
                          {item.name}
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 dark:border-slate-700 pt-1 pb-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <span className="text-red-400 dark:text-red-500 group-hover:text-red-600">
                      <LogOut className="h-4 w-4" />
                    </span>{' '}
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <Modal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          title={logoutTitle}
          description={logoutDescription}
        >
          <div className="mt-4 flex flex-col items-center justify-center p-4">
            {logoutIcon}
            <p className="text-gray-600 text-center mb-6 text-sm font-medium">
              {logoutWarningText}
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  onLogout();
                }}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-sm"
              >
                {logoutConfirmText}
              </button>
            </div>
          </div>
        </Modal>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-900 print:p-0 print:overflow-visible print:bg-white transition-colors">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
