import { useState } from 'react';
import { Activity, Lock } from 'lucide-react';

interface LoginPageProps {
  onLogin: (token: string) => void;
  verifyToken: (token: string) => Promise<boolean>;
}

export function LoginPage({ onLogin, verifyToken }: LoginPageProps) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const isValid = await verifyToken(token);
    if (isValid) {
      onLogin(token);
    } else {
      setError('Invalid admin token. Access denied.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 bg-card border border-border rounded-xl flex items-center justify-center mb-4">
            <Activity size={24} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Go-Sentinel Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your admin token to continue</p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="bg-muted/20 px-6 py-4 border-b border-border">
            <h2 className="text-base font-bold text-foreground">Authentication</h2>
            <p className="text-xs text-muted-foreground mt-1">Admin access required</p>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-foreground mb-2">
                  Admin Token
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Lock size={16} />
                  </div>
                  <input
                    id="token"
                    type="password"
                    placeholder="Enter your admin token"
                    className="w-full bg-background border border-border pl-10 pr-3 py-2 rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    autoFocus
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/30 text-foreground px-4 py-3 rounded text-sm animate-fadeIn">
                  {error}
                </div>
              )}
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded font-bold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Authenticate'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
