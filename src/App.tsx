import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Breadcrumbs } from './components/Breadcrumbs';
import { DashboardView } from './views/DashboardView';
import { AgentsView } from './views/AgentsView';
import { WorkflowsView } from './views/WorkflowsView';
import { ArchitectureView } from './views/ArchitectureView';
import { GovernanceView } from './views/GovernanceView';
import { AgentBuilderView } from './views/AgentBuilderView';
import { MemoryView } from './views/MemoryView';
import { ApprovalQueueView } from './views/ApprovalQueueView';
import { AutomationView } from './views/AutomationView';
import { SettingsView } from './views/SettingsView';
import { EvaluationsView } from './views/EvaluationsView';
import { ResourceUsageMonitor } from './components/ResourceUsageMonitor';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [theme, setTheme] = useState('theme-default');
  const [isNavigating, setIsNavigating] = useState(false);

  const handleViewChange = (view: string) => {
    if (view === currentView) return;
    setIsNavigating(true);
    setCurrentView(view);
  };

  useEffect(() => {
    if (isNavigating) {
      const timer = setTimeout(() => setIsNavigating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [currentView, isNavigating]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'org':
      case 'agents':
        return <AgentsView onViewChange={handleViewChange} />;
      case 'agent-builder':
        return <AgentBuilderView onViewChange={handleViewChange} />;
      case 'workflows':
        return <WorkflowsView />;
      case 'governance':
        return <GovernanceView />;
      case 'memory':
        return <MemoryView />;
      case 'approvals':
        return <ApprovalQueueView />;
      case 'automations':
        return <AutomationView />;
      case 'evaluations':
        return <EvaluationsView />;
      case 'settings':
        return <SettingsView theme={theme} setTheme={setTheme} />;
      case 'architecture':
        return <ArchitectureView />;
      default:
        return (
          <div className="p-8 flex items-center justify-center h-full text-[var(--text-tertiary)]">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2 text-[var(--text-muted)]">View under construction</h2>
              <p className="text-sm">The {currentView} module is being initialized by the Main Brain.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`flex h-screen bg-[var(--bg-base)] text-[var(--text-base)] overflow-hidden font-sans selection:bg-blue-500/30 ${theme}`}>
      <Sidebar currentView={currentView} onViewChange={handleViewChange} />
      <main className="flex-1 overflow-y-auto bg-[var(--bg-base)] border-l border-[var(--border-base)] shadow-2xl relative flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-[var(--bg-base)] to-[var(--bg-base)] pointer-events-none" />
        <div className="relative z-10 flex flex-col min-h-full">
          <Breadcrumbs currentView={currentView} onViewChange={handleViewChange} />
          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              {isNavigating ? (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="p-8 max-w-6xl mx-auto space-y-8 w-full"
                >
                  <div className="border-b border-[var(--border-base)] pb-6 flex justify-between items-end">
                    <div className="space-y-3 w-full">
                      <div className="h-8 bg-[var(--bg-surface)] rounded-lg w-1/3 animate-pulse border border-[var(--border-base)]"></div>
                      <div className="h-4 bg-[var(--bg-surface)] rounded-lg w-1/2 animate-pulse border border-[var(--border-base)]"></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-24 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-base)] animate-pulse"></div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="col-span-2 space-y-6">
                      <div className="h-64 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-base)] animate-pulse"></div>
                      <div className="h-48 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-base)] animate-pulse"></div>
                    </div>
                    <div className="col-span-1 space-y-6">
                      <div className="h-[400px] bg-[var(--bg-surface)] rounded-xl border border-[var(--border-base)] animate-pulse"></div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {renderView()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <ResourceUsageMonitor />
        </div>
      </main>
    </div>
  );
}

