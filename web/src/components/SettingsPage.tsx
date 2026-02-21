import { useState } from 'react';
import { MonitorForm } from './MonitorForm';
import { MonitorList } from './MonitorList';
import { WebhookList } from './WebhookList';
import { IncidentList } from './IncidentList';
import type { Monitor, Check, Incident, Webhook, DailyStats } from '@/types';

interface SettingsPageProps {
  monitors: Monitor[];
  checks: Record<number, Check[]>;
  monitorHistory: Record<number, Check[]>;
  dailyHistory: Record<number, DailyStats[]>;
  incidents: Incident[];
  webhooks: Webhook[];
  onAddMonitor: (name: string, url: string, interval: number) => Promise<boolean>;
  onUpdateMonitor: (id: number, name: string, url: string, interval: number) => Promise<boolean>;
  onDeleteMonitor: (id: number) => Promise<void>;
  onAddIncident: (title: string, desc: string, status: 'investigating' | 'monitoring' | 'resolved') => Promise<boolean>;
  onDeleteIncident: (id: number) => Promise<void>;
  onAddWebhook: (name: string, url: string) => Promise<boolean>;
  onUpdateWebhook: (id: number, name: string, url: string, enabled: boolean) => Promise<boolean>;
  onDeleteWebhook: (id: number) => Promise<void>;
  fetchHistory: (id: number) => Promise<DailyStats[]>;
}

export function SettingsPage({
  monitors,
  checks,
  monitorHistory,
  dailyHistory,
  incidents,
  webhooks,
  onAddMonitor,
  onUpdateMonitor,
  onDeleteMonitor,
  onAddIncident,
  onDeleteIncident,
  onAddWebhook,
  onUpdateWebhook,
  onDeleteWebhook,
  fetchHistory,
}: SettingsPageProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState<Monitor | null>(null);

  return (
    <div className="flex-1 w-full p-6 max-w-5xl mx-auto">
      <h1 className="text-lg font-bold text-foreground mb-6 uppercase tracking-wider">Settings</h1>

      {/* Monitors */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Monitors</h2>
          {!showAdd && !editingMonitor && (
            <button
              onClick={() => setShowAdd(true)}
              className="text-xs font-bold text-primary hover:opacity-80 transition-opacity"
            >
              + Add Monitor
            </button>
          )}
        </div>

        {(showAdd || editingMonitor) && (
          <MonitorForm
            onAdd={async (n, u, i) => {
              const ok = await onAddMonitor(n, u, i);
              if (ok) setShowAdd(false);
              return ok;
            }}
            onUpdate={async (id, n, u, i) => {
              const ok = await onUpdateMonitor(id, n, u, i);
              if (ok) setEditingMonitor(null);
              return ok;
            }}
            monitor={editingMonitor}
            onCancel={() => { setShowAdd(false); setEditingMonitor(null); }}
          />
        )}

        <div className="border border-border rounded-md overflow-hidden bg-card">
          <div className="hidden md:grid grid-cols-[2fr_3fr_100px_80px_80px] border-b border-border bg-muted/50 px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            <div>Monitor Details</div>
            <div>Latency Trend (Last 50)</div>
            <div className="text-right">Latency</div>
            <div className="text-right">Interval</div>
            <div className="text-right">Action</div>
          </div>
          <MonitorList
            monitors={monitors}
            checks={checks}
            loading={false}
            monitorHistory={monitorHistory}
            dailyHistory={dailyHistory}
            onDelete={onDeleteMonitor}
            onEdit={setEditingMonitor}
            fetchHistory={fetchHistory}
            isAdmin={true}
          />
        </div>
      </section>

      {/* Incidents */}
      <section className="mb-10">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Incidents</h2>
        <IncidentList
          incidents={incidents}
          isAdmin={true}
          onAdd={onAddIncident}
          onDelete={onDeleteIncident}
        />
      </section>

      {/* Webhooks */}
      <section>
        <WebhookList
          webhooks={webhooks}
          onAdd={onAddWebhook}
          onUpdate={onUpdateWebhook}
          onDelete={onDeleteWebhook}
        />
      </section>
    </div>
  );
}
