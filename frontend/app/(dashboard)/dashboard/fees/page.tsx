'use client';

import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Clock, AlertCircle, Download, Calendar } from 'lucide-react';
import Card from '@/components/Card';
import Badge, { getStatusBadgeVariant, getStatusLabel } from '@/components/Badge';
import { PageLoader } from '@/components/LoadingSpinner';

interface Fee {
  id: string;
  year: number;
  month?: number;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  paid_at?: string;
  payment_method?: string;
  receipt_number?: string;
  created_at: string;
}

export default function FeesPage() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // Simulated data - replace with API call
    setTimeout(() => {
      setFees([
        {
          id: '1',
          year: 2024,
          amount: 50000,
          status: 'pending',
          created_at: '2024-01-01',
        },
        {
          id: '2',
          year: 2023,
          amount: 50000,
          status: 'paid',
          paid_at: '2023-02-15',
          payment_method: 'Банкны шилжүүлэг',
          receipt_number: 'REC-2023-001',
          created_at: '2023-01-01',
        },
        {
          id: '3',
          year: 2022,
          amount: 45000,
          status: 'paid',
          paid_at: '2022-03-10',
          payment_method: 'QPay',
          receipt_number: 'REC-2022-001',
          created_at: '2022-01-01',
        },
        {
          id: '4',
          year: 2021,
          amount: 45000,
          status: 'paid',
          paid_at: '2021-01-25',
          payment_method: 'Бэлэн мөнгө',
          receipt_number: 'REC-2021-001',
          created_at: '2021-01-01',
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('mn-MN', {
      style: 'currency',
      currency: 'MNT',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate totals
  const totalPaid = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
  const totalPending = fees.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0);
  const totalOverdue = fees.filter(f => f.status === 'overdue').reduce((sum, f) => sum + f.amount, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  if (loading) return <PageLoader text="Хураамжийн мэдээлэл уншиж байна..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Гишүүнчлэлийн хураамж</h1>
        <p className="text-gray-600 mt-1">Хураамжийн төлбөрийн түүх</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600">Төлөгдсөн</p>
              <p className="text-xl font-bold text-green-700">{formatCurrency(totalPaid)}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-yellow-600">Хүлээгдэж буй</p>
              <p className="text-xl font-bold text-yellow-700">{formatCurrency(totalPending)}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-600">Хугацаа хэтэрсэн</p>
              <p className="text-xl font-bold text-red-700">{formatCurrency(totalOverdue)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Current year fee */}
      {fees.find(f => f.year === new Date().getFullYear() && f.status === 'pending') && (
        <Card className="border-blue-200 bg-blue-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {new Date().getFullYear()} оны гишүүнчлэлийн хураамж
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(fees.find(f => f.year === new Date().getFullYear())?.amount || 0)}
                </p>
              </div>
            </div>
            <button className="btn-primary">
              <CreditCard className="w-5 h-5 mr-2" />
              Төлбөр төлөх
            </button>
          </div>
        </Card>
      )}

      {/* Fee history */}
      <Card>
        <div className="border-b border-gray-200 pb-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Төлбөрийн түүх</h2>
        </div>

        <div className="space-y-4">
          {fees.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Төлбөрийн түүх олдсонгүй</p>
          ) : (
            fees.map(fee => (
              <div
                key={fee.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(fee.status)}
                  <div>
                    <p className="font-medium text-gray-900">
                      {fee.year} оны гишүүнчлэлийн хураамж
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {fee.paid_at ? (
                        <>
                          <Calendar className="w-4 h-4" />
                          Төлөгдсөн: {formatDate(fee.paid_at)}
                          {fee.payment_method && ` - ${fee.payment_method}`}
                        </>
                      ) : (
                        <>Үүсгэсэн: {formatDate(fee.created_at)}</>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(fee.amount)}</p>
                    <Badge variant={getStatusBadgeVariant(fee.status)} size="sm">
                      {getStatusLabel(fee.status)}
                    </Badge>
                  </div>
                  {fee.status === 'paid' && fee.receipt_number && (
                    <button
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Баримт татах"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
