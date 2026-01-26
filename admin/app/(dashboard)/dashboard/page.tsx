'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  Calendar,
  CreditCard,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
} from 'lucide-react';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import { formatCurrency, formatNumber, formatRelativeTime } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'member' | 'organization' | 'event' | 'payment';
  title: string;
  description: string;
  timestamp: string;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - replace with actual API calls
  const stats = {
    totalMembers: 2456,
    memberGrowth: 12.5,
    totalOrganizations: 48,
    organizationGrowth: 5.2,
    upcomingEvents: 8,
    eventGrowth: -2.3,
    paidFees: 45600000,
    feeGrowth: 18.7,
  };

  const recentActivities: Activity[] = [
    {
      id: '1',
      type: 'member',
      title: 'Шинэ гишүүн бүртгэгдлээ',
      description: 'Б.Батбаяр системд бүртгэгдлээ',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'payment',
      title: 'Төлбөр баталгаажлаа',
      description: 'Г.Ганзориг гишүүнчлэлийн хураамж төллөө',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      type: 'event',
      title: 'Арга хэмжээ үүсгэгдлээ',
      description: '"Хаврын сургалт 2024" арга хэмжээ нэмэгдлээ',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      type: 'organization',
      title: 'Байгууллага шинэчлэгдлээ',
      description: '"ТЭХК" байгууллагын мэдээлэл шинэчлэгдлээ',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const upcomingEvents = [
    {
      id: '1',
      title: 'Хаврын уулзалт 2024',
      date: '2024-03-15',
      location: 'Улаанбаатар',
      registrations: 156,
    },
    {
      id: '2',
      title: 'Мэргэжлийн сургалт',
      date: '2024-03-20',
      location: 'Дархан',
      registrations: 89,
    },
    {
      id: '3',
      title: 'Бүсийн хурал',
      date: '2024-04-01',
      location: 'Эрдэнэт',
      registrations: 234,
    },
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'member':
        return <Users className="w-4 h-4" />;
      case 'organization':
        return <Building2 className="w-4 h-4" />;
      case 'event':
        return <Calendar className="w-4 h-4" />;
      case 'payment':
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'member':
        return 'bg-blue-500/20 text-blue-400';
      case 'organization':
        return 'bg-purple-500/20 text-purple-400';
      case 'event':
        return 'bg-green-500/20 text-green-400';
      case 'payment':
        return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  return (
    <div>
      <Header title="Хянах самбар" subtitle="Системийн ерөнхий мэдээлэл" />

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Нийт гишүүд"
            value={formatNumber(stats.totalMembers)}
            change={{ value: stats.memberGrowth, type: 'increase' }}
            icon={Users}
            iconColor="text-blue-400"
            iconBgColor="bg-blue-500/20"
          />
          <StatCard
            title="Байгууллагууд"
            value={formatNumber(stats.totalOrganizations)}
            change={{ value: stats.organizationGrowth, type: 'increase' }}
            icon={Building2}
            iconColor="text-purple-400"
            iconBgColor="bg-purple-500/20"
          />
          <StatCard
            title="Удахгүй болох арга хэмжээ"
            value={stats.upcomingEvents}
            change={{ value: Math.abs(stats.eventGrowth), type: 'decrease' }}
            icon={Calendar}
            iconColor="text-green-400"
            iconBgColor="bg-green-500/20"
          />
          <StatCard
            title="Цуглуулсан хураамж"
            value={formatCurrency(stats.paidFees)}
            change={{ value: stats.feeGrowth, type: 'increase' }}
            icon={CreditCard}
            iconColor="text-yellow-400"
            iconBgColor="bg-yellow-500/20"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="card">
            <div className="p-4 border-b border-dark-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Сүүлийн үйл ажиллагаа
                </h2>
                <button className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
                  Бүгдийг харах <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-dark-700/50 transition-colors"
                  >
                    <div
                      className={`p-2 rounded-lg ${getActivityColor(
                        activity.type
                      )}`}
                    >
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white">{activity.title}</p>
                      <p className="text-sm text-dark-400 truncate">
                        {activity.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-dark-500 text-xs whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(activity.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="card">
            <div className="p-4 border-b border-dark-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Удахгүй болох арга хэмжээ
                </h2>
                <button className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
                  Бүгдийг харах <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 bg-dark-700/30 rounded-lg hover:bg-dark-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-white">{event.title}</h3>
                        <p className="text-sm text-dark-400 mt-1">
                          {event.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-primary-400">
                          {event.date}
                        </p>
                        <p className="text-xs text-dark-400 mt-1">
                          {event.registrations} бүртгэл
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Member Status */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Гишүүдийн төлөв
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-dark-300">Идэвхтэй</span>
                <span className="text-green-400 font-medium">2,156</span>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: '88%' }}
                ></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-300">Хүлээгдэж буй</span>
                <span className="text-yellow-400 font-medium">186</span>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: '8%' }}
                ></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-300">Идэвхгүй</span>
                <span className="text-red-400 font-medium">114</span>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: '4%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* Fee Collection Status */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Хураамж цуглуулалт
            </h3>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-dark-700"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${0.78 * 352} ${352}`}
                    strokeLinecap="round"
                    className="text-primary-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">78%</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-400">1,916</p>
                <p className="text-sm text-dark-400">Төлсөн</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">540</p>
                <p className="text-sm text-dark-400">Төлөөгүй</p>
              </div>
            </div>
          </div>

          {/* Regional Distribution */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Бүсээр харуулах
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Улаанбаатар', count: 1234, percent: 50 },
                { name: 'Дархан-Уул', count: 456, percent: 19 },
                { name: 'Орхон', count: 312, percent: 13 },
                { name: 'Өвөрхангай', count: 234, percent: 10 },
                { name: 'Бусад', count: 220, percent: 8 },
              ].map((region) => (
                <div key={region.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-dark-300">{region.name}</span>
                    <span className="text-white font-medium">{region.count}</span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-1.5">
                    <div
                      className="bg-primary-500 h-1.5 rounded-full"
                      style={{ width: `${region.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
