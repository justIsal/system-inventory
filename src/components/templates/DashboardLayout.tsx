import { useState } from 'react';
import { Link, Outlet } from '@tanstack/react-router';
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  User as UserIcon,
} from 'lucide-react';
import { Modal } from '@/components/molecules/Modal';

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

  // Dummy notifications
  const notifications = [
    {
      id: 1,
      title: 'Stok Menipis',
      message: 'Barang A sisa 5 unit.',
      time: '10 menit lalu',
      isRead: false,
    },
    {
      id: 2,
      title: 'Barang Masuk',
      message: '100 unit Barang B telah diterima.',
      time: '1 jam lalu',
      isRead: true,
    },
    {
      id: 3,
      title: 'Permintaan Relokasi',
      message: 'Relokasi Barang C dari Gudang 1 ke Gudang 2 selesai.',
      time: 'Kemarin',
      isRead: true,
    },
  ];

  const themeClasses = {
    admin: {
      wrapperBg: 'bg-slate-50',
      sidebarBg: 'bg-[#1c2434]',
      sidebarBorder: 'border-[#293143]',
      sidebarTitle: 'text-white',
      sidebarSubtitle: 'text-slate-400',
      linkActiveBg: 'bg-[#333a48]',
      linkActiveIconText: 'text-red-400',
      linkHoverBg: 'hover:bg-[#333a48] hover:border-top border-red-400',
      linkHoverText: 'text-[#8a99af] hover:text-white',
      dropdownHover: 'hover:bg-indigo-50 hover:text-indigo-700',
      sidebarToggleHover: 'hover:bg-[#333a48]',
      sidebarLabel: 'text-[#8a99af]',
    },
    staff: {
      wrapperBg: 'bg-slate-50',
      sidebarBg: 'bg-[#1c2434]',
      sidebarBorder: 'border-[#293143]',
      sidebarTitle: 'text-white',
      sidebarSubtitle: 'text-slate-400',
      linkActiveBg: 'bg-[#333a48]',
      linkActiveIconText: 'text-red-400',
      linkHoverBg: 'hover:bg-[#333a48] hover:border-top border-red-400',
      linkHoverText: 'text-[#8a99af] hover:text-white',
      dropdownHover: 'hover:bg-indigo-50 hover:text-indigo-700',
      sidebarToggleHover: 'hover:bg-[#333a48]',
      sidebarLabel: 'text-[#8a99af]',
    },
  };

  const currentTheme = themeClasses[theme];

  const headerButtonStyle =
    'h-10 w-10 flex items-center justify-center rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 focus:outline-none transition-colors shadow-sm bg-white';

  return (
    <div className={`flex min-h-screen ${currentTheme.wrapperBg}`}>
      <aside
        className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} flex flex-col shadow-xl z-20 text-white transition-all duration-300 ease-in-out ${currentTheme.sidebarBg}`}
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
                  to={item.path as any}
                  activeProps={{
                    className: `active font-semibold text-white ${currentTheme.linkActiveBg}`,
                  }}
                  activeOptions={{ exact: item.path === baseRoute }}
                  className={`group flex items-center ${isSidebarCollapsed ? 'justify-center ' : 'gap-2 '} rounded-md transition-colors ${currentTheme.linkHoverText} ${currentTheme.linkHoverBg}`}
                  title={isSidebarCollapsed ? item.name : undefined}
                >
                  <div
                    className={`flex-shrink-0 p-2 rounded-md transition-colors group-[.active]:bg-white group-[.active]:text-[#1c2434]`}
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
        className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${currentTheme.wrapperBg}`}
      >
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 h-[73px] flex justify-between items-center relative z-10">
          <h1 className="text-xl font-semibold text-gray-800">{headerTitle}</h1>

          <div className="flex items-center gap-3">
            {/* Notification Button */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={headerButtonStyle}
                title="Notifications"
              >
                <Bell className="h-5 w-5 stroke-[2px] " />
                {notifications.filter((n) => !n.isRead).length > 0 && (
                  <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white transform translate-x-1/4 -translate-y-1/4"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              <div
                className={`fixed inset-0 z-10 ${isNotifOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
                onClick={() => setIsNotifOpen(false)}
              ></div>
              <div
                className={`absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-20 overflow-hidden transition-all duration-300 origin-top-right ${isNotifOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
              >
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                  <span className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                    Mark all as read
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4
                            className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}
                          >
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2">{notif.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-sm text-gray-500">
                      No new notifications
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-gray-100 text-center bg-gray-50">
                  <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                    View all notifications
                  </button>
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
                className={`absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-20 overflow-hidden transition-all duration-300 origin-top-right ${isDropdownOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
              >
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-sm font-bold text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{userRole}</p>
                </div>

                <div className="py-1">
                  {dropdownItems.map((item, index) => (
                    <div key={index}>
                      {item.path ? (
                        <Link
                          to={item.path as any}
                          onClick={() => setIsDropdownOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 transition-colors ${currentTheme.dropdownHover}`}
                        >
                          <span className="text-gray-400 group-hover:text-blue-600">
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
                          className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors text-gray-700 ${currentTheme.dropdownHover}`}
                        >
                          <span className="text-gray-400 group-hover:text-blue-600">
                            {item.icon}
                          </span>{' '}
                          {item.name}
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-1 pb-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <span className="text-red-400 group-hover:text-red-600">
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

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
