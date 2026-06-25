import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  ShieldAlert,
  BrainCircuit,
  Database,
  Settings,
  Activity,
  CheckCircle,
  Workflow
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'org', label: 'Organization Builder', icon: Users },
    { id: 'agents', label: 'Agent Hierarchy', icon: BrainCircuit },
    { id: 'evaluations', label: 'Agent Performance', icon: Activity },
    { id: 'workflows', label: 'Workflows', icon: KanbanSquare },
    { id: 'governance', label: 'Governance & Risk', icon: ShieldAlert },
    { id: 'approvals', label: 'Approval Queue', icon: CheckCircle },
    { id: 'memory', label: 'Memory Center', icon: Database },
    { id: 'automations', label: 'Automations', icon: Workflow },
    { id: 'integrations', label: 'Integrations', icon: Settings },
    { id: 'architecture', label: 'System Architecture', icon: BrainCircuit },
  ];

  return (
    <div className="flex flex-col w-64 bg-[var(--bg-base)] border-r border-[var(--border-base)] text-[var(--text-secondary)] h-screen font-sans">
      <div className="flex items-center gap-3 p-6 mb-4">
        <div className="bg-blue-500/20 p-2 rounded-lg">
          <Activity className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="font-bold text-[var(--text-base)] tracking-tight leading-tight text-lg">Orchestr<span className="text-blue-400">OS</span></h1>
          <p className="text-xs text-[var(--text-tertiary)] font-mono">v1.2.0 • Online</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || (currentView === 'agent-builder' && item.id === 'agents');
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
                ${isActive 
                  ? 'bg-[var(--bg-surface)] text-blue-400 shadow-sm' 
                  : 'hover:bg-[var(--bg-surface)] hover:text-[var(--text-base)]'
                }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-[var(--text-muted)]'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-[var(--border-base)]">
        <button 
          onClick={() => onViewChange('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
            ${currentView === 'settings' ? 'bg-[var(--bg-surface)] text-blue-400 shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-base)] hover:bg-[var(--bg-surface)]'}`}
        >
          <Settings className={`w-4 h-4 ${currentView === 'settings' ? 'text-blue-400' : ''}`} />
          Settings
        </button>
      </div>
    </div>
  );
}
