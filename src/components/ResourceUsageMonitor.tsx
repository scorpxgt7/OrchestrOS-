import { useState, useEffect, useRef } from 'react';
import { 
  Cpu, Database, ChevronUp, ChevronDown, Activity, Play, Pause, 
  Settings, Sliders, ShieldCheck, AlertTriangle, ShieldAlert, Zap, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AgentResource {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'Busy' | 'Idle' | 'Halted';
  cpu: number;
  memory: number;
  priority: 'High' | 'Normal' | 'Eco';
}

const initialAgents: AgentResource[] = [
  { id: 'a1', name: 'Alpha Prime', role: 'Main Brain', status: 'Active', cpu: 18.4, memory: 1240, priority: 'Normal' },
  { id: 'a2', name: 'Aegis Monitor', role: 'Overwatch', status: 'Active', cpu: 5.1, memory: 412, priority: 'Normal' },
  { id: 'a5', name: 'Code-Synth V2', role: 'Specialist', status: 'Busy', cpu: 14.8, memory: 890, priority: 'High' },
  { id: 'a6', name: 'Docu-Scribe', role: 'Memory Agent', status: 'Active', cpu: 1.2, memory: 512, priority: 'Eco' },
  { id: 'a7', name: 'QA-Validator', status: 'Active', role: 'Auditor', cpu: 2.3, memory: 256, priority: 'Normal' },
  { id: 'a8', name: 'Fin-Analyst', role: 'Specialist', status: 'Halted', cpu: 0, memory: 156, priority: 'Eco' }
];

export function ResourceUsageMonitor() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [agents, setAgents] = useState<AgentResource[]>(initialAgents);
  const [engineMode, setEngineMode] = useState<'Standard' | 'Balanced' | 'Overdrive'>('Balanced');
  const [isLive, setIsLive] = useState(true);
  
  // Historical data for Sparklines (last 15 points)
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(15).fill(25));
  const [memoryHistory, setMemoryHistory] = useState<number[]>(Array(15).fill(3.2));

  // Ref to hold the latest state values for the interval loop to prevent stale closures
  const stateRef = useRef({ agents, engineMode, isLive });
  useEffect(() => {
    stateRef.current = { agents, engineMode, isLive };
  }, [agents, engineMode, isLive]);

  // Periodic resource simulation
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const { agents: currentAgents, engineMode: mode } = stateRef.current;
      
      // Multipliers based on engine modes
      let modeCpuMultiplier = 1.0;
      let modeMemMultiplier = 1.0;
      
      if (mode === 'Standard') {
        modeCpuMultiplier = 0.7;
        modeMemMultiplier = 0.9;
      } else if (mode === 'Overdrive') {
        modeCpuMultiplier = 1.6;
        modeMemMultiplier = 1.2;
      }

      const updated = currentAgents.map(agent => {
        if (agent.status === 'Halted') {
          return { ...agent, cpu: 0 };
        }

        // Priority factor
        let priorityFactor = 1.0;
        if (agent.priority === 'Eco') priorityFactor = 0.5;
        if (agent.priority === 'High') priorityFactor = 1.5;

        // Base variations
        let baseCpu = 0;
        let baseMem = agent.memory;

        switch (agent.id) {
          case 'a1': // Alpha Prime
            baseCpu = 15 + Math.random() * 10;
            baseMem = 1200 + Math.random() * 60;
            break;
          case 'a2': // Aegis Monitor
            baseCpu = 3 + Math.random() * 4;
            baseMem = 400 + Math.random() * 15;
            break;
          case 'a5': // Code-Synth V2
            baseCpu = 10 + Math.random() * 12;
            baseMem = 850 + Math.random() * 40;
            break;
          case 'a6': // Docu-Scribe
            baseCpu = 0.5 + Math.random() * 2;
            baseMem = 500 + Math.random() * 10;
            break;
          case 'a7': // QA-Validator
            baseCpu = 1 + Math.random() * 3;
            baseMem = 250 + Math.random() * 8;
            break;
          default:
            baseCpu = 2 + Math.random() * 4;
            baseMem = 180 + Math.random() * 10;
        }

        // Apply priorities and mode multipliers
        const finalCpu = Math.min(99.8, parseFloat((baseCpu * priorityFactor * modeCpuMultiplier).toFixed(1)));
        const finalMem = Math.min(4096, Math.round(baseMem * (1 + (priorityFactor - 1) * 0.15) * modeMemMultiplier));

        // Let's also randomly fluctuate status for active/busy
        let status = agent.status;
        if (agent.status !== 'Halted' && Math.random() > 0.85) {
          status = finalCpu > 15 ? 'Busy' : 'Active';
        }

        return {
          ...agent,
          cpu: finalCpu,
          memory: finalMem,
          status
        };
      });

      setAgents(updated);

      // Calculate totals to append to history
      const totalAgentsCpu = updated.reduce((sum, a) => sum + a.cpu, 0);
      const systemOverheadCpu = 2.5 + Math.random() * 1.5;
      const totalCpu = parseFloat(Math.min(100, totalAgentsCpu + systemOverheadCpu).toFixed(1));

      const totalAgentsMem = updated.reduce((sum, a) => sum + a.memory, 0) / 1024; // in GB
      const systemOverheadMem = 0.32 + Math.random() * 0.05;
      const totalMem = parseFloat(Math.min(16, totalAgentsMem + systemOverheadMem).toFixed(2));

      setCpuHistory(prev => [...prev.slice(1), totalCpu]);
      setMemoryHistory(prev => [...prev.slice(1), totalMem]);

    }, 1500);

    return () => clearInterval(interval);
  }, [isLive]);

  // Calculations for aggregate metrics
  const totalCpu = parseFloat(Math.min(100, agents.reduce((sum, a) => sum + a.cpu, 0) + 3.2).toFixed(1));
  const totalMemoryMb = agents.reduce((sum, a) => sum + a.memory, 0) + 350;
  const totalMemoryGb = parseFloat((totalMemoryMb / 1024).toFixed(2));
  const activeCount = agents.filter(a => a.status === 'Active' || a.status === 'Busy').length;

  const getSystemStatus = () => {
    if (totalCpu > 80) return { label: 'CRITICAL LOAD', color: 'text-rose-400', icon: ShieldAlert, bg: 'bg-rose-500/10 border-rose-500/30' };
    if (totalCpu > 50) return { label: 'ELEVATED IMPACT', color: 'text-amber-400', icon: AlertTriangle, bg: 'bg-amber-500/10 border-amber-500/30' };
    return { label: 'ENGINE HEALTHY', color: 'text-emerald-400', icon: ShieldCheck, bg: 'bg-emerald-500/10 border-emerald-500/30' };
  };

  const sysStatus = getSystemStatus();

  const handlePriorityChange = (agentId: string, priority: 'High' | 'Normal' | 'Eco') => {
    setAgents(prev => prev.map(a => {
      if (a.id === agentId) {
        return { ...a, priority };
      }
      return a;
    }));
  };

  const toggleHaltAgent = (agentId: string) => {
    setAgents(prev => prev.map(a => {
      if (a.id === agentId) {
        const isHalted = a.status === 'Halted';
        return {
          ...a,
          status: isHalted ? 'Active' : 'Halted',
          cpu: isHalted ? 5.0 : 0
        };
      }
      return a;
    }));
  };

  // Convert array values to SVG Polyline points
  const getPolylinePoints = (history: number[], min: number, max: number, height: number, width: number) => {
    const step = width / (history.length - 1);
    const range = max - min || 1;
    return history.map((val, index) => {
      const x = index * step;
      const normalizedY = (val - min) / range;
      const y = height - (normalizedY * (height - 4)) - 2; // leave margin padding
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div 
      id="resource-usage-footer" 
      className="border-t border-[var(--border-base)] bg-[var(--bg-base)] text-xs relative z-20"
    >
      {/* Footer Top Strip (Collapsed View / Accordion Header) */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-[var(--bg-surface)]/40 transition-colors select-none"
      >
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
            <span className="font-bold tracking-tight text-[var(--text-primary)]">Cognitive Orchestration Monitor</span>
          </div>

          {/* CPU Overview Meter */}
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="text-[var(--text-muted)] font-mono">CPU:</span>
            <span className={`font-bold font-mono w-10 text-right ${totalCpu > 70 ? 'text-rose-400' : totalCpu > 40 ? 'text-amber-400' : 'text-blue-400'}`}>
              {totalCpu}%
            </span>
            <div className="w-16 h-1.5 bg-[var(--border-base)] rounded-full overflow-hidden shrink-0 hidden sm:block">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  totalCpu > 70 ? 'bg-rose-500' : totalCpu > 40 ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                style={{ width: `${totalCpu}%` }}
              />
            </div>
          </div>

          {/* Memory Overview Meter */}
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="text-[var(--text-muted)] font-mono">RAM:</span>
            <span className="font-bold font-mono text-[var(--text-primary)] w-14 text-right">
              {totalMemoryGb} GB
            </span>
            <div className="w-16 h-1.5 bg-[var(--border-base)] rounded-full overflow-hidden shrink-0 hidden sm:block">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${(totalMemoryGb / 16) * 100}%` }}
              />
            </div>
            <span className="text-[var(--text-tertiary)] font-mono text-[10px]">/ 16GB</span>
          </div>

          {/* Engine Health Badge */}
          <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${sysStatus.bg} ${sysStatus.color}`}>
            <sysStatus.icon className="w-3 h-3 shrink-0" />
            {sysStatus.label}
          </div>

          {/* Active Agents counter */}
          <div className="hidden lg:flex items-center gap-1.5 text-[var(--text-muted)] font-mono">
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>{activeCount} of {agents.length} Agents Computing</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Mini Real-Time Sparkline */}
          <div className="hidden xl:flex items-center gap-2 border-r border-[var(--border-base)] pr-4 h-5">
            <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider">Engine Load History</span>
            <svg className="w-20 h-5" viewBox="0 0 80 20">
              <polyline
                fill="none"
                stroke="#60a5fa"
                strokeWidth="1.5"
                points={getPolylinePoints(cpuHistory, 0, 100, 20, 80)}
              />
            </svg>
          </div>

          <div className="flex items-center justify-center p-1 rounded-md bg-[var(--bg-surface)] border border-[var(--border-base)] hover:text-[var(--text-base)]">
            {isCollapsed ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
          </div>
        </div>
      </div>

      {/* Expanded Diagnostics Drawer */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-[var(--border-base)] bg-[var(--bg-base)]"
          >
            <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Section: Active Agent Resource Breakdown (Spans 8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-400" />
                    Agent Cognitive Core Allocations
                  </h4>
                  <div className="text-[10px] text-[var(--text-tertiary)] font-mono">
                    Updated every 1500ms • Real-time Host Telemetry
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                  {agents.map(agent => {
                    const isHalted = agent.status === 'Halted';
                    const isBusy = agent.status === 'Busy';
                    
                    return (
                      <div 
                        key={agent.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isHalted 
                            ? 'bg-zinc-950/40 border-zinc-900 opacity-60' 
                            : isBusy
                              ? 'bg-[var(--bg-surface)] border-blue-500/20'
                              : 'bg-[var(--bg-surface)] border-[var(--border-base)]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[var(--text-primary)]">{agent.name}</span>
                              <span className="text-[10px] text-[var(--text-tertiary)] font-mono">({agent.role})</span>
                            </div>
                            
                            {/* Priority Indicator & Controller */}
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[9px] font-mono text-[var(--text-tertiary)] uppercase">Priority:</span>
                              {(['Eco', 'Normal', 'High'] as const).map(p => (
                                <button
                                  key={p}
                                  disabled={isHalted}
                                  onClick={() => handlePriorityChange(agent.id, p)}
                                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold font-mono transition-all ${
                                    agent.priority === p
                                      ? p === 'High' 
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                        : p === 'Eco'
                                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                                  }`}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Control Switch / Halt State Toggle */}
                          <button
                            id={`halt-toggle-${agent.id}`}
                            onClick={() => toggleHaltAgent(agent.id)}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                              isHalted
                                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {isHalted ? 'Resume' : 'Halt'}
                          </button>
                        </div>

                        {/* Real-time stats row */}
                        <div className="grid grid-cols-2 gap-3 text-xs mt-2 border-t border-[var(--border-base)] pt-2 font-mono">
                          <div className="flex items-center justify-between">
                            <span className="text-[var(--text-muted)] text-[10px]">CPU Load:</span>
                            <span className={`font-bold ${isHalted ? 'text-[var(--text-tertiary)]' : agent.cpu > 20 ? 'text-amber-400 font-extrabold' : 'text-blue-400'}`}>
                              {agent.cpu}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[var(--text-muted)] text-[10px]">Memory:</span>
                            <span className={`font-bold ${isHalted ? 'text-[var(--text-tertiary)]' : 'text-indigo-400'}`}>
                              {agent.memory} MB
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Section: System Diagnostics & Settings (Spans 4 cols) */}
              <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[var(--border-base)] pt-4 lg:pt-0 lg:pl-6 space-y-4">
                <h4 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4 text-indigo-400" />
                  Kernel Configurations
                </h4>

                {/* Profile Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] font-mono block">Orchestration Engine Throttle Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Standard', 'Balanced', 'Overdrive'] as const).map(mode => (
                      <button
                        key={mode}
                        id={`engine-mode-${mode.toLowerCase()}`}
                        onClick={() => setEngineMode(mode)}
                        className={`py-1.5 px-2 rounded-xl border text-[10px] font-bold font-mono transition-all text-center flex flex-col items-center justify-center gap-1 ${
                          engineMode === mode
                            ? mode === 'Overdrive'
                              ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 shadow-sm shadow-rose-500/5'
                              : mode === 'Standard'
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                                : 'bg-blue-500/10 border-blue-500/40 text-blue-400'
                            : 'bg-[var(--bg-surface)] border-[var(--border-base)] text-[var(--text-muted)] hover:text-[var(--text-base)]'
                        }`}
                      >
                        {mode === 'Overdrive' && <Zap className="w-3.5 h-3.5 text-rose-400" />}
                        <span>{mode}</span>
                      </button>
                    ))}
                  </div>
                  {engineMode === 'Overdrive' && (
                    <div className="flex items-start gap-1.5 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <p className="text-[9px] leading-snug text-rose-300">
                        Warning: Overdrive mode lifts governor limits. Active CPU core temperatures and system memory usage will spike significantly.
                      </p>
                    </div>
                  )}
                </div>

                {/* Engine Simulation toggle & manual update */}
                <div className="flex items-center justify-between border-t border-[var(--border-base)] pt-3">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] font-mono">Live Simulation</span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      id="live-telemetry-toggle"
                      onClick={() => setIsLive(!isLive)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold transition-all border ${
                        isLive
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : 'bg-zinc-800/40 border-zinc-700 text-zinc-400'
                      }`}
                    >
                      {isLive ? (
                        <>
                          <Play className="w-3 h-3 text-emerald-400 fill-emerald-400/20" />
                          Streaming
                        </>
                      ) : (
                        <>
                          <Pause className="w-3 h-3" />
                          Paused
                        </>
                      )}
                    </button>

                    <button
                      disabled={isLive}
                      onClick={() => {
                        // Trigger one manual fluctuation
                        setAgents(prev => prev.map(a => ({
                          ...a,
                          cpu: a.status === 'Halted' ? 0 : parseFloat((Math.max(0.5, a.cpu + (Math.random() * 4 - 2))).toFixed(1)),
                          memory: Math.round(a.memory + (Math.random() * 20 - 10))
                        })));
                      }}
                      className={`p-1 rounded bg-[var(--bg-surface)] border border-[var(--border-base)] ${
                        isLive ? 'opacity-40 cursor-not-allowed' : 'hover:bg-zinc-800 hover:text-[var(--text-base)]'
                      }`}
                      title="Step Simulation"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Secure seal */}
                <div className="text-[9px] text-[var(--text-tertiary)] leading-snug font-mono">
                  OS Scheduler: <span className="text-[var(--text-muted)] font-bold">CFS Core-Affinity</span> • Active Limits: <span className="text-[var(--text-muted)]">Enabled</span>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
