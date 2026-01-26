'use client';

import { useState } from 'react';
import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Mail,
  Globe,
  Key,
  Save,
  RefreshCw,
  Download,
} from 'lucide-react';
import Header from '@/components/Header';
import { clsx } from 'clsx';

interface SettingsSection {
  id: string;
  title: string;
  icon: typeof Settings;
  description: string;
}

const settingsSections: SettingsSection[] = [
  {
    id: 'general',
    title: 'Ерөнхий тохиргоо',
    icon: Settings,
    description: 'Системийн үндсэн тохиргоо',
  },
  {
    id: 'profile',
    title: 'Профайл',
    icon: User,
    description: 'Хэрэглэгчийн мэдээлэл',
  },
  {
    id: 'notifications',
    title: 'Мэдэгдэл',
    icon: Bell,
    description: 'Мэдэгдлийн тохиргоо',
  },
  {
    id: 'security',
    title: 'Аюулгүй байдал',
    icon: Shield,
    description: 'Нууцлал, хандалтын тохиргоо',
  },
  {
    id: 'email',
    title: 'И-мэйл',
    icon: Mail,
    description: 'И-мэйл илгээлтийн тохиргоо',
  },
  {
    id: 'database',
    title: 'Өгөгдлийн сан',
    icon: Database,
    description: 'Нөөцлөлт, сэргээлт',
  },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [isLoading, setIsLoading] = useState(false);

  // Settings state
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'СДЗН Админ',
    siteDescription: 'Сэргээгдэх дулааны загварчлалын нэгдэл',
    language: 'mn',
    timezone: 'Asia/Ulaanbaatar',
    dateFormat: 'yyyy-MM-dd',
    membershipFee: 50000,
  });

  const [profileSettings, setProfileSettings] = useState({
    firstName: 'Админ',
    lastName: 'Хэрэглэгч',
    email: 'admin@sdyn.mn',
    phone: '99112233',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newMemberAlert: true,
    paymentAlert: true,
    eventReminder: true,
    weeklyReport: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 60,
    passwordExpiry: 90,
  });

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    // Show success message
    alert('Тохиргоо амжилттай хадгалагдлаа');
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Сайтын нэр
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={generalSettings.siteName}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, siteName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Тайлбар
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={generalSettings.siteDescription}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Хэл
                </label>
                <select
                  className="input-field"
                  value={generalSettings.language}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, language: e.target.value })
                  }
                >
                  <option value="mn">Монгол</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Цагийн бүс
                </label>
                <select
                  className="input-field"
                  value={generalSettings.timezone}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, timezone: e.target.value })
                  }
                >
                  <option value="Asia/Ulaanbaatar">Улаанбаатар (UTC+8)</option>
                  <option value="Asia/Hovd">Ховд (UTC+7)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Огнооны формат
                </label>
                <select
                  className="input-field"
                  value={generalSettings.dateFormat}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })
                  }
                >
                  <option value="yyyy-MM-dd">2024-01-15</option>
                  <option value="dd/MM/yyyy">15/01/2024</option>
                  <option value="MM/dd/yyyy">01/15/2024</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Гишүүнчлэлийн хураамж (₮)
                </label>
                <input
                  type="number"
                  className="input-field"
                  value={generalSettings.membershipFee}
                  onChange={(e) =>
                    setGeneralSettings({
                      ...generalSettings,
                      membershipFee: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-6 pb-6 border-b border-dark-700">
              <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-3xl font-medium">А</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Профайл зураг</h3>
                <p className="text-dark-400 text-sm mb-3">PNG, JPG 500KB хүртэл</p>
                <button className="btn-secondary text-sm">Зураг солих</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Овог
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={profileSettings.lastName}
                  onChange={(e) =>
                    setProfileSettings({ ...profileSettings, lastName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Нэр
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={profileSettings.firstName}
                  onChange={(e) =>
                    setProfileSettings({ ...profileSettings, firstName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  И-мэйл
                </label>
                <input
                  type="email"
                  className="input-field"
                  value={profileSettings.email}
                  onChange={(e) =>
                    setProfileSettings({ ...profileSettings, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Утас
                </label>
                <input
                  type="tel"
                  className="input-field"
                  value={profileSettings.phone}
                  onChange={(e) =>
                    setProfileSettings({ ...profileSettings, phone: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {[
                {
                  key: 'emailNotifications',
                  title: 'И-мэйл мэдэгдэл',
                  description: 'Бүх мэдэгдлүүдийг и-мэйлээр хүлээн авах',
                },
                {
                  key: 'newMemberAlert',
                  title: 'Шинэ гишүүний мэдэгдэл',
                  description: 'Шинэ гишүүн бүртгэгдэх үед мэдэгдэл авах',
                },
                {
                  key: 'paymentAlert',
                  title: 'Төлбөрийн мэдэгдэл',
                  description: 'Төлбөр хийгдэх үед мэдэгдэл авах',
                },
                {
                  key: 'eventReminder',
                  title: 'Арга хэмжээний сануулга',
                  description: 'Арга хэмжээний өмнө сануулга авах',
                },
                {
                  key: 'weeklyReport',
                  title: 'Долоо хоногийн тайлан',
                  description: 'Долоо хоног бүр тайлан и-мэйлээр авах',
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-white">{item.title}</h4>
                    <p className="text-sm text-dark-400">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={
                        notificationSettings[item.key as keyof typeof notificationSettings]
                      }
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          [item.key]: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-dark-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-white">Хоёр шатлалт баталгаажуулалт</h4>
                  <p className="text-sm text-dark-400">
                    Нэмэлт хамгаалалт идэвхжүүлэх
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securitySettings.twoFactorAuth}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        twoFactorAuth: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Session хугацаа (минут)
                </label>
                <input
                  type="number"
                  className="input-field"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) =>
                    setSecuritySettings({
                      ...securitySettings,
                      sessionTimeout: parseInt(e.target.value),
                    })
                  }
                />
                <p className="text-xs text-dark-500 mt-1">
                  Идэвхгүй байх хугацаа дууссаны дараа автоматаар гарна
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Нууц үг дуусах хугацаа (хоног)
                </label>
                <input
                  type="number"
                  className="input-field"
                  value={securitySettings.passwordExpiry}
                  onChange={(e) =>
                    setSecuritySettings({
                      ...securitySettings,
                      passwordExpiry: parseInt(e.target.value),
                    })
                  }
                />
                <p className="text-xs text-dark-500 mt-1">
                  Хэрэглэгчдийг тогтмол нууц үгээ солиулах
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-dark-700">
              <h4 className="font-medium text-white mb-4">Нууц үг солих</h4>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Одоогийн нууц үг
                  </label>
                  <input type="password" className="input-field" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Шинэ нууц үг
                  </label>
                  <input type="password" className="input-field" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Нууц үг давтах
                  </label>
                  <input type="password" className="input-field" placeholder="••••••••" />
                </div>
                <button className="btn-secondary flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Нууц үг солих
                </button>
              </div>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  SMTP сервер
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="smtp.example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Порт
                </label>
                <input type="number" className="input-field" placeholder="587" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Хэрэглэгчийн нэр
                </label>
                <input type="text" className="input-field" placeholder="username" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Нууц үг
                </label>
                <input type="password" className="input-field" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Илгээгчийн и-мэйл
                </label>
                <input type="email" className="input-field" placeholder="noreply@sdyn.mn" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Илгээгчийн нэр
                </label>
                <input type="text" className="input-field" placeholder="СДЗН систем" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn-secondary flex items-center gap-2">
                Туршилтын и-мэйл илгээх
              </button>
            </div>
          </div>
        );

      case 'database':
        return (
          <div className="space-y-6">
            <div className="p-6 bg-dark-700/50 rounded-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Database className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Өгөгдлийн сангийн төлөв</h4>
                  <p className="text-sm text-green-400">Хэвийн ажиллаж байна</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-dark-400">Хэмжээ</p>
                  <p className="text-white font-medium">256 MB</p>
                </div>
                <div>
                  <p className="text-dark-400">Хүснэгтүүд</p>
                  <p className="text-white font-medium">24</p>
                </div>
                <div>
                  <p className="text-dark-400">Сүүлийн нөөцлөлт</p>
                  <p className="text-white font-medium">2024-02-15</p>
                </div>
                <div>
                  <p className="text-dark-400">Версия</p>
                  <p className="text-white font-medium">PostgreSQL 15.2</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6">
                <h4 className="font-medium text-white mb-4">Нөөцлөлт</h4>
                <p className="text-sm text-dark-400 mb-4">
                  Өгөгдлийн сангийн бүрэн нөөц хуулбар хийх
                </p>
                <button className="btn-primary flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Нөөцлөх
                </button>
              </div>
              <div className="card p-6">
                <h4 className="font-medium text-white mb-4">Сэргээлт</h4>
                <p className="text-sm text-dark-400 mb-4">
                  Нөөц файлаас өгөгдлийн санг сэргээх
                </p>
                <button className="btn-secondary flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Сэргээх
                </button>
              </div>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-400">Анхааруулга</h4>
                  <p className="text-sm text-dark-300">
                    Өгөгдлийн сангийн сэргээлт хийхээс өмнө заавал нөөцлөлт хийнэ үү. Сэргээлт
                    хийх үед одоо байгаа бүх өгөгдөл устах болно.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <Header title="Тохиргоо" subtitle="Системийн тохиргоо удирдах" />

      <div className="p-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-64 shrink-0">
            <div className="card">
              <nav className="p-2">
                {settingsSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={clsx(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                        activeSection === section.id
                          ? 'bg-primary-600 text-white'
                          : 'text-dark-300 hover:text-white hover:bg-dark-700'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{section.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="card">
              <div className="p-6 border-b border-dark-700">
                <h2 className="text-xl font-semibold text-white">
                  {settingsSections.find((s) => s.id === activeSection)?.title}
                </h2>
                <p className="text-dark-400 mt-1">
                  {settingsSections.find((s) => s.id === activeSection)?.description}
                </p>
              </div>
              <div className="p-6">{renderSection()}</div>
              <div className="p-6 border-t border-dark-700">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="btn-primary flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Хадгалж байна...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Хадгалах
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
