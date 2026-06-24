import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Breadcrumbs({ currentView, onViewChange }: BreadcrumbsProps) {
  const getBreadcrumbs = () => {
    switch (currentView) {
      case 'dashboard':
        return [];
      case 'org':
      case 'agents':
        return [{ id: 'org', label: 'Agent Hierarchy' }];
      case 'agent-builder':
        return [
          { id: 'org', label: 'Agent Hierarchy' },
          { id: 'agent-builder', label: 'Agent Builder' },
        ];
      case 'workflows':
        return [{ id: 'workflows', label: 'Workflows' }];
      case 'governance':
        return [{ id: 'governance', label: 'Governance & Risk' }];
      case 'approvals':
        return [{ id: 'approvals', label: 'Approval Queue' }];
      case 'memory':
        return [{ id: 'memory', label: 'Memory Center' }];
      case 'automations':
        return [{ id: 'automations', label: 'Automations' }];
      case 'architecture':
        return [{ id: 'architecture', label: 'System Architecture' }];
      case 'settings':
        return [{ id: 'settings', label: 'Settings' }];
      default:
        return [{ id: currentView, label: currentView.charAt(0).toUpperCase() + currentView.slice(1) }];
    }
  };

  const crumbs = getBreadcrumbs();

  return (
    <div className="flex items-center h-14 px-8 border-b border-[var(--border-base)] bg-[var(--bg-base)]/80 backdrop-blur-md sticky top-0 z-40 shrink-0 font-sans">
      <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)]">
        <button 
          onClick={() => onViewChange('dashboard')}
          className="hover:text-[var(--text-base)] hover:bg-[var(--bg-surface)] p-1.5 rounded-md transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Platform</span>
        </button>
        
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          
          return (
            <div key={crumb.id} className="flex items-center gap-1.5">
              <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" />
              <button
                onClick={() => onViewChange(crumb.id)}
                disabled={isLast}
                className={`px-2 py-1 rounded-md transition-colors ${
                  isLast 
                    ? 'text-[var(--text-base)] cursor-default' 
                    : 'hover:text-[var(--text-base)] hover:bg-[var(--bg-surface)]'
                }`}
              >
                {crumb.label}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
