import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Breadcrumbs } from './components/Breadcrumbs';
import { DashboardView } from './views/DashboardView';
import { AgentHierarchyView } from './views/AgentHierarchyView';
import { WorkflowsView } from './views/WorkflowsView';
import { ArchitectureView } from './views/ArchitectureView';
import { GovernanceView } from './views/GovernanceView';
import { AuditLogsView } from './views/AuditLogsView';
import { OrganizationBuilderView } from './views/OrganizationBuilderView';
import { AgentBuilderView } from './views/AgentBuilderView';
import { MemoryView } from './views/MemoryView';
import { ApprovalQueueView } from './views/ApprovalQueueView';
import { AutomationView } from './views/AutomationView';
import { IntegrationsView } from './views/IntegrationsView';
import { SettingsView } from './views/SettingsView';
import { EvaluationsView } from './views/EvaluationsView';
import { ResourceUsageMonitor } from './components/ResourceUsageMonitor';
import { GlobalActivityFeed } from './components/GlobalActivityFeed';
import { LockScreen } from './components/LockScreen';
import { CommandPalette } from './components/CommandPalette';
import { GuidedTour } from './components/GuidedTour';
import { NotificationCenter } from './components/NotificationCenter';
import { motion, AnimatePresence } from 'motion/react';
import { fetchApi } from './lib/api';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [viewHistory, setViewHistory] = useState<string[]>(['dashboard']);
  const [theme, setTheme] = useState('theme-default');
  const [accentColor, setAccentColor] = useState('accent-blue');
  const [isNavigating, setIsNavigating] = useState(false);
  const [isActivityFeedOpen, setIsActivityFeedOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(open => !open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // Development initialization: creates default user, organization, and seeds data
    const initApp = async () => {
      try {
        const initRes = await fetch('/api/dev/init', { method: 'POST' });
        console.log('init status:', initRes.status);
        const seedRes = await fetchApi('/seed', { method: 'POST' });
        console.log('seed res:', seedRes);
        
        // Fetch organization settings to apply theme and accent color globally on load
        const org = await fetchApi('/organizations/current');
        if (org?.settings) {
          if (org.settings.theme) setTheme(org.settings.theme);
          if (org.settings.accentColor) setAccentColor(org.settings.accentColor);
        }
      } catch (err) {
        console.error('App init/seed error:', err);
      } finally {
        setIsAppReady(true);
      }
    };
    initApp();
  }, []);

  const handleViewChange = (view: string, isBackAction = false) => {
    if (view === currentView) return;
    setIsNavigating(true);
    setCurrentView(view);
    
    if (isBackAction) {
      setViewHistory(prev => prev.slice(0, -1));
    } else {
      setViewHistory(prev => [...prev, view]);
    }
  };

  const handleGoBack = () => {
    if (viewHistory.length > 1) {
      const prevView = viewHistory[viewHistory.length - 2];
      handleViewChange(prevView, true);
    }
  };

  useEffect(() => {
    if (isNavigating) {
      const timer = setTimeout(() => setIsNavigating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [currentView, isNavigating]);

  const renderView = () => {
    if (!isAppReady) {
      return (
        <div className="p-8 flex items-center justify-center h-full text-[var(--text-tertiary)]">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2 text-[var(--text-primary)]">Initializing OrchestrOS...</h2>
            <p className="text-sm">Connecting to Main Brain and verifying governance policies.</p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'org':
        return <OrganizationBuilderView />;
      case 'agents':
        return <AgentHierarchyView onViewChange={handleViewChange} />;
      case 'agent-builder':
        return <AgentBuilderView onViewChange={handleViewChange} />;
      case 'workflows':
        return <WorkflowsView />;
      case 'governance':
        return <GovernanceView />;
      case 'audit-logs':
        return <AuditLogsView />;
      case 'memory':
        return <MemoryView />;
      case 'approvals':
        return <ApprovalQueueView onViewChange={handleViewChange} />;
      case 'automations':
        return <AutomationView />;
      case 'integrations':
        return <IntegrationsView />;
      case 'evaluations':
        return <EvaluationsView />;
      case 'settings':
        return <SettingsView theme={theme} setTheme={setTheme} accentColor={accentColor} setAccentColor={setAccentColor} />;
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
    <div className={`flex h-screen bg-[var(--bg-base)] text-[var(--text-base)] overflow-hidden font-sans selection:bg-blue-500/30 ${theme} ${accentColor}`}>
      <Sidebar currentView={currentView} onViewChange={handleViewChange} />
      <main className="flex-1 overflow-y-auto bg-[var(--bg-base)] border-l border-[var(--border-base)] shadow-2xl relative flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-[var(--bg-base)] to-[var(--bg-base)] pointer-events-none" />
        <div className="relative z-10 flex flex-col min-h-full">
          <Breadcrumbs 
            currentView={currentView}
            viewHistory={viewHistory}
            onViewChange={handleViewChange}
            onGoBack={handleGoBack}
            onToggleActivityFeed={() => setIsActivityFeedOpen(true)}
            onToggleNotifications={() => setIsNotificationsOpen(true)}
          />
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
      <GlobalActivityFeed isOpen={isActivityFeedOpen} onClose={() => setIsActivityFeedOpen(false)} />
      <LockScreen />
      <NotificationCenter isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      <GuidedTour currentView={currentView} />
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={handleViewChange}
      />
    </div>
  );
}

