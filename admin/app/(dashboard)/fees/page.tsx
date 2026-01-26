'use client';

import { useState } from 'react';
import {
  Edit,
  Eye,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Filter,
} from 'lucide-react';
import Header from '@/components/Header';
import DataTable from '@/components/DataTable';
import Modal, { FormField, ModalFooter } from '@/components/Modal';
import { getStatusDisplay, formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { clsx } from 'clsx';

interface MembershipFee {
  id: string;
  memberId: string;
  memberName: string;
  membershipNumber: string;
  organizationName: string;
  amount: number;
  year: number;
  status: 'pending' | 'paid' | 'overdue';
  paidAt?: string;
  createdAt: string;
}

const mockFees: MembershipFee[] = [
  {
    id: '1',
    memberId: '1',
    memberName: 'Батбаяр Бат-Эрдэнэ',
    membershipNumber: 'СДЗН-2024-0001',
    organizationName: 'ТЭХК',
    amount: 50000,
    year: 2024,
    status: 'paid',
    paidAt: '2024-01-15',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    memberId: '2',
    memberName: 'Ганзориг Гантөмөр',
    membershipNumber: 'СДЗН-2024-0002',
    organizationName: 'ДБТК',
    amount: 50000,
    year: 2024,
    status: 'paid',
    paidAt: '2024-01-20',
    createdAt: '2024-01-01',
  },
  {
    id: '3',
    memberId: '3',
    memberName: 'Оюунчимэг Отгонбаяр',
    membershipNumber: 'СДЗН-2024-0003',
    organizationName: 'ЭБТК',
    amount: 50000,
    year: 2024,
    status: 'pending',
    createdAt: '2024-01-01',
  },
  {
    id: '4',
    memberId: '4',
    memberName: 'Болдбаатар Баясгалан',
    membershipNumber: 'СДЗН-2024-0004',
    organizationName: 'ТЭХК',
    amount: 50000,
    year: 2024,
    status: 'overdue',
    createdAt: '2024-01-01',
  },
  {
    id: '5',
    memberId: '5',
    memberName: 'Цэцэгмаа Чулуунбат',
    membershipNumber: 'СДЗН-2024-0005',
    organizationName: 'ДБТК',
    amount: 50000,
    year: 2024,
    status: 'pending',
    createdAt: '2024-01-01',
  },
  {
    id: '6',
    memberId: '1',
    memberName: 'Батбаяр Бат-Эрдэнэ',
    membershipNumber: 'СДЗН-2024-0001',
    organizationName: 'ТЭХК',
    amount: 50000,
    year: 2023,
    status: 'paid',
    paidAt: '2023-02-10',
    createdAt: '2023-01-01',
  },
];

export default function FeesPage() {
  const [fees, setFees] = useState<MembershipFee[]>(mockFees);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<MembershipFee | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const handleView = (fee: MembershipFee) => {
    setSelectedFee(fee);
    setIsViewModalOpen(true);
  };

  const handleApprove = (fee: MembershipFee) => {
    setSelectedFee(fee);
    setIsApproveModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedFee) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setFees(
      fees.map((f) =>
        f.id === selectedFee.id
          ? { ...f, status: 'paid' as const, paidAt: new Date().toISOString().split('T')[0] }
          : f
      )
    );

    setIsApproveModalOpen(false);
    setSelectedFee(null);
    setIsLoading(false);
  };

  // Filter fees
  const filteredFees = fees.filter((fee) => {
    if (selectedYear && fee.year !== selectedYear) return false;
    if (selectedStatus !== 'all' && fee.status !== selectedStatus) return false;
    return true;
  });

  // Statistics
  const currentYearFees = fees.filter((f) => f.year === selectedYear);
  const totalAmount = currentYearFees.reduce((sum, f) => sum + f.amount, 0);
  const paidAmount = currentYearFees
    .filter((f) => f.status === 'paid')
    .reduce((sum, f) => sum + f.amount, 0);
  const pendingCount = currentYearFees.filter((f) => f.status === 'pending').length;
  const overdueCount = currentYearFees.filter((f) => f.status === 'overdue').length;
  const collectionRate = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  const columns = [
    {
      key: 'member',
      header: 'Гишүүн',
      sortable: true,
      render: (fee: MembershipFee) => (
        <div>
          <p className="font-medium text-white">{fee.memberName}</p>
          <p className="text-sm text-dark-400">{fee.membershipNumber}</p>
        </div>
      ),
    },
    {
      key: 'organizationName',
      header: 'Байгууллага',
      sortable: true,
    },
    {
      key: 'year',
      header: 'Жил',
      sortable: true,
      render: (fee: MembershipFee) => (
        <span className="text-white font-medium">{fee.year}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Дүн',
      sortable: true,
      render: (fee: MembershipFee) => (
        <span className="text-white font-medium">{formatCurrency(fee.amount)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Төлөв',
      sortable: true,
      render: (fee: MembershipFee) => {
        const status = getStatusDisplay(fee.status);
        return (
          <span className={clsx('badge', status.color.bg, status.color.text)}>
            {status.text}
          </span>
        );
      },
    },
    {
      key: 'paidAt',
      header: 'Төлсөн огноо',
      render: (fee: MembershipFee) => (
        <span className="text-dark-300">
          {fee.paidAt ? formatDate(fee.paidAt) : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Үйлдэл',
      width: 'w-32',
      render: (fee: MembershipFee) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleView(fee);
            }}
            className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
            title="Харах"
          >
            <Eye className="w-4 h-4" />
          </button>
          {fee.status !== 'paid' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleApprove(fee);
              }}
              className="p-2 text-dark-400 hover:text-green-400 hover:bg-dark-700 rounded-lg transition-colors"
              title="Баталгаажуулах"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <Header title="Гишүүнчлэлийн хураамж" subtitle="Хураамжийн төлбөр удирдах" />

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <CreditCard className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{formatCurrency(totalAmount)}</p>
                <p className="text-xs text-dark-400">Нийт хураамж</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{formatCurrency(paidAmount)}</p>
                <p className="text-xs text-dark-400">Төлөгдсөн</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{pendingCount}</p>
                <p className="text-xs text-dark-400">Хүлээгдэж буй</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{overdueCount}</p>
                <p className="text-xs text-dark-400">Хугацаа хэтэрсэн</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <CreditCard className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{collectionRate.toFixed(1)}%</p>
                <p className="text-xs text-dark-400">Цуглуулалт</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-dark-400 text-sm">Жил:</label>
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
              <label className="text-dark-400 text-sm">Төлөв:</label>
              <select
                className="input-field w-40"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Бүгд</option>
                <option value="paid">Төлөгдсөн</option>
                <option value="pending">Хүлээгдэж буй</option>
                <option value="overdue">Хугацаа хэтэрсэн</option>
              </select>
            </div>
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-5 h-5" />
            Тайлан татах
          </button>
        </div>

        {/* Collection Progress */}
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-dark-300">{selectedYear} оны хураамж цуглуулалтын явц</span>
            <span className="text-white font-medium">{collectionRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-dark-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary-600 to-primary-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${collectionRate}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-dark-500 mt-2">
            <span>Төлөгдсөн: {formatCurrency(paidAmount)}</span>
            <span>Үлдэгдэл: {formatCurrency(totalAmount - paidAmount)}</span>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={filteredFees}
          columns={columns}
          searchPlaceholder="Гишүүн хайх..."
          onRowClick={handleView}
          showFilters={false}
        />
      </div>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Хураамжийн мэдээлэл"
        size="md"
      >
        {selectedFee && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-dark-700">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-medium">
                  {selectedFee.memberName.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {selectedFee.memberName}
                </h3>
                <p className="text-dark-400">{selectedFee.membershipNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-dark-400">Байгууллага</p>
                <p className="text-white">{selectedFee.organizationName}</p>
              </div>
              <div>
                <p className="text-sm text-dark-400">Жил</p>
                <p className="text-white">{selectedFee.year}</p>
              </div>
              <div>
                <p className="text-sm text-dark-400">Дүн</p>
                <p className="text-white font-medium">{formatCurrency(selectedFee.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-dark-400">Төлөв</p>
                <span
                  className={clsx(
                    'badge mt-1',
                    getStatusDisplay(selectedFee.status).color.bg,
                    getStatusDisplay(selectedFee.status).color.text
                  )}
                >
                  {getStatusDisplay(selectedFee.status).text}
                </span>
              </div>
              {selectedFee.paidAt && (
                <div>
                  <p className="text-sm text-dark-400">Төлсөн огноо</p>
                  <p className="text-white">{formatDate(selectedFee.paidAt)}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-dark-400">Үүсгэсэн огноо</p>
                <p className="text-white">{formatDate(selectedFee.createdAt)}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-dark-700">
              {selectedFee.status !== 'paid' && (
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleApprove(selectedFee);
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Баталгаажуулах
                </button>
              )}
              <button onClick={() => setIsViewModalOpen(false)} className="btn-secondary">
                Хаах
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Approve Confirmation Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Төлбөр баталгаажуулах"
        size="sm"
      >
        {selectedFee && (
          <div>
            <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <p className="font-medium text-white">{selectedFee.memberName}</p>
                <p className="text-green-400 font-bold">{formatCurrency(selectedFee.amount)}</p>
              </div>
            </div>
            <p className="text-dark-300 mb-6">
              Энэ гишүүний {selectedFee.year} оны гишүүнчлэлийн хураамжийг төлөгдсөн гэж
              баталгаажуулах уу?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmApprove}
                disabled={isLoading}
                className="btn-primary flex items-center gap-2"
              >
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <CheckCircle className="w-4 h-4" />
                Баталгаажуулах
              </button>
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="btn-secondary"
                disabled={isLoading}
              >
                Болих
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
