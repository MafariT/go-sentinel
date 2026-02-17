import { Activity, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  showAdd: boolean;
  setShowAdd: (show: boolean) => void;
  isAdmin: boolean;
  onLogout: () => void;
}

export function Navbar({ showAdd, setShowAdd, isAdmin, onLogout }: NavbarProps) {
  return (
    <nav className="border-b border-border bg-card h-14 flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur">
      <div className="flex items-center gap-2">
        <Activity size={20} className="text-primary" />
        <span className="font-bold text-foreground text-base tracking-tight cursor-default select-none">
          Go-Sentinel
        </span>
      </div>
      
      <div className="flex items-center gap-3">
          {isAdmin && (
            <>
              <Button 
                  onClick={() => setShowAdd(!showAdd)}
                  size="sm"
                  variant={showAdd ? "outline" : "default"}
                  aria-label={showAdd ? 'Cancel adding monitor' : 'Add new monitor'}
              >
                  {showAdd ? 'Cancel' : '+ Add Monitor'}
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
