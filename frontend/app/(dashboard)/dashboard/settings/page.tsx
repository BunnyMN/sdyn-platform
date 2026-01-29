'use client';

import { useState } from 'react';
import { Bell, Lock, Globe, Moon, Sun, Smartphone, Mail, Shield, Save } from 'lucide-react';
import Card from '@/components/Card';
import { ButtonLoader } from '@/components/LoadingSpinner';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    // Notification settings
    emailNotifications: true,
    smsNotifications: false,
    eventReminders: true,
    feeReminders: true,
    newsUpdates: true,

    // Display settings
    language: 'mn',
    theme: 'light',

    // Privacy settings
    showProfile: true,
    showEmail: false,
    showPhone: false,
  });

  const handleSave = async () => {
    setSaving(true);
    // API call to save settings
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
  };

  const ToggleSwitch = ({
    enabled,
    onChange,
  }: {
    enabled: boolean;
    onChange: (value: boolean) => void;
  }) => (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        enabled ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Тохиргоо</h1>
        <p className="text-gray-600 mt-1">Системийн тохиргоо, мэдэгдлүүд</p>
      </div>

      {/* Notification Settings */}
      <Card>
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Мэдэгдэл</h2>
            <p className="text-sm text-gray-500">Мэдэгдэл хүлээн авах тохиргоо</p>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">И-мэйл мэдэгдэл</p>
                <p className="text-sm text-gray-500">И-мэйлээр мэдэгдэл хүлээн авах</p>
              </div>
            </div>
            <ToggleSwitch
              enabled={settings.emailNotifications}
              onChange={(value) => setSettings({ ...settings, emailNotifications: value })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">SMS мэдэгдэл</p>
                <p className="text-sm text-gray-500">Утсаар SMS хүлээн авах</p>
              </div>
            </div>
            <ToggleSwitch
              enabled={settings.smsNotifications}
              onChange={(value) => setSettings({ ...settings, smsNotifications: value })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Арга хэмжээний сануулга</p>
                <p className="text-sm text-gray-500">Удахгүй болох арга хэмжээний талаар</p>
              </div>
            </div>
            <ToggleSwitch
              enabled={settings.eventReminders}
              onChange={(value) => setSettings({ ...settings, eventReminders: value })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Хураамжийн сануулга</p>
                <p className="text-sm text-gray-500">Хураамж төлөх хугацааны талаар</p>
              </div>
            </div>
            <ToggleSwitch
              enabled={settings.feeReminders}
              onChange={(value) => setSettings({ ...settings, feeReminders: value })}
            />
          </div>
        </div>
      </Card>

      {/* Display Settings */}
      <Card>
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Globe className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Харагдац</h2>
            <p className="text-sm text-gray-500">Хэл, дизайны тохиргоо</p>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Хэл</p>
                <p className="text-sm text-gray-500">Системийн хэл сонгох</p>
              </div>
            </div>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="input w-40"
            >
              <option value="mn">Монгол</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.theme === 'dark' ? (
                <Moon className="w-5 h-5 text-gray-400" />
              ) : (
                <Sun className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium text-gray-900">Загвар</p>
                <p className="text-sm text-gray-500">Гэрэлтэй/Бараан загвар</p>
              </div>
            </div>
            <select
              value={settings.theme}
              onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
              className="input w-40"
            >
              <option value="light">Гэрэлтэй</option>
              <option value="dark">Бараан</option>
              <option value="system">Системийн</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <div className="p-2 bg-green-100 rounded-lg">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Нууцлал</h2>
            <p className="text-sm text-gray-500">Хувийн мэдээллийн хамгаалалт</p>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Профайл харуулах</p>
              <p className="text-sm text-gray-500">Бусад гишүүдэд профайл харуулах</p>
            </div>
            <ToggleSwitch
              enabled={settings.showProfile}
              onChange={(value) => setSettings({ ...settings, showProfile: value })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">И-мэйл харуулах</p>
              <p className="text-sm text-gray-500">Профайл дээр и-мэйл харуулах</p>
            </div>
            <ToggleSwitch
              enabled={settings.showEmail}
              onChange={(value) => setSettings({ ...settings, showEmail: value })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Утас харуулах</p>
              <p className="text-sm text-gray-500">Профайл дээр утас харуулах</p>
            </div>
            <ToggleSwitch
              enabled={settings.showPhone}
              onChange={(value) => setSettings({ ...settings, showPhone: value })}
            />
          </div>
        </div>
      </Card>

      {/* Security Settings */}
      <Card>
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <div className="p-2 bg-red-100 rounded-lg">
            <Lock className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Аюулгүй байдал</h2>
            <p className="text-sm text-gray-500">Нэвтрэлтийн тохиргоо</p>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <button className="btn-outline w-full justify-center">
            <Lock className="w-5 h-5 mr-2" />
            Нууц үг солих
          </button>
        </div>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? (
            <>
              <ButtonLoader />
              <span className="ml-2">Хадгалж байна...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Хадгалах
            </>
          )}
        </button>
      </div>
    </div>
  );
}
