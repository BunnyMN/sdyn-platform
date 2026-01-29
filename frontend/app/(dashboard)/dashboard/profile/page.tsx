'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Calendar, Edit, Camera, Save } from 'lucide-react';
import Card from '@/components/Card';
import Modal, { FormField, ModalFooter } from '@/components/Modal';
import Badge from '@/components/Badge';
import { PageLoader } from '@/components/LoadingSpinner';

interface Profile {
  id: string;
  member_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  birth_date: string;
  national_id: string;
  address: string;
  province_name: string;
  district_name: string;
  education: string;
  occupation: string;
  workplace: string;
  status: string;
  joined_at: string;
  avatar_url?: string;
  bio?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Simulated data - replace with API call
    setTimeout(() => {
      const data: Profile = {
        id: '1',
        member_id: 'СДЗН-2024-00001',
        first_name: 'Батболд',
        last_name: 'Ганбат',
        email: 'batbold@example.com',
        phone: '99001122',
        gender: 'male',
        birth_date: '1990-05-15',
        national_id: 'УБ90051512',
        address: 'Баянгол дүүрэг, 5-р хороо',
        province_name: 'Улаанбаатар',
        district_name: 'Баянгол',
        education: 'bachelor',
        occupation: 'Инженер',
        workplace: 'ТЭХК',
        status: 'active',
        joined_at: '2024-01-15',
        bio: 'Залуучуудын хөгжил, боловсролын чиглэлээр идэвхтэй ажилладаг.',
      };
      setProfile(data);
      setFormData(data);
      setLoading(false);
    }, 500);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // API call to update profile
    await new Promise(resolve => setTimeout(resolve, 1000));
    setProfile({ ...profile!, ...formData });
    setSaving(false);
    setIsEditing(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const educationLabels: Record<string, string> = {
    primary: 'Бага',
    secondary: 'Дунд',
    high_school: 'Бүрэн дунд',
    vocational: 'Мэргэжлийн',
    bachelor: 'Бакалавр',
    master: 'Магистр',
    doctorate: 'Доктор',
  };

  const genderLabels: Record<string, string> = {
    male: 'Эрэгтэй',
    female: 'Эмэгтэй',
    other: 'Бусад',
  };

  if (loading) return <PageLoader text="Профайл уншиж байна..." />;
  if (!profile) return <div>Профайл олдсонгүй</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Миний профайл</h1>
          <p className="text-gray-600 mt-1">Хувийн мэдээллээ удирдах</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="btn-primary">
            <Edit className="w-5 h-5 mr-2" />
            Засах
          </button>
        )}
      </div>

      {/* Profile header */}
      <Card>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-blue-600">
                  {profile.first_name[0]}
                </span>
              )}
            </div>
            {isEditing && (
              <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900">
              {profile.last_name} {profile.first_name}
            </h2>
            <p className="text-gray-500">{profile.member_id}</p>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
              <Badge variant="success">Идэвхтэй гишүүн</Badge>
              <span className="text-sm text-gray-500">
                Элссэн: {formatDate(profile.joined_at)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal info */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-4 border-b border-gray-200">
            Хувийн мэдээлэл
          </h3>
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Овог">
                  <input
                    type="text"
                    className="input"
                    value={formData.last_name || ''}
                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </FormField>
                <FormField label="Нэр">
                  <input
                    type="text"
                    className="input"
                    value={formData.first_name || ''}
                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </FormField>
              </div>
              <FormField label="Хүйс">
                <select
                  className="input"
                  value={formData.gender || ''}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="male">Эрэгтэй</option>
                  <option value="female">Эмэгтэй</option>
                  <option value="other">Бусад</option>
                </select>
              </FormField>
              <FormField label="Төрсөн огноо">
                <input
                  type="date"
                  className="input"
                  value={formData.birth_date || ''}
                  onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                />
              </FormField>
            </div>
          ) : (
            <div className="space-y-4">
              <InfoRow icon={User} label="Овог нэр" value={`${profile.last_name} ${profile.first_name}`} />
              <InfoRow icon={User} label="Хүйс" value={genderLabels[profile.gender] || profile.gender} />
              <InfoRow icon={Calendar} label="Төрсөн огноо" value={formatDate(profile.birth_date)} />
              <InfoRow icon={User} label="Регистрийн дугаар" value={profile.national_id} />
            </div>
          )}
        </Card>

        {/* Contact info */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-4 border-b border-gray-200">
            Холбоо барих
          </h3>
          {isEditing ? (
            <div className="space-y-4">
              <FormField label="И-мэйл">
                <input
                  type="email"
                  className="input"
                  value={formData.email || ''}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </FormField>
              <FormField label="Утас">
                <input
                  type="tel"
                  className="input"
                  value={formData.phone || ''}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </FormField>
              <FormField label="Хаяг">
                <textarea
                  className="input min-h-[80px]"
                  value={formData.address || ''}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </FormField>
            </div>
          ) : (
            <div className="space-y-4">
              <InfoRow icon={Mail} label="И-мэйл" value={profile.email} />
              <InfoRow icon={Phone} label="Утас" value={profile.phone} />
              <InfoRow icon={MapPin} label="Аймаг/Хот" value={profile.province_name} />
              <InfoRow icon={MapPin} label="Сум/Дүүрэг" value={profile.district_name} />
              <InfoRow icon={MapPin} label="Хаяг" value={profile.address} />
            </div>
          )}
        </Card>

        {/* Education & Work */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-4 border-b border-gray-200">
            Боловсрол, Ажил мэргэжил
          </h3>
          {isEditing ? (
            <div className="space-y-4">
              <FormField label="Боловсрол">
                <select
                  className="input"
                  value={formData.education || ''}
                  onChange={e => setFormData({ ...formData, education: e.target.value })}
                >
                  {Object.entries(educationLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Мэргэжил">
                <input
                  type="text"
                  className="input"
                  value={formData.occupation || ''}
                  onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                />
              </FormField>
              <FormField label="Ажлын газар">
                <input
                  type="text"
                  className="input"
                  value={formData.workplace || ''}
                  onChange={e => setFormData({ ...formData, workplace: e.target.value })}
                />
              </FormField>
            </div>
          ) : (
            <div className="space-y-4">
              <InfoRow icon={GraduationCap} label="Боловсрол" value={educationLabels[profile.education] || profile.education} />
              <InfoRow icon={Briefcase} label="Мэргэжил" value={profile.occupation} />
              <InfoRow icon={Briefcase} label="Ажлын газар" value={profile.workplace} />
            </div>
          )}
        </Card>

        {/* Bio */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-4 border-b border-gray-200">
            Танилцуулга
          </h3>
          {isEditing ? (
            <FormField label="Өөрийн тухай">
              <textarea
                className="input min-h-[120px]"
                value={formData.bio || ''}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Өөрийн тухай товч танилцуулга бичнэ үү..."
              />
            </FormField>
          ) : (
            <p className="text-gray-600">{profile.bio || 'Танилцуулга оруулаагүй байна.'}</p>
          )}
        </Card>
      </div>

      {/* Save/Cancel buttons */}
      {isEditing && (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              setFormData(profile);
              setIsEditing(false);
            }}
            className="btn-outline"
          >
            Болих
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? (
              <>Хадгалж байна...</>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Хадгалах
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// Helper component for info rows
function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-gray-400 mt-0.5" />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-gray-900">{value || '-'}</p>
      </div>
    </div>
  );
}
