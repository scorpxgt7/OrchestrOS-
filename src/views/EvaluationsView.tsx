import { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';
import { motion } from 'motion/react';
import { useToast } from '../contexts/ToastContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Activity, 
  Target, 
  DollarSign, 
  ShieldCheck,
  AlertTriangle,
  Award,
  RefreshCw,
  Sliders
} from 'lucide-react';

interface AgentPerformance {
  agentId: string;
  completionRate: number;
  accuracyScore: number;
  costEfficiency: number;
  policyAdherence: number;
  overallScore: number;
  trend: 'Up' | 'Down' | 'Stable';
  recentFeedback: {
    source: 'Overwatch' | 'Main Brain' | 'Human';
    date: string;
    message: string;
    type: 'Positive' | 'Negative' | 'Warning';
    actionTaken?: string;
  }[];
}

interface Agent {
  id: number;
  name: string;
  role: string;
  department?: {
    id: number;
    name: string;
  };
}

export function EvaluationsView() {
  const { showToast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [evaluations, setEvaluations] = useState<Record<string, AgentPerformance>>({});

  useEffect(() => {
    fetchApi('/agents').then((data: Agent[]) => {
      setAgents(data);
      if (data.length > 0) {
        setSelectedAgentId(data[0].id.toString());
      }
    });
    fetchApi('/evaluations').then((data: Record<string, AgentPerformance>) => {
       setEvaluations(data);
    });
  }, []);

  const selectedAgent = agents.find(a => a.id.toString() === selectedAgentId);
  const perf = evaluations[selectedAgentId] || { completionRate: 85, accuracyScore: 90, costEfficiency: 80, policyAdherence: 95, overallScore: 88, trend: 'Stable', recentFeedback: [] };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 75) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getBgScoreColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 75) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans pb-24">
      <div className="border-b border-[var(--border-base)] pb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-base)] tracking-tight mb-1">Agent Performance Evaluations</h2>
          <p className="text-[var(--text-muted)] text-sm">Monitor KPIs, review feedback, and orchestrate agent retraining & role adjustments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Selection Sidebar */}
        <div className="col-span-1 space-y-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[var(--border-base)] bg-[var(--bg-base)]">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Agent Roster</h3>
            </div>
            <div className="divide-y divide-[var(--border-base)] max-h-[500px] overflow-y-auto">
              {agents.map((agent, i) => {
                const agentPerf = evaluations[agent.id.toString()] || { completionRate: 85, accuracyScore: 90, costEfficiency: 80, policyAdherence: 95, overallScore: 88, trend: 'Stable', recentFeedback: [] };
                const isSelected = selectedAgentId === agent.id.toString();
                return (
                  <button
                    key={agent.id || `agent-${i}`}
                    onClick={() => setSelectedAgentId(agent.id.toString())}
                    className={`w-full text-left p-4 hover:bg-[var(--bg-base)] transition-colors flex items-center justify-between
                      ${isSelected ? 'bg-[var(--bg-base)] border-l-2 border-l-blue-500' : ''}`}
                  >
                    <div>
                      <div className="font-bold text-sm text-[var(--text-primary)]">{agent.name}</div>
                      <div className="text-xs text-[var(--text-muted)]">{agent.role}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${getScoreColor(agentPerf.overallScore)}`}>
                        {agentPerf.overallScore.toFixed(1)}
                      </span>
                      {agentPerf.trend === 'Up' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                      {agentPerf.trend === 'Down' && <TrendingDown className="w-3 h-3 text-rose-400" />}
                      {agentPerf.trend === 'Stable' && <Minus className="w-3 h-3 text-[var(--text-muted)]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Performance Details */}
        <div className="col-span-2 space-y-6">
          {selectedAgent && perf && (
            <motion.div
              key={selectedAgentId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Header Card */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-6 shadow-sm flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">{selectedAgent.name}</h2>
                  <div className="flex items-center gap-3 mt-2 text-sm">
                    <span className="text-[var(--text-secondary)] bg-[var(--bg-base)] px-2.5 py-1 rounded-md border border-[var(--border-base)]">{selectedAgent.role}</span>
                    <span className="text-[var(--text-secondary)] bg-[var(--bg-base)] px-2.5 py-1 rounded-md border border-[var(--border-base)]">{selectedAgent.department?.name || 'Central Swarm'}</span>
                  </div>
                </div>
                <div className={`flex flex-col items-center justify-center p-4 rounded-xl border ${getBgScoreColor(perf.overallScore)}`}>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Overall Score</span>
                  <span className={`text-3xl font-black ${getScoreColor(perf.overallScore)}`}>{perf.overallScore.toFixed(1)}</span>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Completion Rate" value={`${perf.completionRate}%`} icon={Activity} score={perf.completionRate} />
                <MetricCard title="Accuracy" value={`${perf.accuracyScore}%`} icon={Target} score={perf.accuracyScore} />
                <MetricCard title="Cost Efficiency" value={`${perf.costEfficiency}%`} icon={DollarSign} score={perf.costEfficiency} />
                <MetricCard title="Policy Adherence" value={`${perf.policyAdherence}%`} icon={ShieldCheck} score={perf.policyAdherence} />
              </div>

              {/* Feedback & Interventions */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-[var(--border-base)] bg-[var(--bg-base)] flex items-center justify-between">
                  <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Feedback & Interventions
                  </h3>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => showToast('Retraining pipeline initiated...', 'info')}
                      className="px-3 py-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-base)] border border-[var(--border-base)] text-[var(--text-secondary)] text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Trigger Retraining
                    </button>
                    <button 
                      type="button" 
                      onClick={() => showToast('Opening autonomy adjustment panel...', 'info')}
                      className="px-3 py-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-base)] border border-[var(--border-base)] text-[var(--text-secondary)] text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sliders className="w-3 h-3" />
                      Adjust Autonomy
                    </button>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  {perf.recentFeedback.length === 0 ? (
                    <div className="text-center py-8 text-[var(--text-tertiary)] text-sm">
                      No recent feedback or interventions recorded.
                    </div>
                  ) : (
                    perf.recentFeedback.map((fb, idx) => (
                      <div key={idx} className="flex gap-4 p-4 rounded-xl border border-[var(--border-base)] bg-[var(--bg-base)]">
                        <div className="mt-1">
                          {fb.type === 'Positive' ? <Award className="w-5 h-5 text-emerald-400" /> :
                           fb.type === 'Negative' ? <TrendingDown className="w-5 h-5 text-rose-400" /> :
                           <AlertTriangle className="w-5 h-5 text-amber-400" />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{fb.source}</span>
                            <span className="text-xs text-[var(--text-muted)] font-mono">{new Date(fb.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-[var(--text-primary)]">{fb.message}</p>
                          {fb.actionTaken && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 mt-2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold">
                              Action Taken: {fb.actionTaken}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, score }: { title: string, value: string, icon: any, score: number }) {
  const colorClass = score >= 90 ? 'text-emerald-400' : score >= 75 ? 'text-amber-400' : 'text-rose-400';
  
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">{title}</span>
        <Icon className={`w-4 h-4 ${colorClass}`} />
      </div>
      <div className={`text-2xl font-black ${colorClass}`}>{value}</div>
    </div>
  );
}
