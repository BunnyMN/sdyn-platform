'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  membersApi,
  organizationsApi,
  eventsApi,
  feesApi,
  reportsApi,
  Member,
  Organization,
  Event,
  MembershipFee,
  DashboardStats,
  PaginatedResponse,
} from '@/lib/api';

// Generic list params
interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  organizationId?: string;
  provinceId?: string;
}

// Generic hook state
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Generic paginated state
interface UsePaginatedState<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

// ========================
// Members Hooks
// ========================
export function useMembers(initialParams?: ListParams) {
  const [state, setState] = useState<UsePaginatedState<Member>>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
    loading: true,
    error: null,
  });
  const [params, setParams] = useState<ListParams>(initialParams || {});

  const fetchMembers = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await membersApi.getAll({
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        search: params.search,
      });
      setState({
        data: response.data || [],
        total: response.total || 0,
        page: response.page || 1,
        pageSize: response.pageSize || 10,
        totalPages: response.totalPages || 0,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch members',
      }));
    }
  }, [params]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const refetch = () => fetchMembers();
  const updateParams = (newParams: Partial<ListParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  };

  return { ...state, refetch, updateParams, params };
}

export function useMember(id: string | null) {
  const [state, setState] = useState<UseApiState<Member>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!id) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    const fetchMember = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const data = await membersApi.getById(id);
        setState({ data, loading: false, error: null });
      } catch (err) {
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to fetch member',
        });
      }
    };

    fetchMember();
  }, [id]);

  return state;
}

export function useMemberMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMember = async (data: Partial<Member>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await membersApi.create(data);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create member');
      setLoading(false);
      throw err;
    }
  };

  const updateMember = async (id: string, data: Partial<Member>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await membersApi.update(id, data);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member');
      setLoading(false);
      throw err;
    }
  };

  const deleteMember = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await membersApi.delete(id);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete member');
      setLoading(false);
      throw err;
    }
  };

  return { createMember, updateMember, deleteMember, loading, error };
}

// ========================
// Organizations Hooks
// ========================
export function useOrganizations(initialParams?: ListParams) {
  const [state, setState] = useState<UsePaginatedState<Organization>>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
    loading: true,
    error: null,
  });
  const [params, setParams] = useState<ListParams>(initialParams || {});

  const fetchOrganizations = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await organizationsApi.getAll({
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        search: params.search,
      });
      setState({
        data: response.data || [],
        total: response.total || 0,
        page: response.page || 1,
        pageSize: response.pageSize || 10,
        totalPages: response.totalPages || 0,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch organizations',
      }));
    }
  }, [params]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const refetch = () => fetchOrganizations();
  const updateParams = (newParams: Partial<ListParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  };

  return { ...state, refetch, updateParams, params };
}

export function useOrganization(id: string | null) {
  const [state, setState] = useState<UseApiState<Organization>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!id) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    const fetchOrganization = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const data = await organizationsApi.getById(id);
        setState({ data, loading: false, error: null });
      } catch (err) {
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to fetch organization',
        });
      }
    };

    fetchOrganization();
  }, [id]);

  return state;
}

export function useOrganizationMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrganization = async (data: Partial<Organization>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await organizationsApi.create(data);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization');
      setLoading(false);
      throw err;
    }
  };

  const updateOrganization = async (id: string, data: Partial<Organization>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await organizationsApi.update(id, data);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update organization');
      setLoading(false);
      throw err;
    }
  };

  const deleteOrganization = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await organizationsApi.delete(id);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete organization');
      setLoading(false);
      throw err;
    }
  };

  return { createOrganization, updateOrganization, deleteOrganization, loading, error };
}

// ========================
// Events Hooks
// ========================
export function useEvents(initialParams?: ListParams) {
  const [state, setState] = useState<UsePaginatedState<Event>>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
    loading: true,
    error: null,
  });
  const [params, setParams] = useState<ListParams>(initialParams || {});

  const fetchEvents = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await eventsApi.getAll({
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        search: params.search,
      });
      setState({
        data: response.data || [],
        total: response.total || 0,
        page: response.page || 1,
        pageSize: response.pageSize || 10,
        totalPages: response.totalPages || 0,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch events',
      }));
    }
  }, [params]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const refetch = () => fetchEvents();
  const updateParams = (newParams: Partial<ListParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  };

  return { ...state, refetch, updateParams, params };
}

export function useEvent(id: string | null) {
  const [state, setState] = useState<UseApiState<Event>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!id) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    const fetchEvent = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const data = await eventsApi.getById(id);
        setState({ data, loading: false, error: null });
      } catch (err) {
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to fetch event',
        });
      }
    };

    fetchEvent();
  }, [id]);

  return state;
}

export function useEventMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEvent = async (data: Partial<Event>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await eventsApi.create(data);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
      setLoading(false);
      throw err;
    }
  };

  const updateEvent = async (id: string, data: Partial<Event>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await eventsApi.update(id, data);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
      setLoading(false);
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await eventsApi.delete(id);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      setLoading(false);
      throw err;
    }
  };

  return { createEvent, updateEvent, deleteEvent, loading, error };
}

// ========================
// Fees Hooks
// ========================
export function useFees(initialParams?: ListParams) {
  const [state, setState] = useState<UsePaginatedState<MembershipFee>>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
    loading: true,
    error: null,
  });
  const [params, setParams] = useState<ListParams>(initialParams || {});

  const fetchFees = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await feesApi.getAll({
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        search: params.search,
        status: params.status,
      });
      setState({
        data: response.data || [],
        total: response.total || 0,
        page: response.page || 1,
        pageSize: response.pageSize || 10,
        totalPages: response.totalPages || 0,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch fees',
      }));
    }
  }, [params]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const refetch = () => fetchFees();
  const updateParams = (newParams: Partial<ListParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  };

  return { ...state, refetch, updateParams, params };
}

export function useFeeMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createFee = async (data: Partial<MembershipFee>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await feesApi.create(data);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create fee');
      setLoading(false);
      throw err;
    }
  };

  const updateFee = async (id: string, data: Partial<MembershipFee>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await feesApi.update(id, data);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update fee');
      setLoading(false);
      throw err;
    }
  };

  const approveFee = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await feesApi.approve(id);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve fee');
      setLoading(false);
      throw err;
    }
  };

  return { createFee, updateFee, approveFee, loading, error };
}

// ========================
// Dashboard/Reports Hooks
// ========================
export function useDashboardStats() {
  const [state, setState] = useState<UseApiState<DashboardStats>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchStats = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await reportsApi.getDashboardStats();
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch dashboard stats',
      });
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { ...state, refetch: fetchStats };
}

export function useMembershipReport(params?: { startDate?: string; endDate?: string }) {
  const [state, setState] = useState<UseApiState<unknown>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchReport = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const data = await reportsApi.getMembershipReport(params);
        setState({ data, loading: false, error: null });
      } catch (err) {
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to fetch membership report',
        });
      }
    };

    fetchReport();
  }, [params?.startDate, params?.endDate]);

  return state;
}

// ========================
// Provinces and Districts (Static data from API)
// ========================
import { api } from '@/lib/api';

interface Province {
  id: string;
  name: string;
  code: string;
}

interface District {
  id: string;
  name: string;
  code: string;
  provinceId: string;
}

export function useProvinces() {
  const [state, setState] = useState<UseApiState<Province[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await api.get<Province[]>('/provinces');
        setState({ data, loading: false, error: null });
      } catch (err) {
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to fetch provinces',
        });
      }
    };

    fetchProvinces();
  }, []);

  return state;
}

export function useDistricts(provinceId?: string) {
  const [state, setState] = useState<UseApiState<District[]>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!provinceId) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    const fetchDistricts = async () => {
      setState(prev => ({ ...prev, loading: true }));
      try {
        const data = await api.get<District[]>(`/provinces/${provinceId}/districts`);
        setState({ data, loading: false, error: null });
      } catch (err) {
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to fetch districts',
        });
      }
    };

    fetchDistricts();
  }, [provinceId]);

  return state;
}
