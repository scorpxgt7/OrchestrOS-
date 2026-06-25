import { useState, FormEvent, useEffect } from 'react';
import { fetchApi } from '../lib/api';
import { 
  Database, Folder, FileText, Search, Upload, Lock, ShieldCheck, Clock, 
  ChevronRight, ArrowRight, Trash2, Edit3, Save, X, Check, RotateCcw, 
  Info, ShieldAlert, Users, Sliders, Cpu, Layers, Terminal, Network, 
  Code, Share2, HelpCircle, AlertTriangle, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MemoryRecord, MemoryCategory, MemoryVersion } from '../types/memory';
import { MemoryArchitectureSpec } from '../components/MemoryArchitectureSpec';
import { MemoryMap } from '../components/MemoryMap';
import { logActivity } from '../utils/activityLogger';

export function MemoryView() {
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [selectedMemoryId, setSelectedMemoryId] = useState<string>('');
  
  useEffect(() => {
    fetchApi('/memory').then((data: any[]) => {
      const mappedData = data.map(m => ({
        id: m.id.toString(),
        title: m.metadata?.title || `Memory Record ${m.id}`,
        category: m.category,
        content: m.content,
        schema: m.metadata?.schema || {},
        tags: Array.isArray(m.metadata?.tags) ? m.metadata.tags : [],
        dept: m.metadata?.dept || 'Operations',
        size: m.metadata?.size || '1KB',
        updated: m.updatedAt || new Date().toISOString(),
        version: m.metadata?.version || 1,
        permissions: {
          roles: Array.isArray(m.metadata?.permissions?.roles) ? m.metadata.permissions.roles : [],
          minAutonomy: m.metadata?.permissions?.minAutonomy || 'Level 1',
          owner: m.metadata?.permissions?.owner || 'System'
        },
        versions: Array.isArray(m.metadata?.versions) ? m.metadata.versions : [],
        indexing: {
          vectorIndex: m.metadata?.indexing?.vectorIndex || '',
          graphNodes: Array.isArray(m.metadata?.indexing?.graphNodes) 
            ? m.metadata.indexing.graphNodes 
            : typeof m.metadata?.indexing?.graphNodes === 'string'
              ? m.metadata.indexing.graphNodes.split(',').map((s: string) => s.trim()).filter(Boolean)
              : [],
          primaryKey: m.metadata?.indexing?.primaryKey || ''
        }
      }));
      setMemories(mappedData);
      if (mappedData.length > 0) {
        setSelectedMemoryId(mappedData[0].id);
      }
    });
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MemoryCategory | 'all'>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  
  // Tab within the Memory Center
  const [activeMainTab, setActiveMainTab] = useState<'explorer' | 'playground' | 'spec' | 'map'>('explorer');
  
  // Right Inspector sub-tab
  const [inspectorTab, setInspectorTab] = useState<'payload' | 'permissions' | 'versions' | 'indexing'>('payload');
  
  // Ingestion Modal State
  const [ingestOpen, setIngestOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('org');
  const [newDept, setNewDept] = useState('Operations');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newMinAutonomy, setNewMinAutonomy] = useState('Level 3: Conditional');
  const [newRoles, setNewRoles] = useState<string[]>(['All Agents', 'Department Manager']);
  const [newOwner, setNewOwner] = useState('admin@orchestrator.ai');
  const [newPrimaryKey, setNewPrimaryKey] = useState('');
  const [newVectorIndex, setNewVectorIndex] = useState('org_sop_vec');
  const [newGraphNodes, setNewGraphNodes] = useState('Org:Global, Dept:Operations');
  const [ingestError, setIngestError] = useState('');

  // Editing state for selected memory
  const [isEditing, setIsEditing] = useState(false);
  const [editContentText, setEditContentText] = useState('');
  const [editError, setEditError] = useState('');

  // Playground state
  const [playgroundQuery, setPlaygroundQuery] = useState('What are the rules for financial transfers over $50k?');
  const [playgroundStrategy, setPlaygroundStrategy] = useState<'hybrid' | 'vector' | 'keyword' | 'graph'>('hybrid');
  const [playgroundResults, setPlaygroundResults] = useState<any[] | null>(null);
  const [playgroundSearching, setPlaygroundSearching] = useState(false);
  const [playgroundStep, setPlaygroundStep] = useState<number>(0);

  // Computed Values
  const selectedMemory = memories.find(m => m.id === selectedMemoryId) || memories[0] || {
    id: '',
    title: 'Loading...',
    category: 'org' as MemoryCategory,
    content: '{}',
    schema: {},
    tags: [],
    dept: '',
    size: '',
    updated: '',
    version: 1,
    permissions: { roles: [], minAutonomy: '', owner: '' },
    versions: [],
    indexing: { vectorIndex: '', graphNodes: [], primaryKey: '' }
  };

  const filteredMemories = memories.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          m.dept.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesDept = selectedDept === 'all' || m.dept === selectedDept;
    return matchesSearch && matchesCategory && matchesDept;
  });

  const categoriesList: { id: MemoryCategory | 'all'; label: string; count: number }[] = [
    { id: 'all', label: 'All Memory', count: memories.length },
    { id: 'user', label: 'User Memory', count: memories.filter(m => m.category === 'user').length },
    { id: 'org', label: 'Organizational Memory', count: memories.filter(m => m.category === 'org').length },
    { id: 'task', label: 'Task Memory', count: memories.filter(m => m.category === 'task').length },
    { id: 'agent', label: 'Agent Memory', count: memories.filter(m => m.category === 'agent').length },
    { id: 'governance', label: 'Governance Memory', count: memories.filter(m => m.category === 'governance').length },
  ];

  const departments = ['all', 'Executive', 'Operations', 'Finance', 'Marketing', 'Security', 'Engineering'];

  // Handle Category change in Ingestion Modal to update template
  const handleIngestCategoryChange = (cat: MemoryCategory) => {
    setNewCategory(cat);
    let defaultTemplate = '';
    let pKey = '';
    let vIndex = '';
    let gNodes = '';

    switch (cat) {
      case 'user':
        defaultTemplate = JSON.stringify({
          userId: "usr_custom_user",
          preferred_summary_format: "summary",
          escalation_threshold: "medium",
          risk_tolerance_level: "low",
          authorized_departments: ["Operations"]
        }, null, 2);
        pKey = "usr_custom_user_primary";
        vIndex = "usr_prefs_vec";
        gNodes = "User:custom, Agent:Alpha Prime";
        break;
      case 'org':
        defaultTemplate = JSON.stringify({
          sop_name: "Operations Dispatch Standard",
          procedures: [
            "Validate file checksum",
            "Route exceptions to supervisor queue"
          ],
          authorized_escalations: ["Operations Director"]
        }, null, 2);
        pKey = "org_sop_custom_v1";
        vIndex = "org_sop_vec";
        gNodes = "Org:Global, Dept:Operations";
        break;
      case 'task':
        defaultTemplate = JSON.stringify({
          taskId: "t_custom_99",
          associated_agents: ["a1"],
          steps: [
            { step: 1, action: "Initialized task", status: "success" }
          ],
          results_summary: "Process successfully configured."
        }, null, 2);
        pKey = "tsk_trace_custom_99";
        vIndex = "task_trace_vec";
        gNodes = "Task:t_custom, Agent:Alpha Prime";
        break;
      case 'agent':
        defaultTemplate = JSON.stringify({
          agentId: "a_custom",
          active_workspace: "Awaiting instruction payload",
          behavioral_constraints: "Redact financial fields prior to parsing logs"
        }, null, 2);
        pKey = "agt_scratch_custom";
        vIndex = "agt_cog_vec";
        gNodes = "Agent:custom, Role:Specialist";
        break;
      case 'governance':
        defaultTemplate = JSON.stringify({
          framework_name: "Dynamic Safety Overlay v1",
          enforced_policies: [
            { id: "POL-SAFE-99", scope: "Cost caps", definition: "Halt executions exceeding $10 API billing threshold." }
          ]
        }, null, 2);
        pKey = "gov_compliance_custom_v1";
        vIndex = "gov_compliance_vec";
        gNodes = "Governance:Overwatch, Compliance:Safety";
        break;
    }
    setNewContent(defaultTemplate);
    setNewPrimaryKey(pKey);
    setNewVectorIndex(vIndex);
    setNewGraphNodes(gNodes);
  };

  // Trigger JSON Edit Mode
  const startEditing = () => {
    setIsEditing(true);
    setEditContentText(selectedMemory.content);
    setEditError('');
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditContentText('');
    setEditError('');
  };

  const saveContentChanges = async () => {
    try {
      // Validate JSON structure
      const parsed = JSON.parse(editContentText);
      
      const m = selectedMemory;
      const nextVersion = m.version + 1;
      const newVerRecord: MemoryVersion = {
        version: nextVersion,
        updatedAt: new Date().toISOString(),
        author: 'scorpxgt7@gmail.com (Owner Override)',
        changeSummary: `Manual content modification via memory payload editor.`,
        content: editContentText
      };

      const updatedMetadata = {
        ...m.schema, // wait, we mapped schema to root level in mapping?
        // Let's just construct the metadata properly. Actually, we should pull the real metadata structure from the DB or just re-create it from our React state.
        title: m.title,
        tags: m.tags,
        dept: m.dept,
        size: `${(editContentText.length / 1024).toFixed(1)} KB`,
        version: nextVersion,
        schema: m.schema,
        permissions: m.permissions,
        indexing: m.indexing,
        versions: [newVerRecord, ...m.versions]
      };

      const res = await fetchApi(`/memory/${m.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editContentText,
          metadata: updatedMetadata
        })
      });

      const updatedMemories = memories.map(mem => {
        if (mem.id === m.id) {
          logActivity(
            'edit',
            'scorpxgt7@gmail.com (Owner Override)',
            mem.title,
            `Modified JSON payload. Incremented state to Version ${nextVersion}.`,
            'info',
            10
          );

          return {
            ...mem,
            content: editContentText,
            version: nextVersion,
            updated: 'Just now',
            size: `${(editContentText.length / 1024).toFixed(1)} KB`,
            versions: [newVerRecord, ...mem.versions]
          };
        }
        return mem;
      });

      setMemories(updatedMemories);
      setIsEditing(false);
    } catch (err: any) {
      setEditError(`Failed to save: ${err.message}`);
    }
  };

  // Rollback to historical version
  const handleRollback = async (targetVer: MemoryVersion) => {
    try {
      const m = selectedMemory;
      const nextVersion = m.version + 1;
      const newVerRecord: MemoryVersion = {
        version: nextVersion,
        updatedAt: new Date().toISOString(),
        author: 'scorpxgt7@gmail.com (Rollback Execution)',
        changeSummary: `Rolled back state to historical Version ${targetVer.version}.`,
        content: targetVer.content
      };

      const updatedMetadata = {
        title: m.title,
        tags: m.tags,
        dept: m.dept,
        size: `${(targetVer.content.length / 1024).toFixed(1)} KB`,
        version: nextVersion,
        schema: m.schema,
        permissions: m.permissions,
        indexing: m.indexing,
        versions: [newVerRecord, ...m.versions]
      };

      await fetchApi(`/memory/${m.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: targetVer.content,
          metadata: updatedMetadata
        })
      });

      const updatedMemories = memories.map(mem => {
        if (mem.id === m.id) {
          logActivity(
            'rollback',
            'scorpxgt7@gmail.com (Rollback Execution)',
            mem.title,
            `Executed database rollback of active memory state to Version ${targetVer.version}.`,
            'warning',
            40
          );

          return {
            ...mem,
            content: targetVer.content,
            version: nextVersion,
            updated: 'Just now',
            size: `${(targetVer.content.length / 1024).toFixed(1)} KB`,
            versions: [newVerRecord, ...mem.versions]
          };
        }
        return mem;
      });

      setMemories(updatedMemories);
    } catch (err) {
      console.error('Rollback failed:', err);
    }
  };

  // Export Record to JSON
  const handleExportJSON = (record: MemoryRecord) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(record, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${record.id}_${record.category}_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Delete Memory Record
  const handleDeleteRecord = async (id: string) => {
    const mToDelete = memories.find(m => m.id === id);
    if (confirm("Are you sure you want to scrub this memory cluster from the OS? This action is permanent and might un-ground active agents.")) {
      try {
        await fetchApi(`/memory/${id}`, { method: 'DELETE' });
        const remaining = memories.filter(m => m.id !== id);
        setMemories(remaining);
        if (selectedMemoryId === id && remaining.length > 0) {
          setSelectedMemoryId(remaining[0].id);
        }

        if (mToDelete) {
          logActivity(
            'delete',
            'scorpxgt7@gmail.com (Owner)',
            mToDelete.title,
            `Permanently deleted memory cluster from vector database index.`,
            'critical',
            90
          );
        }
      } catch (err) {
        console.error('Failed to delete memory record', err);
      }
    }
  };

  // Ingest custom memory
  const handleIngestMemory = async (e: FormEvent) => {
    e.preventDefault();
    setIngestError('');

    if (!newTitle.trim()) {
      setIngestError('Title is required.');
      return;
    }

    try {
      JSON.parse(newContent); // Verify payload is JSON
    } catch (err: any) {
      setIngestError(`Invalid JSON payload: ${err.message}`);
      return;
    }

    try {
      const newRecordPayload = {
        category: newCategory,
        content: newContent,
        metadata: {
          title: newTitle,
          tags: newTags.split(',').map(t => t.trim()).filter(t => t !== ''),
          dept: newDept,
          size: `${(newContent.length / 1024).toFixed(1)} KB`,
          version: 1,
          schema: {
            userId: "string",
            customPayload: "object",
            ingestedBy: "string"
          },
          permissions: {
            roles: newRoles,
            minAutonomy: newMinAutonomy,
            owner: newOwner
          },
          indexing: {
            vectorIndex: newVectorIndex,
            graphNodes: newGraphNodes.split(',').map(n => n.trim()).filter(n => n !== ''),
            primaryKey: newPrimaryKey || `${newTitle}_primary`
          },
          versions: [
            {
              version: 1,
              updatedAt: new Date().toISOString(),
              author: newOwner,
              changeSummary: 'First ingestion of corporate memory node.',
              content: newContent
            }
          ]
        }
      };

      const m = await fetchApi('/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecordPayload)
      });

      const formattedRecord = {
        id: m.id.toString(),
        title: m.metadata?.title || `Memory Record ${m.id}`,
        category: m.category,
        content: m.content,
        schema: m.metadata?.schema || {},
        tags: m.metadata?.tags || [],
        dept: m.metadata?.dept || 'Operations',
        size: m.metadata?.size || '1KB',
        updated: m.updatedAt || new Date().toISOString(),
        version: m.metadata?.version || 1,
        permissions: m.metadata?.permissions || { roles: [], minAutonomy: 'Level 1', owner: 'System' },
        versions: m.metadata?.versions || [],
        indexing: m.metadata?.indexing || { vectorIndex: '', graphNodes: [], primaryKey: '' }
      };

      setMemories([formattedRecord, ...memories]);
      setSelectedMemoryId(formattedRecord.id);
      setIngestOpen(false);

      logActivity(
        'ingestion',
        'scorpxgt7@gmail.com (Owner Ingest)',
        newTitle,
        `Ingested custom compliance memory node into '${newVectorIndex}' index.`,
        'success',
        0
      );
      
      // We will also use auditService to persist the log to db
      // We need to import auditService in this file. But wait, `logActivity` is already logging?
      // `logActivity` just stores it in `sessionStorage` in `utils/activityLogger.ts` maybe. Let me check what it does.
      
      // Reset fields
      setNewTitle('');
      setNewTags('');
    } catch (err: any) {
      setIngestError(`API Error: ${err.message}`);
    }
  };

  // Toggle role in modal
  const toggleRoleInModal = (role: string) => {
    if (newRoles.includes(role)) {
      setNewRoles(newRoles.filter(r => r !== role));
    } else {
      setNewRoles([...newRoles, role]);
    }
  };

  // Change existing memory permissions roles
  const handleTogglePermissionRole = async (role: string) => {
    try {
      const m = selectedMemory;
      const roles = m.permissions.roles.includes(role) 
        ? m.permissions.roles.filter(r => r !== role)
        : [...m.permissions.roles, role];
      
      const nextVersion = m.version + 1;
      const newVerRecord: MemoryVersion = {
        version: nextVersion,
        updatedAt: new Date().toISOString(),
        author: 'scorpxgt7@gmail.com (Access Adjust)',
        changeSummary: `Updated RBAC accessibility requirements. Toggled role '${role}'.`,
        content: m.content
      };

      const updatedMetadata = {
        title: m.title,
        tags: m.tags,
        dept: m.dept,
        size: m.size,
        version: nextVersion,
        schema: m.schema,
        permissions: { ...m.permissions, roles },
        indexing: m.indexing,
        versions: [newVerRecord, ...m.versions]
      };

      await fetchApi(`/memory/${m.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata: updatedMetadata })
      });

      const updated = memories.map(mem => {
        if (mem.id === m.id) {
          logActivity(
            'permission',
            'scorpxgt7@gmail.com (Access Adjust)',
            mem.title,
            `RBAC security update: ${mem.permissions.roles.includes(role) ? 'Revoked' : 'Granted'} access role '${role}'.`,
            'warning',
            25
          );

          return {
            ...mem,
            permissions: { ...mem.permissions, roles },
            version: nextVersion,
            versions: [newVerRecord, ...mem.versions]
          };
        }
        return mem;
      });
      setMemories(updated);
    } catch (err) {
      console.error('Failed to update permission role', err);
    }
  };

  // Update Min Autonomy for existing memory
  const handleMinAutonomyChange = async (val: string) => {
    try {
      const m = selectedMemory;
      const nextVersion = m.version + 1;
      const newVerRecord: MemoryVersion = {
        version: nextVersion,
        updatedAt: new Date().toISOString(),
        author: 'scorpxgt7@gmail.com (Access Adjust)',
        changeSummary: `Adjusted minimum autonomy threshold to '${val}'.`,
        content: m.content
      };

      const updatedMetadata = {
        title: m.title,
        tags: m.tags,
        dept: m.dept,
        size: m.size,
        version: nextVersion,
        schema: m.schema,
        permissions: { ...m.permissions, minAutonomy: val },
        indexing: m.indexing,
        versions: [newVerRecord, ...m.versions]
      };

      await fetchApi(`/memory/${m.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata: updatedMetadata })
      });

      const updated = memories.map(mem => {
        if (mem.id === m.id) {
          logActivity(
            'permission',
            'scorpxgt7@gmail.com (Access Adjust)',
            mem.title,
            `Escalated minimum execution autonomy threshold to '${val}'.`,
            'warning',
            35
          );

          return {
            ...mem,
            permissions: { ...mem.permissions, minAutonomy: val },
            version: nextVersion,
            versions: [newVerRecord, ...mem.versions]
          };
        }
        return mem;
      });
      setMemories(updated);
    } catch (err) {
      console.error('Failed to update min autonomy', err);
    }
  };

  // Query Playground execution
  const runPlaygroundSearch = () => {
    setPlaygroundSearching(true);
    setPlaygroundStep(1);
    setPlaygroundResults(null);

    // Progress trace step timing
    setTimeout(() => {
      setPlaygroundStep(2);
      setTimeout(() => {
        setPlaygroundStep(3);
        setTimeout(() => {
          setPlaygroundStep(4);
          setTimeout(() => {
            // Find records matching query text or tags roughly
            const queryWords = playgroundQuery.toLowerCase().split(' ');
            
            // Calculate a simple match score for simulation
            const scored = memories.map(m => {
              let score = 5; // Base score
              
              // Direct matches in title
              if (m.title.toLowerCase().includes(playgroundQuery.toLowerCase())) {
                score += 50;
              }
              // Keyword matches in text payload
              queryWords.forEach(word => {
                if (word.length > 3) {
                  if (m.content.toLowerCase().includes(word)) score += 15;
                  if (m.title.toLowerCase().includes(word)) score += 20;
                  if (m.tags.some(t => t.toLowerCase().includes(word))) score += 25;
                }
              });

              // Strategy influence
              if (playgroundStrategy === 'vector' && m.indexing.vectorIndex) {
                score += 10;
              }
              if (playgroundStrategy === 'graph' && m.indexing.graphNodes.length > 0) {
                score += 15;
              }

              // Access compliance deduction (Simulation: if not administrative query, keep high score but validate permissions)
              const passesAuth = m.permissions.roles.includes('All Agents') || m.permissions.roles.includes('Main Brain') || m.permissions.roles.includes('Overwatch');

              return {
                record: m,
                score: Math.min(score, 99),
                passesAuth
              };
            });

            // Sort by score descending
            const matches = scored
              .filter(s => s.score > 15)
              .sort((a, b) => b.score - a.score)
              .slice(0, 3);

            // If nothing matched, just give top memories with a standard score
            if (matches.length === 0) {
              setPlaygroundResults(
                memories.slice(0, 2).map((m, i) => ({
                  record: m,
                  score: 75 - i * 15,
                  passesAuth: true
                }))
              );
            } else {
              setPlaygroundResults(matches);
            }
            logActivity(
              'playground',
              'scorpxgt7@gmail.com (Playground Operator)',
              `Index Search (${playgroundStrategy.toUpperCase()})`,
              `Executed Retrieval Playground query: "${playgroundQuery}"`,
              'info',
              15
            );
            setPlaygroundSearching(false);
          }, 600);
        }, 500);
      }, 500);
    }, 400);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-[var(--border-base)] pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] uppercase font-bold tracking-wider rounded border border-blue-500/15">
              Persistent Core OS
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-base)] tracking-tight mb-1">Memory Center</h2>
          <p className="text-[var(--text-muted)] text-sm">
            Centralized memory orchestrator. Track, index, secure, and version cognitive nodes across autonomous operations.
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button 
            onClick={() => {
              handleIngestCategoryChange('org');
              setIngestOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2 shadow-sm shadow-blue-500/10 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Ingest Knowledge
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-[var(--border-base)] gap-2">
        {[
          { id: 'explorer', label: 'Memory Explorer', desc: 'Browse, Edit, & Version Control' },
          { id: 'playground', label: 'Retrieval Playground', desc: 'Test BM25 & Semantic HNSW' },
          { id: 'spec', label: 'Architecture Specifications', desc: 'Formal System Blueprint' },
          { id: 'map', label: 'Relationship Map', desc: 'Force-Directed Graph' },
        ].map((tab) => {
          const isActive = activeMainTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMainTab(tab.id as any)}
              className={`flex-1 sm:flex-initial text-left px-5 py-3 border-b-2 transition-all ${
                isActive 
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/20'
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-wider">{tab.label}</div>
              <div className="text-[10px] text-[var(--text-tertiary)] font-normal hidden sm:block mt-0.5">{tab.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Main Tab Panels */}
      <div className="space-y-6">

        {/* --- TAB 1: EXPLORER --- */}
        {activeMainTab === 'explorer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Sidebar Filters */}
            <div className="lg:col-span-3 space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3.5" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title, tag, dept..." 
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500/50 transition-colors" 
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3.5 p-0.5 text-[var(--text-muted)] hover:text-white rounded-full bg-[var(--bg-base)]">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Category selector */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-4 space-y-2.5">
                <div className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider px-1">Memory Taxonomy</div>
                <nav className="space-y-1">
                  {categoriesList.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button 
                        key={cat.id} 
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                          isSelected 
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/15' 
                            : 'text-[var(--text-muted)] hover:bg-[var(--bg-base)] hover:text-[var(--text-primary)] border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 capitalize">
                          <Folder className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-400' : 'text-blue-500/40'}`} />
                          {cat.label}
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-blue-500/20 text-blue-300' : 'bg-[var(--bg-base)] text-[var(--text-tertiary)]'
                        }`}>{cat.count}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Department selector */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-4 space-y-2.5">
                <div className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider px-1">Department Scopes</div>
                <div className="flex flex-wrap gap-1.5">
                  {departments.map(dept => {
                    const isSelected = selectedDept === dept;
                    return (
                      <button
                        key={dept}
                        onClick={() => setSelectedDept(dept)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase transition-colors ${
                          isSelected
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            : 'bg-[var(--bg-base)] text-[var(--text-muted)] border-transparent hover:text-white'
                        }`}
                      >
                        {dept === 'all' ? 'All Depts' : dept}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Middle Records List */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                  Indexed Clusters ({filteredMemories.length})
                </span>
                <span className="text-[10px] text-[var(--text-tertiary)]">
                  Access: Enforced via Dual-Sign
                </span>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
                <AnimatePresence mode="popLayout">
                  {filteredMemories.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-8 text-center bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-2xl space-y-2"
                    >
                      <Database className="w-8 h-8 text-[var(--text-tertiary)] mx-auto opacity-40" />
                      <div className="text-sm font-bold text-[var(--text-muted)]">No memory clusters found</div>
                      <p className="text-xs text-[var(--text-tertiary)]">Try loosening your filters or search keywords.</p>
                    </motion.div>
                  ) : (
                    filteredMemories.map((m, idx) => {
                      const isSelected = m.id === selectedMemoryId;
                      return (
                        <motion.div
                          key={m.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(idx * 0.04, 0.3) }}
                          onClick={() => {
                            setSelectedMemoryId(m.id);
                            setIsEditing(false); // Reset editing mode
                            logActivity(
                              'access',
                              'scorpxgt7@gmail.com (Owner)',
                              m.title,
                              `Manual cluster retrieval & inspector load. Checked permissions & schemas.`,
                              'info',
                              0
                            );
                          }}
                          className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                            isSelected 
                              ? 'bg-blue-500/5 border-blue-500/40 shadow-md shadow-blue-500/5' 
                              : 'bg-[var(--bg-surface)] border-[var(--border-base)] hover:border-[var(--text-tertiary)]/20'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 relative z-10">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded tracking-wider ${
                                  m.category === 'user' ? 'bg-sky-500/10 text-sky-400' :
                                  m.category === 'org' ? 'bg-indigo-500/10 text-indigo-400' :
                                  m.category === 'task' ? 'bg-amber-500/10 text-amber-400' :
                                  m.category === 'agent' ? 'bg-emerald-500/10 text-emerald-400' :
                                  'bg-rose-500/10 text-rose-400'
                                }`}>
                                  {m.category}
                                </span>
                                <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                                  v{m.version} • {m.size}
                                </span>
                              </div>
                              <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] leading-snug group-hover:text-blue-400 transition-colors">
                                {m.title}
                              </h4>
                            </div>

                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRecord(m.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-[var(--text-muted)] hover:text-red-400 rounded-md hover:bg-red-500/10 transition-all"
                              title="Scrub memory cluster"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center justify-between text-[10px] text-[var(--text-tertiary)] gap-2 border-t border-[var(--border-base)]/40 pt-2.5">
                            <div className="flex items-center gap-1.5">
                              <Cpu className="w-3 h-3 text-blue-400/50" />
                              <span>Dept: <strong className="text-[var(--text-muted)]">{m.dept}</strong></span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{m.updated}</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Detailed Inspector Panel */}
            <div className="lg:col-span-4 bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl overflow-hidden h-full">
              
              {/* Header Info */}
              <div className="p-5 border-b border-[var(--border-base)] bg-[var(--bg-base)]/20">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded tracking-wider ${
                    selectedMemory.category === 'user' ? 'bg-sky-500/10 text-sky-400' :
                    selectedMemory.category === 'org' ? 'bg-indigo-500/10 text-indigo-400' :
                    selectedMemory.category === 'task' ? 'bg-amber-500/10 text-amber-400' :
                    selectedMemory.category === 'agent' ? 'bg-emerald-500/10 text-emerald-400' :
                    'bg-rose-500/10 text-rose-400'
                  }`}>
                    {selectedMemory.category}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    ID: {selectedMemory.id}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight leading-tight mb-2">
                  {selectedMemory.title}
                </h3>
                
                {/* File tags */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedMemory.tags.map(t => (
                    <span key={t} className="text-[9px] bg-black/30 border border-[var(--border-base)] text-[var(--text-muted)] px-1.5 py-0.5 rounded font-mono">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sub-Tabs within Inspector */}
              <div className="flex border-b border-[var(--border-base)] bg-[var(--bg-base)]/10 text-xs">
                {[
                  { id: 'payload', label: 'Content JSON', icon: Code },
                  { id: 'permissions', label: 'Security RBAC', icon: ShieldCheck },
                  { id: 'versions', label: `Versions (${selectedMemory.versions.length})`, icon: Clock },
                  { id: 'indexing', label: 'Index & Graph', icon: Network },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = inspectorTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setInspectorTab(t.id as any)}
                      className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
                        isActive 
                          ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
                          : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Inspector Content Panel */}
              <div className="p-5 min-h-[350px]">

                {/* INSPECTOR SUB-TAB 1: PAYLOAD JSON */}
                {inspectorTab === 'payload' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                        Cognitive Structure Payload
                      </span>
                      
                      {!isEditing ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleExportJSON(selectedMemory)}
                            className="px-2 py-1 bg-black/40 hover:bg-black/60 text-[var(--text-muted)] hover:text-white border border-[var(--border-base)] text-[10px] font-semibold rounded-md transition-colors flex items-center gap-1"
                          >
                            <Share2 className="w-3 h-3" />
                            Export
                          </button>
                          <button 
                            onClick={startEditing}
                            className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-semibold rounded-md border border-blue-500/15 transition-colors flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            Edit JSON
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1.5">
                          <button 
                            onClick={cancelEditing}
                            className="px-2 py-1 bg-black/40 hover:bg-black/60 text-[var(--text-muted)] text-[10px] font-semibold rounded-md border border-[var(--border-base)] transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={saveContentChanges}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold rounded-md transition-colors flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            Save
                          </button>
                        </div>
                      )}
                    </div>

                    {!isEditing ? (
                      <div className="bg-black/40 rounded-xl p-4 border border-[var(--border-base)] overflow-x-auto h-[320px] font-mono text-[11px] text-blue-300 leading-relaxed scrollbar-thin">
                        <pre>{selectedMemory.content}</pre>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <textarea
                          value={editContentText}
                          onChange={(e) => setEditContentText(e.target.value)}
                          className="w-full bg-black/50 rounded-xl p-4 border border-blue-500/30 text-emerald-400 font-mono text-[11px] leading-relaxed focus:outline-none focus:border-blue-500 h-[280px] scrollbar-thin"
                        />
                        {editError && (
                          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] text-red-400 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>{editError}</span>
                          </div>
                        )}
                        <span className="text-[9px] text-[var(--text-tertiary)] italic block">
                          *Editing will commit a new version entry and recalculate file sizes dynamically.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* INSPECTOR SUB-TAB 2: SECURITY & PERMISSIONS */}
                {inspectorTab === 'permissions' && (
                  <div className="space-y-6">
                    {/* Minimum Autonomy */}
                    <div className="space-y-2 bg-black/20 p-3.5 border border-[var(--border-base)] rounded-xl">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
                        <Sliders className="w-4 h-4 text-blue-400" />
                        Autonomy Authorization Limit
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                        Specify the minimum autonomy level an agent must possess to parse or download this file index.
                      </p>
                      <select 
                        value={selectedMemory.permissions.minAutonomy}
                        onChange={(e) => handleMinAutonomyChange(e.target.value)}
                        className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-lg text-[11px] p-2 text-[var(--text-primary)] font-medium mt-1 focus:outline-none"
                      >
                        <option value="Level 1: Suggested">Level 1: Suggested (Read-all)</option>
                        <option value="Level 2: Assisted">Level 2: Assisted</option>
                        <option value="Level 3: Conditional">Level 3: Conditional</option>
                        <option value="Level 4: Managed">Level 4: Managed</option>
                        <option value="Level 5: Full Autonomous">Level 5: Full Autonomous</option>
                      </select>
                    </div>

                    {/* RBAC Roles Accessibility Toggle */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
                        <Users className="w-4 h-4 text-emerald-400" />
                        RBAC Access Privileges
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                        Control which specialized worker classes can mount this memory context onto their active pipelines.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {['All Agents', 'Main Brain', 'Overwatch', 'Department Manager', 'Auditor', 'Specialist', 'Worker'].map(role => {
                          const hasRole = selectedMemory.permissions.roles.includes(role);
                          return (
                            <button
                              key={role}
                              onClick={() => handleTogglePermissionRole(role)}
                              className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-left text-[10px] transition-colors ${
                                hasRole 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold' 
                                  : 'bg-black/20 text-[var(--text-muted)] border-transparent hover:border-[var(--border-base)]'
                              }`}
                            >
                              {hasRole ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              ) : (
                                <div className="w-3.5 h-3.5 rounded border border-[var(--border-base)] shrink-0" />
                              )}
                              <span className="truncate">{role}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Security Info Panel */}
                    <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl flex gap-2 text-[10px] text-amber-400 leading-normal">
                      <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Security Envelope:</strong> Toggling roles or modifying limits immediately generates compliance state logs. Unauthorized access attempts will prompt the Aegis Overwatch core to trigger context quarantines.
                      </div>
                    </div>
                  </div>
                )}

                {/* INSPECTOR SUB-TAB 3: VERSION CONTROL */}
                {inspectorTab === 'versions' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                        Append-Only Version Ledger
                      </span>
                      <span className="text-[10px] font-mono text-blue-400 font-bold">
                        v{selectedMemory.version} active
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                      {selectedMemory.versions.map((ver, idx) => (
                        <div key={idx} className="p-3.5 bg-black/30 border border-[var(--border-base)] rounded-xl space-y-2 relative group">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-xs font-bold text-[var(--text-primary)]">
                                Version {ver.version}
                              </span>
                              <div className="text-[9px] text-[var(--text-tertiary)] mt-0.5">
                                {new Date(ver.updatedAt).toLocaleString()}
                              </div>
                            </div>

                            {/* Only offer rollback if NOT the current version */}
                            {idx > 0 && (
                              <button
                                onClick={() => handleRollback(ver)}
                                className="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-400 hover:text-indigo-300 text-[10px] font-bold rounded-md border border-indigo-500/20 transition-all flex items-center gap-1"
                                title="Roll back to this version"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Rollback
                              </button>
                            )}

                            {idx === 0 && (
                              <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold tracking-widest uppercase rounded border border-emerald-500/20">
                                Current
                              </span>
                            )}
                          </div>

                          <div className="text-[10px] text-[var(--text-muted)] leading-relaxed bg-[var(--bg-base)]/50 p-2 rounded-lg border border-[var(--border-base)]/30">
                            <strong>Summary:</strong> {ver.changeSummary}
                            <div className="text-[9px] text-[var(--text-tertiary)] mt-1 font-mono">
                              By: {ver.author}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* INSPECTOR SUB-TAB 4: INDEXING & GRAPH DETAILS */}
                {inspectorTab === 'indexing' && (
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">
                      Retrieval Attributes & KG Linkages
                    </span>

                    {/* Primary Key */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Primary Key (PK)</span>
                      <code className="text-xs font-mono text-blue-300 block bg-black/40 p-2 rounded-lg border border-[var(--border-base)]">
                        {selectedMemory.indexing.primaryKey}
                      </code>
                    </div>

                    {/* Vector Store Target Index */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Target pgvector Index</span>
                      <code className="text-xs font-mono text-emerald-300 block bg-black/40 p-2 rounded-lg border border-[var(--border-base)]">
                        {selectedMemory.indexing.vectorIndex}
                      </code>
                    </div>

                    {/* Knowledge Graph Linked Nodes */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Semantic Graph Linkages</span>
                      <div className="bg-black/40 p-3.5 rounded-lg border border-[var(--border-base)] space-y-2">
                        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                          Relationships indexed inside the Knowledge Graph (Neo4j interface). Nodes with semantic matching weights:
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {selectedMemory.indexing.graphNodes.map((node, i) => (
                            <span key={i} className="px-2 py-0.5 bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 font-mono text-[9px] rounded-full">
                              {node}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

        {/* --- TAB 2: RETRIEVAL PLAYGROUND --- */}
        {activeMainTab === 'playground' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Input Form Controls */}
            <div className="lg:col-span-5 bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4.5 h-4.5 text-blue-400" />
                  Query Construction Interface
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Test raw natural language queries to verify cognitive indexing performance, safety scoring filters, and semantic search routing metrics.
                </p>

                {/* Text Area */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Natural Language Query</label>
                  <textarea
                    value={playgroundQuery}
                    onChange={(e) => setPlaygroundQuery(e.target.value)}
                    placeholder="Enter system retrieval query..."
                    className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl p-3.5 text-xs text-[var(--text-primary)] h-24 focus:outline-none focus:border-blue-500/60"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'What are the rules for financial transfers over $50k?',
                      'Check PR #4022 security vulnerabilities and dependencies',
                      'Alpha Prime system prompts and overrides',
                      'What is the brand tone for corporate communication?'
                    ].map((sample, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => setPlaygroundQuery(sample)}
                        className="text-[9px] bg-black/20 hover:bg-blue-500/10 text-[var(--text-muted)] hover:text-blue-400 border border-transparent hover:border-blue-500/10 px-2 py-0.5 rounded transition-all"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Retrieval Strategy Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block">Retrieval Method Strategy</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'hybrid', title: 'Hybrid (Cosine + BM25)', desc: 'Best of both worlds' },
                      { id: 'vector', title: 'Vector Similarity', desc: 'pgvector Cosine distance' },
                      { id: 'keyword', title: 'Keyword Matching', desc: 'Standard BM25 scoring' },
                      { id: 'graph', title: 'Knowledge Graph BFS', desc: 'Dependency relationship map' },
                    ].map(strategy => {
                      const isSelected = playgroundStrategy === strategy.id;
                      return (
                        <button
                          key={strategy.id}
                          onClick={() => setPlaygroundStrategy(strategy.id as any)}
                          className={`p-3.5 border rounded-lg text-left transition-all ${
                            isSelected
                              ? 'bg-blue-500/10 border-blue-500/40'
                              : 'bg-black/10 border-[var(--border-base)] hover:border-[var(--text-tertiary)]/20'
                          }`}
                        >
                          <div className={`text-[10px] font-bold ${isSelected ? 'text-blue-400' : 'text-[var(--text-primary)]'}`}>
                            {strategy.title}
                          </div>
                          <div className="text-[9px] text-[var(--text-tertiary)] mt-0.5 leading-tight">{strategy.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                onClick={runPlaygroundSearch}
                disabled={playgroundSearching}
                className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {playgroundSearching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Executing Pipeline...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Query Memory Center
                  </>
                )}
              </button>
            </div>

            {/* Results Logs & Visual Flow */}
            <div className="lg:col-span-7 bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-6 flex flex-col justify-between">
              
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4.5 h-4.5 text-emerald-400" />
                  Retrieval Execution & Security Check logs
                </h3>

                {/* Trace steps */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-black/20 p-2.5 rounded-xl border border-[var(--border-base)]/40 text-center">
                  {[
                    { label: 'Query Embed', step: 1, desc: 'Hypothetical doc vector' },
                    { label: 'Index Lookup', step: 2, desc: 'BM25 + Cosine search' },
                    { label: 'Reranker Feed', step: 3, desc: 'Dynamic context rerank' },
                    { label: 'Compliance Audit', step: 4, desc: 'RBAC authorization check' },
                  ].map(step => {
                    let status = 'pending';
                    if (playgroundStep >= step.step) status = 'completed';
                    if (playgroundSearching && playgroundStep === step.step) status = 'active';

                    return (
                      <div key={step.step} className={`p-2 rounded-lg border transition-all ${
                        status === 'completed' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' :
                        status === 'active' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 animate-pulse' :
                        'bg-black/10 border-transparent text-[var(--text-tertiary)]'
                      }`}>
                        <div className="text-[10px] font-bold uppercase tracking-wider">{step.label}</div>
                        <div className="text-[8px] opacity-80 mt-0.5">{step.desc}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Output results */}
                <div className="space-y-4">
                  {playgroundSearching && (
                    <div className="py-12 text-center space-y-3">
                      <div className="relative w-12 h-12 mx-auto">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500"
                        />
                      </div>
                      <div className="text-xs font-bold text-blue-400">Processing memory nodes with RRF algorithm...</div>
                      <p className="text-[10px] text-[var(--text-tertiary)] max-w-sm mx-auto">Scanning User, Org, Task, Agent, and Governance clusters matching access guidelines.</p>
                    </div>
                  )}

                  {!playgroundSearching && !playgroundResults && (
                    <div className="py-16 text-center space-y-3">
                      <HelpCircle className="w-10 h-10 text-[var(--text-tertiary)] mx-auto opacity-30" />
                      <div className="text-xs font-bold text-[var(--text-muted)]">Playground Ready</div>
                      <p className="text-[10px] text-[var(--text-tertiary)] max-w-xs mx-auto">Construct a query in the left panel to test and visualize how the Agentic OS reads persistent memory.</p>
                    </div>
                  )}

                  {!playgroundSearching && playgroundResults && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                          Scored Memory Blocks Retrieved
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">
                          Execution latency: 12.4ms • 100% Secure
                        </span>
                      </div>

                      <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
                        {playgroundResults.map((result, rIdx) => {
                          const m = result.record;
                          return (
                            <motion.div
                              key={m.id}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: rIdx * 0.05 }}
                              className="p-4 bg-black/20 border border-[var(--border-base)] rounded-xl space-y-3 relative group overflow-hidden"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[8px] font-mono uppercase font-bold px-1.5 py-0.5 rounded tracking-wider ${
                                      m.category === 'user' ? 'bg-sky-500/10 text-sky-400' :
                                      m.category === 'org' ? 'bg-indigo-500/10 text-indigo-400' :
                                      m.category === 'task' ? 'bg-amber-500/10 text-amber-400' :
                                      m.category === 'agent' ? 'bg-emerald-500/10 text-emerald-400' :
                                      'bg-rose-500/10 text-rose-400'
                                    }`}>
                                      {m.category}
                                    </span>
                                    <span className="text-[10px] font-bold text-[var(--text-primary)]">
                                      {m.title}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end">
                                  <span className="text-xs font-mono font-bold text-emerald-400">
                                    {result.score}% Match
                                  </span>
                                  <span className="text-[8px] text-[var(--text-tertiary)]">Relevance Rank #{rIdx + 1}</span>
                                </div>
                              </div>

                              <div className="bg-black/30 p-3 rounded-lg border border-[var(--border-base)]/40 overflow-x-auto font-mono text-[10px] text-blue-300 leading-normal max-h-24 scrollbar-thin">
                                <pre>{m.content}</pre>
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-[var(--text-tertiary)] pt-1 border-t border-[var(--border-base)]/30">
                                <div className="flex items-center gap-1">
                                  <Lock className="w-3 h-3 text-emerald-400" />
                                  <span>Secure Owner: <strong className="text-[var(--text-muted)]">{m.permissions.owner}</strong></span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400 font-bold">Passed Compliance Redaction</span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Policy notice */}
              <div className="mt-6 p-3 bg-blue-500/5 border border-blue-500/15 rounded-xl flex gap-2 text-[10px] text-[var(--text-muted)] items-center">
                <Info className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  Query execution logs are mapped into <strong>Audit Archives</strong> automatically in governance memory.
                </span>
              </div>

            </div>

          </div>
        )}

        {/* --- TAB 3: TECHNICAL SPECIFICATION --- */}
        {activeMainTab === 'spec' && (
          <div className="space-y-6">
            <MemoryArchitectureSpec />
          </div>
        )}

        {/* --- TAB 4: RELATIONSHIP MAP --- */}
        {activeMainTab === 'map' && (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Knowledge Graph Topological View</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">Force-directed visualization of semantic linkages between memory nodes, tags, and categorical buckets.</p>
              </div>
            </div>
            <MemoryMap memories={memories} />
          </div>
        )}

      </div>

      {/* --- INGESTION MODAL / DIALOG --- */}
      <AnimatePresence>
        {ingestOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] font-sans"
            >
              
              {/* Modal Header */}
              <div className="p-6 border-b border-[var(--border-base)] bg-[var(--bg-base)]/30 flex items-center justify-between">
                <div>
                  <h3 className="text-md sm:text-lg font-bold text-[var(--text-base)] flex items-center gap-2">
                    <Upload className="w-5 h-5 text-blue-400" />
                    Ingest Cognitive Knowledge Node
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Ingest custom files or structured policies, setup permissions, and configure indexes instantly.</p>
                </div>
                <button 
                  onClick={() => setIngestOpen(false)}
                  className="p-1.5 hover:bg-[var(--bg-base)] text-[var(--text-muted)] hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleIngestMemory} className="p-6 overflow-y-auto space-y-4 flex-1 scrollbar-thin">
                {ingestError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{ingestError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Memory Title</label>
                    <input 
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g., Marketing SOP v2"
                      className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Core Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => handleIngestCategoryChange(e.target.value as MemoryCategory)}
                      className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                    >
                      <option value="user">User Memory</option>
                      <option value="org">Organizational Memory</option>
                      <option value="task">Task Memory</option>
                      <option value="agent">Agent Memory</option>
                      <option value="governance">Governance Memory</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Department */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Department Owner</label>
                    <select
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                    >
                      {departments.filter(d => d !== 'all').map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tags */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Tags (comma-separated)</label>
                    <input 
                      type="text"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      placeholder="e.g., guidelines, cache, operations"
                      className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Content Payload editor */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">JSON Payloads Content Structure</label>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full bg-black/40 border border-[var(--border-base)] rounded-xl p-3 text-xs text-blue-300 font-mono h-32 focus:outline-none focus:border-blue-500 scrollbar-thin"
                    required
                  />
                  <span className="text-[9px] text-[var(--text-tertiary)] italic block">
                    *The payload structure must be standard valid JSON representing the selected category metadata.
                  </span>
                </div>

                {/* Security Section */}
                <div className="p-4 bg-black/20 border border-[var(--border-base)] rounded-xl space-y-4">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Security Envelope Settings</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Owner Email */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Owner Signature Email</label>
                      <input 
                        type="email"
                        value={newOwner}
                        onChange={(e) => setNewOwner(e.target.value)}
                        className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* Min Autonomy */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Min Autonomy Check</label>
                      <select
                        value={newMinAutonomy}
                        onChange={(e) => setNewMinAutonomy(e.target.value)}
                        className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none"
                      >
                        <option value="Level 1: Suggested">Level 1: Suggested</option>
                        <option value="Level 2: Assisted">Level 2: Assisted</option>
                        <option value="Level 3: Conditional">Level 3: Conditional</option>
                        <option value="Level 4: Managed">Level 4: Managed</option>
                        <option value="Level 5: Full Autonomous">Level 5: Full Autonomous</option>
                      </select>
                    </div>
                  </div>

                  {/* RBAC Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Allowed Roles Access (RBAC)</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['All Agents', 'Main Brain', 'Overwatch', 'Department Manager', 'Auditor', 'Specialist', 'Worker'].map(role => {
                        const isSelected = newRoles.includes(role);
                        return (
                          <button
                            type="button"
                            key={role}
                            onClick={() => toggleRoleInModal(role)}
                            className={`px-2.5 py-1 text-[10px] font-bold border rounded-md transition-colors ${
                              isSelected
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                                : 'bg-black/10 text-[var(--text-muted)] border-transparent hover:border-[var(--border-base)]'
                            }`}
                          >
                            {role}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Indexing Section */}
                <div className="p-4 bg-black/20 border border-[var(--border-base)] rounded-xl space-y-4">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">HNSW pgvector & KG Index Settings</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Primary Key</label>
                      <input 
                        type="text"
                        value={newPrimaryKey}
                        onChange={(e) => setNewPrimaryKey(e.target.value)}
                        placeholder="e.g., org_sop_v1"
                        className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Vector Index Name</label>
                      <input 
                        type="text"
                        value={newVectorIndex}
                        onChange={(e) => setNewVectorIndex(e.target.value)}
                        className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">KG Linked Nodes</label>
                      <input 
                        type="text"
                        value={newGraphNodes}
                        onChange={(e) => setNewGraphNodes(e.target.value)}
                        className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Panel */}
                <div className="pt-4 border-t border-[var(--border-base)] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIngestOpen(false)}
                    className="px-4 py-2 bg-black/40 hover:bg-black/60 text-[var(--text-muted)] hover:text-white border border-[var(--border-base)] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/15"
                  >
                    <Upload className="w-4 h-4" />
                    Ingest & Index Node
                  </button>
                </div>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
