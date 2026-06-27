import { ChevronRight, Home, ArrowLeft, Network, Users, Workflow, Monitor, Gavel, History, Database, CheckSquare, Settings } from 'lucide-react';

interface BreadcrumbsProps {
  currentView: string;
  viewHistory: string[];
  onViewChange: (view: string) => void;
  onGoBack: () => void;
  onToggleActivityFeed?: () => void;
}

export function Breadcrumbs({ currentView, viewHistory, onViewChange, onGoBack, onToggleActivityFeed, onToggleNotifications }: BreadcrumbsProps & { onToggleNotifications?: () => void }) {
  const getViewInfo = (viewId: string) => {
    switch (viewId) {
      case 'dashboard': return { icon: <Home className="w-4 h-4" />, label: 'Platform' };
      case 'org': return { icon: <Network className="w-4 h-4" />, label: 'Organization' };
      case 'agents': return { icon: <Network className="w-4 h-4" />, label: 'Agent Hierarchy' };
      case 'agent-builder': return { icon: <Users className="w-4 h-4" />, label: 'Agent Builder' };
      case 'workflows': return { icon: <Workflow className="w-4 h-4" />, label: 'Workflows' };
      case 'architecture': return { icon: <Monitor className="w-4 h-4" />, label: 'System Architecture' };
      case 'governance': return { icon: <Gavel className="w-4 h-4" />, label: 'Governance & Risk' };
      case 'audit-logs': return { icon: <History className="w-4 h-4" />, label: 'Audit Logs' };
      case 'memory': return { icon: <Database className="w-4 h-4" />, label: 'Memory Center' };
      case 'approvals': return { icon: <CheckSquare className="w-4 h-4" />, label: 'Approval Queue' };
      case 'automations': return { icon: <Workflow className="w-4 h-4" />, label: 'Automations' };
      case 'integrations': return { icon: <Network className="w-4 h-4" />, label: 'Integrations' };
      case 'evaluations': return { icon: <CheckSquare className="w-4 h-4" />, label: 'Evaluations' };
      case 'settings': return { icon: <Settings className="w-4 h-4" />, label: 'Settings' };
      default: return { icon: <Home className="w-4 h-4" />, label: viewId.charAt(0).toUpperCase() + viewId.slice(1) };
    }
  };

  const crumbs = viewHistory.map((viewId, index) => ({
    id: `${viewId}-${index}`,
    viewId,
    ...getViewInfo(viewId)
  }));

  return (
    <div className="flex items-center h-14 px-4 md:px-8 border-b border-[var(--border-base)] bg-[var(--bg-base)]/80 backdrop-blur-md sticky top-0 z-40 shrink-0 font-sans w-full">
      <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] min-w-0 flex-1 overflow-x-auto no-scrollbar pb-0.5">
        {viewHistory.length > 1 && (
          <button
            onClick={onGoBack}
            className="hover:text-[var(--text-base)] hover:bg-[var(--bg-surface)] p-1.5 rounded-md transition-colors flex items-center justify-center mr-1 sm:mr-2 shrink-0"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          
          return (
            <div key={crumb.id} className="flex items-center gap-1.5 shrink-0">
              {index > 0 && <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" />}
              <button
                onClick={() => onViewChange(crumb.viewId)}
                disabled={isLast}
                className={`px-2 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-2 ${
                  isLast 
                    ? 'text-[var(--text-base)] cursor-default' 
                    : 'hover:text-[var(--text-base)] hover:bg-[var(--bg-surface)]'
                }`}
              >
                {crumb.icon}
                <span className={index === 0 ? "hidden sm:inline" : ""}>{crumb.label}</span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="ml-2 sm:ml-auto flex items-center shrink-0 gap-2">
        {onToggleNotifications && (
          <button
            onClick={onToggleNotifications}
            className="flex items-center justify-center p-1.5 hover:bg-[var(--bg-surface)] rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors relative"
            title="Notifications"
          >
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border border-[var(--bg-base)]"></span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </button>
        )}
        
        {onToggleActivityFeed && (
          <button
            onClick={onToggleActivityFeed}
            className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-base)] border border-[var(--border-base)] rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shadow-sm relative group"
            title="Global Activity Feed"
          >
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-[var(--bg-surface)]"></span>
            <span className="hidden sm:inline">Activity Feed</span>
          </button>
        )}
      </div>
    </div>
  );
}
