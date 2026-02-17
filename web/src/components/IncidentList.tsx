import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, Plus, Trash2 } from 'lucide-react';
import type { Incident } from '@/types';

interface IncidentListProps {
  incidents: Incident[];
  isAdmin: boolean;
  onAdd: (title: string, desc: string, status: 'investigating' | 'monitoring' | 'resolved') => Promise<boolean>;
  onDelete: (id: number) => void;
}

// Using React.memo for performance optimization - prevents unnecessary re-renders
export const IncidentList = React.memo(function IncidentList({ incidents, isAdmin, onAdd, onDelete }: IncidentListProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState<'investigating' | 'monitoring' | 'resolved'>('investigating');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onAdd(title, desc, status);
    if (success) {
      setShowForm(false);
      setTitle('');
      setDesc('');
      setStatus('investigating');
    }
  };

  return (
    <div className="mb-6 space-y-3">
      {isAdmin && (
        <div className="flex justify-end mb-2">
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 text-xs font-bold text-status-up hover:text-status-up-dark transition-colors"
          >
            <Plus size={12} /> Post Incident
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border p-4 rounded-lg mb-4 animate-fadeIn">
          <div className="grid gap-3">
            <input 
              type="text" 
              placeholder="Title (e.g. Database Connectivity Issue)" 
              className="bg-background border border-border px-3 py-2 rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required
            />
            <textarea 
              placeholder="Description..." 
              className="bg-background border border-border px-3 py-2 rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent h-20"
              value={desc} 
              onChange={e => setDesc(e.target.value)} 
              required
            />
            <div className="flex gap-2">
              <select 
                className="bg-background border border-border px-3 py-2 rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                value={status} 
                onChange={e => setStatus(e.target.value as 'investigating' | 'monitoring' | 'resolved')}
              >
                <option value="investigating">Investigating</option>
                <option value="monitoring">Monitoring</option>
                <option value="resolved">Resolved</option>
              </select>
              <button 
                type="submit" 
                className="bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded text-sm font-bold ml-auto transition-opacity"
              >
                Post Update
              </button>
            </div>
          </div>
        </form>
      )}

      {incidents.length > 0 ? (
        incidents.map(i => (
          <div key={i.id} className={`p-4 rounded-lg border flex items-start gap-3 group relative ${
            i.status === 'resolved' ? 'bg-green-950/10 border-green-900/30' : 
            i.status === 'monitoring' ? 'bg-blue-950/10 border-blue-900/30' : 
            'bg-orange-950/10 border-orange-900/30'
          }`}>
            <div className="mt-0.5">
              {i.status === 'resolved' ? <CheckCircle size={18} className="text-green-500" /> :
               i.status === 'monitoring' ? <Info size={18} className="text-blue-500" /> :
               <AlertTriangle size={18} className="text-orange-500" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-[15px] text-white">{i.title}</h3>
                <span className={`text-[11px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-bold ${
                  i.status === 'resolved' ? 'text-green-500 border-green-900/50 bg-green-900/20' : 
                  i.status === 'monitoring' ? 'text-blue-500 border-blue-900/50 bg-blue-900/20' : 
                  'text-orange-500 border-orange-900/50 bg-orange-900/20'
                }`}>
                  {i.status}
                </span>
              </div>
              <p className="text-[15px] text-muted-foreground">{i.description}</p>
              <div className="text-[11px] text-muted-foreground/60 mt-2 font-mono">
                {new Date(i.created_at).toLocaleString()}
              </div>
            </div>
            {isAdmin && (
              <button 
                onClick={() => onDelete(i.id)}
                className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1"
                title="Delete Incident"
                aria-label={`Delete incident: ${i.title}`}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))
      ) : (
        isAdmin && incidents.length === 0 && !showForm && (
          <div className="text-center text-muted-foreground text-xs py-2 italic">
            No active incidents.
          </div>
        )
      )}
    </div>
  );
});
