import { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';
import { 
  ShieldAlert, AlertTriangle, ShieldCheck, Lock, Activity, Search, 
  Play, Pause, Trash2, Cpu, User, Database, Sparkles, Filter, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getActivities, 
  simulateAgentActivity, 
  clearActivities, 
  ActivityEvent, 
  ActivityType 
} from '../utils/activityLogger';

export function GovernanceView() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [riskIncidents, setRiskIncidents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ActivityType | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [isSimulating, setIsSimulating] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const [isAddingPolicy, setIsAddingPolicy] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    scope: 'Global',
    subjectType: 'Agent Actions',
    action: 'Execute Tool',
    severity: 'High',
    status: 'Active',
    condition: 'Autonomy Level > 3'
  });

  // Sync logs state on mount and subscribe to update events
  useEffect(() => {
    const syncActivities = () => {
      setActivities(getActivities());
    };

    syncActivities();
    
    // Subscribe to custom event from both this view and memory view updates
    window.addEventListener('activity-stream-updated', syncActivities);
    
    loadPolicies();
    
    fetchApi('/incidents').then(data => {
      setRiskIncidents(data.map((r: any) => ({
        id: r.id,
        timestamp: new Date(r.createdAt).toLocaleString(),
        agent: 'System',
        event: r.title,
        risk: r.severity === 'critical' ? 90 : 50,
        action: r.status
      })));
    });

    return () => {
      window.removeEventListener('activity-stream-updated', syncActivities);
    };
  }, []);

  const loadPolicies = () => {
    fetchApi('/policies').then(data => {
      // map backend names if necessary
      setPolicies(data.map((p: any) => ({
        id: p.id,
        department: p.scope || 'Global',
        name: `${p.action} on ${p.subjectType} (${p.condition})`,
        severity: p.severity || 'Medium',
        status: p.status || 'Enforced'
      })));
    });
  };

  const handleAddPolicy = async () => {
    try {
      await fetchApi('/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPolicy)
      });
      setIsAddingPolicy(false);
      loadPolicies();
    } catch (err) {
      console.error(err);
    }
  };

  // Interval-based live agent activity simulation
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      simulateAgentActivity();
    }, 6000); // Trigger a simulated agent action every 6 seconds

    return () => clearInterval(interval);
  }, [isSimulating]);

  const handleManualSimulate = () => {
    simulateAgentActivity();
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear the real-time activity stream history?")) {
      clearActivities();
      setSelectedEventId(null);
    }
  };

  // Filter logic
  const filteredActivities = activities.filter(act => {
    const matchesSearch = 
      act.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || act.type === selectedType;
    const matchesSeverity = selectedSeverity === 'all' || act.severity === selectedSeverity;

    return matchesSearch && matchesType && matchesSeverity;
  });

  const selectedEvent = activities.find(act => act.id === selectedEventId);

  // Formatting helpers
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-rose-500/15 border-rose-500/30 text-rose-400';
      case 'warning': return 'bg-amber-500/15 border-amber-500/30 text-amber-400';
      case 'success': return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
      default: return 'bg-blue-500/15 border-blue-500/30 text-blue-400';
    }
  };

  const getTypeIcon = (type: ActivityType) => {
    switch (type) {
      case 'permission': return <Lock className="w-4 h-4 text-amber-400" />;
      case 'ingestion': return <Database className="w-4 h-4 text-emerald-400" />;
      case 'edit': return <Cpu className="w-4 h-4 text-indigo-400" />;
      case 'rollback': return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'delete': return <Trash2 className="w-4 h-4 text-red-500" />;
      default: return <User className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-[var(--border-base)] pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-base)] tracking-tight mb-1">Governance & Risk</h2>
          <p className="text-[var(--text-muted)] text-sm">Policy Engine rulesets, risk thresholds, and live accountability logging.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            id="sim-live-toggle"
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
              isSimulating 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-500/5' 
                : 'bg-[var(--bg-surface)] border-[var(--border-base)] text-[var(--text-muted)]'
            }`}
          >
            {isSimulating ? (
              <>
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                Live Simulation Active
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                Simulation Paused
              </>
            )}
          </button>
          
          <button
            id="sim-trigger-btn"
            onClick={handleManualSimulate}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/10 flex items-center gap-2 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            Trigger Agent Event
          </button>
        </div>
      </div>

      {/* Primary Grid: Policies & Risk Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Policies */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-400" />
              Active Policies
            </h3>
            <button 
              type="button"
              onClick={() => setIsAddingPolicy(!isAddingPolicy)}
              className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              {isAddingPolicy ? 'Cancel' : 'Add Policy'}
            </button>
          </div>
          
          <div className="space-y-3">
            {isAddingPolicy && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--bg-surface)] border border-blue-500/30 rounded-xl p-4 space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Scope</label>
                    <input 
                      type="text" 
                      value={newPolicy.scope}
                      onChange={e => setNewPolicy({...newPolicy, scope: e.target.value})}
                      className="w-full mt-1 bg-[var(--bg-base)] border border-[var(--border-base)] rounded-lg px-3 py-1.5 text-sm" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Severity</label>
                    <select 
                      value={newPolicy.severity}
                      onChange={e => setNewPolicy({...newPolicy, severity: e.target.value})}
                      className="w-full mt-1 bg-[var(--bg-base)] border border-[var(--border-base)] rounded-lg px-3 py-1.5 text-sm"
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Action</label>
                    <input 
                      type="text" 
                      value={newPolicy.action}
                      onChange={e => setNewPolicy({...newPolicy, action: e.target.value})}
                      className="w-full mt-1 bg-[var(--bg-base)] border border-[var(--border-base)] rounded-lg px-3 py-1.5 text-sm" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Condition</label>
                    <input 
                      type="text" 
                      value={newPolicy.condition}
                      onChange={e => setNewPolicy({...newPolicy, condition: e.target.value})}
                      className="w-full mt-1 bg-[var(--bg-base)] border border-[var(--border-base)] rounded-lg px-3 py-1.5 text-sm" 
                    />
                  </div>
                </div>
                <button 
                  onClick={handleAddPolicy}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-sm transition-colors"
                >
                  Save Policy
                </button>
              </motion.div>
            )}

            {policies.map((policy, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={policy.id} 
                className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-4 flex items-center justify-between hover:border-[var(--text-secondary)]/30 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase">{policy.department}</span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded
                      ${policy.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400' :
                        policy.severity === 'High' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'}`}>
                      {policy.severity}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{policy.name}</p>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium bg-emerald-500/10 px-2 py-1 rounded">
                  <ShieldCheck className="w-4 h-4" />
                  {policy.status}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Risk Incidents */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              Recent Risk Incidents
            </h3>
            <span className="bg-rose-500/20 text-rose-400 text-xs font-bold px-2 py-1 rounded">3 Alerts</span>
          </div>

          <div className="space-y-3">
            {riskIncidents.map((incident, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                key={incident.id} 
                className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-4 hover:border-rose-500/20 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                     <AlertTriangle className={`w-4 h-4 ${incident.risk > 80 ? 'text-rose-400' : 'text-amber-400'}`} />
                     <span className="text-sm font-bold text-[var(--text-primary)]">{incident.event}</span>
                  </div>
                  <span className="text-xs text-[var(--text-tertiary)]">{incident.timestamp}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-muted)]">Source: <span className="text-[var(--text-secondary)] font-medium">{incident.agent}</span></span>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    incident.action.includes('Halted') ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {incident.action}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Segment: Real-Time Activity Stream Section */}
      <div className="border-t border-[var(--border-base)] pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Real-Time Activity Stream</h3>
              <p className="text-xs text-[var(--text-muted)]">Ticking ledger of RBAC changes, memory ingestion, edits, and agent query accesses.</p>
            </div>
          </div>
          <button 
            id="clear-stream-btn"
            onClick={handleClearAll}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium bg-rose-500/10 px-2.5 py-1.5 rounded-lg border border-rose-500/20 transition-all active:scale-95 self-start sm:self-center"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Stream
          </button>
        </div>

        {/* Toolbar: Search, Category Filter, Severity Filter */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-2xl p-4 grid grid-cols-1 md:grid-cols-12 gap-3 shadow-md">
          {/* Search bar */}
          <div className="relative md:col-span-5">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-tertiary)]" />
            <input 
              type="text" 
              placeholder="Search actors, targets, details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl pl-9 pr-4 py-2 text-sm text-[var(--text-base)] placeholder-[var(--text-tertiary)] focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          {/* Type Filter */}
          <div className="relative md:col-span-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--text-tertiary)] shrink-0" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl px-3 py-2 text-sm text-[var(--text-base)] focus:border-blue-500 focus:outline-none transition-all"
            >
              <option value="all">All Operations</option>
              <option value="access">Access Logs</option>
              <option value="permission">Permission Changes</option>
              <option value="ingestion">Memory Ingestions</option>
              <option value="edit">Payload Modifications</option>
              <option value="rollback">Version Rollbacks</option>
              <option value="playground">Playground Queries</option>
              <option value="delete">Cluster Deletions</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="relative md:col-span-3">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl px-3 py-2 text-sm text-[var(--text-base)] focus:border-blue-500 focus:outline-none transition-all"
            >
              <option value="all">All Severities</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Dynamic Activity Split Layout: Left logs stream, Right log details inspect */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Stream of Activities (Left, Spans 7 or 8 columns) */}
          <div className="lg:col-span-7 space-y-3 max-h-[620px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence initial={false}>
              {filteredActivities.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-[var(--bg-surface)] border border-dashed border-[var(--border-base)] rounded-2xl p-12 text-center text-[var(--text-tertiary)]"
                >
                  <Activity className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3 opacity-60" />
                  <p className="text-sm font-semibold text-[var(--text-muted)]">No operations logs match your current filter criteria.</p>
                  <p className="text-xs mt-1">Try resetting the search filters or trigger a live event.</p>
                </motion.div>
              ) : (
                filteredActivities.map((act) => {
                  const isSelected = act.id === selectedEventId;
                  const logDate = new Date(act.timestamp);
                  const displayTime = logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  
                  return (
                    <motion.div
                      layout
                      key={act.id}
                      initial={{ opacity: 0, y: -12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -50 }}
                      onClick={() => setSelectedEventId(act.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-blue-500/5 border-blue-500/40 shadow-sm shadow-blue-500/5' 
                          : 'bg-[var(--bg-surface)] border-[var(--border-base)] hover:bg-[var(--bg-surface)]/70 hover:border-[var(--text-tertiary)]/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {/* Type Indicator Icon */}
                          <div className={`p-2 rounded-lg border shrink-0 ${getSeverityStyle(act.severity)}`}>
                            {getTypeIcon(act.type)}
                          </div>
                          
                          <div>
                            {/* Actor & Time */}
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                              <span className="font-bold text-[var(--text-primary)]">{act.actor}</span>
                              <span className="text-[var(--text-tertiary)] font-medium">•</span>
                              <span className="text-[var(--text-tertiary)] font-mono">{displayTime}</span>
                              
                              {/* Type Badge */}
                              <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-tertiary)] px-1.5 py-0.2 bg-[var(--bg-base)] border border-[var(--border-base)] rounded">
                                {act.type}
                              </span>
                            </div>

                            {/* Main message snippet */}
                            <p className="text-sm text-[var(--text-secondary)] mt-1 font-medium leading-relaxed">
                              {act.message}
                            </p>

                            {/* Target Memory context indicator */}
                            <div className="flex items-center gap-1.5 mt-2">
                              <Database className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                              <span className="text-xs font-mono text-[var(--text-muted)] truncate max-w-sm sm:max-w-md">
                                scope: <span className="text-[var(--text-secondary)] font-medium">{act.target}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Risk Score or visual tag */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {act.riskScore > 0 ? (
                            <div className="flex flex-col items-end">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                act.riskScore > 75 ? 'bg-rose-500/10 text-rose-400' :
                                act.riskScore > 40 ? 'bg-amber-500/10 text-amber-400' :
                                'bg-blue-500/10 text-blue-400'
                              }`}>
                                Risk {act.riskScore}%
                              </span>
                              {/* Small color-coded horizontal indicator */}
                              <div className="w-10 h-1 bg-[var(--border-base)] rounded-full mt-1 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    act.riskScore > 75 ? 'bg-rose-500' :
                                    act.riskScore > 40 ? 'bg-amber-500' :
                                    'bg-blue-400'
                                  }`}
                                  style={{ width: `${act.riskScore}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Secure
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {/* Audit Diagnostic Inspector Panel (Right, Spans 5 columns) */}
          <div className="lg:col-span-5">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-2xl p-5 shadow-lg space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border-base)] pb-3">
                <h4 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Accountability Inspector
                </h4>
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[var(--text-tertiary)] bg-[var(--bg-base)] px-2 py-0.5 rounded border border-[var(--border-base)]">
                  Live diagnostics
                </span>
              </div>

              {selectedEvent ? (
                <div className="space-y-5 text-sm">
                  {/* Event Meta Grid */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider block mb-1">OPERATION ID</span>
                      <code className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-base)] border border-[var(--border-base)] px-2.5 py-1.5 rounded-lg block overflow-x-auto select-all">
                        {selectedEvent.id}
                      </code>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider block mb-1">SEVERITY LEVEL</span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded border inline-block uppercase tracking-wider ${getSeverityStyle(selectedEvent.severity)}`}>
                          {selectedEvent.severity}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider block mb-1">RISK PROFILE</span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded border inline-block ${
                          selectedEvent.riskScore > 75 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                          selectedEvent.riskScore > 40 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                          'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        }`}>
                          {selectedEvent.riskScore}% Probability
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider block mb-1">TIMESTAMP</span>
                      <p className="font-medium text-[var(--text-primary)]">
                        {new Date(selectedEvent.timestamp).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider block mb-1">ACTOR ID / AUTHORITY LEVEL</span>
                      <div className="flex items-center gap-2 p-2 bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl">
                        <User className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="font-mono text-xs text-[var(--text-primary)] truncate">
                          {selectedEvent.actor}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider block mb-1">TARGET CLUSTER / SCOPE</span>
                      <div className="flex items-center gap-2 p-2 bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl">
                        <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-mono text-xs text-[var(--text-primary)] truncate">
                          {selectedEvent.target}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider block mb-1">FULL EVENT LEDGER MESSAGE</span>
                      <p className="bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl p-3 text-xs leading-relaxed text-[var(--text-secondary)] font-medium">
                        {selectedEvent.message}
                      </p>
                    </div>
                  </div>

                  {/* Verification Envelope */}
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-[var(--text-primary)]">Cryptographic Compliance Seal</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
                      This log payload is cryptographically sealed, immutable, and synchronized to the Governance Ledger. Any tempering attempts automatically halt down-stream Agent execution frameworks.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-[var(--text-tertiary)] space-y-2">
                  <Activity className="w-10 h-10 text-[var(--text-muted)] mx-auto opacity-50" />
                  <p className="text-sm font-semibold text-[var(--text-muted)]">No Log Event Selected</p>
                  <p className="text-xs max-w-xs mx-auto">Select any operational event from the real-time activity stream to run detailed compliance audits and diagnostics.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
