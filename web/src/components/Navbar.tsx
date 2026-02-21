import { Activity, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  isAdmin: boolean;
  view: 'dashboard' | 'settings';
  onNavigate: (view: 'dashboard' | 'settings') => void;
  onLogout: () => void;
}

export function Navbar({ isAdmin, view, onNavigate, onLogout }: NavbarProps) {
  return (
    <nav className="border-b border-border bg-card h-14 flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur">
      <div className="flex items-center gap-2">
        <Activity size={20} className="text-primary" />
        <button
          onClick={() => onNavigate('dashboard')}
          className="font-bold text-foreground text-base tracking-tight hover:opacity-80 transition-opacity"
        >
          Go-Sentinel
        </button>
      </div>

      <div className="flex items-center gap-3">
        {isAdmin && (
          <>
            <Button
              onClick={() => onNavigate(view === 'settings' ? 'dashboard' : 'settings')}
              size="sm"
              variant={view === 'settings' ? 'default' : 'ghost'}
              aria-label="Settings"
            >
              <Settings size={14} className="mr-1" />
              Settings
            </Button>
            <Button
              onClick={onLogout}
              size="icon"
              variant="ghost"
              title="Logout Admin"
              aria-label="Logout from admin panel"
            >
              <LogOut size={16} />
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
