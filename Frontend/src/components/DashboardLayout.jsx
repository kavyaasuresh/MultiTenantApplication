import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, CheckSquare, Users, LogOut, Settings, Bell, Building2 } from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Organization', href: '/dashboard/organization', icon: Building2 },
  ];

  if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
    navigation.push({ name: 'Users', href: '/dashboard/users', icon: Users });
  }

  return (
    <div className="h-screen flex overflow-hidden bg-[#F9FAFB]">
      {/* Sidebar - Solid Modern SaaS Dark */}
      <div className="w-64 bg-[#111827] flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <div className="text-lg font-bold text-white flex items-center gap-3">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <CheckSquare className="text-white h-5 w-5" />
            </div>
            <span>TaskMaster</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-3">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                  <Icon
                    className={`flex-shrink-0 mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
                      }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer">
            <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.username}</p>
              <p className="text-xs text-gray-500 truncate uppercase tracking-wider">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-2 flex w-full items-center px-3 py-2 text-sm font-medium text-gray-400 rounded-lg hover:bg-red-900/20 hover:text-red-400 transition-colors"
          >
            <LogOut className="flex-shrink-0 mr-3 h-5 w-5" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar - Refined SaaS Style */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 relative z-10">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900">
              {navigation.find((n) => n.href === location.pathname)?.name || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4 relative">
            <button className="p-2 text-gray-400 hover:text-gray-500 transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white"></span>
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-500 transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#F9FAFB] p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
