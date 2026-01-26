'use client';

import { useState } from 'react';
import {
  Bell,
  Search,
  Moon,
  Sun,
  Menu,
  X,
  Settings,
  User,
  LogOut,
} from 'lucide-react';
import { clsx } from 'clsx';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Шинэ гишүүн бүртгэгдлээ',
      message: 'Б.Батбаяр системд бүртгэгдлээ',
      time: '5 минутын өмнө',
      unread: true,
    },
    {
      id: 2,
      title: 'Төлбөр баталгаажлаа',
      message: 'Гишүүнчлэлийн хураамж төлөгдлөө',
      time: '1 цагийн өмнө',
      unread: true,
    },
    {
      id: 3,
      title: 'Арга хэмжээ дуусгавар боллоо',
      message: 'Сургалт амжилттай болов',
      time: '2 цагийн өмнө',
      unread: false,
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-dark-800/80 backdrop-blur-sm border-b border-dark-700">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Title */}
        <div>
          <h1 className="text-xl font-semibold text-white">{title}</h1>
          {subtitle && (
            <p className="text-sm text-dark-400">{subtitle}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            {showSearch ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Хайх..."
                  className="input-field w-64"
                  autoFocus
                />
                <button
                  onClick={() => setShowSearch(false)}
                  className="p-2 text-dark-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              className="relative p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 card shadow-xl">
                <div className="p-4 border-b border-dark-700">
                  <h3 className="font-semibold text-white">Мэдэгдэл</h3>
                </div>
                <div className="max-h-96 overflow-y-auto scrollbar-thin">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={clsx(
                        'p-4 border-b border-dark-700 hover:bg-dark-700/50 cursor-pointer transition-colors',
                        notification.unread && 'bg-dark-700/30'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {notification.unread && (
                          <span className="mt-2 w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></span>
                        )}
                        <div className={clsx(!notification.unread && 'ml-5')}>
                          <p className="font-medium text-white text-sm">
                            {notification.title}
                          </p>
                          <p className="text-dark-400 text-sm mt-1">
                            {notification.message}
                          </p>
                          <p className="text-dark-500 text-xs mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-dark-700">
                  <button className="w-full text-center text-sm text-primary-400 hover:text-primary-300">
                    Бүх мэдэгдэл харах
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              className="flex items-center gap-3 p-2 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">А</span>
              </div>
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 card shadow-xl">
                <div className="p-4 border-b border-dark-700">
                  <p className="font-medium text-white">Админ хэрэглэгч</p>
                  <p className="text-sm text-dark-400">admin@sdyn.mn</p>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg transition-colors">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Профайл</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg transition-colors">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Тохиргоо</span>
                  </button>
                  <hr className="my-2 border-dark-700" />
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-dark-700 rounded-lg transition-colors">
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Гарах</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
