import { AlertTriangle, Check, X, Edit3, ShieldAlert, Clock, Inbox, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';
import { auditService } from '../services/auditService';

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  department: string;
  riskLevel: number;
  assignedAgentId: number;
  lastAction: string;
}

interface Agent {
  id: number;
  name: string;
}

export function ApprovalQueueView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filterDept, setFilterDept] = useState<string>('all');

  const loadData = () => {
    fetchApi('/tasks').then(setTasks);
    fetchApi('/agents').then(setAgents);
  };

  useEffect(() => {
    loadData();
  }, []);
  
  const allHaltedTasks = tasks.filter(t => t.status === 'Awaiting Approval' || t.status === 'Blocked');
  const haltedTasks = filterDept === 'all' 
    ? allHaltedTasks 
    : allHaltedTasks.filter(t => t.department === filterDept);

  const handleAction = async (taskId: number, action: 'approve' | 'deny', agentId: number) => {
    try {
      const status = action === 'approve' ? 'In Progress' : 'Backlog';
      await fetchApi(`/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      await auditService.logEvent({
        action: `Task ${action === 'approve' ? 'Approved' : 'Denied'}`,
        taskId,
        actorAgentId: agentId,
        metadata: { status },
        outcome: 'success'
      });
      
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 font-sans pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[var(--border-base)] pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-base)] tracking-tight mb-1">Approval Queue & Remediation</h2>
          <p className="text-[var(--text-muted)] text-sm">Review, approve, deny, or modify tasks halted by Overwatch for human intervention.</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--text-muted)]" />
          <select 
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="bg-[var(--bg-surface)] border border-[var(--border-base)] text-[var(--text-secondary)] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="all">All Departments</option>
            <option value="Executive">Executive</option>
            <option value="Engineering">Engineering</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
            {/* Using an option that guarantees empty state for testing */}
            <option value="Legal">Legal (Empty)</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {haltedTasks.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[var(--bg-surface)] border border-[var(--border-base)] border-dashed rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden"
            >
              {/* Decorative background elements */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-blue-500/10 blur-[100px] rounded-full transform rotate-12" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[120%] bg-emerald-500/10 blur-[80px] rounded-full transform -rotate-12" />
              </div>

              {/* Illustration composite */}
              <div className="relative mb-8 mt-4">
                <div className="w-32 h-32 bg-gradient-to-br from-[var(--bg-base)] to-[var(--bg-surface)] border border-[var(--border-base)] rounded-3xl shadow-xl flex items-center justify-center relative z-10">
                  <div className="w-24 h-24 rounded-2xl border border-dashed border-blue-500/30 bg-blue-500/5 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                </div>
                
                {/* Floating elements */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -right-8 w-16 h-16 bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl shadow-lg flex items-center justify-center z-20"
                >
                  <Inbox className="w-6 h-6 text-blue-400" />
                </motion.div>
                
                <motion.div 
                  animate={{ y: [0, 8, 0] }} 
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-4 -left-6 w-12 h-12 bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl shadow-lg flex items-center justify-center z-20"
                >
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </motion.div>
              </div>
              
              <h3 className="text-xl font-bold text-[var(--text-primary)] relative z-10 mb-2">Inbox Zero Achieved</h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-8 relative z-10">
                All autonomous agent requests have been processed. There are no tasks waiting for human remediation or approval right now.
              </p>
              
              <div className="flex gap-4 relative z-10">
                <button 
                  type="button" disabled title="Coming soon"
                  className="px-5 py-2.5 bg-blue-600/50 cursor-not-allowed text-white/70 font-semibold rounded-lg text-sm transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Configure Auto-Approvals
                </button>
                <button 
                  type="button" disabled title="Coming soon"
                  className="px-5 py-2.5 bg-[var(--bg-base)]/50 cursor-not-allowed border border-[var(--border-base)] text-[var(--text-primary)]/50 font-medium rounded-lg text-sm transition-all"
                >
                  View Audit Logs
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="list" className="space-y-6">
              {haltedTasks.map((task, i) => {
                const assignee = agents.find(a => a.id === task.assignedAgentId);
                const isBlocked = task.status === 'Blocked';

                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={task.id} 
                    className={`bg-[var(--bg-surface)] border rounded-xl overflow-hidden ${isBlocked ? 'border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]' : 'border-[var(--border-base)] shadow-sm'}`}
                  >
                    <div className={`px-6 py-3 border-b ${isBlocked ? 'bg-amber-500/10 border-amber-500/20' : 'bg-[var(--bg-base)] border-[var(--border-base)]'} flex items-center justify-between`}>
                      <div className="flex items-center gap-3">
                        {isBlocked ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <Clock className="w-4 h-4 text-blue-400" />}
                        <span className={`text-xs font-bold uppercase tracking-wider ${isBlocked ? 'text-amber-400' : 'text-blue-400'}`}>
                          {isBlocked ? 'Overwatch Block' : 'Approval Required'}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--text-tertiary)] font-mono">Risk Score: <span className={task.riskLevel > 50 ? 'text-rose-400 font-bold' : 'text-[var(--text-secondary)]'}>{task.riskLevel}/100</span></div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{task.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-[var(--text-muted)] border border-[var(--border-base)] bg-[var(--bg-base)] px-3 py-1.5 rounded-lg inline-flex">
                            <span className="font-medium text-blue-400">{assignee?.name}</span>
                            <span className="text-[var(--border-base)]">•</span>
                            <span>{assignee?.department}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[var(--bg-base)] border border-[var(--border-base)] rounded-lg p-4 mb-6">
                        <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-3">Agent Reasoning / Output Preview</h4>
                        <pre className="text-sm text-[var(--text-secondary)] font-mono whitespace-pre-wrap">
                          {isBlocked 
                            ? task.lastAction 
                            : "Prepared executive board presentation draft based on Q3 financials. Found 3 minor discrepancies in ops budget. Requesting executive sign-off before distribution to stakeholders."}
                        </pre>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button 
                          type="button" 
                          onClick={() => handleAction(task.id, 'approve', task.assignedAgentId)}
                          className="flex-1 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          Approve & Execute
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleAction(task.id, 'deny', task.assignedAgentId)}
                          className="flex-1 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                          Deny & Halt
                        </button>
                        <button 
                          type="button" disabled title="Coming soon"
                          className="flex-1 bg-[var(--bg-surface)]/50 cursor-not-allowed text-[var(--text-secondary)]/50 border border-[var(--border-base)] py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          Modify Request
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
