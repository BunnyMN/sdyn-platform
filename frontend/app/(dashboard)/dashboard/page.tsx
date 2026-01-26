'use client'

import { useEffect, useState } from 'react'
import { Users, UserPlus, Calendar, CreditCard, TrendingUp, TrendingDown } from 'lucide-react'

interface DashboardStats {
  total_members: number
  active_members: number
  pending_members: number
  total_events: number
  upcoming_events: number
  fee_collection_rate: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulated data for demo
    setStats({
      total_members: 1234,
      active_members: 987,
      pending_members: 45,
      total_events: 156,
      upcoming_events: 8,
      fee_collection_rate: 78.5,
    })
    setLoading(false)
  }, [])

  const statCards = [
    {
      name: 'Нийт гишүүд',
      value: stats?.total_members || 0,
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'blue',
    },
    {
      name: 'Идэвхтэй гишүүд',
      value: stats?.active_members || 0,
      change: '+5%',
      trend: 'up',
      icon: UserPlus,
      color: 'green',
    },
    {
      name: 'Удахгүй болох арга хэмжээ',
      value: stats?.upcoming_events || 0,
      change: '',
      trend: 'neutral',
      icon: Calendar,
      color: 'purple',
    },
    {
      name: 'Татвар цуглуулалт',
      value: `${stats?.fee_collection_rate || 0}%`,
      change: '+3%',
      trend: 'up',
      icon: CreditCard,
      color: 'orange',
    },
  ]

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Хянах самбар</h1>
        <p className="text-gray-600 mt-1">СДЗН системийн ерөнхий мэдээлэл</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="card p-6">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              {stat.trend !== 'neutral' && (
                <div
                  className={`flex items-center text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {stat.change}
                </div>
              )}
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Members */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Сүүлд элссэн гишүүд</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">Б{i}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Батболд Ганбат</p>
                      <p className="text-sm text-gray-500">Улаанбаатар</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">2 өдрийн өмнө</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Түргэн үйлдэл</h3>
          </div>
          <div className="card-content space-y-3">
            <button className="btn-primary w-full justify-start">
              <UserPlus className="w-5 h-5 mr-2" />
              Шинэ гишүүн бүртгэх
            </button>
            <button className="btn-outline w-full justify-start">
              <Calendar className="w-5 h-5 mr-2" />
              Арга хэмжээ үүсгэх
            </button>
            <button className="btn-outline w-full justify-start">
              <CreditCard className="w-5 h-5 mr-2" />
              Татвар бүртгэх
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Удахгүй болох арга хэмжээ</h3>
        </div>
        <div className="card-content">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 text-sm text-blue-600 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>2024-03-{15 + i}</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Залуучуудын манлайллын сургалт {i}
                </h4>
                <p className="text-sm text-gray-600 mb-3">Улаанбаатар хот</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">25 бүртгүүлсэн</span>
                  <span className="text-blue-600 hover:text-blue-700 cursor-pointer">
                    Дэлгэрэнгүй →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
