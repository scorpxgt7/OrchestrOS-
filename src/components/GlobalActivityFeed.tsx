import { X, Activity, AlertTriangle, CheckCircle2, ShieldAlert, Network, Cpu, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { fetchApi } from '../lib/api';
import { useToast } from '../contexts/ToastContext';

interface GlobalActivityFeedProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalActivityFeed({ isOpen, onClose }: GlobalActivityFeedProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState<number>(0);
  const { showToast } = useToast();

  useEffect(() => {
    fetchApi('/agents').then(setAgents);
  }, []);

  const loadLogs = async () => {
    try {
      const auditLogs = await fetchApi('/audit');
      const formattedLogs = auditLogs.map((log: any) => ({
        id: log.id,
        timestamp: log.timestamp,
        type: log.riskScore && log.riskScore > 60 ? 'Warning' : 'Info',
        sourceId: log.actorAgentId || 'System',
        message: `${log.action} - ${log.metadata ? JSON.stringify(log.metadata).substring(0, 50) : ''}`,
        riskScore: log.riskScore,
      }));
      setLogs(formattedLogs);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  };

  // Fetch real logs
  useEffect(() => {
    if (!isOpen) return;

    loadLogs();

    const handleUpdate = () => loadLogs();
    window.addEventListener('activity-stream-updated', handleUpdate);

    return () => {
      window.removeEventListener('activity-stream-updated', handleUpdate);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !lastUpdated) return;

    setSecondsSinceUpdate(0);

    const interval = setInterval(() => {
      setSecondsSinceUpdate(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, lastUpdated]);

  const handleExport = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `system_activity_logs_${new Date().toISOString()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      showToast("Activity logs exported successfully", "success");
    } catch (err) {
      showToast("Failed to export logs", "error");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          />

          {/* Slide-over panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-[var(--bg-surface)] border-l border-[var(--border-base)] shadow-2xl z-50 flex flex-col font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-base)]">
              <div className="flex flex-col gap-0.5 text-[var(--text-base)]">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <h2 className="font-bold">Global Activity Feed</h2>
                </div>
                {lastUpdated && (
                  <button
                    id="activity-feed-sync-status"
                    onClick={() => {
                      loadLogs();
                      showToast("Manually synchronized activity logs", "info");
                    }}
                    className="flex items-center gap-1.5 ml-7 text-[10px] hover:bg-zinc-800/40 px-1.5 py-0.5 rounded transition-all cursor-pointer select-none text-left w-fit"
                    title="Click to manually refresh activity stream"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${secondsSinceUpdate < 15 ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
                    <span className={secondsSinceUpdate < 15 ? 'text-emerald-400 font-semibold' : 'text-amber-500 font-semibold'}>
                      {secondsSinceUpdate < 15 ? 'Synced' : 'Stale'}
                    </span>
                    <span className="text-[var(--text-tertiary)] font-mono">
                      ({secondsSinceUpdate}s ago)
                    </span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  title="Export Logs as JSON"
                  className="p-1.5 text-[var(--text-muted)] hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Feed Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence initial={false}>
                {logs.map((log, i) => {
                  const isNew = Date.now() - new Date(log.timestamp).getTime() < 30000;
                  return (
                    <motion.div
                      key={`${log.id || 'log'}-${i}`}
                      layout
                      initial={{ opacity: 0, y: -25, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                      transition={{
                        type: 'spring',
                        stiffness: 320,
                        damping: 24,
                        mass: 0.8,
                      }}
                      className={`flex gap-3 p-3 rounded-lg bg-[var(--bg-base)] border transition-all duration-300 relative overflow-hidden
                        ${isNew 
                          ? 'border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.12)] bg-gradient-to-r from-blue-500/[0.02] to-transparent' 
                          : 'border-[var(--border-base)] hover:border-zinc-700/50'
                        }`}
                    >
                      {isNew && (
                        <div className="absolute top-0 right-0">
                          <span className="inline-flex items-center gap-1 text-[8px] font-bold text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded-bl border-l border-b border-blue-500/20 font-mono tracking-wider animate-pulse">
                            LIVE SYNC
                          </span>
                        </div>
                      )}
                      
                      <div className="mt-0.5 shrink-0">
                        {log.type === 'Warning' ? <AlertTriangle className="w-4 h-4 text-amber-400" /> :
                         log.type === 'Error' ? <ShieldAlert className="w-4 h-4 text-rose-400" /> :
                         log.type === 'Approval' ? <Network className="w-4 h-4 text-blue-400" /> :
                         log.type === 'System' ? <Cpu className="w-4 h-4 text-purple-400" /> :
                         <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {agents.find(a => a.id === log.sourceId)?.name || 'System'}
                          </span>
                          <span className="text-[10px] text-[var(--text-tertiary)] font-mono shrink-0 whitespace-nowrap mt-0.5">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed break-words pr-12">{log.message}</p>
                        {log.riskScore && (
                          <div className="mt-2 flex">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${log.riskScore > 80 ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                              Risk: {log.riskScore}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
