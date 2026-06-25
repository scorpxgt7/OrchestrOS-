import { useState, useEffect, useMemo } from 'react';
import { fetchApi } from '../lib/api';
import { auditService } from '../services/auditService';
import { 
  Shield, Brain, Network, Zap, Settings, Activity, Gauge, 
  Database, RefreshCw, Sparkles, AlertTriangle, Check, ArrowRight,
  Info, Award, Server, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface Agent {
  id: number;
  name: string;
  role: string;
  mission: string | null;
  autonomyLevel: number;
  status: string;
  department?: { name: string };
  skills: string[];
  responsibilities: string[];
}

interface DataPoint {
  time: string;
  memory: number; // MB
  latency: number; // ms
}

// Generate the 24h cyclic baseline data for a given agent
function generateBaseDataForAgent(agentId: number | string): DataPoint[] {
  const currentHour = new Date().getHours();
  const data: DataPoint[] = [];

  // Determine baselines based on agent ID
  let baseMem = 400; // in MB
  let memFluct = 30;
  let baseLat = 120; // in ms
  let latFluct = 15;

  if (typeof agentId === 'number') {
    baseMem = 400 + agentId * 10;
  } else {
    switch (agentId) {
      case 'a1': // Alpha Prime (Main Brain)
        baseMem = 1250;
        memFluct = 110;
        baseLat = 95;
        latFluct = 12;
        break;
      case 'a2': // Aegis Monitor (Overwatch)
        baseMem = 420;
        memFluct = 20;
        baseLat = 55;
        latFluct = 6;
        break;
      case 'a3': // Exec-Ops 1 (Executive Director)
        baseMem = 310;
        memFluct = 15;
        baseLat = 145;
        latFluct = 18;
        break;
      case 'a4': // Mktg-Lead
        baseMem = 480;
        memFluct = 45;
        baseLat = 210;
        latFluct = 25;
        break;
      case 'a5': // Code-Synth V2
        baseMem = 840;
        memFluct = 95;
        baseLat = 360;
        latFluct = 55;
        break;
      case 'a6': // Docu-Scribe (Memory Agent)
        baseMem = 512;
        memFluct = 35;
        baseLat = 75;
        latFluct = 10;
        break;
      case 'a7': // QA-Validator
        baseMem = 256;
        memFluct = 18;
        baseLat = 290;
        latFluct = 35;
        break;
      case 'a8': // Fin-Analyst
        baseMem = 156;
        memFluct = 5;
        baseLat = 0;
        latFluct = 0;
        break;
    }
  }

  for (let i = 23; i >= 0; i--) {
    const hr = (currentHour - i + 24) % 24;
    const timeLabel = `${hr.toString().padStart(2, '0')}:00`;

    // Activity curve peaks during work hours (14:00 / 2:00 PM)
    const cycleFactor = Math.sin((hr - 8) * Math.PI / 12); 

    let memVal = baseMem + (cycleFactor * memFluct) + (Math.random() * 16 - 8);
    let latVal = baseLat + (cycleFactor * latFluct) + (Math.random() * 10 - 5);

    if (agentId === 'a8') { // Halted agent
      memVal = 156 + (Math.random() * 2 - 1);
      latVal = 0;
    }

    data.push({
      time: timeLabel,
      memory: parseFloat(Math.max(10, memVal).toFixed(1)),
      latency: parseFloat(Math.max(0, latVal).toFixed(1))
    });
  }

  return data;
}

export function AgentsView({ onViewChange }: { onViewChange?: (view: string) => void }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<number | string>('');
  const [allChartData, setAllChartData] = useState<Record<string, DataPoint[]>>({});
  
  // Interactive action animations/states
  const [gcActive, setGcActive] = useState(false);
  const [tuningActive, setTuningActive] = useState(false);
  const [stressActive, setStressActive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize all agents chart data on mount
  useEffect(() => {
    fetchApi('/agents').then((data: Agent[]) => {
      setAgents(data);
      if (data.length > 0) {
        setSelectedAgentId(data[0].id);
      }
      const initialData: Record<string, DataPoint[]> = {};
      data.forEach(agent => {
        initialData[agent.id.toString()] = generateBaseDataForAgent(agent.id);
      });
      setAllChartData(initialData);
    });
  }, []);

  // Find currently selected agent details
  const selectedAgent = useMemo(() => {
    return agents.find(a => a.id === selectedAgentId) || agents[0] || {
      id: 0,
      name: 'Loading Agent...',
      status: 'Active',
      type: 'Primary',
      department: { name: 'Operations' },
      memoryAccess: [],
      autonomyLevel: 'Level 1',
      riskThreshold: 80,
    };
  }, [selectedAgentId, agents]);

  // Read active chart data for selected agent
  const chartData = useMemo(() => {
    const idStr = selectedAgentId?.toString();
    if (!idStr) return [];
    if (!allChartData[idStr]) {
      return generateBaseDataForAgent(selectedAgentId);
    }
    return allChartData[idStr];
  }, [allChartData, selectedAgentId]);

  // Aggregate stats derived from current 24h data
  const avgMemory = useMemo(() => {
    if (!chartData.length) return 0;
    const sum = chartData.reduce((acc, d) => acc + d.memory, 0);
    return Math.round(sum / chartData.length);
  }, [chartData]);

  const peakLatency = useMemo(() => {
    if (!chartData.length) return 0;
    return Math.max(...chartData.map(d => d.latency));
  }, [chartData]);

  const efficiencyIndex = useMemo(() => {
    if (!selectedAgent || selectedAgent.status === 'Halted') return '0.0%';
    if (!chartData.length) return '95.0%';
    const avgLat = chartData.reduce((acc, d) => acc + d.latency, 0) / chartData.length;
    const rawScore = 100 - (avgLat * 0.04) - (avgMemory * 0.005);
    return `${Math.max(68, Math.min(99.8, rawScore)).toFixed(1)}%`;
  }, [chartData, avgMemory, selectedAgent]);

  // Custom tooltips matching our UI theme
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#09090b] border border-zinc-800 p-3 rounded-xl shadow-2xl font-mono text-xs space-y-2">
          <p className="text-[var(--text-primary)] font-bold border-b border-zinc-800 pb-1">Timestamp: {label}</p>
          <div className="flex items-center gap-2 text-blue-400">
            <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            <span>Memory Load: <span className="font-bold">{payload[0].value} MB</span></span>
          </div>
          {payload[1] && payload[1].value > 0 && (
            <div className="flex items-center gap-2 text-amber-400">
              <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span>Response Latency: <span className="font-bold">{payload[1].value} ms</span></span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Sparklines helper
  const sparklineData = useMemo(() => 
    agents.map(() => 
      Array.from({ length: 16 }, () => Math.floor(Math.random() * 60) + 20)
    )
  , [agents]);

  // Action: Garbage Collection
  const triggerGarbageCollection = () => {
    if (selectedAgent.status === 'Halted') {
      showToast("Cannot run Garbage Collection on halted agent.");
      return;
    }
    setGcActive(true);
    showToast(`Initializing heap scan on ${selectedAgent.name}...`);
    
    setTimeout(() => {
      // Create a drop in memory utilization for the last 6 data points
      setAllChartData(prev => {
        const currentData = prev[selectedAgentId];
        if (!currentData) return prev;
        
        const updated = currentData.map((d, index) => {
          if (index >= currentData.length - 6) {
            // Gradually larger drops up to 45% reduction at the latest point
            const reductionFactor = 0.6 + (0.4 * (currentData.length - 1 - index) / 5);
            return {
              ...d,
              memory: parseFloat((d.memory * reductionFactor).toFixed(1))
            };
          }
          return d;
        });

        return { ...prev, [selectedAgentId]: updated };
      });

      setGcActive(false);
      const savedMem = Math.round(avgMemory * 0.35);
      showToast(`Garbage Collection completed. Reclaimed ${savedMem}MB memory heap!`);
      auditService.logEvent({
        action: 'Garbage Collection Triggered',
        actorAgentId: selectedAgent.id,
        metadata: { savedMem, agentName: selectedAgent.name },
        outcome: 'success'
      });
    }, 1500);
  };

  // Action: Latency Tuning
  const triggerLatencyTuning = () => {
    if (selectedAgent.status === 'Halted') {
      showToast("Cannot optimize routing on halted agent.");
      return;
    }
    setTuningActive(true);
    showToast(`Re-routing logical links for ${selectedAgent.name}...`);

    setTimeout(() => {
      // Drops latency in the last 6 hours
      setAllChartData(prev => {
        const currentData = prev[selectedAgentId];
        if (!currentData) return prev;
        
        const updated = currentData.map((d, index) => {
          if (index >= currentData.length - 6) {
            const reductionFactor = 0.65 + (0.3 * (currentData.length - 1 - index) / 5);
            return {
              ...d,
              latency: parseFloat((d.latency * reductionFactor).toFixed(1))
            };
          }
          return d;
        });

        return { ...prev, [selectedAgentId]: updated };
      });

      setTuningActive(false);
      showToast(`Cognitive tuning completed. Reduced peak latency by ${Math.round(peakLatency * 0.3)}ms.`);
      auditService.logEvent({
        action: 'Latency Tuning Triggered',
        actorAgentId: selectedAgent.id,
        metadata: { latencyReduced: Math.round(peakLatency * 0.3), agentName: selectedAgent.name },
        outcome: 'success'
      });
    }, 1500);
  };

  // Action: Stress Test
  const triggerStressTest = () => {
    if (selectedAgent.status === 'Halted') {
      showToast("Cannot stress test a halted agent.");
      return;
    }
    setStressActive(true);
    showToast(`Injecting mock parallel prompt queue into ${selectedAgent.name}...`);

    setTimeout(() => {
      // Spike both memory and latency for the last 4 data points
      setAllChartData(prev => {
        const currentData = prev[selectedAgentId];
        if (!currentData) return prev;

        const updated = currentData.map((d, index) => {
          if (index >= currentData.length - 4) {
            return {
              ...d,
              memory: parseFloat((d.memory * 1.55).toFixed(1)),
              latency: parseFloat((d.latency * 2.1).toFixed(1))
            };
          }
          return d;
        });

        return { ...prev, [selectedAgentId]: updated };
      });

      setStressActive(false);
      showToast(`Stress test completed. Core verified safe up to 150k context tokens.`);
      auditService.logEvent({
        action: 'Stress Test Triggered',
        actorAgentId: selectedAgent.id,
        metadata: { agentName: selectedAgent.name },
        outcome: 'success'
      });
    }, 2000);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 4000);
  };

  if (!selectedAgent) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center h-[50vh] text-[var(--text-tertiary)] gap-3 font-sans">
        <Server className="w-5 h-5 animate-spin" />
        <p className="text-sm font-medium">Booting Agent Telemetry Interface...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-32 font-sans">
      
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between border-b border-[var(--border-base)] pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-base)] tracking-tight mb-1">Agent Roster & Diagnostics</h2>
          <p className="text-[var(--text-muted)] text-sm">Manage autonomous cognitive agents, tune memory utilization, and analyze task latency metrics.</p>
        </div>
        <button 
          onClick={() => onViewChange?.('agent-builder')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-[var(--text-base)] text-sm font-semibold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-blue-500/15 hover:scale-[1.02] active:scale-95"
        >
          <Zap className="w-4 h-4" />
          Deploy New Agent
        </button>
      </div>

      {/* Dynamic Telemetry & Analytics Dashboard (Selected Agent) */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-2xl overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Column: Recharts Line Chart (Spans 8 cols) */}
        <div className="lg:col-span-8 p-6 border-b lg:border-b-0 lg:border-r border-[var(--border-base)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-base)]/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                <Gauge className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--text-primary)] text-base flex items-center gap-2">
                  <span>Core Telemetry:</span>
                  <span className="text-blue-400 font-extrabold">{selectedAgent.name}</span>
                </h3>
                <p className="text-xs text-[var(--text-muted)]">Historical 24-hour resource load and orchestration latency profiling.</p>
              </div>
            </div>

            {/* Custom chart legends */}
            <div className="flex items-center gap-4 text-xs font-mono shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                <span className="text-[var(--text-secondary)] font-medium">Memory (MB)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span className="text-[var(--text-secondary)] font-medium">Latency (ms)</span>
              </div>
            </div>
          </div>

          {/* Recharts Render Stage */}
          <div className="h-[280px] w-full relative">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={chartData} 
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="var(--text-muted)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    dy={8}
                  />
                  
                  {/* Left Y-axis (Memory Utilization) */}
                  <YAxis 
                    yAxisId="left" 
                    stroke="#3b82f6" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `${val}MB`}
                  />
                  
                  {/* Right Y-axis (Task Latency) */}
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#f59e0b" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `${val}ms`}
                  />
                  
                  <Tooltip content={<CustomTooltip />} />
                  
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="memory" 
                    stroke="#3b82f6" 
                    strokeWidth={2.2} 
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    animationDuration={600}
                  />
                  
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="latency" 
                    stroke="#f59e0b" 
                    strokeWidth={2.2} 
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    animationDuration={600}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[var(--text-tertiary)] gap-2">
                <Server className="w-8 h-8 animate-spin" />
                <p className="text-xs">Re-generating diagnostic streams...</p>
              </div>
            )}
          </div>

          {/* Prompt/Interactive Toast Indicator */}
          <div className="h-6 flex items-center">
            <AnimatePresence mode="wait">
              {toastMessage ? (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs text-blue-400 font-mono flex items-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>{toastMessage}</span>
                </motion.div>
              ) : (
                <div className="text-[10px] text-[var(--text-tertiary)] font-mono flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  <span>Interactive Playground: Click any action on the right to optimize memory/latency profiles.</span>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Dynamic Agent Metrics & Fine-Tuning Actions (Spans 4 cols) */}
        <div className="lg:col-span-4 p-6 bg-[var(--bg-surface)]/60 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            
            {/* Header info */}
            <div className="flex items-start justify-between border-b border-[var(--border-base)] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-tertiary)] font-mono">Telemetry Node</span>
                <h4 className="font-bold text-[var(--text-primary)] text-sm">{selectedAgent.name}</h4>
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border shrink-0
                ${selectedAgent.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                  selectedAgent.status === 'Busy' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  selectedAgent.status === 'Halted' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                  'bg-[var(--bg-base)] text-[var(--text-muted)] border-[var(--border-base)]'}`}>
                {selectedAgent.status}
              </span>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              
              <div className="bg-[var(--bg-base)] border border-[var(--border-base)] p-3 rounded-xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase font-mono block mb-1">Avg Memory</span>
                <div>
                  <span className="text-sm font-mono font-bold text-[var(--text-primary)]">{avgMemory}</span>
                  <span className="text-[10px] text-[var(--text-muted)] ml-1">MB</span>
                </div>
              </div>

              <div className="bg-[var(--bg-base)] border border-[var(--border-base)] p-3 rounded-xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase font-mono block mb-1">Peak Latency</span>
                <div>
                  <span className="text-sm font-mono font-bold text-[var(--text-primary)]">{peakLatency}</span>
                  <span className="text-[10px] text-[var(--text-muted)] ml-1">ms</span>
                </div>
              </div>

              <div className="bg-[var(--bg-base)] border border-[var(--border-base)] p-3 rounded-xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase font-mono block mb-1">Efficiency Index</span>
                <span className="text-sm font-mono font-bold text-emerald-400">{efficiencyIndex}</span>
              </div>

              <div className="bg-[var(--bg-base)] border border-[var(--border-base)] p-3 rounded-xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase font-mono block mb-1">Cluster Scopes</span>
                <span className="text-[11px] font-mono text-blue-400 font-semibold truncate">
                  {selectedAgent.memoryAccess.slice(0, 2).join(', ')}
                </span>
              </div>

            </div>

          </div>

          {/* Interactive Core Control Buttons */}
          <div className="space-y-2 border-t border-[var(--border-base)] pt-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-tertiary)] font-mono block mb-2">Cognitive Core Actions</span>
            
            <div className="grid grid-cols-1 gap-2">
              
              <button
                disabled={gcActive || tuningActive || stressActive || selectedAgent.status === 'Halted'}
                onClick={triggerGarbageCollection}
                className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all active:scale-[0.98] ${
                  selectedAgent.status === 'Halted'
                    ? 'bg-zinc-900/40 border-zinc-950 text-zinc-600 cursor-not-allowed'
                    : 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-blue-400 hover:border-blue-500/40'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Database className={`w-4 h-4 ${gcActive ? 'animate-spin' : ''}`} />
                  {gcActive ? 'Sweeping Garbage...' : 'Trigger Heap GC Sweep'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                disabled={gcActive || tuningActive || stressActive || selectedAgent.status === 'Halted'}
                onClick={triggerLatencyTuning}
                className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all active:scale-[0.98] ${
                  selectedAgent.status === 'Halted'
                    ? 'bg-zinc-900/40 border-zinc-950 text-zinc-600 cursor-not-allowed'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-400 hover:border-amber-500/40'
                }`}
              >
                <span className="flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 ${tuningActive ? 'animate-spin' : ''}`} />
                  {tuningActive ? 'Streamlining Links...' : 'Quantum Latency Tuning'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                disabled={gcActive || tuningActive || stressActive || selectedAgent.status === 'Halted'}
                onClick={triggerStressTest}
                className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all active:scale-[0.98] ${
                  selectedAgent.status === 'Halted'
                    ? 'bg-zinc-900/40 border-zinc-950 text-zinc-600 cursor-not-allowed'
                    : 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-400 hover:border-rose-500/40'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className={`w-4 h-4 ${stressActive ? 'animate-bounce' : ''}`} />
                  {stressActive ? 'Injecting Surge Load...' : 'Run Surge Stress Test'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

            </div>
          </div>

        </div>

      </div>

      {/* Roster Segment */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-400" />
            Active Agent Directory ({agents.length})
          </h3>
          <span className="text-xs text-[var(--text-muted)] font-mono">Select any agent to inspect telemetry</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map((agent, i) => {
            const isSelected = agent.id === selectedAgentId;
            const levelNum = agent.autonomyLevel;
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedAgentId(agent.id)}
                key={agent.id} 
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group select-none flex flex-col justify-between h-[230px] ${
                  isSelected 
                    ? 'bg-blue-500/5 border-blue-500 shadow-lg shadow-blue-500/5' 
                    : 'bg-[var(--bg-surface)] border-[var(--border-base)] hover:border-zinc-500'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0
                      ${agent.role === 'Main Brain' ? 'bg-purple-900/20 text-purple-400 border-purple-500/20' : 
                        agent.role === 'Overwatch' ? 'bg-rose-900/20 text-rose-400 border-rose-500/20' : 
                        agent.role === 'Executive Director' ? 'bg-amber-900/20 text-amber-400 border-amber-500/20' :
                        'bg-[var(--bg-base)] text-[var(--text-secondary)] border-[var(--border-base)]'}`}>
                      {agent.role === 'Main Brain' ? <Brain className="w-5 h-5" /> : 
                       agent.role === 'Overwatch' ? <Shield className="w-5 h-5" /> : 
                       <Network className="w-5 h-5" />}
                    </div>

                    <div className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider flex items-center gap-1 border
                      ${agent.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        agent.status === 'Busy' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        agent.status === 'Halted' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        'bg-[var(--bg-base)] text-[var(--text-muted)] border-[var(--border-base)]'}`}>
                      {agent.status === 'Active' && <Activity className="w-2.5 h-2.5 animate-pulse" />}
                      {agent.status}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-[var(--text-primary)] text-sm truncate">{agent.name}</h4>
                    <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider truncate mt-0.5">{agent.role}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)] mt-1">{agent.department}</p>
                  </div>
                </div>

                <div className="border-t border-[var(--border-base)]/50 pt-3 mt-4 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-mono text-[var(--text-tertiary)] uppercase block mb-1">Autonomy</span>
                    <div className="flex gap-[1.5px]">
                      {[1, 2, 3, 4, 5].map(l => (
                        <div key={l} className={`w-1.5 h-2.5 rounded-[1px] ${l <= levelNum ? 'bg-amber-400' : 'bg-zinc-800'}`} />
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] font-mono text-[var(--text-tertiary)] uppercase block">Tasks completed</span>
                    <span className="text-xs font-mono font-bold text-[var(--text-primary)]">{agent.tasksCompleted.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
