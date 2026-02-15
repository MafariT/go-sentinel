import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import type { Monitor, Check, MonitorStats } from '../types';

const API_BASE = '';

type GroupedChecks = Record<number, Check[]>;

interface UseMonitorsReturn {
  monitors: Monitor[];
  checks: GroupedChecks;
  loading: boolean;
  showAdd: boolean;
  setShowAdd: (show: boolean) => void;
  addMonitor: (name: string, url: string, interval: number) => Promise<boolean>;
  deleteMonitor: (id: number) => Promise<void>;
  monitorHistory: GroupedChecks; // History is now directly the grouped checks
  globalStats: MonitorStats;
  isAdmin: boolean;
  setToken: (token: string | null) => void;
}

export function useMonitors(): UseMonitorsReturn {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [checks, setChecks] = useState<GroupedChecks>({});
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('admin_token', token);
    } else {
      localStorage.removeItem('admin_token');
    }
  }, [token]);

  const fetchData = async () => {
    try {
      const [monRes, checkRes] = await Promise.all([
        axios.get(`${API_BASE}/monitors`),
        axios.get(`${API_BASE}/checks?limit=50`)
      ]);
      setMonitors(monRes.data || []);
      setChecks(checkRes.data || {});
    } catch (err) {
      console.error('Data fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 3000);
    return () => clearInterval(timer);
  }, []);

  const addMonitor = async (name: string, url: string, interval: number) => {
    try {
      await axios.post(`${API_BASE}/monitors`, { name, url, interval }, {
        headers: { Authorization: token }
      });
      setShowAdd(false);
      fetchData();
      return true;
    } catch (err: any) {
      if (err.response?.status === 401) {
        alert('Unauthorized: Invalid or missing token');
        setToken(null);
      }
      return false;
    }
  };

  const deleteMonitor = async (id: number) => {
    if (!confirm('Delete this monitor?')) return;
    try {
      await axios.delete(`${API_BASE}/monitors?id=${id}`, {
        headers: { Authorization: token }
      });
      fetchData();
    } catch (err: any) {
      if (err.response?.status === 401) {
        alert('Unauthorized: Invalid or missing token');
        setToken(null);
      } else {
        alert('Delete failed');
      }
    }
  };

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
       return mChecks && mChecks.length > 0 ? mChecks[0] : null; // First is newest
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
    loading,
    showAdd,
    setShowAdd,
    addMonitor,
    deleteMonitor,
    monitorHistory,
    globalStats,
    isAdmin: !!token,
    setToken
  };
}
