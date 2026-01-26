'use client';

import { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Building2,
  Users,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react';
import Header from '@/components/Header';
import DataTable from '@/components/DataTable';
import Modal, { FormField, ModalFooter } from '@/components/Modal';
import { getStatusDisplay, formatNumber } from '@/lib/utils';
import { clsx } from 'clsx';

interface Organization {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  email: string;
  memberCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'Төв Эрчим Хүчний Компани',
    type: 'Салбар байгууллага',
    address: 'Улаанбаатар хот, Сүхбаатар дүүрэг',
    phone: '77001122',
    email: 'tehk@sdyn.mn',
    memberCount: 456,
    status: 'active',
    createdAt: '2020-01-15',
  },
  {
    id: '2',
    name: 'Дархан Барилгын Трест Компани',
    type: 'Салбар байгууллага',
    address: 'Дархан-Уул аймаг, Дархан сум',
    phone: '70372233',
    email: 'dbtk@sdyn.mn',
    memberCount: 234,
    status: 'active',
    createdAt: '2019-06-20',
  },
  {
    id: '3',
    name: 'Эрдэнэт Барилгын Трест Компани',
    type: 'Салбар байгууллага',
    address: 'Орхон аймаг, Баян-Өндөр сум',
    phone: '70353344',
    email: 'ebtk@sdyn.mn',
    memberCount: 189,
    status: 'active',
    createdAt: '2019-09-10',
  },
  {
    id: '4',
    name: 'Хөвсгөл Барилгын Трест',
    type: 'Салбар байгууллага',
    address: 'Хөвсгөл аймаг, Мөрөн сум',
    phone: '70382255',
    email: 'hvbt@sdyn.mn',
    memberCount: 98,
    status: 'inactive',
    createdAt: '2021-03-25',
  },
];

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>(mockOrganizations);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    address: '',
    phone: '',
    email: '',
    status: 'active' as 'active' | 'inactive',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      address: '',
      phone: '',
      email: '',
      status: 'active',
    });
  };

  const handleCreate = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleEdit = (org: Organization) => {
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      type: org.type,
      address: org.address,
      phone: org.phone,
      email: org.email,
      status: org.status,
    });
    setIsEditModalOpen(true);
  };

  const handleView = (org: Organization) => {
    setSelectedOrg(org);
    setIsViewModalOpen(true);
  };

  const handleDelete = (org: Organization) => {
    setSelectedOrg(org);
    setIsDeleteModalOpen(true);
  };

  const handleSaveCreate = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newOrg: Organization = {
      id: String(organizations.length + 1),
      ...formData,
      memberCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setOrganizations([...organizations, newOrg]);
    setIsCreateModalOpen(false);
    resetForm();
    setIsLoading(false);
  };

  const handleSaveEdit = async () => {
    if (!selectedOrg) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setOrganizations(
      organizations.map((o) =>
        o.id === selectedOrg.id ? { ...o, ...formData } : o
      )
    );

    setIsEditModalOpen(false);
    setSelectedOrg(null);
    resetForm();
    setIsLoading(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedOrg) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setOrganizations(organizations.filter((o) => o.id !== selectedOrg.id));
    setIsDeleteModalOpen(false);
    setSelectedOrg(null);
    setIsLoading(false);
  };

  const columns = [
    {
      key: 'name',
      header: 'Байгууллагын нэр',
      sortable: true,
      render: (org: Organization) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="font-medium text-white">{org.name}</p>
            <p className="text-sm text-dark-400">{org.type}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Хаяг',
      render: (org: Organization) => (
        <div className="flex items-center gap-2 text-dark-300">
          <MapPin className="w-4 h-4 text-dark-500" />
          {org.address}
        </div>
      ),
    },
    {
      key: 'memberCount',
      header: 'Гишүүд',
      sortable: true,
      render: (org: Organization) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-dark-500" />
          <span className="text-white font-medium">{formatNumber(org.memberCount)}</span>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Холбоо барих',
      render: (org: Organization) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-dark-300 text-sm">
            <Phone className="w-3 h-3 text-dark-500" />
            {org.phone}
          </div>
          <div className="flex items-center gap-2 text-dark-300 text-sm">
            <Mail className="w-3 h-3 text-dark-500" />
            {org.email}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Төлөв',
      sortable: true,
      render: (org: Organization) => {
        const status = getStatusDisplay(org.status);
        return (
          <span className={clsx('badge', status.color.bg, status.color.text)}>
            {status.text}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Үйлдэл',
      width: 'w-32',
      render: (org: Organization) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleView(org);
            }}
            className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
            title="Харах"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(org);
            }}
            className="p-2 text-dark-400 hover:text-primary-400 hover:bg-dark-700 rounded-lg transition-colors"
            title="Засах"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(org);
            }}
            className="p-2 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors"
            title="Устгах"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Header title="Байгууллагууд" subtitle="Байгууллагуудын бүртгэл удирдах" />

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Building2 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{organizations.length}</p>
                <p className="text-sm text-dark-400">Нийт байгууллага</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Building2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {organizations.filter((o) => o.status === 'active').length}
                </p>
                <p className="text-sm text-dark-400">Идэвхтэй</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(organizations.reduce((sum, o) => sum + o.memberCount, 0))}
                </p>
                <p className="text-sm text-dark-400">Нийт гишүүд</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Users className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {Math.round(
                    organizations.reduce((sum, o) => sum + o.memberCount, 0) /
                      organizations.length
                  )}
                </p>
                <p className="text-sm text-dark-400">Дундаж гишүүд</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Шинэ байгууллага
          </button>
        </div>

        {/* Data Table */}
        <DataTable
          data={organizations}
          columns={columns}
          searchPlaceholder="Байгууллага хайх..."
          onRowClick={handleView}
        />
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Шинэ байгууллага нэмэх"
        size="lg"
      >
        <div className="space-y-4">
          <FormField label="Байгууллагын нэр" required>
            <input
              type="text"
              className="input-field"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Байгууллагын нэр оруулна уу"
            />
          </FormField>
          <FormField label="Төрөл" required>
            <select
              className="input-field"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="">Сонгоно уу</option>
              <option value="Салбар байгууллага">Салбар байгууллага</option>
              <option value="Гишүүн байгууллага">Гишүүн байгууллага</option>
              <option value="Түнш байгууллага">Түнш байгууллага</option>
            </select>
          </FormField>
          <FormField label="Хаяг" required>
            <input
              type="text"
              className="input-field"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Хаяг оруулна уу"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Утас" required>
              <input
                type="tel"
                className="input-field"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Утасны дугаар"
              />
            </FormField>
            <FormField label="И-мэйл" required>
              <input
                type="email"
                className="input-field"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="И-мэйл хаяг"
              />
            </FormField>
          </div>
          <FormField label="Төлөв">
            <select
              className="input-field"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'active' | 'inactive',
                })
              }
            >
              <option value="active">Идэвхтэй</option>
              <option value="inactive">Идэвхгүй</option>
            </select>
          </FormField>
        </div>
        <ModalFooter
          onCancel={() => setIsCreateModalOpen(false)}
          onConfirm={handleSaveCreate}
          isLoading={isLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Байгууллагын мэдээлэл засах"
        size="lg"
      >
        <div className="space-y-4">
          <FormField label="Байгууллагын нэр" required>
            <input
              type="text"
              className="input-field"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </FormField>
          <FormField label="Төрөл" required>
            <select
              className="input-field"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="Салбар байгууллага">Салбар байгууллага</option>
              <option value="Гишүүн байгууллага">Гишүүн байгууллага</option>
              <option value="Түнш байгууллага">Түнш байгууллага</option>
            </select>
          </FormField>
          <FormField label="Хаяг" required>
            <input
              type="text"
              className="input-field"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Утас" required>
              <input
                type="tel"
                className="input-field"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </FormField>
            <FormField label="И-мэйл" required>
              <input
                type="email"
                className="input-field"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </FormField>
          </div>
          <FormField label="Төлөв">
            <select
              className="input-field"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'active' | 'inactive',
                })
              }
            >
              <option value="active">Идэвхтэй</option>
              <option value="inactive">Идэвхгүй</option>
            </select>
          </FormField>
        </div>
        <ModalFooter
          onCancel={() => setIsEditModalOpen(false)}
          onConfirm={handleSaveEdit}
          isLoading={isLoading}
        />
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Байгууллагын мэдээлэл"
        size="md"
      >
        {selectedOrg && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-dark-700">
              <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedOrg.name}</h3>
                <p className="text-dark-400">{selectedOrg.type}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-dark-500" />
                <span className="text-dark-200">{selectedOrg.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-dark-500" />
                <span className="text-dark-200">{selectedOrg.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-dark-500" />
                <span className="text-dark-200">{selectedOrg.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-dark-500" />
                <span className="text-dark-200">{formatNumber(selectedOrg.memberCount)} гишүүн</span>
              </div>
            </div>

            <div className="pt-4 border-t border-dark-700">
              <div className="flex items-center justify-between">
                <span className="text-dark-400">Төлөв</span>
                <span
                  className={clsx(
                    'badge',
                    getStatusDisplay(selectedOrg.status).color.bg,
                    getStatusDisplay(selectedOrg.status).color.text
                  )}
                >
                  {getStatusDisplay(selectedOrg.status).text}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-dark-700">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEdit(selectedOrg);
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Засах
              </button>
              <button onClick={() => setIsViewModalOpen(false)} className="btn-secondary">
                Хаах
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Байгууллага устгах"
        size="sm"
      >
        {selectedOrg && (
          <div>
            <p className="text-dark-300 mb-4">
              Та <span className="text-white font-medium">{selectedOrg.name}</span> байгууллагыг
              устгахдаа итгэлтэй байна уу?
            </p>
            <p className="text-dark-500 text-sm mb-6">
              Энэ үйлдлийг буцаах боломжгүй. Байгууллагад холбогдсон {selectedOrg.memberCount}{' '}
              гишүүний бүртгэл хадгалагдах боловч байгууллагагүй болно.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                disabled={isLoading}
                className="btn-danger flex items-center gap-2"
              >
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Устгах
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
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
