import { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';
import { AlertCircle, Clock, ShieldAlert, Sparkles, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { auditService } from '../services/auditService';

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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);

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
    } catch (err) {
      console.error(err);
    } finally {
      setIsPlanning(false);
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
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-base)] tracking-tight mb-1">Active Workflows</h2>
          <p className="text-[var(--text-muted)] text-sm">Kanban view of autonomous tasks, escalations, and human approval queues.</p>
        </div>
        <div className="flex gap-2 items-center bg-[var(--bg-surface)] p-2 rounded-lg border border-[var(--border-base)] w-full md:w-auto">
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
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-md transition-colors"
          >
            {isPlanning ? <Sparkles className="w-4 h-4 animate-pulse" /> : <Plus className="w-4 h-4" />}
          </button>
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
