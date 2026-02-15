import { Activity, LogOut } from 'lucide-react';

interface NavbarProps {
  showAdd: boolean;
  setShowAdd: (show: boolean) => void;
  isAdmin: boolean;
  onLogout: () => void;
}

export function Navbar({ showAdd, setShowAdd, isAdmin, onLogout }: NavbarProps) {
  return (
    <nav className="border-b border-[#262626] bg-[#111111] h-14 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <Activity size={20} className="text-[#2f855a]" />
        <span className="font-bold text-white text-base tracking-tight cursor-default select-none">
          Go-Sentinel
        </span>
      </div>
      
      <div className="flex items-center gap-4 text-xs font-mono text-[#666]">
          {isAdmin && (
            <>
              <button 
                  onClick={() => setShowAdd(!showAdd)}
                  className="bg-[#2f855a] hover:bg-[#276749] text-white px-3 py-1.5 rounded font-bold transition-colors"
              >
                  {showAdd ? 'Cancel' : '+ Add Monitor'}
              </button>
              <button 
                onClick={onLogout}
                className="p-1.5 rounded text-[#444] hover:text-white hover:bg-[#262626] transition-colors"
                title="Logout Admin"
              >
                <LogOut size={16} />
              </button>
            </>
          )}
      </div>
    </nav>
  );
}
