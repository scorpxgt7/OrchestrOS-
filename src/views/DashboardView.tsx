import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, ShieldAlert, Cpu, Network, BrainCircuit, ActivitySquare, GripHorizontal } from 'lucide-react';
import { mockAgents, mockLogs, mockTasks } from '../data/mock';
import { motion } from 'motion/react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line
} from 'recharts';

const throughputData = [
  { time: '00:00', tasks: 120 },
  { time: '04:00', tasks: 85 },
  { time: '08:00', tasks: 340 },
  { time: '12:00', tasks: 450 },
  { time: '16:00', tasks: 380 },
  { time: '20:00', tasks: 210 },
  { time: '24:00', tasks: 150 },
];

const riskData = [
  { time: 'Mon', avgRisk: 12, peakRisk: 45 },
  { time: 'Tue', avgRisk: 15, peakRisk: 82 },
  { time: 'Wed', avgRisk: 14, peakRisk: 55 },
  { time: 'Thu', avgRisk: 18, peakRisk: 90 },
  { time: 'Fri', avgRisk: 22, peakRisk: 95 },
  { time: 'Sat', avgRisk: 10, peakRisk: 30 },
  { time: 'Sun', avgRisk: 8, peakRisk: 25 },
];

const healthData = [
  { time: '10:00', cpu: 45, memory: 60 },
  { time: '10:05', cpu: 52, memory: 62 },
  { time: '10:10', cpu: 48, memory: 61 },
  { time: '10:15', cpu: 70, memory: 68 },
  { time: '10:20', cpu: 65, memory: 69 },
  { time: '10:25', cpu: 55, memory: 65 },
  { time: '10:30', cpu: 40, memory: 63 },
];

export function DashboardView() {
  const activeAgents = mockAgents.filter(a => a.status === 'Active' || a.status === 'Busy').length;
  const criticalTasks = mockTasks.filter(t => t.priority === 'Critical' || t.riskLevel > 80).length;
  const awaitingApproval = mockTasks.filter(t => t.status === 'Awaiting Approval').length;

  const [chartsOrder, setChartsOrder] = useState(['health', 'throughput', 'risk']);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(chartsOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setChartsOrder(items);
  };

  const renderChart = (id: string, dragHandleProps: any) => {
    switch (id) {
      case 'health':
        return (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[var(--text-base)]">System Health</h3>
              <div className="flex items-center gap-2">
                <ActivitySquare className="w-4 h-4 text-emerald-400" />
                <div {...dragHandleProps} className="cursor-grab text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded hover:bg-[var(--bg-base)]">
                  <GripHorizontal className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={healthData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-base)" vertical={false} />
                  <XAxis dataKey="time" stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-base)', color: 'var(--text-primary)' }}
                    itemStyle={{ fontSize: 12 }}
                    labelStyle={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}
                  />
                  <Area type="monotone" dataKey="cpu" name="CPU" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCpu)" />
                  <Area type="monotone" dataKey="memory" name="Memory" stroke="#10b981" fillOpacity={1} fill="url(#colorMem)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        );
      case 'throughput':
        return (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[var(--text-base)]">Agent Throughput</h3>
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-blue-400" />
                <div {...dragHandleProps} className="cursor-grab text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded hover:bg-[var(--bg-base)]">
                  <GripHorizontal className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={throughputData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-base)" vertical={false} />
                  <XAxis dataKey="time" stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    cursor={{ fill: 'var(--bg-base)' }}
                    contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-base)', color: 'var(--text-primary)' }}
                    itemStyle={{ fontSize: 12 }}
                    labelStyle={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}
                  />
                  <Bar dataKey="tasks" name="Tasks Executed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        );
      case 'risk':
        return (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[var(--text-base)]">Risk Trends</h3>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <div {...dragHandleProps} className="cursor-grab text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded hover:bg-[var(--bg-base)]">
                  <GripHorizontal className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riskData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-base)" vertical={false} />
                  <XAxis dataKey="time" stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-base)', color: 'var(--text-primary)' }}
                    itemStyle={{ fontSize: 12 }}
                    labelStyle={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}
                  />
                  <Line type="monotone" dataKey="peakRisk" name="Peak Risk" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3, fill: '#f43f5e' }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="avgRisk" name="Average Risk" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-base)] tracking-tight mb-1">Mission Control</h2>
          <p className="text-[var(--text-muted)] text-sm">System-wide overview of autonomous operations and agent health.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-[var(--bg-surface)] border border-[var(--border-base)] px-4 py-2.5 rounded-xl shadow-sm">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest mb-0.5">System Pulse</span>
            <span className="text-[10px] font-medium text-emerald-400 font-mono">NOMINAL • 98.4%</span>
          </div>
          <div className="relative flex items-center justify-center w-8 h-8">
            <motion.div 
              animate={{ 
                scale: [1, 1.8, 1], 
                opacity: [0.6, 0, 0.6] 
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute w-6 h-6 bg-emerald-500/40 rounded-full"
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.4, 1], 
                opacity: [0.8, 0.2, 0.8] 
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 0.2
              }}
              className="absolute w-4 h-4 bg-emerald-400/50 rounded-full"
            />
            <div className="relative z-10 w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'System Health', value: '98.4%', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Active Agents', value: `${activeAgents} / ${mockAgents.length}`, icon: Cpu, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Pending Approvals', value: awaitingApproval.toString(), icon: Network, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          { label: 'Critical Risks', value: criticalTasks.toString(), icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-400/10' },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-5 flex items-center justify-between shadow-sm"
          >
            <div>
              <p className="text-[var(--text-muted)] text-xs font-medium uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-[var(--text-base)]">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active High-Priority Agents */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[var(--text-base)] flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-400" />
          Active High-Priority Agents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {mockAgents.slice(0, 5).map((agent, i) => {
            const currentTask = mockTasks.find(t => t.assigneeId === agent.id) || { title: 'Idle / Awaiting Task' };
            const cpu = ((agent.id.charCodeAt(1) * 17) % 60) + 20; 
            const memory = ((agent.id.charCodeAt(1) * 23) % 40) + 40;

            return (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                key={agent.id}
                className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-4 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">{agent.name}</h4>
                      <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider mt-0.5">{agent.status}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                      agent.status === 'Active' ? 'bg-emerald-400' :
                      agent.status === 'Busy' ? 'bg-blue-400' :
                      agent.status === 'Halted' ? 'bg-rose-400' : 'bg-zinc-500'
                    }`} />
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mb-5 h-8 overflow-hidden line-clamp-2">
                    <span className="font-semibold text-[var(--text-secondary)]">Task:</span> {currentTask.title}
                  </div>
                </div>

                <div className="space-y-3 mt-auto">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[var(--text-tertiary)] mb-1.5">
                      <span>CPU</span>
                      <span className={cpu > 70 ? 'text-rose-400' : 'text-[var(--text-primary)]'}>{cpu}%</span>
                    </div>
                    <div className="w-full bg-[var(--bg-base)] rounded-full h-1 border border-[var(--border-base)] overflow-hidden">
                      <div className={`h-full rounded-full ${cpu > 70 ? 'bg-rose-400' : 'bg-blue-400'}`} style={{ width: `${cpu}%` }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[var(--text-tertiary)] mb-1.5">
                      <span>Memory</span>
                      <span className={memory > 70 ? 'text-rose-400' : 'text-[var(--text-primary)]'}>{memory}%</span>
                    </div>
                    <div className="w-full bg-[var(--bg-base)] rounded-full h-1 border border-[var(--border-base)] overflow-hidden">
                      <div className={`h-full rounded-full ${memory > 70 ? 'bg-rose-400' : 'bg-emerald-400'}`} style={{ width: `${memory}%` }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Analytics Charts */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="charts" direction="horizontal">
          {(provided) => (
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {chartsOrder.map((chartId, index) => (
                // @ts-ignore
                <Draggable key={chartId} draggableId={chartId} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-5 shadow-sm flex flex-col h-[300px] transition-shadow ${
                        snapshot.isDragging ? 'shadow-2xl ring-2 ring-blue-500/50 z-50' : ''
                      }`}
                      style={provided.draggableProps.style}
                    >
                      {renderChart(chartId, provided.dragHandleProps)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Overwatch Activity Feed */}
        <div className="lg:col-span-2 bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-6 flex flex-col h-[500px]">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-[var(--text-base)]">Overwatch Live Feed</h3>
          </div>
          <div className="flex-1 overflow-y-auto pr-4 space-y-4">
            {mockLogs.map((log, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={log.id} 
                className="flex gap-4 p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-base)]"
              >
                <div className="mt-0.5">
                  {log.type === 'Warning' ? <AlertTriangle className="w-5 h-5 text-amber-400" /> :
                   log.type === 'Error' ? <ShieldAlert className="w-5 h-5 text-rose-400" /> :
                   log.type === 'Approval' ? <Network className="w-5 h-5 text-blue-400" /> :
                   <CheckCircle2 className="w-5 h-5 text-[var(--text-muted)]" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{mockAgents.find(a => a.id === log.sourceId)?.name || 'System'}</span>
                    <span className="text-xs text-[var(--text-tertiary)] font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    {log.riskScore && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${log.riskScore > 80 ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        Risk: {log.riskScore}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">{log.message}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* System Intelligence */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-6 flex flex-col h-[500px]">
          <div className="flex items-center gap-2 mb-6">
            <BrainCircuit className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-[var(--text-base)]">Main Brain Insights</h3>
          </div>
          <div className="flex-1 space-y-4">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <h4 className="text-sm font-medium text-blue-300 mb-2">Optimization Suggested</h4>
              <p className="text-sm text-[var(--text-secondary)]">Local LLM pool is underutilized. Shifting 30% of classification tasks from remote agents could save approx. $140/day without latency impact.</p>
              <button className="mt-3 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-medium rounded transition-colors">Apply Policy</button>
            </div>
            
            <div className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-base)]">
               <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Memory Consolidation</h4>
               <p className="text-sm text-[var(--text-muted)]">Docu-Scribe completed weekly organization indexing. 12 orphaned policies detected and archived.</p>
            </div>

            <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20">
               <h4 className="text-sm font-medium text-rose-300 mb-2">Bottleneck Alert</h4>
               <p className="text-sm text-[var(--text-secondary)]">Finance branch approval queue is growing. Average wait time increased by 40%.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
