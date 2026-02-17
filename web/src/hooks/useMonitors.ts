import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import type { Monitor, Check, MonitorStats, Incident, DailyStats, ApiError } from '@/types';
import { toast, confirmAction, handleApiError } from '@/utils/notifications';

const API_BASE = import.meta.env.VITE_API_BASE || '';
const POLLING_INTERVAL = 3000;

type GroupedChecks = Record<number, Check[]>;

interface UseMonitorsReturn {
  monitors: Monitor[];
  checks: GroupedChecks;
  incidents: Incident[];
  loading: boolean;
  showAdd: boolean;
  setShowAdd: (show: boolean) => void;
  addMonitor: (name: string, url: string, interval: number) => Promise<boolean>;
  updateMonitor: (id: number, name: string, url: string, interval: number) => Promise<boolean>;
  deleteMonitor: (id: number) => Promise<void>;
  addIncident: (title: string, description: string, status: 'investigating' | 'monitoring' | 'resolved') => Promise<boolean>;
  deleteIncident: (id: number) => Promise<void>;
  verifyToken: (token: string) => Promise<boolean>;
  getMonitorHistory: (id: number) => Promise<DailyStats[]>;
  monitorHistory: GroupedChecks;
  dailyHistory: Record<number, DailyStats[]>;
  globalStats: MonitorStats;
  isAdmin: boolean;
  setToken: (token: string | null) => void;
}

export function useMonitors(): UseMonitorsReturn {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [checks, setChecks] = useState<GroupedChecks>({});
  const [dailyHistory, setDailyHistory] = useState<Record<number, DailyStats[]>>({});
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('admin_token');
    } catch (err) {
      console.error('Failed to read from localStorage:', err);
      return null;
    }
  });

  useEffect(() => {
    try {
      if (token) {
        localStorage.setItem('admin_token', token);
      } else {
        localStorage.removeItem('admin_token');
      }
    } catch (err) {
      console.error('Failed to write to localStorage:', err);
    }
  }, [token]);

  const fetchData = useCallback(async () => {
    try {
      const config = token ? { headers: { Authorization: token } } : {};
      const [monRes, checkRes, incRes, historyRes] = await Promise.all([
        axios.get(`${API_BASE}/monitors`, config),
        axios.get(`${API_BASE}/checks?limit=50`, config),
        axios.get(`${API_BASE}/incidents`, config),
        axios.get(`${API_BASE}/history`, config)
      ]);
      setMonitors(monRes.data || []);
      setChecks(checkRes.data || {});
      setIncidents(incRes.data || []);
      setDailyHistory(historyRes.data || {});
    } catch (err) {
      console.error('Data fetch failed', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, POLLING_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchData]);

  const addMonitor = useCallback(async (name: string, url: string, interval: number) => {
    try {
      await axios.post(`${API_BASE}/monitors`, { name, url, interval }, {
        headers: { Authorization: token }
      });
      setShowAdd(false);
      fetchData();
      toast('Monitor added successfully', 'success');
      return true;
    } catch (err) {
      const error = err as ApiError;
      if (error.response?.status === 401) {
        toast('Unauthorized: Invalid token', 'error');
        setToken(null);
      } else {
        handleApiError(error);
      }
      return false;
    }
  }, [token, fetchData, setShowAdd]);

  const updateMonitor = useCallback(async (id: number, name: string, url: string, interval: number) => {
    try {
      await axios.put(`${API_BASE}/monitors`, { id, name, url, interval }, {
        headers: { Authorization: token }
      });
      fetchData();
      toast('Monitor updated successfully', 'success');
      return true;
    } catch (err) {
      const error = err as ApiError;
      if (error.response?.status === 401) {
        toast('Unauthorized: Invalid token', 'error');
        setToken(null);
      } else {
        handleApiError(error);
      }
      return false;
    }
  }, [token, fetchData]);

  const deleteMonitor = useCallback(async (id: number) => {
    const confirmed = await confirmAction('Delete this monitor? This action cannot be undone.');
    if (!confirmed) return;
    try {
      await axios.delete(`${API_BASE}/monitors/${id}`, {
        headers: { Authorization: token }
      });
      fetchData();
      toast('Monitor deleted successfully', 'success');
    } catch (err) {
      const error = err as ApiError;
      if (error.response?.status === 401) {
        toast('Unauthorized: Invalid token', 'error');
        setToken(null);
      } else {
        handleApiError(error);
      }
    }
  }, [token, fetchData]);

  const addIncident = useCallback(async (title: string, description: string, status: 'investigating' | 'monitoring' | 'resolved') => {
    try {
      await axios.post(`${API_BASE}/incidents`, { title, description, status }, {
        headers: { Authorization: token }
      });
      fetchData();
      toast('Incident posted successfully', 'success');
      return true;
    } catch (err) {
      const error = err as ApiError;
      if (error.response?.status === 401) {
        toast('Unauthorized: Invalid token', 'error');
        setToken(null);
      } else {
        handleApiError(error);
      }
      return false;
    }
  }, [token, fetchData]);

  const deleteIncident = useCallback(async (id: number) => {
    const confirmed = await confirmAction('Delete this incident?');
    if (!confirmed) return;
    try {
      await axios.delete(`${API_BASE}/incidents/${id}`, {
        headers: { Authorization: token }
      });
      fetchData();
      toast('Incident deleted successfully', 'success');
    } catch (err) {
      const error = err as ApiError;
      if (error.response?.status === 401) {
        toast('Unauthorized: Invalid token', 'error');
        setToken(null);
      } else {
        handleApiError(error);
      }
    }
  }, [token, fetchData]);

  const getMonitorHistory = useCallback(async (id: number): Promise<DailyStats[]> => {
    try {
      const res = await axios.get<DailyStats[]>(`${API_BASE}/history/${id}`);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch monitor history:', err);
      toast('Failed to load history data', 'error');
      return [];
    }
  }, []);

  const verifyToken = useCallback(async (testToken: string) => {
    try {
      await axios.post(`${API_BASE}/verify-token`, {}, {
        headers: { Authorization: testToken }
      });
      return true;
    } catch (err) {
      return false;
    }
  }, []);

  const monitorHistory = useMemo(() => {
    const history: GroupedChecks = {};
    Object.entries(checks).forEach(([monitorId, monitorChecks]) => {
      history[Number(monitorId)] = [...monitorChecks].reverse();
    });
    return history;
  }, [checks]);

  const globalStats = useMemo<MonitorStats>(() => {
    const latestChecks = monitors.map(m => {
       const mChecks = checks[m.id];
       return mChecks && mChecks.length > 0 ? mChecks[0] : null; 
    }).filter((c): c is Check => !!c);

    const upCount = latestChecks.filter(c => c.is_up).length;
    const avgLatency = latestChecks.length > 0 
      ? Math.round(latestChecks.reduce((acc, c) => acc + c.latency, 0) / latestChecks.length) 
      : 0;

    return { 
      total: monitors.length, 
      up: upCount, 
      down: monitors.length - upCount,
      avgLatency 
    };
  }, [checks, monitors]);

  return {
    monitors,
    checks,
    incidents,
    loading,
    showAdd,
    setShowAdd,
    addMonitor,
    updateMonitor,
    deleteMonitor,
    addIncident,
    deleteIncident,
    verifyToken,
    getMonitorHistory,
    monitorHistory,
    dailyHistory,
    globalStats,
    isAdmin: !!token,
    setToken
  };
}
