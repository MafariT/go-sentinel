import React, { useState } from 'react';
import { Plus, Trash2, Pencil, Webhook } from 'lucide-react';
import type { Webhook as WebhookType } from '@/types';

interface WebhookListProps {
  webhooks: WebhookType[];
  onAdd: (name: string, url: string) => Promise<boolean>;
  onUpdate: (id: number, name: string, url: string, enabled: boolean) => Promise<boolean>;
  onDelete: (id: number) => Promise<void>;
}

export const WebhookList = React.memo(function WebhookList({
  webhooks = [],
  onAdd,
  onUpdate,
  onDelete,
}: WebhookListProps) {
  const safeWebhooks = Array.isArray(webhooks) ? webhooks : [];
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const openAdd = () => {
    setEditingId(null);
    setName('');
    setUrl('');
    setShowForm(true);
  };

  const openEdit = (wh: WebhookType) => {
    setEditingId(wh.id);
    setName(wh.name);
    setUrl(wh.url);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setName('');
    setUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let success: boolean;
    if (editingId !== null) {
      const current = webhooks.find(w => w.id === editingId);
      success = await onUpdate(editingId, name, url, current?.enabled ?? true);
    } else {
      success = await onAdd(name, url);
    }
    if (success) handleCancel();
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Webhook size={14} className="text-muted-foreground" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Discord Webhooks
          </span>
          <span className="text-xs text-muted-foreground">({webhooks.length})</span>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1 text-xs font-bold text-primary hover:opacity-80 transition-opacity"
        >
          <Plus size={12} /> Add Webhook
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border p-4 rounded-lg mb-3 animate-fadeIn"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              {editingId !== null ? 'Edit Webhook' : 'New Webhook'}
            </span>
            <button
              type="button"
              onClick={handleCancel}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-3">
            <input
              type="text"
              placeholder="Name (e.g. #alerts)"
              className="bg-background border border-border px-3 py-2 rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <input
              type="url"
              placeholder="https://discord.com/api/webhooks/..."
              className="bg-background border border-border px-3 py-2 rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              value={url}
              onChange={e => setUrl(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              className="bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded text-sm font-bold transition-opacity"
            >
              {editingId !== null ? 'Update Webhook' : 'Add Webhook'}
            </button>
          </div>
        </form>
      )}

      {safeWebhooks.length === 0 && !showForm ? (
        <p className="text-xs text-muted-foreground py-3">
          No webhooks configured. Add one to receive Discord alerts on monitor state changes.
        </p>
      ) : (
        <div className="space-y-2">
          {safeWebhooks.map(wh => (
            <div
              key={wh.id}
              className="bg-card border border-border rounded-lg px-4 py-3 flex items-center gap-3"
            >
              {/* Toggle */}
              <button
                onClick={() => onUpdate(wh.id, wh.name, wh.url, !wh.enabled)}
                title={wh.enabled ? 'Disable webhook' : 'Enable webhook'}
                className={`w-8 h-4 rounded-full relative transition-colors flex-shrink-0 ${
                  wh.enabled ? 'bg-green-500' : 'bg-muted'
                }`}
                aria-label={wh.enabled ? 'Disable' : 'Enable'}
              >
                <span
                  className={`absolute top-0.5 left-0 w-3 h-3 rounded-full bg-white shadow transition-transform ${
                    wh.enabled ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>

              {/* Name */}
              <span className="text-sm font-medium text-foreground flex-shrink-0 w-32 truncate">
                {wh.name}
              </span>

              {/* URL (masked) */}
              <span className="text-xs text-muted-foreground font-mono flex-1 truncate">
                {maskUrl(wh.url)}
              </span>

              {/* Status pill */}
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                  wh.enabled
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {wh.enabled ? 'active' : 'paused'}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => openEdit(wh)}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded"
                  title="Edit"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => onDelete(wh.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

function maskUrl(url: string): string {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/');
    if (parts.length >= 2) {
      const last = parts[parts.length - 1];
      parts[parts.length - 1] = last.slice(0, 6) + '••••••••';
    }
    return u.origin + parts.join('/');
  } catch {
    return url;
  }
}
