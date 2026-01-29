'use client';

import { useState, useEffect } from 'react';
import { Building2, Users, MapPin, Phone, Mail, ChevronRight, Search } from 'lucide-react';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import { PageLoader } from '@/components/LoadingSpinner';

interface Organization {
  id: string;
  name: string;
  level: string;
  code: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  member_count: number;
  province_name?: string;
  district_name?: string;
  parent_name?: string;
  is_active: boolean;
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  useEffect(() => {
    // Simulated data - replace with API call
    setTimeout(() => {
      setOrganizations([
        {
          id: '1',
          name: 'Социал Демократ Залуучуудын Нийгэмлэг',
          level: 'national',
          code: 'SDYN',
          description: 'Үндэсний түвшний залуучуудын байгууллага',
          address: 'Улаанбаатар хот, Сүхбаатар дүүрэг',
          phone: '77001100',
          email: 'info@sdyn.mn',
          member_count: 2456,
          is_active: true,
        },
        {
          id: '2',
          name: 'СДЗН - Улаанбаатар',
          level: 'province',
          code: 'SDYN-UB',
          province_name: 'Улаанбаатар',
          parent_name: 'Социал Демократ Залуучуудын Нийгэмлэг',
          member_count: 1234,
          is_active: true,
        },
        {
          id: '3',
          name: 'СДЗН - Дархан-Уул',
          level: 'province',
          code: 'SDYN-DAR',
          province_name: 'Дархан-Уул',
          parent_name: 'Социал Демократ Залуучуудын Нийгэмлэг',
          member_count: 456,
          is_active: true,
        },
        {
          id: '4',
          name: 'СДЗН - Орхон',
          level: 'province',
          code: 'SDYN-ORH',
          province_name: 'Орхон',
          parent_name: 'Социал Демократ Залуучуудын Нийгэмлэг',
          member_count: 312,
          is_active: true,
        },
        {
          id: '5',
          name: 'СДЗН - Өвөрхангай',
          level: 'province',
          code: 'SDYN-OVH',
          province_name: 'Өвөрхангай',
          parent_name: 'Социал Демократ Залуучуудын Нийгэмлэг',
          member_count: 234,
          is_active: true,
        },
        {
          id: '6',
          name: 'СДЗН - Хөвсгөл',
          level: 'province',
          code: 'SDYN-HOS',
          province_name: 'Хөвсгөл',
          parent_name: 'Социал Демократ Залуучуудын Нийгэмлэг',
          member_count: 189,
          is_active: true,
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const levelLabels: Record<string, string> = {
    national: 'Үндэсний',
    province: 'Аймаг/Хот',
    district: 'Сум/Дүүрэг',
    branch: 'Салбар',
  };

  const levelColors: Record<string, string> = {
    national: 'info',
    province: 'success',
    district: 'warning',
    branch: 'secondary',
  };

  const filteredOrgs = organizations.filter(org =>
    org.name.toLowerCase().includes(search.toLowerCase()) ||
    org.code.toLowerCase().includes(search.toLowerCase()) ||
    (org.province_name && org.province_name.toLowerCase().includes(search.toLowerCase()))
  );

  const nationalOrg = organizations.find(org => org.level === 'national');
  const provinceOrgs = organizations.filter(org => org.level === 'province');

  if (loading) return <PageLoader text="Байгууллагууд уншиж байна..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Байгууллагууд</h1>
        <p className="text-gray-600 mt-1">СДЗН-ийн бүтэц, байгууллагуудын мэдээлэл</p>
      </div>

      {/* National organization */}
      {nationalOrg && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-100 rounded-xl">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900">{nationalOrg.name}</h2>
                  <Badge variant="info">{levelLabels[nationalOrg.level]}</Badge>
                </div>
                <p className="text-gray-600 mt-1">{nationalOrg.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-400" />
                <span className="font-semibold text-gray-900">{nationalOrg.member_count}</span>
                <span className="text-gray-500">гишүүн</span>
              </div>
            </div>
          </div>
          {(nationalOrg.address || nationalOrg.phone || nationalOrg.email) && (
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-blue-200 text-sm text-gray-600">
              {nationalOrg.address && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {nationalOrg.address}
                </div>
              )}
              {nationalOrg.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {nationalOrg.phone}
                </div>
              )}
              {nationalOrg.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {nationalOrg.email}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Байгууллага хайх..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10 w-full"
        />
      </div>

      {/* Province organizations */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Аймаг, хотын байгууллагууд ({provinceOrgs.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrgs.filter(org => org.level !== 'national').map(org => (
            <Card
              key={org.id}
              hover
              onClick={() => setSelectedOrg(org)}
              className="group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <Building2 className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {org.name}
                    </h4>
                    <p className="text-sm text-gray-500">{org.code}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <Badge variant={levelColors[org.level] as any} size="sm">
                  {levelLabels[org.level]}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  {org.member_count} гишүүн
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {filteredOrgs.length === 0 && (
        <Card className="text-center py-8">
          <p className="text-gray-500">Байгууллага олдсонгүй</p>
        </Card>
      )}
    </div>
  );
}
