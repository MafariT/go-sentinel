import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import type { Monitor, Check, MonitorStats } from '../types';

const API_BASE = '';

interface UseMonitorsReturn {
  monitors: Monitor[];
  checks: Check[];
  loading: boolean;
  showAdd: boolean;
  setShowAdd: (show: boolean) => void;
  addMonitor: (name: string, url: string, interval: number) => Promise<boolean>;
  deleteMonitor: (id: number) => Promise<void>;
  monitorHistory: Record<number, any[]>;
  globalStats: MonitorStats;
  isAdmin: boolean;
  setToken: (token: string | null) => void;
}

export function useMonitors(): UseMonitorsReturn {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [checks, setChecks] = useState<Check[]>([]);
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
        axios.get(`${API_BASE}/checks?limit=500`)
      ]);
      setMonitors(monRes.data || []);
      setChecks(checkRes.data || []);
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
    const history: Record<number, any[]> = {};
    const sortedChecks = [...checks].sort((a, b) => 
      new Date(a.checked_at).getTime() - new Date(b.checked_at).getTime()
    );
    
    sortedChecks.forEach(c => {
      if (!history[c.monitor_id]) history[c.monitor_id] = [];
      history[c.monitor_id].push({ latency: c.latency });
    });
    return history;
  }, [checks]);

  const globalStats = useMemo<MonitorStats>(() => {
    const totalChecks = checks.length;
    const avgLatency = totalChecks > 0 
      ? Math.round(checks.reduce((acc, c) => acc + c.latency, 0) / totalChecks) 
      : 0;
    const upMonitors = monitors.filter(m => {
       const lastCheck = checks.find(c => c.monitor_id === m.id);
       return lastCheck ? lastCheck.is_up : true;
    }).length;

    return { totalChecks, avgLatency, upMonitors };
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
