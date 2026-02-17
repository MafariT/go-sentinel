import { useEffect, useState } from 'react';
import { useMonitors } from './hooks/useMonitors';
import { setupAxiosInterceptors } from './utils/axios-interceptors';
import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { IncidentList } from './components/IncidentList';
import { MonitorForm } from './components/MonitorForm';
import { MonitorList } from './components/MonitorList';
import { Footer } from './components/Footer';
import { LoginPage } from './components/LoginPage';
import type { Monitor } from './types';

function App() {
  const {
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
    isAdmin,
    setToken
  } = useMonitors();

  const [view, setView] = useState<'dashboard' | 'login'>('dashboard');
  const [editingMonitor, setEditingMonitor] = useState<Monitor | null>(null);

  useEffect(() => {
    setupAxiosInterceptors(() => {
      setToken(null);
      setView('login');
    });
  }, [setToken]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('login') === 'true') {
      setView('login');
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const handleLogin = (token: string) => {
    setToken(token);
    setView('dashboard');
  };

  const handleLogout = () => {
    setToken(null);
  };

  useEffect(() => {
    const isHealthy = globalStats.down === 0;
    document.title = isHealthy ? "Go-Sentinel • Operational" : `Go-Sentinel • ${globalStats.down} Issue(s)`;
  }, [globalStats]);

  if (view === 'login') {
    return <LoginPage onLogin={handleLogin} verifyToken={verifyToken} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <Navbar 
        showAdd={showAdd} 
        setShowAdd={(show) => { setShowAdd(show); setEditingMonitor(null); }}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />

      <main className="flex-1 w-full p-6">
        <DashboardStats stats={globalStats} />
        
        <IncidentList 
          incidents={incidents} 
          isAdmin={isAdmin} 
          onAdd={addIncident}
          onDelete={deleteIncident}
        />

        {(showAdd || editingMonitor) && (
          <MonitorForm 
            onAdd={async (n, u, i) => { 
              const success = await addMonitor(n, u, i);
              if (success) setShowAdd(false);
              return success;
            }}
            onUpdate={async (id, n, u, i) => {
              const success = await updateMonitor(id, n, u, i);
              if (success) setEditingMonitor(null);
              return success;
            }}
            monitor={editingMonitor}
            onCancel={() => { setShowAdd(false); setEditingMonitor(null); }}
          />
        )}

        <div className="border border-border rounded-md overflow-hidden bg-card">
          <div className={`hidden md:grid ${isAdmin ? 'grid-cols-[2fr_3fr_100px_80px_80px]' : 'grid-cols-[2fr_3fr_100px_80px]'} border-b border-border bg-muted/50 px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground`}>
            <div>Monitor Details</div>
            <div>Latency Trend (Last 50)</div>
            <div className="text-right">Latency</div>
            <div className="text-right">Interval</div>
            {isAdmin && <div className="text-right">Action</div>}
          </div>

          <MonitorList 
            monitors={monitors} 
            checks={checks} 
            loading={loading} 
            monitorHistory={monitorHistory} 
            dailyHistory={dailyHistory}
            onDelete={deleteMonitor}
            onEdit={setEditingMonitor} 
            fetchHistory={getMonitorHistory}
            isAdmin={isAdmin}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
