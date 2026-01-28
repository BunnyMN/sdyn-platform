'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { useAuth, ROLES } from '@/lib/auth-context';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  roles?: string[];
}

const navigation: NavItem[] = [
  { name: 'Хянах самбар', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Гишүүд', href: '/members', icon: Users },
  { name: 'Байгууллагууд', href: '/organizations', icon: Building2 },
  { name: 'Арга хэмжээ', href: '/events', icon: Calendar },
  { name: 'Гишүүнчлэлийн хураамж', href: '/fees', icon: CreditCard },
  { name: 'Тайлан', href: '/reports', icon: BarChart3 },
  { name: 'Тохиргоо', href: '/settings', icon: Settings, roles: [ROLES.NATIONAL_ADMIN] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, hasAnyRole, isNationalAdmin, isProvinceAdmin, isDistrictAdmin } = useAuth();

  // Get user's display name
  const displayName = user?.fullName || user?.username || 'Админ';
  const displayEmail = user?.email || '';
  const displayInitial = displayName.charAt(0).toUpperCase();

  // Get role display text
  const getRoleDisplay = () => {
    if (isNationalAdmin) return 'Үндэсний админ';
    if (isProvinceAdmin) return 'Аймгийн админ';
    if (isDistrictAdmin) return 'Сумын админ';
    return 'Админ';
  };

  // Filter navigation items based on user roles
  const filteredNavigation = navigation.filter((item) => {
    if (!item.roles) return true;
    return hasAnyRole(item.roles);
  });

  const handleLogout = () => {
    logout();
  };

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 z-40 h-screen bg-dark-800 border-r border-dark-700 transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-bold text-white">СДЗН</h1>
                <p className="text-xs text-dark-400">Админ портал</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3">
          <ul className="space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={clsx(
                      isActive ? 'sidebar-link-active' : 'sidebar-link',
                      collapsed && 'justify-center px-2'
                    )}
                    title={collapsed ? item.name : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 flex items-center justify-center w-6 h-6 bg-dark-700 border border-dark-600 rounded-full text-dark-300 hover:text-white hover:bg-dark-600 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {/* User Section */}
        <div className="p-4 border-t border-dark-700">
          <div
            className={clsx(
              'flex items-center gap-3',
              collapsed && 'justify-center'
            )}
          >
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">{displayInitial}</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {displayName}
                </p>
                <p className="text-xs text-dark-400 truncate">
                  {getRoleDisplay()}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={clsx(
              'mt-3 flex items-center gap-2 text-dark-400 hover:text-red-400 transition-colors w-full',
              collapsed && 'justify-center'
            )}
            title={collapsed ? 'Гарах' : undefined}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="text-sm">Гарах</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
