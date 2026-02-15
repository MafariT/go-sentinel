import React, { useState } from 'react';

interface MonitorFormProps {
  onAdd: (name: string, url: string, interval: number) => Promise<boolean>;
}

export function MonitorForm({ onAdd }: MonitorFormProps) {
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newInterval, setNewInterval] = useState(60);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onAdd(newName, newUrl, newInterval);
    if (success) {
      setNewName('');
      setNewUrl('');
      setNewInterval(60);
    } else {
      alert('Failed to add monitor');
    }
  };

  return (
    <div className="bg-[#111111] border border-[#262626] p-4 rounded mb-6 animate-in slide-in-from-top-2 fade-in duration-200">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input 
          type="text" placeholder="Name (e.g. My API)"
          className="bg-[#050505] border border-[#262626] px-3 py-2 rounded text-sm focus:outline-none focus:border-[#f6821f] flex-1 text-white placeholder-[#444]"
          value={newName} onChange={e => setNewName(e.target.value)} required
        />
        <input 
          type="url" placeholder="https://example.com"
          className="bg-[#050505] border border-[#262626] px-3 py-2 rounded text-sm focus:outline-none focus:border-[#f6821f] flex-[2] text-white placeholder-[#444]"
          value={newUrl} onChange={e => setNewUrl(e.target.value)} required
        />
        <input 
          type="number" placeholder="60s"
          className="bg-[#050505] border border-[#262626] px-3 py-2 rounded text-sm focus:outline-none focus:border-[#f6821f] w-24 text-white placeholder-[#444]"
          value={newInterval} onChange={e => setNewInterval(Number(e.target.value))} required
        />
        <button type="submit" className="bg-[#333] hover:bg-[#444] text-white px-6 py-2 rounded text-sm font-bold border border-[#444]">
          Save
        </button>
      </form>
    </div>
  );
}
