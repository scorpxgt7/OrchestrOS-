import { useState, useEffect } from 'react';
import { ArrowLeft, Brain, Command, Cpu, Database, Network, Shield, Zap, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { fetchApi } from '../lib/api';
import { auditService } from '../services/auditService';

interface AgentBuilderViewProps {
  onViewChange?: (view: string) => void;
}

export function AgentBuilderView({ onViewChange }: AgentBuilderViewProps) {
  const [autonomyLevel, setAutonomyLevel] = useState(3);
  const [selectedMemory, setSelectedMemory] = useState<string[]>(['Global Memory']);
  
  const [name, setName] = useState('');
  const [role, setRole] = useState('Specialist Agent');
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [mission, setMission] = useState('');
  const [primaryModel, setPrimaryModel] = useState('Gemini 1.5 Pro (Remote)');
  
  const [departments, setDepartments] = useState<any[]>([]);
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [reportingManager, setReportingManager] = useState<string>('');
  const [failureBehavior, setFailureBehavior] = useState('halt_and_escalate');

  useEffect(() => {
    fetchApi('/departments').then(setDepartments).catch(() => setDepartments([]));
    fetchApi('/agents').then(setAvailableAgents).catch(() => setAvailableAgents([]));
  }, []);

  const autonomyLevels = [
    { level: 1, title: 'L1: Suggested', desc: 'Recommends actions, executes nothing.', risk: 'Negligible risk. Useful for broad strategic planning.', gov: 'Advisory only. Output must be heavily verified by human operators.' },
    { level: 2, title: 'L2: Assisted', desc: 'Executes low-risk tasks with approval.', risk: 'Low risk. Agent cannot finalize external-facing actions.', gov: 'Requires one-click human approval before any state mutation.' },
    { level: 3, title: 'L3: Conditional', desc: 'Operates freely within strict policies.', risk: 'Moderate risk. Bounded by predefined departmental safeguards.', gov: 'Auto-executes within limits. Halted by Overwatch if thresholds exceeded.' },
    { level: 4, title: 'L4: Managed', desc: 'High autonomy. Overwatch intervenes if risk spikes.', risk: 'Significant risk. Can interact externally and manage budgets.', gov: 'Operates until Overwatch detects an anomaly (>80 risk score).' },
    { level: 5, title: 'L5: Full Autonomous', desc: 'Complete domain control. Strategic execution.', risk: 'Extreme risk. Reserved for central intelligence and core operations.', gov: 'Self-governing. Subject only to global organizational boundaries.' }
  ];

  const toggleMemory = (mem: string) => {
    if (selectedMemory.includes(mem)) {
      setSelectedMemory(selectedMemory.filter(m => m !== mem));
    } else {
      setSelectedMemory([...selectedMemory, mem]);
    }
  };

  const handleProvision = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      const newAgent = await fetchApi('/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          role,
          mission,
          autonomyLevel,
          memoryAccess: selectedMemory.join(', '),
          departmentId: departmentId || undefined,
          toolPermissions: selectedTools,
          reportingManager: reportingManager ? parseInt(reportingManager) : undefined,
          failureBehavior,
          riskLimits: { maxRiskScore: autonomyLevel > 3 ? 80 : 50 }
        })
      });

      await auditService.logEvent({
        action: 'Agent Provisioned',
        actorAgentId: newAgent.id,
        metadata: { name, role, autonomyLevel, model: primaryModel },
        outcome: 'success'
      });

      // Navigate back to agents list
      if (onViewChange) onViewChange('agents');
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 font-sans pb-24">
      <div className="flex items-center gap-4 border-b border-[var(--border-base)] pb-6">
        <button 
          onClick={() => onViewChange?.('agents')}
          className="p-2 rounded-lg bg-[var(--bg-surface)] hover:bg-[#27272a] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border-base)]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-base)] tracking-tight mb-1">Agent Builder</h2>
          <p className="text-[var(--text-muted)] text-sm">Deploy a new autonomous worker to the organization swarm.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 mb-4">
              <Command className="w-5 h-5 text-blue-400" />
              Core Identity
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Agent Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Content-Synth V3" 
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Assigned Department</label>
                <select 
                  value={departmentId || ''}
                  onChange={e => setDepartmentId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                >
                  <option value="">None (Global)</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">System Role</label>
              <select 
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
              >
                <option>Specialist Agent</option>
                <option>Supervisor Agent</option>
                <option>Department Manager</option>
                <option>Auditor Agent</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Primary Prompt / Mission Directive</label>
              <textarea 
                rows={4}
                value={mission}
                onChange={e => setMission(e.target.value)}
                placeholder="Define the core objective, behavioral guidelines, and formatting style for this agent..."
                className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-lg px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 resize-none font-mono text-[13px]" 
              />
            </div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Autonomy Limit
                </h3>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">Determine how much action this agent can take without human approval.</p>
              </div>
              <div className="px-3 py-1 bg-[var(--bg-base)] border border-amber-500/30 rounded text-amber-400 font-bold text-sm tracking-widest">
                L{autonomyLevel}
              </div>
            </div>

            <div className="space-y-3 relative">
              {autonomyLevels.map((lvl) => (
                <div 
                  key={lvl.level}
                  onClick={() => setAutonomyLevel(lvl.level)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all flex items-center justify-between group relative
                    ${autonomyLevel === lvl.level 
                      ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]' 
                      : 'bg-[var(--bg-base)] border-[var(--border-base)] hover:border-zinc-600'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0
                      ${autonomyLevel === lvl.level ? 'border-amber-400 bg-amber-400/20' : 'border-zinc-600'}`}>
                      {autonomyLevel === lvl.level && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${autonomyLevel === lvl.level ? 'text-amber-400' : 'text-[var(--text-secondary)]'}`}>
                        {lvl.title}
                      </div>
                      <div className="text-xs text-[var(--text-tertiary)]">{lvl.desc}</div>
                    </div>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 top-0 bottom-0 flex items-center pointer-events-none z-50">
                     <div className="w-80 p-4 bg-[var(--bg-base)] border border-amber-500/30 rounded-xl shadow-[0_10px_40px_-5px_rgba(245,158,11,0.15)] translate-x-[calc(100%+1rem)] translate-y-0 hidden lg:block">
                      <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 border-b border-[var(--border-base)] pb-2">Governance & Risk Analysis</div>
                      <div className="space-y-2 text-[11px] leading-relaxed">
                        <div><strong className="text-rose-400">Risk Profile:</strong> <span className="text-[var(--text-secondary)]">{lvl.risk}</span></div>
                        <div><strong className="text-emerald-400">Governance:</strong> <span className="text-[var(--text-secondary)]">{lvl.gov}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-[var(--border-base)] pt-6 mt-6">
              <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                <Network className="w-5 h-5 text-indigo-400" />
                Governance & Constraints
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Reporting Manager</label>
                  <select 
                    value={reportingManager}
                    onChange={e => setReportingManager(e.target.value)}
                    className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="">None (Top Level)</option>
                    {availableAgents.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.role})</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Failure Behavior</label>
                  <select 
                    value={failureBehavior}
                    onChange={e => setFailureBehavior(e.target.value)}
                    className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="halt_and_escalate">Halt & Escalate to Human</option>
                    <option value="retry_with_lower_temp">Retry with Lower Temp</option>
                    <option value="fallback_to_manager">Fallback to Manager Agent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Allowed Tools</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Web Search', 'Database Write', 'Send Email', 'Execute Code', 'Slack Notify', 'Approve Workflows'].map(tool => (
                    <label key={tool} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-base)] cursor-pointer hover:bg-[#27272a]/50">
                      <input 
                        type="checkbox"
                        checked={selectedTools.includes(tool)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedTools([...selectedTools, tool]);
                          else setSelectedTools(selectedTools.filter(t => t !== tool));
                        }}
                        className="rounded border-zinc-600 bg-[var(--bg-base)] text-blue-500 focus:ring-blue-500/50" 
                      />
                      <span className="text-sm text-[var(--text-secondary)]">{tool}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-emerald-400" />
              Memory Access
            </h3>
            <p className="text-xs text-[var(--text-tertiary)]">Select which context and vector databases this agent can query.</p>
            
            <div className="space-y-2">
              {['Global Memory', 'Department Specific', 'Audit Logs', 'Technical Docs', 'Financial Ledgers', 'Client Interactions'].map(mem => (
                <label key={mem} onClick={() => toggleMemory(mem)} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-base)] border border-[var(--border-base)] cursor-pointer hover:bg-[#27272a]/50 transition-colors">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center
                    ${selectedMemory.includes(mem) ? 'bg-emerald-500 border-emerald-500 text-[#09090b]' : 'border-zinc-600'}`}>
                    {selectedMemory.includes(mem) && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className="text-sm font-medium text-[var(--text-secondary)]">{mem}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 mb-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              Model Routing
            </h3>
            <p className="text-xs text-[var(--text-tertiary)]">Configure which LLM powers this agent based on cost/latency triage.</p>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Primary Model</label>
              <select 
                value={primaryModel}
                onChange={e => setPrimaryModel(e.target.value)}
                className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50"
              >
                <option>Gemini 1.5 Pro (Remote)</option>
                <option>Gemini 1.5 Flash (Remote)</option>
                <option>Local Gemma 2 9B (Local)</option>
              </select>
            </div>
            
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="text-xs text-purple-300 font-medium flex items-center gap-2">
                <Shield className="w-3 h-3" />
                Overwatch Policy Target
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">This agent will be subject to the standard risk-scoring engine. Workflows scoring &gt;75 risk will require dual-approval.</p>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleProvision}
            disabled={!name.trim() || isSubmitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text-base)] font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
                Provisioning...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Provision Agent
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

