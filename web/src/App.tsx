import { useEffect } from 'react';
import { useMonitors } from './hooks/useMonitors';
import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { MonitorForm } from './components/MonitorForm';
import { MonitorList } from './components/MonitorList';
import { Footer } from './components/Footer';

function App() {
  const {
    monitors,
    checks,
    loading,
    showAdd,
    setShowAdd,
    addMonitor,
    deleteMonitor,
    monitorHistory,
    globalStats,
    isAdmin,
    setToken
  } = useMonitors();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' && !isAdmin) {
      const token = prompt('Enter Admin Token to enable Edit Mode:');
      if (token) {
        setToken(token);
        window.history.replaceState({}, '', '/');
      }
    }
  }, [isAdmin, setToken]);

  useEffect(() => {
    const isHealthy = globalStats.down === 0;
    document.title = isHealthy ? "Go-Sentinel • Operational" : `Go-Sentinel • ${globalStats.down} Issue(s)`;
    
    const favicon = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (favicon) {
      const color = isHealthy ? '%232f855a' : '%23e53e3e';
      favicon.href = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='${color}'><circle cx='12' cy='12' r='10'/></svg>`;
    }
  }, [globalStats]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d1d1d1] font-sans flex flex-col">
      <Navbar 
        monitorCount={monitors.length} 
        stats={globalStats} 
        showAdd={showAdd} 
        setShowAdd={setShowAdd}
        isAdmin={isAdmin}
      />

      <main className="flex-1 max-w-[1200px] mx-auto w-full p-6">
        <DashboardStats stats={globalStats} />

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
            isAdmin={isAdmin}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
