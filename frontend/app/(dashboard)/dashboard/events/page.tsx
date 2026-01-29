'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, ExternalLink, CheckCircle } from 'lucide-react';
import Card from '@/components/Card';
import Badge, { getStatusBadgeVariant, getStatusLabel } from '@/components/Badge';
import { PageLoader } from '@/components/LoadingSpinner';

interface Event {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  start_date: string;
  end_date: string;
  location: string;
  address: string;
  is_online: boolean;
  online_url?: string;
  max_participants: number;
  registered_count: number;
  is_registered: boolean;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'registered'>('all');

  useEffect(() => {
    // Simulated data - replace with API call
    setTimeout(() => {
      setEvents([
        {
          id: '1',
          title: 'Залуучуудын манлайллын сургалт',
          description: 'Манлайллын ур чадвар, багийн удирдлагын талаарх сургалт',
          type: 'training',
          status: 'upcoming',
          start_date: '2024-03-20T09:00:00',
          end_date: '2024-03-20T17:00:00',
          location: 'Улаанбаатар',
          address: 'Сүхбаатар дүүрэг, Төв цогцолбор',
          is_online: false,
          max_participants: 50,
          registered_count: 32,
          is_registered: true,
        },
        {
          id: '2',
          title: 'Онлайн уулзалт - Стратегийн хэлэлцүүлэг',
          description: '2024 оны үйл ажиллагааны төлөвлөгөөний хэлэлцүүлэг',
          type: 'meeting',
          status: 'upcoming',
          start_date: '2024-03-25T14:00:00',
          end_date: '2024-03-25T16:00:00',
          location: 'Онлайн',
          address: 'Zoom',
          is_online: true,
          online_url: 'https://zoom.us/j/123456789',
          max_participants: 100,
          registered_count: 45,
          is_registered: false,
        },
        {
          id: '3',
          title: 'Сайн дурын ажил - Хот тохижуулалт',
          description: 'Баянгол дүүргийн цэцэрлэгт хүрээлэн тохижуулах',
          type: 'volunteer',
          status: 'upcoming',
          start_date: '2024-04-01T10:00:00',
          end_date: '2024-04-01T14:00:00',
          location: 'Улаанбаатар',
          address: 'Баянгол дүүрэг, Төв цэцэрлэгт хүрээлэн',
          is_online: false,
          max_participants: 30,
          registered_count: 18,
          is_registered: false,
        },
        {
          id: '4',
          title: 'Нийгмийн хариуцлагын өдөрлөг',
          description: 'Жил бүрийн уламжлалт арга хэмжээ',
          type: 'campaign',
          status: 'completed',
          start_date: '2024-02-15T09:00:00',
          end_date: '2024-02-15T18:00:00',
          location: 'Улаанбаатар',
          address: 'Сүхбаатарын талбай',
          is_online: false,
          max_participants: 200,
          registered_count: 186,
          is_registered: true,
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handleRegister = async (eventId: string) => {
    // API call to register
    setEvents(events.map(e =>
      e.id === eventId
        ? { ...e, is_registered: true, registered_count: e.registered_count + 1 }
        : e
    ));
  };

  const handleUnregister = async (eventId: string) => {
    // API call to unregister
    setEvents(events.map(e =>
      e.id === eventId
        ? { ...e, is_registered: false, registered_count: e.registered_count - 1 }
        : e
    ));
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'upcoming') return event.status === 'upcoming';
    if (filter === 'registered') return event.is_registered;
    return true;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('mn-MN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const typeLabels: Record<string, string> = {
    meeting: 'Уулзалт',
    training: 'Сургалт',
    campaign: 'Кампейн',
    volunteer: 'Сайн дурын ажил',
    cultural: 'Соёл урлаг',
    sports: 'Спорт',
    other: 'Бусад',
  };

  if (loading) return <PageLoader text="Арга хэмжээ уншиж байна..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Арга хэмжээ</h1>
        <p className="text-gray-600 mt-1">
          Удахгүй болох арга хэмжээнүүдэд бүртгүүлэх
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: 'all', label: 'Бүгд' },
          { key: 'upcoming', label: 'Удахгүй болох' },
          { key: 'registered', label: 'Миний бүртгэл' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              filter === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events list */}
      <div className="grid gap-4">
        {filteredEvents.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-gray-500">Арга хэмжээ олдсонгүй</p>
          </Card>
        ) : (
          filteredEvents.map(event => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Date badge */}
                <div className="flex-shrink-0 w-16 h-16 bg-blue-50 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {new Date(event.start_date).getDate()}
                  </span>
                  <span className="text-xs text-blue-600 uppercase">
                    {new Date(event.start_date).toLocaleDateString('mn-MN', { month: 'short' })}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {event.title}
                    </h3>
                    <Badge variant={getStatusBadgeVariant(event.status)} size="sm">
                      {getStatusLabel(event.status)}
                    </Badge>
                    <Badge variant="secondary" size="sm">
                      {typeLabels[event.type] || event.type}
                    </Badge>
                    {event.is_registered && (
                      <Badge variant="success" size="sm">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Бүртгүүлсэн
                      </Badge>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-3">{event.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(event.start_date)} - {formatTime(event.end_date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {event.is_online ? 'Онлайн' : event.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {event.registered_count} / {event.max_participants}
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="flex-shrink-0">
                  {event.status === 'upcoming' && (
                    event.is_registered ? (
                      <button
                        onClick={() => handleUnregister(event.id)}
                        className="btn-outline text-sm"
                      >
                        Бүртгэл цуцлах
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister(event.id)}
                        disabled={event.registered_count >= event.max_participants}
                        className="btn-primary text-sm disabled:opacity-50"
                      >
                        Бүртгүүлэх
                      </button>
                    )
                  )}
                  {event.is_online && event.online_url && event.is_registered && (
                    <a
                      href={event.online_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline text-sm flex items-center gap-1 mt-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Холбогдох
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
