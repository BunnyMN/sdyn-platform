'use client';

import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Building2,
  CreditCard,
  Calendar,
  Download,
  Filter,
  FileText,
  PieChart,
  LineChart,
} from 'lucide-react';
import Header from '@/components/Header';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { clsx } from 'clsx';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: typeof BarChart3;
  color: string;
  bgColor: string;
}

const reportTypes: ReportCard[] = [
  {
    id: 'membership',
    title: 'Гишүүнчлэлийн тайлан',
    description: 'Гишүүдийн өсөлт, бүртгэлийн статистик',
    icon: Users,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  {
    id: 'financial',
    title: 'Санхүүгийн тайлан',
    description: 'Хураамж цуглуулалт, орлогын тайлан',
    icon: CreditCard,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
  {
    id: 'organization',
    title: 'Байгууллагын тайлан',
    description: 'Байгууллагуудын идэвхжил, гишүүд',
    icon: Building2,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  {
    id: 'events',
    title: 'Арга хэмжээний тайлан',
    description: 'Арга хэмжээнүүд, оролцоо',
    icon: Calendar,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
  },
];

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('year');
  const [selectedYear, setSelectedYear] = useState(2024);

  // Mock data for charts
  const monthlyData = [
    { month: '1-р сар', members: 120, fees: 5600000 },
    { month: '2-р сар', members: 145, fees: 6800000 },
    { month: '3-р сар', members: 168, fees: 7200000 },
    { month: '4-р сар', members: 189, fees: 8100000 },
    { month: '5-р сар', members: 210, fees: 9500000 },
    { month: '6-р сар', members: 235, fees: 10200000 },
  ];

  const organizationStats = [
    { name: 'ТЭХК', members: 456, percentage: 35 },
    { name: 'ДБТК', members: 312, percentage: 24 },
    { name: 'ЭБТК', members: 256, percentage: 20 },
    { name: 'ХБТТ', members: 156, percentage: 12 },
    { name: 'Бусад', members: 120, percentage: 9 },
  ];

  const feeStats = {
    total: 45600000,
    paid: 35800000,
    pending: 6200000,
    overdue: 3600000,
  };

  return (
    <div>
      <Header title="Тайлан" subtitle="Статистик болон аналитик мэдээлэл" />

      <div className="p-6">
        {/* Period Selection */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex bg-dark-800 rounded-lg p-1">
              {['month', 'quarter', 'year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    selectedPeriod === period
                      ? 'bg-primary-600 text-white'
                      : 'text-dark-400 hover:text-white'
                  )}
                >
                  {period === 'month' && 'Сар'}
                  {period === 'quarter' && 'Улирал'}
                  {period === 'year' && 'Жил'}
                </button>
              ))}
            </div>
            <select
              className="input-field w-32"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
              <option value={2022}>2022</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Шүүлтүүр
            </button>
            <button className="btn-primary flex items-center gap-2">
              <Download className="w-4 h-4" />
              Тайлан татах
            </button>
          </div>
        </div>

        {/* Report Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                className="card p-4 text-left hover:bg-dark-700/50 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className={clsx('p-2 rounded-lg', report.bgColor)}>
                    <Icon className={clsx('w-5 h-5', report.color)} />
                  </div>
                  <div>
                    <h3 className="font-medium text-white group-hover:text-primary-400 transition-colors">
                      {report.title}
                    </h3>
                    <p className="text-sm text-dark-400 mt-1">{report.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">2,456</p>
                <p className="text-sm text-dark-400">Нийт гишүүд</p>
                <p className="text-xs text-green-400">+12.5% өмнөх сараас</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CreditCard className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{formatCurrency(feeStats.paid)}</p>
                <p className="text-sm text-dark-400">Цуглуулсан хураамж</p>
                <p className="text-xs text-green-400">78.5% биелэлт</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Building2 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">48</p>
                <p className="text-sm text-dark-400">Байгууллагууд</p>
                <p className="text-xs text-green-400">+3 шинэ</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">24</p>
                <p className="text-sm text-dark-400">Арга хэмжээ</p>
                <p className="text-xs text-yellow-400">8 удахгүй болох</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Membership Growth Chart */}
          <div className="card">
            <div className="p-4 border-b border-dark-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-primary-400" />
                  <h3 className="font-semibold text-white">Гишүүдийн өсөлт</h3>
                </div>
                <button className="text-sm text-primary-400 hover:text-primary-300">
                  Дэлгэрэнгүй
                </button>
              </div>
            </div>
            <div className="p-4">
              {/* Simple bar chart visualization */}
              <div className="space-y-3">
                {monthlyData.map((data, index) => (
                  <div key={data.month} className="flex items-center gap-3">
                    <span className="text-sm text-dark-400 w-16">{data.month}</span>
                    <div className="flex-1 bg-dark-700 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary-600 to-primary-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(data.members / 250) * 100}%` }}
                      ></div>
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white font-medium">
                        {data.members}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Organization Distribution */}
          <div className="card">
            <div className="p-4 border-b border-dark-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white">Байгууллагаар харуулах</h3>
                </div>
                <button className="text-sm text-primary-400 hover:text-primary-300">
                  Дэлгэрэнгүй
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {organizationStats.map((org, index) => {
                  const colors = [
                    'bg-blue-500',
                    'bg-green-500',
                    'bg-purple-500',
                    'bg-yellow-500',
                    'bg-gray-500',
                  ];
                  return (
                    <div key={org.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={clsx('w-3 h-3 rounded-full', colors[index])}></div>
                          <span className="text-dark-200">{org.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{org.members}</span>
                          <span className="text-dark-500 text-sm">({org.percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-dark-700 rounded-full h-2">
                        <div
                          className={clsx('h-2 rounded-full', colors[index])}
                          style={{ width: `${org.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Fee Collection Overview */}
        <div className="card">
          <div className="p-4 border-b border-dark-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-400" />
                <h3 className="font-semibold text-white">Хураамж цуглуулалтын тойм</h3>
              </div>
              <button className="btn-secondary flex items-center gap-2 text-sm">
                <Download className="w-4 h-4" />
                Excel татах
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-dark-700/50 rounded-lg">
                <p className="text-dark-400 text-sm">Нийт</p>
                <p className="text-xl font-bold text-white">{formatCurrency(feeStats.total)}</p>
              </div>
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 text-sm">Төлөгдсөн</p>
                <p className="text-xl font-bold text-green-400">{formatCurrency(feeStats.paid)}</p>
              </div>
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-400 text-sm">Хүлээгдэж буй</p>
                <p className="text-xl font-bold text-yellow-400">{formatCurrency(feeStats.pending)}</p>
              </div>
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">Хугацаа хэтэрсэн</p>
                <p className="text-xl font-bold text-red-400">{formatCurrency(feeStats.overdue)}</p>
              </div>
            </div>

            {/* Monthly fee collection */}
            <div className="space-y-3">
              <h4 className="text-dark-300 text-sm font-medium">Сараар харуулах</h4>
              {monthlyData.map((data) => (
                <div key={data.month} className="flex items-center gap-3">
                  <span className="text-sm text-dark-400 w-16">{data.month}</span>
                  <div className="flex-1 bg-dark-700 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-600 to-green-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(data.fees / 12000000) * 100}%` }}
                    ></div>
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white font-medium">
                      {formatCurrency(data.fees)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Export Options */}
        <div className="mt-6 card p-4">
          <h3 className="font-semibold text-white mb-4">Тайлан экспортлох</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 bg-dark-700/50 hover:bg-dark-700 rounded-lg transition-colors">
              <FileText className="w-8 h-8 text-green-400" />
              <div className="text-left">
                <p className="font-medium text-white">Excel тайлан</p>
                <p className="text-sm text-dark-400">Бүх мэдээлэл Excel форматаар</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 bg-dark-700/50 hover:bg-dark-700 rounded-lg transition-colors">
              <FileText className="w-8 h-8 text-red-400" />
              <div className="text-left">
                <p className="font-medium text-white">PDF тайлан</p>
                <p className="text-sm text-dark-400">Хэвлэх боломжтой тайлан</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 bg-dark-700/50 hover:bg-dark-700 rounded-lg transition-colors">
              <FileText className="w-8 h-8 text-blue-400" />
              <div className="text-left">
                <p className="font-medium text-white">CSV өгөгдөл</p>
                <p className="text-sm text-dark-400">Түүхий өгөгдөл CSV форматаар</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
