import React, { useState, useEffect } from 'react';
import type { Monitor } from '@/types';

interface MonitorFormProps {
  onAdd: (name: string, url: string, interval: number) => Promise<boolean>;
  onUpdate?: (id: number, name: string, url: string, interval: number) => Promise<boolean>;
  monitor?: Monitor | null;
  onCancel?: () => void;
}

export function MonitorForm({ onAdd, onUpdate, monitor, onCancel }: MonitorFormProps) {
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newInterval, setNewInterval] = useState(60);

  useEffect(() => {
    if (monitor) {
      setNewName(monitor.name);
      setNewUrl(monitor.url);
      setNewInterval(monitor.interval);
    } else {
      setNewName('');
      setNewUrl('');
      setNewInterval(60);
    }
  }, [monitor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (monitor && onUpdate) {
      const success = await onUpdate(monitor.id, newName, newUrl, newInterval);
      if (success && onCancel) onCancel();
    } else {
      const success = await onAdd(newName, newUrl, newInterval);
      if (success) {
        setNewName('');
        setNewUrl('');
        setNewInterval(60);
      }
    }
  };

  return (
    <div className="bg-card p-4 rounded-lg mb-6 border border-border animate-fadeIn">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
          {monitor ? 'Edit Monitor' : 'Add New Monitor'}
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1"
          >
            Cancel
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Name"
            className="bg-background border border-border px-3 py-2 rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            required
          />
          <input
            type="url"
            placeholder="https://example.com"
            className="bg-background border border-border px-3 py-2 rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent md:col-span-2"
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            required={!monitor}
          />
          <input
            type="number"
            placeholder="Interval (s)"
            className="bg-background border border-border px-3 py-2 rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            value={newInterval}
            onChange={e => setNewInterval(Number(e.target.value))}
            required
          />
        </div>
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className="bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded text-sm font-bold transition-opacity"
          >
            {monitor ? 'Update Monitor' : 'Add Monitor'}
          </button>
        </div>
      </form>
    </div>
  );
}
