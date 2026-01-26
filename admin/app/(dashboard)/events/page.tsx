'use client';

import { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  Users,
  Clock,
  CalendarPlus,
} from 'lucide-react';
import Header from '@/components/Header';
import DataTable from '@/components/DataTable';
import Modal, { FormField, ModalFooter } from '@/components/Modal';
import { getStatusDisplay, formatDate, formatNumber } from '@/lib/utils';
import { clsx } from 'clsx';

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  registeredCount: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Хаврын уулзалт 2024',
    description: 'Жил бүрийн уламжлалт хаврын нийт гишүүдийн уулзалт',
    startDate: '2024-03-15',
    endDate: '2024-03-16',
    location: 'Улаанбаатар, Номин Холл',
    capacity: 500,
    registeredCount: 156,
    status: 'upcoming',
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    title: 'Мэргэжлийн сургалт - Барилгын норм',
    description: 'Барилгын шинэ норм стандартын талаарх сургалт',
    startDate: '2024-03-20',
    endDate: '2024-03-22',
    location: 'Дархан-Уул, ДБТК төв',
    capacity: 100,
    registeredCount: 89,
    status: 'upcoming',
    createdAt: '2024-02-01',
  },
  {
    id: '3',
    title: 'Бүсийн хурал - Хангай бүс',
    description: 'Хангай бүсийн гишүүдийн хурал, санал солилцоо',
    startDate: '2024-04-01',
    endDate: '2024-04-01',
    location: 'Эрдэнэт, Очирбат Холл',
    capacity: 300,
    registeredCount: 234,
    status: 'upcoming',
    createdAt: '2024-02-15',
  },
  {
    id: '4',
    title: 'Өвлийн уулзалт 2024',
    description: 'Өвлийн улирлын дүгнэлт хурал',
    startDate: '2024-02-01',
    endDate: '2024-02-02',
    location: 'Улаанбаатар, Шангри-Ла',
    capacity: 400,
    registeredCount: 380,
    status: 'completed',
    createdAt: '2023-12-01',
  },
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    capacity: 100,
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      capacity: 100,
      status: 'upcoming',
    });
  };

  const handleCreate = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      capacity: event.capacity,
      status: event.status,
    });
    setIsEditModalOpen(true);
  };

  const handleView = (event: Event) => {
    setSelectedEvent(event);
    setIsViewModalOpen(true);
  };

  const handleDelete = (event: Event) => {
    setSelectedEvent(event);
    setIsDeleteModalOpen(true);
  };

  const handleSaveCreate = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newEvent: Event = {
      id: String(events.length + 1),
      ...formData,
      registeredCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setEvents([...events, newEvent]);
    setIsCreateModalOpen(false);
    resetForm();
    setIsLoading(false);
  };

  const handleSaveEdit = async () => {
    if (!selectedEvent) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setEvents(
      events.map((e) =>
        e.id === selectedEvent.id ? { ...e, ...formData } : e
      )
    );

    setIsEditModalOpen(false);
    setSelectedEvent(null);
    resetForm();
    setIsLoading(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEvent) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setEvents(events.filter((e) => e.id !== selectedEvent.id));
    setIsDeleteModalOpen(false);
    setSelectedEvent(null);
    setIsLoading(false);
  };

  const columns = [
    {
      key: 'title',
      header: 'Арга хэмжээ',
      sortable: true,
      render: (event: Event) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="font-medium text-white">{event.title}</p>
            <p className="text-sm text-dark-400 truncate max-w-xs">
              {event.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Огноо',
      sortable: true,
      render: (event: Event) => (
        <div className="flex items-center gap-2 text-dark-300">
          <Clock className="w-4 h-4 text-dark-500" />
          <div>
            <p>{formatDate(event.startDate)}</p>
            {event.startDate !== event.endDate && (
              <p className="text-xs text-dark-500">- {formatDate(event.endDate)}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Байршил',
      render: (event: Event) => (
        <div className="flex items-center gap-2 text-dark-300">
          <MapPin className="w-4 h-4 text-dark-500" />
          {event.location}
        </div>
      ),
    },
    {
      key: 'registration',
      header: 'Бүртгэл',
      render: (event: Event) => (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-dark-500" />
            <span className="text-white font-medium">
              {event.registeredCount}/{event.capacity}
            </span>
          </div>
          <div className="w-24 bg-dark-700 rounded-full h-1.5">
            <div
              className="bg-primary-500 h-1.5 rounded-full"
              style={{
                width: `${Math.min((event.registeredCount / event.capacity) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Төлөв',
      sortable: true,
      render: (event: Event) => {
        const status = getStatusDisplay(event.status);
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
      render: (event: Event) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleView(event);
            }}
            className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
            title="Харах"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(event);
            }}
            className="p-2 text-dark-400 hover:text-primary-400 hover:bg-dark-700 rounded-lg transition-colors"
            title="Засах"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(event);
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

  const upcomingEvents = events.filter((e) => e.status === 'upcoming').length;
  const ongoingEvents = events.filter((e) => e.status === 'ongoing').length;
  const completedEvents = events.filter((e) => e.status === 'completed').length;
  const totalRegistrations = events.reduce((sum, e) => sum + e.registeredCount, 0);

  return (
    <div>
      <Header title="Арга хэмжээ" subtitle="Арга хэмжээний бүртгэл удирдах" />

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{upcomingEvents}</p>
                <p className="text-sm text-dark-400">Удахгүй болох</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{ongoingEvents}</p>
                <p className="text-sm text-dark-400">Явагдаж буй</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{completedEvents}</p>
                <p className="text-sm text-dark-400">Дууссан</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{formatNumber(totalRegistrations)}</p>
                <p className="text-sm text-dark-400">Нийт бүртгэл</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
            <CalendarPlus className="w-5 h-5" />
            Шинэ арга хэмжээ
          </button>
        </div>

        {/* Data Table */}
        <DataTable
          data={events}
          columns={columns}
          searchPlaceholder="Арга хэмжээ хайх..."
          onRowClick={handleView}
        />
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Шинэ арга хэмжээ нэмэх"
        size="lg"
      >
        <div className="space-y-4">
          <FormField label="Арга хэмжээний нэр" required>
            <input
              type="text"
              className="input-field"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Арга хэмжээний нэр оруулна уу"
            />
          </FormField>
          <FormField label="Тайлбар">
            <textarea
              className="input-field min-h-[100px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Дэлгэрэнгүй тайлбар оруулна уу"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Эхлэх огноо" required>
              <input
                type="date"
                className="input-field"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </FormField>
            <FormField label="Дуусах огноо" required>
              <input
                type="date"
                className="input-field"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </FormField>
          </div>
          <FormField label="Байршил" required>
            <input
              type="text"
              className="input-field"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Арга хэмжээний байршил"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Багтаамж" required>
              <input
                type="number"
                className="input-field"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                min={1}
              />
            </FormField>
            <FormField label="Төлөв">
              <select
                className="input-field"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
                  })
                }
              >
                <option value="upcoming">Удахгүй болох</option>
                <option value="ongoing">Явагдаж буй</option>
                <option value="completed">Дууссан</option>
                <option value="cancelled">Цуцлагдсан</option>
              </select>
            </FormField>
          </div>
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
        title="Арга хэмжээ засах"
        size="lg"
      >
        <div className="space-y-4">
          <FormField label="Арга хэмжээний нэр" required>
            <input
              type="text"
              className="input-field"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </FormField>
          <FormField label="Тайлбар">
            <textarea
              className="input-field min-h-[100px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Эхлэх огноо" required>
              <input
                type="date"
                className="input-field"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </FormField>
            <FormField label="Дуусах огноо" required>
              <input
                type="date"
                className="input-field"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </FormField>
          </div>
          <FormField label="Байршил" required>
            <input
              type="text"
              className="input-field"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Багтаамж" required>
              <input
                type="number"
                className="input-field"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                min={1}
              />
            </FormField>
            <FormField label="Төлөв">
              <select
                className="input-field"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
                  })
                }
              >
                <option value="upcoming">Удахгүй болох</option>
                <option value="ongoing">Явагдаж буй</option>
                <option value="completed">Дууссан</option>
                <option value="cancelled">Цуцлагдсан</option>
              </select>
            </FormField>
          </div>
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
        title="Арга хэмжээний мэдээлэл"
        size="lg"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="pb-4 border-b border-dark-700">
              <h3 className="text-xl font-semibold text-white mb-2">
                {selectedEvent.title}
              </h3>
              <p className="text-dark-300">{selectedEvent.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-dark-500" />
                <div>
                  <p className="text-sm text-dark-400">Огноо</p>
                  <p className="text-white">
                    {formatDate(selectedEvent.startDate)}
                    {selectedEvent.startDate !== selectedEvent.endDate &&
                      ` - ${formatDate(selectedEvent.endDate)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-dark-500" />
                <div>
                  <p className="text-sm text-dark-400">Байршил</p>
                  <p className="text-white">{selectedEvent.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-dark-500" />
                <div>
                  <p className="text-sm text-dark-400">Бүртгэл</p>
                  <p className="text-white">
                    {selectedEvent.registeredCount} / {selectedEvent.capacity}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-dark-400">Төлөв</p>
                <span
                  className={clsx(
                    'badge mt-1',
                    getStatusDisplay(selectedEvent.status).color.bg,
                    getStatusDisplay(selectedEvent.status).color.text
                  )}
                >
                  {getStatusDisplay(selectedEvent.status).text}
                </span>
              </div>
            </div>

            {/* Registration Progress */}
            <div className="pt-4 border-t border-dark-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-dark-400">Бүртгэлийн явц</span>
                <span className="text-white font-medium">
                  {Math.round((selectedEvent.registeredCount / selectedEvent.capacity) * 100)}%
                </span>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      (selectedEvent.registeredCount / selectedEvent.capacity) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-dark-700">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEdit(selectedEvent);
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
        title="Арга хэмжээ устгах"
        size="sm"
      >
        {selectedEvent && (
          <div>
            <p className="text-dark-300 mb-4">
              Та <span className="text-white font-medium">{selectedEvent.title}</span> арга
              хэмжээг устгахдаа итгэлтэй байна уу?
            </p>
            <p className="text-dark-500 text-sm mb-6">
              Энэ үйлдлийг буцаах боломжгүй. {selectedEvent.registeredCount} бүртгэгдсэн
              оролцогчдын мэдээлэл устах болно.
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
