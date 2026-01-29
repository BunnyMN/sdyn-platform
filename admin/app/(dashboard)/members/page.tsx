'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MoreHorizontal,
  UserPlus,
  Download,
  Upload,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Header from '@/components/Header';
import DataTable from '@/components/DataTable';
import Modal, { FormField, ModalFooter } from '@/components/Modal';
import { getStatusDisplay, formatDate, formatPhone } from '@/lib/utils';
import { clsx } from 'clsx';
import { useMembers, useMemberMutations, useOrganizations } from '@/hooks/useApi';
import { Member } from '@/lib/api';

export default function MembersPage() {
  const { data: members, loading, error, total, page, totalPages, refetch, updateParams } = useMembers();
  const { createMember, updateMember, deleteMember, loading: mutationLoading } = useMemberMutations();
  const { data: organizations } = useOrganizations();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const isLoading = mutationLoading;

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organizationName: '',
    status: 'pending' as 'active' | 'inactive' | 'pending',
  });

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      organizationName: '',
      status: 'pending',
    });
  };

  const handleCreate = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      organizationName: member.organizationName,
      status: member.status,
    });
    setIsEditModalOpen(true);
  };

  const handleView = (member: Member) => {
    setSelectedMember(member);
    setIsViewModalOpen(true);
  };

  const handleDelete = (member: Member) => {
    setSelectedMember(member);
    setIsDeleteModalOpen(true);
  };

  const handleSaveCreate = async () => {
    try {
      await createMember({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        organizationName: formData.organizationName,
        status: formData.status,
      });
      setIsCreateModalOpen(false);
      resetForm();
      refetch();
    } catch (err) {
      console.error('Failed to create member:', err);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedMember) return;

    try {
      await updateMember(selectedMember.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        organizationName: formData.organizationName,
        status: formData.status,
      });
      setIsEditModalOpen(false);
      setSelectedMember(null);
      resetForm();
      refetch();
    } catch (err) {
      console.error('Failed to update member:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedMember) return;

    try {
      await deleteMember(selectedMember.id);
      setIsDeleteModalOpen(false);
      setSelectedMember(null);
      refetch();
    } catch (err) {
      console.error('Failed to delete member:', err);
    }
  };

  // Loading state
  if (loading && members.length === 0) {
    return (
      <div>
        <Header title="Гишүүд" subtitle="Гишүүдийн бүртгэл удирдах" />
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-dark-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Уншиж байна...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <Header title="Гишүүд" subtitle="Гишүүдийн бүртгэл удирдах" />
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle className="w-6 h-6" />
            <span>Алдаа гарлаа: {error}</span>
          </div>
        </div>
      </div>
    );
  }

  const columns = [
    {
      key: 'name',
      header: 'Нэр',
      sortable: true,
      render: (member: Member) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {member.firstName.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-white">
              {member.lastName} {member.firstName}
            </p>
            <p className="text-sm text-dark-400">{member.membershipNumber}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'И-мэйл',
      sortable: true,
      render: (member: Member) => (
        <div className="flex items-center gap-2 text-dark-300">
          <Mail className="w-4 h-4 text-dark-500" />
          {member.email}
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Утас',
      render: (member: Member) => (
        <div className="flex items-center gap-2 text-dark-300">
          <Phone className="w-4 h-4 text-dark-500" />
          {formatPhone(member.phone)}
        </div>
      ),
    },
    {
      key: 'organizationName',
      header: 'Байгууллага',
      sortable: true,
    },
    {
      key: 'status',
      header: 'Төлөв',
      sortable: true,
      render: (member: Member) => {
        const status = getStatusDisplay(member.status);
        return (
          <span className={clsx('badge', status.color.bg, status.color.text)}>
            {status.text}
          </span>
        );
      },
    },
    {
      key: 'joinedAt',
      header: 'Элссэн огноо',
      sortable: true,
      render: (member: Member) => formatDate(member.joinedAt),
    },
    {
      key: 'actions',
      header: 'Үйлдэл',
      width: 'w-32',
      render: (member: Member) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleView(member);
            }}
            className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
            title="Харах"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(member);
            }}
            className="p-2 text-dark-400 hover:text-primary-400 hover:bg-dark-700 rounded-lg transition-colors"
            title="Засах"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(member);
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
      <Header title="Гишүүд" subtitle="Гишүүдийн бүртгэл удирдах" />

      <div className="p-6">
        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Шинэ гишүүн
            </button>
            <button className="btn-secondary flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Импорт
            </button>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={members}
          columns={columns}
          searchPlaceholder="Гишүүн хайх..."
          onRowClick={handleView}
        />
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Шинэ гишүүн нэмэх"
        size="lg"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Овог" required>
            <input
              type="text"
              className="input-field"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Овог оруулна уу"
            />
          </FormField>
          <FormField label="Нэр" required>
            <input
              type="text"
              className="input-field"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="Нэр оруулна уу"
            />
          </FormField>
          <FormField label="И-мэйл" required>
            <input
              type="email"
              className="input-field"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="И-мэйл хаяг оруулна уу"
            />
          </FormField>
          <FormField label="Утас" required>
            <input
              type="tel"
              className="input-field"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Утасны дугаар"
            />
          </FormField>
          <FormField label="Байгууллага" required>
            <select
              className="input-field"
              value={formData.organizationName}
              onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
            >
              <option value="">Сонгоно уу</option>
              <option value="ТЭХК">ТЭХК</option>
              <option value="ДБТК">ДБТК</option>
              <option value="ЭБТК">ЭБТК</option>
            </select>
          </FormField>
          <FormField label="Төлөв">
            <select
              className="input-field"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'active' | 'inactive' | 'pending',
                })
              }
            >
              <option value="pending">Хүлээгдэж буй</option>
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
        title="Гишүүний мэдээлэл засах"
        size="lg"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Овог" required>
            <input
              type="text"
              className="input-field"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </FormField>
          <FormField label="Нэр" required>
            <input
              type="text"
              className="input-field"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
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
          <FormField label="Утас" required>
            <input
              type="tel"
              className="input-field"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </FormField>
          <FormField label="Байгууллага" required>
            <select
              className="input-field"
              value={formData.organizationName}
              onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
            >
              <option value="ТЭХК">ТЭХК</option>
              <option value="ДБТК">ДБТК</option>
              <option value="ЭБТК">ЭБТК</option>
            </select>
          </FormField>
          <FormField label="Төлөв">
            <select
              className="input-field"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'active' | 'inactive' | 'pending',
                })
              }
            >
              <option value="pending">Хүлээгдэж буй</option>
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
        title="Гишүүний мэдээлэл"
        size="md"
      >
        {selectedMember && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-dark-700">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-medium">
                  {selectedMember.firstName.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {selectedMember.lastName} {selectedMember.firstName}
                </h3>
                <p className="text-dark-400">{selectedMember.membershipNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-dark-400">И-мэйл</p>
                <p className="text-white">{selectedMember.email}</p>
              </div>
              <div>
                <p className="text-sm text-dark-400">Утас</p>
                <p className="text-white">{formatPhone(selectedMember.phone)}</p>
              </div>
              <div>
                <p className="text-sm text-dark-400">Байгууллага</p>
                <p className="text-white">{selectedMember.organizationName}</p>
              </div>
              <div>
                <p className="text-sm text-dark-400">Төлөв</p>
                <span
                  className={clsx(
                    'badge',
                    getStatusDisplay(selectedMember.status).color.bg,
                    getStatusDisplay(selectedMember.status).color.text
                  )}
                >
                  {getStatusDisplay(selectedMember.status).text}
                </span>
              </div>
              <div>
                <p className="text-sm text-dark-400">Элссэн огноо</p>
                <p className="text-white">{formatDate(selectedMember.joinedAt)}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-dark-700">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEdit(selectedMember);
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Засах
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="btn-secondary"
              >
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
        title="Гишүүн устгах"
        size="sm"
      >
        {selectedMember && (
          <div>
            <p className="text-dark-300 mb-4">
              Та <span className="text-white font-medium">{selectedMember.lastName} {selectedMember.firstName}</span> гишүүнийг устгахдаа итгэлтэй байна уу?
            </p>
            <p className="text-dark-500 text-sm mb-6">
              Энэ үйлдлийг буцаах боломжгүй.
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
