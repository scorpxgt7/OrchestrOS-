import { 
  Workflow, Play, Plus, Zap, ArrowRight, Save, Link as LinkIcon, AlertTriangle, 
  ShieldAlert, CheckCircle2, X, Copy, History, LayoutGrid, Wand2,
  Youtube, Key, Terminal, MessageSquare, Mail, Settings, Shield, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, WheelEvent, useMemo } from 'react';
import { YouTubeAutomationComponent } from '../components/YouTubeAutomationComponent';
import { useToast } from '../contexts/ToastContext';

// Simple wireframe node component
const FlowNode = ({ 
  id, icon: Icon, title, desc, type, active = false, selected = false, onClick, x, y 
}: { 
  key?: string, id?: string, icon: any, title: string, desc: string, type: 'trigger' | 'condition' | 'agent' | 'action', active?: boolean, selected?: boolean, onClick?: (id: string) => void, x: number, y: number 
}) => {
  const colors = {
    trigger: 'border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]',
    condition: 'border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
    agent: 'border-purple-500/30 bg-purple-500/10 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]',
    action: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => id && onClick?.(id)}
      className={`absolute w-64 h-36 bg-[var(--bg-surface)] backdrop-blur-xl border ${selected ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)] ring-1 ring-blue-500/50' : active ? 'border-zinc-500/50 shadow-[0_0_20px_rgba(255,255,255,0.03)]' : 'border-[var(--border-base)]'} rounded-2xl p-5 cursor-pointer hover:border-[var(--text-tertiary)] transition-all group z-10`}
      style={{ left: x, top: y }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-xl border ${colors[type]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[var(--text-primary)]">{title}</h4>
          <p className="text-[9px] text-[var(--text-tertiary)] uppercase font-bold tracking-widest">{type}</p>
        </div>
      </div>
      <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">{desc}</p>

      {/* Node Connection Points */}
      {type !== 'trigger' && (
        <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-[var(--bg-surface)] border-[3px] border-[var(--bg-base)] shadow-sm rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-[var(--border-base)] rounded-full group-hover:bg-[var(--text-tertiary)] transition-colors" />
        </div>
      )}
      {type !== 'action' && (
        <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-[var(--bg-surface)] border-[3px] border-[var(--bg-base)] shadow-sm rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-[var(--border-base)] rounded-full group-hover:bg-[var(--text-tertiary)] transition-colors" />
        </div>
      )}
    </motion.div>
  );
};

const BezierEdge = ({ x1, y1, x2, y2, active = false }: { key?: string, x1: number, y1: number, x2: number, y2: number, active?: boolean }) => {
  const dx = Math.abs(x2 - x1);
  const cx = dx / 1.5;
  const path = `M ${x1} ${y1} C ${x1 + cx} ${y1}, ${x2 - cx} ${y2}, ${x2} ${y2}`;
  
  return (
    <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
      <path 
          d={path} 
          fill="none" 
          strokeWidth={2} 
          stroke="var(--border-base)" 
          className="opacity-50"
      />
      {active && (
        <motion.path 
          d={path} 
          fill="none" 
          strokeWidth={3} 
          stroke="url(#active-gradient)" 
          strokeDasharray="6 12"
          strokeLinecap="round"
          initial={{ strokeDashoffset: 100 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="opacity-80 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]"
        />
      )}
      <defs>
        <linearGradient id="active-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const TEMPLATES = [
  {
    id: 'youtube-manager',
    title: 'YouTube Channel Automator',
    desc: 'Local Gemma model + MCP server with Google OAuth approval gates.',
    nodes: [
      { id: 'yn1', x: 60, y: 320, icon: Youtube, title: "YouTube Monitor", desc: "Checks recent video performances and summarizes new comments every 24h.", type: "trigger" as const, active: true },
      { id: 'yn2', x: 440, y: 320, icon: Shield, title: "OAuth Security Gate", desc: "Routes read-only metrics automatically; flags write actions for manual approval.", type: "condition" as const },
      { id: 'yn3', x: 820, y: 160, icon: Terminal, title: "Local Gemma LLM", desc: "Offline llama.cpp model drafts video metadata suggestions and response recommendations.", type: "agent" as const, active: true },
      { id: 'yn4', x: 820, y: 480, icon: Key, title: "Approval Queue Gate", desc: "Pushes comments, replies, titles, and video scheduling to approval feed.", type: "action" as const }
    ],
    edges: [
      { id: 'ye1', source: 'yn1', target: 'yn2', active: true },
      { id: 'ye2', source: 'yn2', target: 'yn3', active: true },
      { id: 'ye3', source: 'yn2', target: 'yn4', active: false }
    ],
    systemPrompt: `You are my local YouTube channel automation assistant.
You may analyze, summarize, draft, and recommend actions.
You must use tools for all YouTube actions. You do not have direct access to YouTube.

Rules:
1. Read-only actions (pull stats, performance logs, comment fetch) may run automatically.
2. Drafting actions (draft replies, titles, descriptions, tags) may run automatically.
3. Public / write actions (post replies, delete/moderate comments, upload videos) require explicit manual approval.
4. Never upload, publish, delete, reply, moderate, or change metadata without approval.
5. Always explain what action you want to take before calling a write tool.
6. Keep an audit log of every action.
7. Prefer conservative actions when uncertain.`,
    tools: [
      "youtube_get_channel_stats",
      "youtube_list_videos",
      "youtube_get_video_stats",
      "youtube_list_comments",
      "youtube_draft_comment_replies",
      "youtube_reply_to_comment",
      "youtube_update_video_metadata",
      "youtube_upload_video",
      "youtube_schedule_video",
      "youtube_generate_report"
    ]
  },
  {
    id: 'support-router',
    title: 'Customer Support Routing',
    desc: 'Automatically triages incoming customer service tickets and assigns to specialty agents.',
    nodes: [
      { id: 'sn1', x: 60, y: 320, icon: MessageSquare, title: "Incoming Ticket", desc: "Triggers on any new priority support request ticket.", type: "trigger" as const, active: true },
      { id: 'sn2', x: 440, y: 320, icon: AlertTriangle, title: "Sentiment Triage", desc: "Route ticket based on sentiment analysis score and urgency tier.", type: "condition" as const },
      { id: 'sn3', x: 820, y: 160, icon: ShieldAlert, title: "Support QA Bot", desc: "Maintains initial customer interaction with pre-approved SLA templates.", type: "agent" as const, active: true },
      { id: 'sn4', x: 820, y: 480, icon: Zap, title: "Escalate to Slack", desc: "Alert the customer success on-call engineer for critical accounts.", type: "action" as const }
    ],
    edges: [
      { id: 'se1', source: 'sn1', target: 'sn2', active: true },
      { id: 'se2', source: 'sn2', target: 'sn3', active: true },
      { id: 'se3', source: 'sn2', target: 'sn4', active: false }
    ],
    systemPrompt: `You are a Customer Support Triage Agent.
Your job is to identify high-priority or negative sentiment tickets and route them to human engineers.`,
    tools: ["slack_post_message", "zendesk_update_ticket"]
  },
  {
    id: 'incident-escalation',
    title: 'Incident Escalation',
    desc: 'Escalates security vulnerabilities and cloud infrastructure failures.',
    nodes: [
      { id: 'n1', x: 60, y: 320, icon: Play, title: "Security Alert", desc: "Listen for incoming high-severity alerts from cloud monitoring.", type: "trigger" as const, active: true },
      { id: 'n2', x: 440, y: 320, icon: AlertTriangle, title: "Risk Assessment", desc: "If alert risk score > 75 and multiple systems affected.", type: "condition" as const },
      { id: 'n3', x: 820, y: 160, icon: ShieldAlert, title: "Overwatch Agent", desc: "Assign incident to Overwatch for immediate containment.", type: "agent" as const, active: true },
      { id: 'n4', x: 820, y: 480, icon: Zap, title: "Halt CI/CD Pipeline", desc: "Send signal to halt all active deployments via Webhook.", type: "action" as const }
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', active: true },
      { id: 'e2', source: 'n2', target: 'n3', active: true },
      { id: 'e3', source: 'n2', target: 'n4', active: false }
    ],
    systemPrompt: `You are the Incident Security Escalation Brain.
Analyze cloud monitoring data for compromise. Execute pipeline containment on P0/P1 exploits immediately.`,
    tools: ["pagerduty_trigger", "github_cancel_workflow"]
  },
  {
    id: 'report-gen',
    title: 'Weekly Strategic Report',
    desc: 'Aggregates metrics and generates Weekly/Daily PDF reports.',
    nodes: [
      { id: 'rn1', x: 60, y: 320, icon: Play, title: "Scheduler Trigger", desc: "Runs automatically at 08:00 every Friday.", type: "trigger" as const, active: true },
      { id: 'rn2', x: 440, y: 320, icon: AlertTriangle, title: "Metric Validation", desc: "Validates all department logs are uploaded before summarizing.", type: "condition" as const },
      { id: 'rn3', x: 820, y: 160, icon: ShieldAlert, title: "Executive Brain", desc: "Orchestrates multi-source metric queries to build summary graphs.", type: "agent" as const, active: true },
      { id: 'rn4', x: 820, y: 480, icon: Mail, title: "Broadcast Report", desc: "Sends weekly KPI digest email to the executives group.", type: "action" as const }
    ],
    edges: [
      { id: 're1', source: 'rn1', target: 'rn2', active: true },
      { id: 're2', source: 'rn2', target: 'rn3', active: true },
      { id: 're3', source: 'rn2', target: 'rn4', active: false }
    ],
    systemPrompt: `You are the Strategic Analyst Executive Brain.
Query performance metrics and generate the Weekly Enterprise Strategic Report.`,
    tools: ["gmail_send_email", "database_run_queries"]
  }
];

export function AutomationView() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'linear' | 'canvas' | 'youtube-studio'>('canvas');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'library' | 'history'>('library');
  const [isValidating, setIsValidating] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState<boolean | null>(null);
  const [scale, setScale] = useState(1);
  const [activeTemplateId, setActiveTemplateId] = useState('incident-escalation');
  
  // Active template metadata
  const currentTemplate = useMemo(() => {
    return TEMPLATES.find(t => t.id === activeTemplateId) || TEMPLATES[2];
  }, [activeTemplateId]);

  const [nodes, setNodes] = useState(currentTemplate.nodes);
  const [edges, setEdges] = useState(currentTemplate.edges);
  const [flowTitle, setFlowTitle] = useState(currentTemplate.title);

  // Load selected template
  const handleLoadTemplate = (id: string) => {
    const t = TEMPLATES.find(x => x.id === id) || TEMPLATES[2];
    setActiveTemplateId(id);
    setNodes(t.nodes);
    setEdges(t.edges);
    setFlowTitle(t.title);
    setSelectedNode(null);
    if (id === 'youtube-manager') {
      setActiveTab('youtube-studio');
    } else {
      setActiveTab('canvas');
    }
  };

  const [automations, setAutomations] = useState([
    { id: 'a1', title: 'Risk Escalation', active: true },
    { id: 'a2', title: 'Summarize New Epics', active: false },
    { id: 'a3', title: 'Dual-Sign > $5k', active: false },
  ]);

  const handleWheel = (e: WheelEvent) => {
    if (activeTab !== 'canvas') return;
    const delta = e.deltaY;
    setScale(s => Math.min(Math.max(0.4, s - delta * 0.002), 2));
  };

  const snapToGrid = () => {
    setNodes(prev => prev.map(n => ({
      ...n,
      x: Math.round(n.x / 40) * 40,
      y: Math.round(n.y / 40) * 40
    })));
  };

  const autoAlign = () => {
    setNodes([
      { id: 'n1', x: 60, y: 280, icon: Play, title: "Security Alert", desc: "Listen for incoming high-severity alerts from cloud monitoring.", type: "trigger" as const, active: true },
      { id: 'n2', x: 400, y: 280, icon: AlertTriangle, title: "Risk Assessment", desc: "If alert risk score > 75 and multiple systems affected.", type: "condition" as const },
      { id: 'n3', x: 740, y: 140, icon: ShieldAlert, title: "Overwatch Agent", desc: "Assign incident to Overwatch for immediate containment.", type: "agent" as const, active: true },
      { id: 'n4', x: 740, y: 420, icon: Zap, title: "Halt CI/CD Pipeline", desc: "Send signal to halt all active deployments via Webhook.", type: "action" as const }
    ]);
  };

  const handleValidate = () => {
    setIsValidating(true);
    setValidationSuccess(null);
    setTimeout(() => {
      setIsValidating(false);
      setValidationSuccess(true);
      setTimeout(() => setValidationSuccess(null), 3000);
    }, 1500);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 md:space-y-8 font-sans pb-24 h-full flex flex-col">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between border-b border-[var(--border-base)] pb-6 shrink-0 gap-4 xl:gap-0">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-base)] tracking-tight mb-1">Visual Workflow & Automations</h2>
          <p className="text-[var(--text-muted)] text-sm">Define logic triggers, conditions, and autonomous responses for the organization.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={handleValidate}
            disabled={isValidating}
            className="px-4 py-2.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-base)] text-[var(--text-primary)] border border-[var(--border-base)] text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm w-36 justify-center disabled:opacity-50"
          >
            {isValidating ? (
              <>
                <div className="w-4 h-4 border-2 border-emerald-500/50 border-t-emerald-500 rounded-full animate-spin" />
                Validating...
              </>
            ) : validationSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Valid Flow
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-[var(--text-tertiary)]" />
                Validate Flow
              </>
            )}
          </button>
          <div className="bg-[var(--bg-surface)] p-1 rounded-lg border border-[var(--border-base)] flex text-sm font-medium shadow-sm">
            <button 
              onClick={() => setActiveTab('canvas')}
              className={`px-4 py-1.5 rounded-md transition-colors ${activeTab === 'canvas' ? 'bg-[var(--bg-base)] text-[var(--text-primary)] shadow-sm border border-[var(--border-base)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              Canvas View
            </button>
            <button 
              onClick={() => setActiveTab('linear')}
              className={`px-4 py-1.5 rounded-md transition-colors ${activeTab === 'linear' ? 'bg-[var(--bg-base)] text-[var(--text-primary)] shadow-sm border border-[var(--border-base)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              Linear Editor
            </button>
            {activeTemplateId === 'youtube-manager' && (
              <button 
                onClick={() => setActiveTab('youtube-studio')}
                className={`px-4 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${activeTab === 'youtube-studio' ? 'bg-[var(--bg-base)] text-[var(--text-primary)] shadow-sm border border-[var(--border-base)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
              >
                <Youtube className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                YouTube MCP Studio
              </button>
            )}
          </div>
          <button 
            type="button" 
            onClick={() => showToast('Automation pipeline saved to production', 'success')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Automation
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8 min-h-[600px]">
        <div className="lg:col-span-3 flex flex-col space-y-4 md:space-y-6 h-full flex-1 min-h-[500px]">
          {automations.length === 0 ? (
            <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-2xl h-full flex flex-col items-center justify-center p-12 text-center relative overflow-hidden shadow-sm">
              <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--border-base) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
              
              <div className="relative mb-8 mt-4">
                <div className="w-32 h-32 bg-gradient-to-br from-[var(--bg-base)] to-[var(--bg-surface)] border border-[var(--border-base)] rounded-3xl shadow-xl flex items-center justify-center relative z-10">
                  <div className="w-24 h-24 rounded-2xl border border-dashed border-blue-500/30 bg-blue-500/5 flex items-center justify-center relative overflow-hidden">
                    <Workflow className="w-10 h-10 text-blue-400 relative z-10" />
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(59,130,246,0.2)_360deg)]"
                    />
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3 relative z-10 tracking-tight">No Automations Configured</h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-10 relative z-10 leading-relaxed">
                Create your first workflow to automate routine tasks, handle approvals, and trigger autonomous agent responses.
              </p>

              <div className="flex gap-4 relative z-10">
                <button 
                  onClick={() => setAutomations([{ id: 'a1', title: 'New Automation', active: true }])}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 group"
                >
                  <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Create First Workflow
                </button>
                <button 
                  onClick={() => setSidebarTab('library')}
                  className="px-6 py-3 bg-[var(--bg-base)] hover:bg-[var(--border-base)] border border-[var(--border-base)] text-[var(--text-primary)] font-medium rounded-xl text-sm transition-all"
                >
                  Browse Templates
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl py-4 px-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between shrink-0 gap-4 md:gap-0">
                <input 
                  type="text" 
                  value={flowTitle} 
                  onChange={(e) => setFlowTitle(e.target.value)} 
                  className="bg-transparent text-lg font-bold text-[var(--text-base)] focus:outline-none focus:border-b focus:border-blue-500/50 pb-1 w-full md:w-96" 
                />
                <div className="flex items-center gap-3 text-sm self-start md:self-auto">
                  <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Active
                  </span>
                  {/* Button to clear automations for testing empty state */}
                  <button onClick={() => setAutomations([])} className="text-xs text-[var(--text-muted)] hover:text-rose-400 underline ml-2">Clear All</button>
                </div>
              </div>

              {activeTab === 'youtube-studio' ? (
                <YouTubeAutomationComponent />
              ) : activeTab === 'canvas' ? (
                <div 
                  className="flex-1 min-h-[400px] w-full bg-[#050505] border border-[var(--border-base)] rounded-xl relative overflow-hidden shadow-inner cursor-grab active:cursor-grabbing"
                  onWheel={handleWheel}
                >
              <motion.div 
                drag
                dragConstraints={{ left: -2000, right: 2000, top: -2000, bottom: 2000 }}
                className="absolute w-[3000px] h-[3000px]"
                style={{ scale, transformOrigin: "0 0" }}
              >
                {/* Dot Grid Background */}
                <div 
                  className="absolute inset-[-2000px] pointer-events-none opacity-20"
                  style={{ 
                    backgroundImage: 'radial-gradient(circle at 2px 2px, var(--border-base) 1px, transparent 0)', 
                    backgroundSize: '24px 24px' 
                  }}
                />
                
                {/* Edges */}
                {edges.map(edge => {
                  const sourceNode = nodes.find(n => n.id === edge.source);
                  const targetNode = nodes.find(n => n.id === edge.target);
                  if (!sourceNode || !targetNode) return null;
                  return (
                    <BezierEdge 
                      key={edge.id}
                      x1={sourceNode.x + 252} 
                      y1={sourceNode.y + 64} 
                      x2={targetNode.x - 12} 
                      y2={targetNode.y + 64} 
                      active={edge.active} 
                    />
                  );
                })}

                {/* Nodes */}
                {nodes.map(node => (
                  <FlowNode 
                    key={node.id}
                    id={node.id}
                    x={node.x} y={node.y}
                    icon={node.icon} title={node.title} 
                    desc={node.desc} 
                    type={node.type} active={node.active}
                    selected={selectedNode === node.id}
                    onClick={setSelectedNode}
                  />
                ))}
              </motion.div>

              {/* Detail Slide-out Pane */}
              <AnimatePresence>
                {selectedNode && (() => {
                  const node = nodes.find(n => n.id === selectedNode);
                  return (
                    <motion.div 
                      initial={{ x: '100%', opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: '100%', opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="absolute top-0 right-0 bottom-0 w-full sm:w-[400px] bg-[var(--bg-surface)] border-l border-[var(--border-base)] shadow-2xl z-50 flex flex-col"
                    >
                      <div className="flex items-center justify-between p-5 border-b border-[var(--border-base)]">
                        <div>
                          <h3 className="font-bold text-[var(--text-base)]">Node Configuration</h3>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">Modify parameters for this step</p>
                        </div>
                        <button onClick={() => setSelectedNode(null)} className="p-1.5 hover:bg-[var(--bg-base)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="p-6 flex-1 overflow-y-auto space-y-6">
                         <div className="space-y-4">
                           <div>
                             <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Node Name</label>
                             <input type="text" className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50 transition-colors" defaultValue={node?.title} />
                           </div>
                           
                           <div>
                             <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Parameters / Logic</label>
                             <textarea className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50 resize-none h-28 transition-colors" defaultValue={node?.desc} />
                           </div>

                           {node?.type === 'agent' && (
                             <div>
                               <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Target Agent</label>
                               <select className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50">
                                 {activeTemplateId === 'youtube-manager' ? (
                                   <option>Local Gemma (7B) via llama.cpp</option>
                                 ) : (
                                   <>
                                     <option>Overwatch Agent</option>
                                     <option>Executive Main Brain</option>
                                     <option>Quality Assurance Bot</option>
                                   </>
                                 )}
                               </select>
                             </div>
                           )}

                           {node?.type === 'condition' && (
                             <div>
                               <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Threshold Expression</label>
                               <input type="text" className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-lg px-3 py-2.5 text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50" defaultValue="> 75" />
                             </div>
                           )}
                         </div>

                         <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3 mt-8">
                           <Save className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                           <p className="text-xs text-blue-400 font-medium leading-relaxed">Changes to node configuration are isolated and saved to the session. Remember to save the global automation once satisfied.</p>
                         </div>
                      </div>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>

              {/* Floating Controls */}
              <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-[var(--bg-surface)] border border-[var(--border-base)] p-1.5 rounded-lg shadow-xl z-50">
                <button className="p-2 text-[var(--text-muted)] hover:text-blue-400 hover:bg-[var(--bg-base)] rounded transition-colors" title="Add Node">
                  <Plus className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-[var(--border-base)]" />
                <button className="p-2 text-[var(--text-muted)] hover:text-blue-400 hover:bg-[var(--bg-base)] rounded transition-colors" title="Connect Nodes">
                  <LinkIcon className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-[var(--border-base)]" />
                <button onClick={snapToGrid} className="p-2 text-[var(--text-muted)] hover:text-blue-400 hover:bg-[var(--bg-base)] rounded transition-colors" title="Snap to Grid">
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button onClick={autoAlign} className="p-2 text-[var(--text-muted)] hover:text-blue-400 hover:bg-[var(--bg-base)] rounded transition-colors" title="Auto-Align">
                  <Wand2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-10 flex-1 overflow-auto shadow-sm">
              <div className="max-w-2xl mx-auto space-y-6 relative border-l-2 border-[var(--border-base)] ml-10 pl-12 before:absolute before:inset-0 before:-ml-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-amber-500 before:to-transparent opacity-90">
                
                {/* Trigger */}
                <div className="relative group">
                  <div className="absolute -left-[67px] top-4 w-10 h-10 rounded-full bg-blue-500/20 border-2 border-blue-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.2)] group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 text-blue-400 ml-0.5" />
                  </div>
                  <div className="bg-[var(--bg-base)] border border-[var(--border-base)] rounded-2xl p-6 shadow-md hover:border-blue-500/30 transition-colors">
                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">When this event happens</div>
                    <select className="w-full bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-blue-500/50 mb-3 transition-shadow">
                      <option>High-Risk Security Issue Detected</option>
                      <option>Priority Support Ticket Received</option>
                    </select>
                  </div>
                </div>

                {/* Condition */}
                <div className="relative group">
                  <div className="absolute -left-[67px] top-4 w-10 h-10 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)] group-hover:scale-110 transition-transform">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="bg-[var(--bg-base)] border border-[var(--border-base)] rounded-2xl p-6 shadow-md hover:border-amber-500/30 transition-colors">
                    <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-3">If condition matches</div>
                    <div className="flex items-center gap-2">
                       <input type="text" className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl px-4 py-3 text-sm text-[var(--text-secondary)] flex-1 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-shadow" defaultValue="Risk Score > 75" />
                    </div>
                  </div>
                </div>

                {/* Agent Assignment */}
                <div className="relative group">
                  <div className="absolute -left-[67px] top-4 w-10 h-10 rounded-full bg-purple-500/20 border-2 border-purple-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.2)] group-hover:scale-110 transition-transform">
                    <ShieldAlert className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="bg-[var(--bg-base)] border border-[var(--border-base)] rounded-2xl p-6 shadow-md relative overflow-hidden hover:border-purple-500/30 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-5 transform rotate-12 scale-150">
                      <ShieldAlert className="w-32 h-32 text-purple-500" />
                    </div>
                    <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-3 relative z-10">Assign Sub-task to Agent</div>
                    <select className="w-full relative z-10 font-medium bg-[var(--bg-surface)] border border-[var(--border-base)] focus:border-purple-500/50 rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-shadow">
                      <option>Overwatch Agent (Security)</option>
                      <option>Executive Brain (Strategic)</option>
                    </select>
                  </div>
                </div>
                
                {/* Add Node Button */}
                <div className="relative pt-6">
                  <div className="absolute -left-[67px] -top-2 w-10 h-10 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--border-base)] flex items-center justify-center">
                    <Plus className="w-5 h-5 text-[var(--text-tertiary)]" />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => showToast('Added new execution step', 'info')}
                    className="border-2 border-dashed border-[var(--border-base)] hover:border-purple-500/50 hover:bg-purple-500/5 hover:text-purple-400 text-[var(--text-tertiary)] bg-[var(--bg-base)] rounded-2xl px-6 py-4 text-sm font-bold transition-all w-full flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Step
                  </button>
                </div>

              </div>
            </div>
          )}
          </>
          )}
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl h-fit flex flex-col overflow-hidden">
          <div className="flex border-b border-[var(--border-base)] bg-[var(--bg-base)]">
            <button 
              onClick={() => setSidebarTab('library')}
              className={`flex-1 py-4 text-xs font-bold text-center uppercase tracking-widest border-b-2 transition-colors ${sidebarTab === 'library' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'}`}
            >
              Templates
            </button>
            <button 
              onClick={() => setSidebarTab('history')}
              className={`flex-1 py-4 text-xs font-bold text-center uppercase tracking-widest border-b-2 transition-colors flex items-center justify-center gap-2 ${sidebarTab === 'history' ? 'border-amber-500 text-amber-400 bg-amber-500/5' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'}`}
            >
              <History className="w-3.5 h-3.5" />
              History
            </button>
          </div>

          <div className="py-6 space-y-8">
            {sidebarTab === 'library' ? (
               <>
                 <div className="px-6">
                   <h3 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-4">Your Automations</h3>
                   {automations.length === 0 ? (
                     <div className="border border-dashed border-[var(--border-base)] rounded-xl p-6 text-center">
                       <Workflow className="w-5 h-5 text-[var(--text-tertiary)] mx-auto mb-3" />
                       <p className="text-xs text-[var(--text-muted)] leading-relaxed">No automations saved yet.</p>
                     </div>
                   ) : (
                     <div className="space-y-2">
                       {automations.map((auto, i) => (
                         <div key={auto.id || `auto-${i}`} className={`p-4 bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl flex items-center justify-between text-sm hover:border-[var(--text-tertiary)] cursor-pointer transition-colors ${auto.active ? 'shadow-sm relative overflow-hidden ring-1 ring-black/5' : 'opacity-60'}`}>
                           {auto.active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-emerald-600"></div>}
                           <span className={`text-[var(--text-secondary)] font-medium ${auto.active ? 'pl-2 text-[var(--text-primary)]' : ''}`}>{auto.title}</span>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>                  <div className="border-t border-[var(--border-base)] pt-6 px-6">
                    <h3 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Copy className="w-3.5 h-3.5 text-blue-400" />
                      Template Library
                    </h3>
                    <div className="space-y-3">
                      {TEMPLATES.map(t => (
                        <div 
                          key={t.id}
                          onClick={() => handleLoadTemplate(t.id)}
                          className={`p-4 bg-[var(--bg-base)] border rounded-xl hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] cursor-pointer transition-all group ${activeTemplateId === t.id ? 'border-blue-500/80 bg-blue-500/5 ring-1 ring-blue-500/20' : 'border-[var(--border-base)]'}`}
                        >
                          <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-blue-400 transition-colors flex items-center gap-2">
                            {t.id === 'youtube-manager' && <Youtube className="w-4 h-4 text-rose-500 shrink-0" />}
                            <span>{t.title}</span>
                          </h4>
                          <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">{t.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
               </>
            ) : (
              <div className="px-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">Version History</h3>
                    <p className="text-[10px] font-mono text-[var(--text-muted)] mt-1">{flowTitle}</p>
                  </div>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20 font-bold uppercase tracking-widest shadow-sm">Auto-saved</span>
                </div>
                
                <div className="space-y-0 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-gradient-to-b before:from-[var(--border-base)] before:via-[var(--border-base)] before:to-transparent">
                  {/* Version Item 1 */}
                  <div className="relative flex justify-between group py-4">
                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center relative z-10 shrink-0 mt-0.5 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--text-primary)]">Current Version</p>
                        <p className="text-[10px] font-mono text-[var(--text-muted)] mt-1 mb-2">Just now • Auto-saved</p>
                        <span className="text-[9px] font-bold uppercase tracking-widest bg-[var(--bg-base)] border border-[var(--border-base)] text-[var(--text-secondary)] px-2 py-1 rounded">Node modified</span>
                      </div>
                    </div>
                  </div>

                  {/* Version Item 2 */}
                  <div className="relative flex justify-between group cursor-pointer py-4 hover:bg-[var(--bg-base)] -mx-4 px-4 rounded-xl transition-colors border border-transparent hover:border-[var(--border-base)]">
                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--border-base)] group-hover:border-[var(--text-tertiary)] flex items-center justify-center relative z-10 shrink-0 transition-colors mt-0.5">
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">Modified Trigger Condition</p>
                        <p className="text-[10px] font-mono text-[var(--text-tertiary)] mt-1">2 hours ago • System Auth</p>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-[var(--text-primary)] bg-[var(--bg-surface)] border border-[var(--border-base)] hover:border-amber-500/50 hover:text-amber-400 hover:shadow-[0_0_10px_rgba(245,158,11,0.1)] px-3 py-1.5 rounded-lg transition-all h-fit mt-1">Restore</button>
                  </div>

                  {/* Version Item 3 */}
                  <div className="relative flex justify-between group cursor-pointer py-4 hover:bg-[var(--bg-base)] -mx-4 px-4 rounded-xl transition-colors border border-transparent hover:border-[var(--border-base)]">
                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--border-base)] group-hover:border-[var(--text-tertiary)] flex items-center justify-center relative z-10 shrink-0 transition-colors mt-0.5">
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">Added Execution Action</p>
                        <p className="text-[10px] font-mono text-[var(--text-tertiary)] mt-1">Yesterday, 14:32 • Admin</p>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-[var(--text-primary)] bg-[var(--bg-surface)] border border-[var(--border-base)] hover:border-amber-500/50 hover:text-amber-400 hover:shadow-[0_0_10px_rgba(245,158,11,0.1)] px-3 py-1.5 rounded-lg transition-all h-fit mt-1">Restore</button>
                  </div>

                  {/* Version Item 4 */}
                  <div className="relative flex justify-between group cursor-pointer py-4 hover:bg-[var(--bg-base)] -mx-4 px-4 rounded-xl transition-colors opacity-60 hover:opacity-100 border border-transparent hover:border-[var(--border-base)]">
                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--border-base)] group-hover:border-[var(--text-tertiary)] flex items-center justify-center relative z-10 shrink-0 transition-colors mt-0.5">
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">Initial Creation</p>
                        <p className="text-[10px] font-mono text-[var(--text-tertiary)] mt-1">Mar 12, 2026 • System Auth</p>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-[var(--text-primary)] bg-[var(--bg-surface)] border border-[var(--border-base)] hover:border-amber-500/50 hover:text-amber-400 hover:shadow-[0_0_10px_rgba(245,158,11,0.1)] px-3 py-1.5 rounded-lg transition-all h-fit mt-1">Restore</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
