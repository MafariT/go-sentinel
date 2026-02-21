import { useEffect, useState } from 'react';
import { useMonitors } from './hooks/useMonitors';
import { setupAxiosInterceptors } from './utils/axios-interceptors';
import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { IncidentList } from './components/IncidentList';
import { MonitorList } from './components/MonitorList';
import { SettingsPage } from './components/SettingsPage';
import { Footer } from './components/Footer';
import { LoginPage } from './components/LoginPage';

function App() {
  const {
    monitors,
    checks,
    incidents,
    webhooks,
    loading,
    addMonitor,
    updateMonitor,
    deleteMonitor,
    addIncident,
    deleteIncident,
    addWebhook,
    updateWebhook,
    deleteWebhook,
    verifyToken,
    getMonitorHistory,
    monitorHistory,
    dailyHistory,
    globalStats,
    isAdmin,
    setToken
  } = useMonitors();

  const [view, setView] = useState<'dashboard' | 'settings' | 'login'>('dashboard');

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

  // Kick non-admins out of settings if they somehow land there
  useEffect(() => {
    if (view === 'settings' && !isAdmin) setView('dashboard');
  }, [view, isAdmin]);

  useEffect(() => {
    const isHealthy = globalStats.down === 0;
    document.title = isHealthy ? 'Go-Sentinel • Operational' : `Go-Sentinel • ${globalStats.down} Issue(s)`;
  }, [globalStats]);

  const handleLogin = (token: string) => {
    setToken(token);
    setView('dashboard');
  };

  const handleLogout = () => {
    setToken(null);
    setView('dashboard');
  };

  if (view === 'login') {
    return <LoginPage onLogin={handleLogin} verifyToken={verifyToken} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <Navbar
        isAdmin={isAdmin}
        view={view === 'settings' ? 'settings' : 'dashboard'}
        onNavigate={(v) => setView(v)}
        onLogout={handleLogout}
      />

      {view === 'settings' && isAdmin ? (
        <SettingsPage
          monitors={monitors}
          checks={checks}
          monitorHistory={monitorHistory}
          dailyHistory={dailyHistory}
          incidents={incidents}
          webhooks={webhooks}
          onAddMonitor={addMonitor}
          onUpdateMonitor={updateMonitor}
          onDeleteMonitor={deleteMonitor}
          onAddIncident={addIncident}
          onDeleteIncident={deleteIncident}
          onAddWebhook={addWebhook}
          onUpdateWebhook={updateWebhook}
          onDeleteWebhook={deleteWebhook}
          fetchHistory={getMonitorHistory}
        />
      ) : (
        <main className="flex-1 w-full p-6">
          <DashboardStats stats={globalStats} />

          <IncidentList
            incidents={incidents}
            isAdmin={false}
            onAdd={addIncident}
            onDelete={deleteIncident}
          />

          <div className="border border-border rounded-md overflow-hidden bg-card">
            <div className="hidden md:grid grid-cols-[2fr_3fr_100px_80px] border-b border-border bg-muted/50 px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              <div>Monitor Details</div>
              <div>Latency Trend (Last 50)</div>
              <div className="text-right">Latency</div>
              <div className="text-right">Interval</div>
            </div>
            <MonitorList
              monitors={monitors}
              checks={checks}
              loading={loading}
              monitorHistory={monitorHistory}
              dailyHistory={dailyHistory}
              onDelete={deleteMonitor}
              onEdit={() => {}}
              fetchHistory={getMonitorHistory}
              isAdmin={false}
            />
          </div>
        </main>
      )}

      <Footer />
    </div>
  );
}

export default App;
