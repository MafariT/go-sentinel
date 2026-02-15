import { useEffect, useState } from 'react';
import { useMonitors } from './hooks/useMonitors';
import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { IncidentList } from './components/IncidentList';
import { MonitorForm } from './components/MonitorForm';
import { MonitorList } from './components/MonitorList';
import { Footer } from './components/Footer';
import { LoginPage } from './components/LoginPage';

function App() {
  const {
    monitors,
    checks,
    incidents,
    loading,
    showAdd,
    setShowAdd,
    addMonitor,
    deleteMonitor,
    addIncident,
    deleteIncident,
    getMonitorHistory,
    monitorHistory,
    globalStats,
    isAdmin,
    setToken
  } = useMonitors();

  const [view, setView] = useState<'dashboard' | 'login'>('dashboard');

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
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d1d1d1] font-sans flex flex-col">
      <Navbar 
        showAdd={showAdd} 
        setShowAdd={setShowAdd}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-[1200px] mx-auto w-full p-6">
        <DashboardStats stats={globalStats} />
        
        <IncidentList 
          incidents={incidents} 
          isAdmin={isAdmin} 
          onAdd={addIncident}
          onDelete={deleteIncident}
        />

        {showAdd && <MonitorForm onAdd={addMonitor} />}

        <div className="border border-[#262626] rounded-md overflow-hidden bg-[#111111]">
          <div className={`hidden md:grid ${isAdmin ? 'grid-cols-[2fr_3fr_100px_80px_60px]' : 'grid-cols-[2fr_3fr_100px_80px]'} border-b border-[#262626] bg-[#161616] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-[#666]`}>
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
            onDelete={deleteMonitor} 
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
