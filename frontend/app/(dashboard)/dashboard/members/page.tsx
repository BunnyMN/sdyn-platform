'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Filter, Download, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react'

interface Member {
  id: string
  member_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  status: string
  organization_name: string
  created_at: string
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    // Simulated data
    setMembers([
      {
        id: '1',
        member_id: 'СДЗН-2024-00001',
        first_name: 'Батболд',
        last_name: 'Ганбат',
        email: 'batbold@example.com',
        phone: '99001122',
        status: 'active',
        organization_name: 'Улаанбаатар',
        created_at: '2024-01-15',
      },
      {
        id: '2',
        member_id: 'СДЗН-2024-00002',
        first_name: 'Сарангэрэл',
        last_name: 'Оюунбилэг',
        email: 'sarangerel@example.com',
        phone: '88112233',
        status: 'active',
        organization_name: 'Дархан-Уул',
        created_at: '2024-01-18',
      },
      {
        id: '3',
        member_id: 'СДЗН-2024-00003',
        first_name: 'Төмөрбаатар',
        last_name: 'Энхбаяр',
        email: 'tomorbaatar@example.com',
        phone: '77223344',
        status: 'pending',
        organization_name: 'Орхон',
        created_at: '2024-01-20',
      },
    ])
    setLoading(false)
  }, [])

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800',
  }

  const statusLabels: Record<string, string> = {
    active: 'Идэвхтэй',
    pending: 'Хүлээгдэж буй',
    inactive: 'Идэвхгүй',
    suspended: 'Түр зогсоосон',
  }

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.first_name.toLowerCase().includes(search.toLowerCase()) ||
      member.last_name.toLowerCase().includes(search.toLowerCase()) ||
      member.member_id.toLowerCase().includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'all' || member.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Гишүүд</h1>
          <p className="text-gray-600 mt-1">
            Нийт {members.length} гишүүн бүртгэлтэй
          </p>
        </div>
        <button className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Шинэ гишүүн
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Хайх... (нэр, дугаар, и-мэйл)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-full md:w-48"
          >
            <option value="all">Бүх төлөв</option>
            <option value="active">Идэвхтэй</option>
            <option value="pending">Хүлээгдэж буй</option>
            <option value="inactive">Идэвхгүй</option>
            <option value="suspended">Түр зогсоосон</option>
          </select>
          <button className="btn-outline">
            <Filter className="w-5 h-5 mr-2" />
            Шүүлтүүр
          </button>
          <button className="btn-outline">
            <Download className="w-5 h-5 mr-2" />
            Экспорт
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Гишүүн
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дугаар
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Байгууллага
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Төлөв
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Бүртгүүлсэн
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Үйлдэл
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {member.first_name[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.last_name} {member.first_name}
                        </div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{member.member_id}</div>
                    <div className="text-sm text-gray-500">{member.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.organization_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        statusColors[member.status]
                      }`}
                    >
                      {statusLabels[member.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.created_at).toLocaleDateString('mn-MN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-1 text-gray-500 hover:text-blue-600">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button className="p-1 text-gray-500 hover:text-green-600">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button className="p-1 text-gray-500 hover:text-red-600">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t">
          <div className="text-sm text-gray-700">
            <span className="font-medium">{filteredMembers.length}</span> гишүүн харуулж байна
          </div>
          <div className="flex space-x-2">
            <button className="btn-outline px-3 py-1">Өмнөх</button>
            <button className="btn-primary px-3 py-1">1</button>
            <button className="btn-outline px-3 py-1">2</button>
            <button className="btn-outline px-3 py-1">3</button>
            <button className="btn-outline px-3 py-1">Дараах</button>
          </div>
        </div>
      </div>
    </div>
  )
}
