import { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';
import { AlertCircle, Clock, ShieldAlert, Sparkles, Plus, PlayCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { auditService } from '../services/auditService';
import { useToast } from '../contexts/ToastContext';

interface Agent {
  id: number;
  name: string;
}

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  riskLevel: number | null;
  assignedAgentId: number | null;
  lastAction?: string;
}

const COLUMNS = ['Backlog', 'In Progress', 'Reviewing', 'Awaiting Approval'];

export function WorkflowsView() {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);
  const [executeContext, setExecuteContext] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const loadData = () => {
    fetchApi('/tasks').then(setTasks);
    fetchApi('/agents').then(setAgents);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePlanGoal = async () => {
    if (!newGoal.trim()) return;
    setIsPlanning(true);
    try {
      await fetchApi('/brain/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: newGoal })
      });
      setNewGoal('');
      loadData();
      showToast('Goal decomposed successfully.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to plan goal.', 'error');
    } finally {
      setIsPlanning(false);
    }
  };

  const handleExecuteContext = async () => {
    if (!executeContext.trim()) return;
    setIsExecuting(true);
    try {
      const result = await fetchApi('/brain/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: executeContext })
      });
      
      if (result.invokedFunction) {
        showToast(`Main Brain invoked: ${result.invokedFunction}`, 'success');
      } else {
        showToast('Main Brain decided no action was necessary.', 'info');
      }
      
      setExecuteContext('');
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to execute context.', 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExecuteTask = async (taskId: number) => {
    try {
      await fetchApi(`/tasks/${taskId}/execute`, {
        method: 'POST'
      });
      loadData();
    } catch (err: any) {
      console.error(err);
      alert(`Execution blocked: ${err.reason || err.message}`);
      loadData();
    }
  };

  return (
    <div className="p-8 h-full flex flex-col font-sans pb-24">
      <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-base)] tracking-tight mb-1">Active Workflows</h2>
          <p className="text-[var(--text-muted)] text-sm">Kanban view of autonomous tasks, escalations, and human approval queues.</p>
        </div>
        
        <div className="flex flex-col gap-3 w-full md:w-auto">
          {/* Plan Goal Input */}
          <div className="flex gap-2 items-center bg-[var(--bg-surface)] p-2 rounded-lg border border-[var(--border-base)] w-full">
            <input 
              type="text"
              value={newGoal}
              onChange={e => setNewGoal(e.target.value)}
              placeholder="Assign a complex goal to the Main Brain..."
              className="bg-transparent border-none focus:outline-none text-sm px-2 w-full md:w-64"
            />
            <button 
              onClick={handlePlanGoal}
              disabled={!newGoal.trim() || isPlanning}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-md transition-colors whitespace-nowrap"
            >
              {isPlanning ? <Sparkles className="w-4 h-4 animate-pulse" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>

          {/* Context Execution Simulator */}
          <div className="flex gap-2 items-center bg-[var(--bg-surface)] p-2 rounded-lg border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)] w-full relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 group-hover:from-purple-500/10 group-hover:to-blue-500/10 transition-colors pointer-events-none" />
            <input 
              type="text"
              value={executeContext}
              onChange={e => setExecuteContext(e.target.value)}
              placeholder="Simulate live context (e.g., 'Agent 007 is deleting prod')..."
              className="bg-transparent border-none focus:outline-none text-sm px-2 w-full md:w-64 relative z-10 placeholder-purple-500/40"
            />
            <button 
              onClick={handleExecuteContext}
              disabled={!executeContext.trim() || isExecuting}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-2 rounded-md transition-colors relative z-10 whitespace-nowrap flex items-center gap-1.5"
            >
              {isExecuting ? <Sparkles className="w-4 h-4 animate-pulse" /> : <PlayCircle className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
        {COLUMNS.map((status) => {
          const columnTasks = tasks.filter(t => t.status === status);
          
          return (
            <div key={status} className="w-80 flex flex-col shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">{status}</h3>
                <span className="flex items-center justify-center bg-[var(--bg-surface)] text-[var(--text-muted)] text-xs font-medium px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
              
              <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-3 flex-1 flex flex-col gap-3">
                {columnTasks.map((task, i) => {
                  const assignee = agents.find(a => a.id === task.assignedAgentId);
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={task.id || `task-${i}`} 
                      className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-lg p-4 shadow-sm hover:border-[var(--border-base)] cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                         <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded
                          ${task.priority === 'Critical' ? 'bg-rose-500/20 text-rose-400' :
                            task.priority === 'High' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-[#27272a] text-[var(--text-secondary)]'}`}>
                          {task.priority}
                        </span>
                        {task.riskLevel !== null && task.riskLevel > 50 && (
                          <ShieldAlert className={`w-4 h-4 ${task.riskLevel > 80 ? 'text-rose-400' : 'text-amber-400'}`} />
                        )}
                      </div>
                      
                      <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3 leading-snug">{task.title}</h4>
                      
                      <div className="flex justify-between items-center text-xs text-[var(--text-tertiary)]">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-[10px]">
                            {assignee?.name.charAt(0)}
                          </div>
                          <span className="truncate max-w-[100px]">{assignee?.name || 'Unassigned'}</span>
                        </div>
                        {task.status === 'Awaiting Approval' && (
                           <div className="flex items-center gap-1 text-amber-400">
                             <Clock className="w-3 h-3" />
                             Action Needed
                           </div>
                        )}
                      </div>

                      {task.status === 'Backlog' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleExecuteTask(task.id); }}
                          className="mt-3 w-full py-1.5 text-xs font-bold rounded bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 border border-blue-500/20 transition-colors"
                        >
                          Execute Task
                        </button>
                      )}

                      {task.lastAction && (
                        <div className="mt-3 p-2 bg-rose-500/10 border border-rose-500/20 rounded text-xs text-rose-300 flex items-start gap-2">
                          <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                          <span>{task.lastAction}</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
                {columnTasks.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-[var(--text-tertiary)] text-sm border-2 border-dashed border-[var(--border-base)] rounded-lg">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
