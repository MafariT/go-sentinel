import { useState } from 'react';
import { Activity, Lock, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLogin: (token: string) => void;
  error?: string;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [token, setToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(token);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 bg-[#111] border border-[#262626] rounded-xl flex items-center justify-center mb-4">
            <Activity size={24} className="text-[#2f855a]" />
          </div>
          <h1 className="text-xl font-bold text-white">Go-Sentinel Admin</h1>
          <p className="text-sm text-[#666] mt-1">Enter your admin token to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#444]">
              <Lock size={16} />
            </div>
            <input 
              type="password" 
              placeholder="Admin Token"
              className="w-full bg-[#111] border border-[#262626] rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#2f855a] transition-colors placeholder-[#444]"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              autoFocus
            />
          </div>
          
          <button 
            type="submit"
            className="w-full bg-[#2f855a] hover:bg-[#276749] text-white font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 group"
          >
            Authenticate
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <a href="/" className="text-xs text-[#444] hover:text-[#666] transition-colors">
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
