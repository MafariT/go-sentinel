import React, { useState, useEffect } from 'react';
import type { Monitor } from '../types';

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
      } else {
        alert('Failed to add monitor');
      }
    }
  };

  return (
    <div className="bg-[#111111] border border-[#262626] p-4 rounded mb-6 animate-in slide-in-from-top-2 fade-in duration-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          {monitor ? 'Edit Monitor' : 'Add New Monitor'}
        </h3>
        {onCancel && (
          <button onClick={onCancel} className="text-xs text-[#666] hover:text-white">Cancel</button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input 
          type="text" placeholder="Name (e.g. My API)"
          className="bg-[#050505] border border-[#262626] px-3 py-2 rounded text-sm focus:outline-none focus:border-[#2f855a] flex-1 text-white placeholder-[#444]"
          value={newName} onChange={e => setNewName(e.target.value)} required
        />
        <input 
          type="url" placeholder="https://example.com"
          className="bg-[#050505] border border-[#262626] px-3 py-2 rounded text-sm focus:outline-none focus:border-[#2f855a] flex-[2] text-white placeholder-[#444]"
          value={newUrl} onChange={e => setNewUrl(e.target.value)} required={!monitor}
        />
        <input 
          type="number" placeholder="60s"
          className="bg-[#050505] border border-[#262626] px-3 py-2 rounded text-sm focus:outline-none focus:border-[#2f855a] w-24 text-white placeholder-[#444]"
          value={newInterval} onChange={e => setNewInterval(Number(e.target.value))} required
        />
        <button type="submit" className="bg-[#333] hover:bg-[#444] text-white px-6 py-2 rounded text-sm font-bold border border-[#444]">
          {monitor ? 'Update' : 'Add'}
        </button>
      </form>
    </div>
  );
}
