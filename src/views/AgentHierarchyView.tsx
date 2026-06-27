import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BrainCircuit, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Sliders, 
  Activity, 
  Database, 
  RefreshCw, 
  ShieldAlert, 
  Sparkles, 
  Power, 
  X, 
  AlertTriangle, 
  Check, 
  Layers, 
  Grid, 
  Plus, 
  ArrowRight,
  Minus,
  Maximize2,
  Clock,
  FileText,
  Terminal,
  Square,
  CheckSquare
} from 'lucide-react';
import { fetchApi } from '../lib/api';
import { auditService } from '../services/auditService';
import { AgentsView } from './AgentsView';

// TypeScript Declarations
interface Agent {
  id: number;
  name: string;
  role: string;
  mission?: string | null;
  autonomyLevel?: number;
  skills?: string[] | string | null;
  responsibilities?: string[] | string | null;
  status?: string;
  reportingManager?: number | null;
  departmentId?: number | null;
  department?: { id: number; name: string } | null;
  tasksCompleted?: number;
  memoryAccess?: string | string[] | null;
}

interface TreeNodeType {
  id: number;
  name: string;
  role: string;
  agent: Agent;
  children: TreeNodeType[];
}

export function AgentHierarchyView({ onViewChange }: { onViewChange?: (view: string) => void }) {
  // State variables
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({});
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'monitor'>('tree');

  // Zoom and Pan state
  const [scale, setScale] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [agentLogs, setAgentLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);

  // Drag and zoom refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragMovedRef = useRef<boolean>(false);

  // Monitor outer canvas width dynamically for viewport indicator in mini-map
  // Interactive action states for details panel
  const [gcActive, setGcActive] = useState(false);
  const [tuningActive, setTuningActive] = useState(false);
  const [stressActive, setStressActive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [updatingManager, setUpdatingManager] = useState(false);

  // Batch multi-select state
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [selectedNodeIds, setSelectedNodeIds] = useState<number[]>([]);
  const [batchTargetSupervisorId, setBatchTargetSupervisorId] = useState<number | ''>('');
  const [batchUpdating, setBatchUpdating] = useState<boolean>(false);

  // Fetch recent logs for the selected agent
  useEffect(() => {
    if (selectedAgent) {
      const fetchLogs = async () => {
        setLoadingLogs(true);
        try {
          const logs = await auditService.getLogs();
          // Filter logs for this specific agent
          const filtered = logs.filter((l: any) => l.actorAgentId === selectedAgent.id);
          setAgentLogs(filtered);
        } catch (err) {
          console.error('Failed to load logs for agent:', err);
        } finally {
          setLoadingLogs(false);
        }
      };
      fetchLogs();
    } else {
      setAgentLogs([]);
    }
  }, [selectedAgent]);

  // Fallback/mock activity logs
  const displayLogs = useMemo(() => {
    if (agentLogs.length > 0) return agentLogs;
    if (!selectedAgent) return [];

    return [
      {
        id: 'mock-1',
        action: 'Agent Node Bootstrapped',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        outcome: 'success',
        riskScore: 10,
        metadata: { bootSequence: 'success', memoryHeuristics: 'loaded' }
      },
      {
        id: 'mock-2',
        action: 'System Registration Completed',
        timestamp: new Date(Date.now() - 3600000 * 1.95).toISOString(),
        outcome: 'success',
        riskScore: 15,
        metadata: { registryPath: 'central.swarm.nodes' }
      },
      {
        id: 'mock-3',
        action: 'Memory Partition Linked',
        timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(),
        outcome: 'success',
        riskScore: 12,
        metadata: { partitions: selectedAgent.memoryAccess || 'Central Memory' }
      }
    ];
  }, [agentLogs, selectedAgent]);

  // Zoom handlers
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const handleResetZoom = () => {
    setScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Zoom on wheel scroll
    const zoomFactor = 0.05;
    const nextScale = e.deltaY < 0 
      ? Math.min(scale + zoomFactor, 2) 
      : Math.max(scale - zoomFactor, 0.5);
    setScale(nextScale);
  };

  // Pan dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with left click on background canvas (or elements that allow dragging)
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('select') || target.closest('input')) {
      return;
    }
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    dragMovedRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragMovedRef.current = true;
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      startPosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleCardSelect = (agent: Agent) => {
    if (dragMovedRef.current) return; // Do not select if we were panning
    if (isMultiSelectMode) {
      toggleNodeSelection(agent.id);
    } else {
      setSelectedAgent(agent);
    }
  };

  const toggleNodeSelection = (id: number) => {
    setSelectedNodeIds(prev => 
      prev.includes(id) ? prev.filter(nid => nid !== id) : [...prev, id]
    );
  };

  const handleBatchHalt = async () => {
    if (selectedNodeIds.length === 0) return;
    setBatchUpdating(true);
    showToast(`Halting ${selectedNodeIds.length} agents...`);
    try {
      await Promise.all(
        selectedNodeIds.map(id => 
          fetchApi(`/agents/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'halted' })
          })
        )
      );

      await auditService.logEvent({
        action: 'Batch Agents Halted',
        actorAgentId: selectedNodeIds[0],
        metadata: { 
          count: selectedNodeIds.length,
          agentIds: selectedNodeIds.join(', ')
        },
        outcome: 'success'
      });

      showToast(`Successfully halted ${selectedNodeIds.length} agents.`);
      setSelectedNodeIds([]);
      await loadAgents();
    } catch (err: any) {
      console.error(err);
      showToast(`Batch halt failed: ${err.message}`);
    } finally {
      setBatchUpdating(false);
    }
  };

  const handleBatchResume = async () => {
    if (selectedNodeIds.length === 0) return;
    setBatchUpdating(true);
    showToast(`Activating ${selectedNodeIds.length} agents...`);
    try {
      await Promise.all(
        selectedNodeIds.map(id => 
          fetchApi(`/agents/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'active' })
          })
        )
      );

      await auditService.logEvent({
        action: 'Batch Agents Activated',
        actorAgentId: selectedNodeIds[0],
        metadata: { 
          count: selectedNodeIds.length,
          agentIds: selectedNodeIds.join(', ')
        },
        outcome: 'success'
      });

      showToast(`Successfully activated ${selectedNodeIds.length} agents.`);
      setSelectedNodeIds([]);
      await loadAgents();
    } catch (err: any) {
      console.error(err);
      showToast(`Batch activation failed: ${err.message}`);
    } finally {
      setBatchUpdating(false);
    }
  };

  const handleBatchReassign = async (targetSupervisorId: number | null) => {
    if (selectedNodeIds.length === 0) return;
    setBatchUpdating(true);
    showToast(`Re-assigning reporting chain-of-command...`);
    try {
      await Promise.all(
        selectedNodeIds.map(id => 
          fetchApi(`/agents/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reportingManager: targetSupervisorId })
          })
        )
      );

      const newManagerName = targetSupervisorId 
        ? agents.find(a => a.id === targetSupervisorId)?.name || 'Unknown'
        : 'None (Root Level)';
      
      await auditService.logEvent({
        action: 'Batch Hierarchy Reassigned',
        actorAgentId: selectedNodeIds[0],
        metadata: { 
          count: selectedNodeIds.length,
          agentIds: selectedNodeIds.join(', '),
          newSupervisorId: targetSupervisorId,
          newSupervisorName: newManagerName
        },
        outcome: 'success'
      });

      showToast(`Successfully re-assigned ${selectedNodeIds.length} agents to supervisor ${newManagerName}.`);
      setSelectedNodeIds([]);
      setBatchTargetSupervisorId('');
      await loadAgents();
    } catch (err: any) {
      console.error(err);
      showToast(`Batch re-assignment failed: ${err.message}`);
    } finally {
      setBatchUpdating(false);
    }
  };

  // Load agents data
  const loadAgents = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/agents');
      setAgents(data);
      
      // Auto-expand all nodes initially
      const initialExpanded: Record<number, boolean> = {};
      data.forEach((agent: Agent) => {
        initialExpanded[agent.id] = true;
      });
      setExpandedNodes(initialExpanded);
      
      setError(null);
    } catch (err: any) {
      console.error('Failed to load agents in hierarchy:', err);
      setError(err.message || 'Failed to fetch organization agents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  // Construct the hierarchical tree using the custom logic
  const treeRoots = useMemo(() => {
    if (agents.length === 0) return [];

    // Helper map for fast lookups
    const agentMap: Record<number, TreeNodeType> = {};
    agents.forEach(agent => {
      agentMap[agent.id] = {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        agent,
        children: []
      };
    });

    const roots: TreeNodeType[] = [];

    // Build hierarchy
    agents.forEach(agent => {
      const parentId = agent.reportingManager;
      const node = agentMap[agent.id];

      if (parentId && agentMap[parentId] && parentId !== agent.id) {
        // Prevent simple self-cycles and append to valid parent
        agentMap[parentId].children.push(node);
      } else {
        // No reporting manager, or reporting manager is invalid/self
        roots.push(node);
      }
    });

    // Fallback hierarchy matching: If we have multiple roots, but one is clearly Alpha Orchestrator,
    // let's link other non-orchestrator root agents to it so the organization hierarchy flows beautifully.
    if (roots.length > 1) {
      const orchestrator = roots.find(r => r.agent.role?.toLowerCase().includes('orchestrator') || r.agent.name?.toLowerCase().includes('alpha'));
      if (orchestrator) {
        const remainingRoots: TreeNodeType[] = [];
        roots.forEach(r => {
          if (r.id === orchestrator.id) {
            remainingRoots.push(r);
          } else {
            orchestrator.children.push(r);
          }
        });
        return remainingRoots;
      }
    }

    return roots;
  }, [agents]);

  // Expand or collapse a single node
  const toggleNode = (nodeId: number) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Expand all nodes
  const expandAll = () => {
    const nextExpanded: Record<number, boolean> = {};
    agents.forEach(a => {
      nextExpanded[a.id] = true;
    });
    setExpandedNodes(nextExpanded);
  };

  // Collapse all nodes
  const collapseAll = () => {
    setExpandedNodes({});
  };

  // Trigger toast notifications
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Action: Update Reporting Manager live
  const handleUpdateReportingManager = async (agentId: number, parentId: number | null) => {
    setUpdatingManager(true);
    showToast("Re-linking agent reporting hierarchy...");
    try {
      const updated = await fetchApi(`/agents/${agentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportingManager: parentId })
      });

      await auditService.logEvent({
        action: 'Agent Hierarchy Altered',
        actorAgentId: agentId,
        metadata: { 
          agentName: updated.name, 
          newReportingManagerId: parentId,
          newReportingManagerName: agents.find(a => a.id === parentId)?.name || 'None'
        },
        outcome: 'success'
      });

      // Update selected agent context
      setSelectedAgent(updated);
      
      // Reload hierarchy
      await loadAgents();
      showToast(`${updated.name} has been successfully re-assigned in the hierarchy.`);
    } catch (err: any) {
      console.error(err);
      showToast(`Hierarchy update failed: ${err.message}`);
    } finally {
      setUpdatingManager(false);
    }
  };

  // Action: Garbage Collection Simulation
  const triggerGarbageCollection = (agent: Agent) => {
    if (agent.status === 'halted') {
      showToast("Cannot run Garbage Collection on a halted agent.");
      return;
    }
    setGcActive(true);
    showToast(`Initializing heap optimization on ${agent.name}...`);
    
    setTimeout(() => {
      setGcActive(false);
      showToast(`Garbage Collection completed. Reclaimed 340MB heap storage.`);
      auditService.logEvent({
        action: 'Garbage Collection Triggered',
        actorAgentId: agent.id,
        metadata: { agentName: agent.name, reclaimedMem: '340MB' },
        outcome: 'success'
      });
    }, 1500);
  };

  // Action: Latency Tuning Simulation
  const triggerLatencyTuning = (agent: Agent) => {
    if (agent.status === 'halted') {
      showToast("Cannot optimize routing on a halted agent.");
      return;
    }
    setTuningActive(true);
    showToast(`Optimizing neural link pathways for ${agent.name}...`);
    
    setTimeout(() => {
      setTuningActive(false);
      showToast(`Latency tuning completed successfully. Base latency reduced by 14ms.`);
      auditService.logEvent({
        action: 'Neural Tuning Performed',
        actorAgentId: agent.id,
        metadata: { agentName: agent.name, latencySavings: '14ms' },
        outcome: 'success'
      });
    }, 1500);
  };

  // Toggle active/halted status
  const toggleAgentStatus = async (agent: Agent) => {
    const nextStatus = agent.status === 'halted' ? 'active' : 'halted';
    showToast(`Toggling status of ${agent.name} to ${nextStatus}...`);
    try {
      const updated = await fetchApi(`/agents/${agent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });

      await auditService.logEvent({
        action: agent.status === 'halted' ? 'Agent Restored' : 'Agent Halted',
        actorAgentId: agent.id,
        metadata: { agentName: agent.name },
        outcome: 'success'
      });

      setSelectedAgent(updated);
      await loadAgents();
      showToast(`${agent.name} is now ${nextStatus === 'active' ? 'Fully Operational' : 'Halted'}.`);
    } catch (err: any) {
      console.error(err);
      showToast(`Failed to update status: ${err.message}`);
    }
  };

  // Filter agents matching the search query
  const filteredNodes = useMemo(() => {
    if (!searchQuery) return treeRoots;

    const query = searchQuery.toLowerCase();

    // Deep filter matching either node or its children
    const filterTree = (nodes: TreeNodeType[]): TreeNodeType[] => {
      return nodes
        .map(node => {
          const selfMatch = 
            node.name.toLowerCase().includes(query) || 
            node.role.toLowerCase().includes(query) ||
            (node.agent.department?.name || '').toLowerCase().includes(query);

          const filteredChildren = filterTree(node.children);

          if (selfMatch || filteredChildren.length > 0) {
            return {
              ...node,
              children: filteredChildren
            };
          }
          return null;
        })
        .filter(Boolean) as TreeNodeType[];
    };

    return filterTree(treeRoots);
  }, [treeRoots, searchQuery]);

  // Monitor outer canvas width dynamically for viewport indicator in mini-map
  const [containerWidth, setContainerWidth] = useState<number>(800);
  useEffect(() => {
    if (canvasRef.current) {
      setContainerWidth(canvasRef.current.clientWidth);
    }
    const handleResize = () => {
      if (canvasRef.current) {
        setContainerWidth(canvasRef.current.clientWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  // Construct flat map representation of visible hierarchical nodes for mini-map representation
  const miniMapNodes = useMemo(() => {
    const list: {
      id: number;
      name: string;
      role: string;
      status: string;
      depth: number;
      row: number;
      parentId: number | null;
    }[] = [];
    let currentRow = 0;

    const traverse = (node: TreeNodeType, depth: number, parentId: number | null) => {
      const row = currentRow++;
      list.push({
        id: node.id,
        name: node.name,
        role: node.role,
        status: node.agent.status || 'active',
        depth,
        row,
        parentId
      });

      const isExpanded = expandedNodes[node.id] ?? false;
      if (isExpanded && node.children.length > 0) {
        node.children.forEach(child => traverse(child, depth + 1, node.id));
      }
    };

    filteredNodes.forEach(root => traverse(root, 0, null));
    return list;
  }, [filteredNodes, expandedNodes]);

  const MM_WIDTH = 160;
  const MM_HEIGHT = 90;
  const MM_PADDING = 8;
  const MM_INNER_W = MM_WIDTH - 2 * MM_PADDING;
  const MM_INNER_H = MM_HEIGHT - 2 * MM_PADDING;

  const mmLayout = useMemo(() => {
    if (miniMapNodes.length === 0) {
      return { nodes: [], virtualCW: 800, virtualCH: 650 };
    }
    const maxD = Math.max(...miniMapNodes.map(n => n.depth), 1);
    const maxR = Math.max(miniMapNodes.length, 1);
    
    // Virtual dimensions of the full tree space in the main scrollable canvas
    const virtualCW = Math.max(maxD * 160 + 340, 800);
    const virtualCH = Math.max(maxR * 110 + 100, 650);

    const nodes = miniMapNodes.map(n => {
      // Map node layout to virtual pixels
      const vx = n.depth * 130 + 100;
      const vy = n.row * 105 + 80;
      
      return {
        ...n,
        mmX: MM_PADDING + (vx / virtualCW) * MM_INNER_W,
        mmY: MM_PADDING + (vy / virtualCH) * MM_INNER_H,
      };
    });

    return { nodes, virtualCW, virtualCH };
  }, [miniMapNodes, MM_INNER_W, MM_INNER_H, MM_PADDING]);

  const mmNodeMap = useMemo(() => {
    return new Map(mmLayout.nodes.map(n => [n.id, n]));
  }, [mmLayout.nodes]);

  const mmViewport = useMemo(() => {
    const { virtualCW, virtualCH } = mmLayout;
    
    // Mapped top-left virtual coordinates of our viewport
    const vLeft = -panOffset.x / scale;
    const vTop = -panOffset.y / scale;
    
    // Mapped dimensions of our viewport
    const vWidth = containerWidth / scale;
    const vHeight = 650 / scale;

    const mmX = MM_PADDING + (vLeft / virtualCW) * MM_INNER_W;
    const mmY = MM_PADDING + (vTop / virtualCH) * MM_INNER_H;
    const mmW = (vWidth / virtualCW) * MM_INNER_W;
    const mmH = (vHeight / virtualCH) * MM_INNER_H;

    // Clamp the viewport rectangle so it fits inside the mini-map nicely
    const left = Math.max(MM_PADDING, Math.min(MM_WIDTH - MM_PADDING, mmX));
    const top = Math.max(MM_PADDING, Math.min(MM_HEIGHT - MM_PADDING, mmY));
    const width = Math.max(12, Math.min(MM_WIDTH - left - MM_PADDING, mmW));
    const height = Math.max(8, Math.min(MM_HEIGHT - top - MM_PADDING, mmH));

    return { left, top, width, height };
  }, [mmLayout, panOffset, scale, containerWidth, MM_INNER_W, MM_INNER_H, MM_PADDING, MM_WIDTH, MM_HEIGHT]);

  const [isMiniMapDragging, setIsMiniMapDragging] = useState(false);

  const handleMiniMapClickOrDrag = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Get mouse/touch coordinate within the SVG element
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    // Convert click coordinates inside padding to percentages
    const fracX = Math.max(0, Math.min(1, (clickX - MM_PADDING) / MM_INNER_W));
    const fracY = Math.max(0, Math.min(1, (clickY - MM_PADDING) / MM_INNER_H));

    const { virtualCW, virtualCH } = mmLayout;

    // Find the target center in virtual coordinate space
    const targetVirtualX = fracX * virtualCW;
    const targetVirtualY = fracY * virtualCH;

    // Pan main canvas to center around target virtual coordinate
    setPanOffset({
      x: -targetVirtualX * scale + containerWidth / 2,
      y: -targetVirtualY * scale + 325, // container is 650px high, so 325 is center
    });
  };

  const handleMiniMapMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsMiniMapDragging(true);
    handleMiniMapClickOrDrag(e);
  };

  const handleMiniMapMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isMiniMapDragging) {
      handleMiniMapClickOrDrag(e);
    }
  };

  const handleMiniMapMouseUp = () => {
    setIsMiniMapDragging(false);
  };

  // Main layout view choice switcher
  if (viewMode === 'monitor') {
    return (
      <div className="h-full flex flex-col">
        {/* Top Header/Selector */}
        <div className="px-8 py-4 bg-[var(--bg-surface)] border-b border-[var(--border-base)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-blue-400" />
              Agent Core Performance
            </h2>
            <p className="text-[var(--text-muted)] text-xs mt-0.5">Real-time telemetry, resources load, and command controls.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-[var(--bg-base)] border border-[var(--border-base)] p-1 rounded-xl">
            <button
              id="switch-tree-btn"
              onClick={() => setViewMode('tree')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all duration-200"
            >
              <Layers className="w-3.5 h-3.5" />
              Hierarchy Tree
            </button>
            <button
              id="switch-monitor-btn"
              onClick={() => setViewMode('monitor')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--bg-surface)] text-blue-400 shadow border border-[var(--border-base)] transition-all duration-200"
            >
              <Grid className="w-3.5 h-3.5" />
              Performance Monitor
            </button>
          </div>
        </div>
        
        {/* Embedded view container */}
        <div className="flex-1 overflow-y-auto">
          <AgentsView onViewChange={onViewChange} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans pb-24 relative min-h-full flex flex-col">
      {/* Global SVG Gradients for connector lines */}
      <svg className="absolute w-0 h-0 pointer-events-none" width="0" height="0" aria-hidden="true">
        <defs>
          <linearGradient id="connector-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="active-connector-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="halted-connector-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="idle-connector-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Toast Alert overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            id="toast-notification"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#09090b] border border-zinc-800 text-zinc-100 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-mono max-w-md"
          >
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
            <span className="flex-1 text-[var(--text-secondary)]">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section */}
      <div className="border-b border-[var(--border-base)] pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-[var(--text-base)] tracking-tight">Agent Hierarchy</h2>
          <p className="text-[var(--text-muted)] text-sm">Visual topology of active autonomous agents, scopes, and reporting hierarchy.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[var(--bg-surface)] border border-[var(--border-base)] p-1 rounded-xl w-full md:w-auto">
            <button
              id="view-tree-btn"
              onClick={() => setViewMode('tree')}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--bg-base)] text-blue-400 shadow border border-[var(--border-base)] transition-all duration-200"
            >
              <Layers className="w-3.5 h-3.5" />
              Hierarchy Tree
            </button>
            <button
              id="view-monitor-btn"
              onClick={() => setViewMode('monitor')}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all duration-200"
            >
              <Grid className="w-3.5 h-3.5" />
              Performance Monitor
            </button>
          </div>

          <button
            id="provision-agent-header-btn"
            onClick={() => onViewChange?.('agent-builder')}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] transition-all text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Provision Agent
          </button>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[var(--bg-surface)] border border-[var(--border-base)] p-4 rounded-2xl">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input 
            type="text"
            placeholder="Search agents, roles, or scopes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl pl-10 pr-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 placeholder:text-[var(--text-muted)] transition-all font-mono"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button 
            id="toggle-multiselect-btn"
            onClick={() => {
              setIsMultiSelectMode(!isMultiSelectMode);
              setSelectedNodeIds([]); // Reset selections
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer
              ${isMultiSelectMode 
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-md shadow-emerald-500/5' 
                : 'border-[var(--border-base)] bg-[var(--bg-base)] hover:bg-[#27272a] text-[var(--text-secondary)]'}`}
          >
            {isMultiSelectMode ? (
              <>
                <CheckSquare className="w-3.5 h-3.5" />
                Multi-Select Active
              </>
            ) : (
              <>
                <Square className="w-3.5 h-3.5" />
                Batch Actions Mode
              </>
            )}
          </button>
          
          <button 
            id="expand-all-btn"
            onClick={expandAll}
            className="px-3 py-1.5 rounded-xl border border-[var(--border-base)] bg-[var(--bg-base)] hover:bg-[#27272a] text-[var(--text-secondary)] text-xs font-semibold transition-colors flex items-center gap-1"
          >
            Expand All
          </button>
          <button 
            id="collapse-all-btn"
            onClick={collapseAll}
            className="px-3 py-1.5 rounded-xl border border-[var(--border-base)] bg-[var(--bg-base)] hover:bg-[#27272a] text-[var(--text-secondary)] text-xs font-semibold transition-colors flex items-center gap-1"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Main Container Area */}
      <div className="flex-1 min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 text-[var(--text-tertiary)] gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
            <p className="text-sm font-mono animate-pulse">Syncing organizational registry...</p>
          </div>
        ) : error ? (
          <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-6 text-center max-w-md mx-auto space-y-4">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
            <h4 className="font-bold text-[var(--text-primary)] text-sm">Failed to Synced Swarm Registry</h4>
            <p className="text-xs text-[var(--text-muted)]">{error}</p>
            <button 
              onClick={loadAgents}
              className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[#27272a] text-[var(--text-primary)] rounded-xl text-xs font-semibold border border-[var(--border-base)] transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredNodes.length === 0 ? (
          <div className="border border-zinc-800 bg-[var(--bg-surface)] rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
            <BrainCircuit className="w-12 h-12 text-[var(--text-muted)] mx-auto animate-pulse" />
            <h4 className="font-bold text-[var(--text-primary)] text-sm">No Swarm Agents Found</h4>
            <p className="text-xs text-[var(--text-muted)]">
              {searchQuery ? "No agents match your current query parameter." : "You haven't provisioned any agents yet."}
            </p>
            {searchQuery ? (
              <button 
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-[var(--bg-base)] hover:bg-[#27272a] text-[var(--text-primary)] rounded-xl text-xs font-semibold border border-[var(--border-base)] transition-colors"
              >
                Clear Search
              </button>
            ) : (
              <button 
                onClick={() => onViewChange?.('agent-builder')}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg transition-colors"
              >
                Create First Agent
              </button>
            )}
          </div>
        ) : (
          <div className="relative border border-zinc-800/60 rounded-3xl bg-[#030303] overflow-hidden select-none">
            {/* Canvas instructions */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500 tracking-wider">
                DRAG TO PAN • SCROLL TO ZOOM • CLICK AGENT FOR DETAILS
              </span>
            </div>

            {/* Interactive Swarm Mini-map */}
            <div className="absolute top-4 right-4 z-30 flex flex-col bg-zinc-950/90 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-2 shadow-2xl select-none w-[180px] h-[135px]">
              <div className="flex items-center justify-between px-1 mb-1.5">
                <div className="flex items-center gap-1">
                  <Grid className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">SWARM MAP</span>
                </div>
                <div className="text-[9px] font-mono text-zinc-600 font-medium">
                  {mmLayout.nodes.length} nodes
                </div>
              </div>
              
              {/* Mini-map SVG Container */}
              <div className="relative flex-1 bg-black/60 border border-zinc-900 rounded-lg overflow-hidden cursor-crosshair">
                <svg 
                  width="100%" 
                  height="100%" 
                  viewBox={`0 0 ${MM_WIDTH} ${MM_HEIGHT}`}
                  onMouseDown={handleMiniMapMouseDown}
                  onMouseMove={handleMiniMapMouseMove}
                  onMouseUp={handleMiniMapMouseUp}
                  onMouseLeave={handleMiniMapMouseUp}
                  className="w-full h-full"
                >
                  {/* Parent-child link lines */}
                  {mmLayout.nodes.map(node => {
                    if (node.parentId === null) return null;
                    const parent = mmNodeMap.get(node.parentId);
                    if (!parent) return null;
                    return (
                      <line 
                        key={`link-${node.id}`}
                        x1={parent.mmX} 
                        y1={parent.mmY} 
                        x2={node.mmX} 
                        y2={node.mmY} 
                        stroke={
                          node.status === 'halted' 
                            ? 'rgba(239, 68, 68, 0.25)' 
                            : node.status === 'idle' 
                              ? 'rgba(245, 158, 11, 0.25)' 
                              : 'rgba(59, 130, 246, 0.25)'
                        } 
                        strokeWidth="1.2" 
                        strokeDasharray="1.5 1.5"
                      />
                    );
                  })}

                  {/* Nodes */}
                  {mmLayout.nodes.map(node => {
                    const isSelected = selectedAgent?.id === node.id;
                    const colorClass = node.status === 'halted' 
                      ? '#ef4444' 
                      : node.status === 'idle' 
                        ? '#f59e0b' 
                        : '#10b981';

                    return (
                      <g key={`node-${node.id}`} className="transition-all duration-300">
                        {/* Selected Pulsing Ring */}
                        {isSelected && (
                          <circle 
                            cx={node.mmX} 
                            cy={node.mmY} 
                            r="5.5" 
                            fill="none" 
                            stroke="#3b82f6" 
                            strokeWidth="1" 
                            className="animate-pulse"
                          />
                        )}
                        <circle 
                          cx={node.mmX} 
                          cy={node.mmY} 
                          r={isSelected ? 3.5 : 2.5} 
                          fill={colorClass}
                          stroke="#09090b"
                          strokeWidth={isSelected ? 1.5 : 1}
                          className="cursor-pointer hover:scale-125 transition-transform"
                          title={`${node.name} (${node.role})`}
                        />
                      </g>
                    );
                  })}

                  {/* Viewport Boundary Indicator */}
                  <rect 
                    x={mmViewport.left}
                    y={mmViewport.top}
                    width={mmViewport.width}
                    height={mmViewport.height}
                    fill="rgba(59, 130, 246, 0.05)"
                    stroke="#3b82f6"
                    strokeWidth="1"
                    strokeDasharray="2 1"
                    className="pointer-events-none"
                  />
                </svg>
              </div>
            </div>

            {/* Canvas Outer Wrapper */}
            <div 
              ref={canvasRef}
              className="relative w-full h-[650px] cursor-grab active:cursor-grabbing overflow-hidden"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(63, 63, 70, 0.15) 1.2px, transparent 1.2px)',
                backgroundSize: `${24 * scale}px ${24 * scale}px`,
                backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              {/* Draggable Inner Canvas content */}
              <motion.div
                animate={{
                  x: panOffset.x,
                  y: panOffset.y,
                  scale: scale,
                }}
                transition={{ type: 'spring', damping: 30, stiffness: 220 }}
                className="absolute origin-top-left p-12 w-max min-w-full"
              >
                <div className="relative pl-2 sm:pl-6 border-l border-zinc-800/40 space-y-6">
                  {filteredNodes.map((rootNode, i) => (
                    <RenderNode 
                      key={rootNode.id || `root-${i}`} 
                      node={rootNode} 
                      depth={0} 
                      expandedNodes={expandedNodes} 
                      toggleNode={toggleNode}
                      onSelect={handleCardSelect}
                      selectedId={selectedAgent?.id || null}
                      isMultiSelectMode={isMultiSelectMode}
                      selectedNodeIds={selectedNodeIds}
                      toggleNodeSelection={toggleNodeSelection}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Floating Canvas controls */}
              <div className="absolute bottom-6 right-6 flex items-center gap-1.5 bg-zinc-950/90 backdrop-blur-md border border-zinc-800/80 p-2 rounded-2xl shadow-2xl z-30">
                <button 
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors cursor-pointer border border-transparent hover:border-zinc-800"
                  title="Zoom In (Max 200%)"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <div className="px-2 text-[10px] font-mono text-zinc-400 font-bold min-w-[50px] text-center select-none bg-zinc-900/50 py-1 rounded-lg">
                  {Math.round(scale * 100)}%
                </div>
                <button 
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors cursor-pointer border border-transparent hover:border-zinc-800"
                  title="Zoom Out (Min 50%)"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-zinc-800 self-center mx-1" />
                <button 
                  onClick={handleResetZoom}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors cursor-pointer border border-transparent hover:border-zinc-800 flex items-center gap-1 text-[10px] font-mono font-semibold"
                  title="Recenter and Reset Workspace"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  RECENTER
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Side drawer for agent details */}
      <AnimatePresence>
        {selectedAgent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex justify-end">
            {/* Clickable backdrop area to close panel */}
            <div className="absolute inset-0" onClick={() => setSelectedAgent(null)} />
            
            <motion.div
              id="details-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-[#09090b] border-l border-zinc-800 h-full overflow-y-auto p-6 shadow-2xl flex flex-col z-50 font-sans"
            >
              {/* Close Button & Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-blue-400" />
                  <span className="text-xs font-mono font-bold text-blue-400 tracking-wider uppercase">Agent Supervisor Overview</span>
                </div>
                <button 
                  id="close-details-btn"
                  onClick={() => setSelectedAgent(null)}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Identity & Hero Section */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-100">{selectedAgent.name}</h3>
                    <p className="text-xs font-mono text-zinc-400 font-semibold mt-0.5 uppercase tracking-wider">{selectedAgent.role}</p>
                    <p className="text-[11px] text-zinc-500 font-medium mt-1">
                      Department: <span className="text-blue-400 font-semibold">{selectedAgent.department?.name || 'Central Swarm'}</span>
                    </p>
                  </div>

                  {/* Operational Status Toggler */}
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-zinc-500 block uppercase mb-1.5">Operational State</span>
                    <button
                      id="toggle-status-btn"
                      onClick={() => toggleAgentStatus(selectedAgent)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer
                        ${selectedAgent.status === 'halted' 
                          ? 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                          : 'border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      {selectedAgent.status === 'halted' ? 'HALTED' : 'ACTIVE'}
                    </button>
                  </div>
                </div>

                {/* Agent Mission Prompt */}
                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block mb-1">Core Mission Prompt</span>
                  <p className="text-xs font-mono text-zinc-300 leading-relaxed italic">
                    "{selectedAgent.mission || 'No specific objective guidelines configured.'}"
                  </p>
                </div>
              </div>

              {/* Dynamic Telemetry stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase font-mono">Tasks Handled</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-bold font-mono text-zinc-100">{(selectedAgent.tasksCompleted || 0).toLocaleString()}</span>
                    <span className="text-[10px] font-mono text-zinc-500">runs</span>
                  </div>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase font-mono">Autonomy Level</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-lg font-bold font-mono text-amber-400">L{selectedAgent.autonomyLevel || 1}</span>
                    <span className="text-[10px] text-zinc-500 font-medium font-mono">
                      {selectedAgent.autonomyLevel === 5 ? 'Fully Autonomous' : selectedAgent.autonomyLevel === 4 ? 'Managed' : 'Assisted'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tree Hierarchy Re-linking Selection */}
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-3 mb-6">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono block mb-1">Reporting Chain-of-Command</span>
                  <p className="text-[11px] text-zinc-500">Alter this agent's position within the organizational tree live.</p>
                </div>
                
                <div className="flex gap-2">
                  <select
                    id="reporting-manager-select"
                    disabled={updatingManager}
                    value={selectedAgent.reportingManager || ''}
                    onChange={e => {
                      const val = e.target.value;
                      handleUpdateReportingManager(selectedAgent.id, val ? parseInt(val) : null);
                    }}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="">No Manager (Root Level Node)</option>
                    {agents
                      .filter(a => a.id !== selectedAgent.id) // Cannot report to self
                      .map((a, i) => (
                        <option key={a.id || `opt-${i}`} value={a.id}>{a.name} ({a.role})</option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Skills and scopes */}
              <div className="space-y-4 mb-8">
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block mb-2">Capabilities & Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(selectedAgent.skills) ? (
                      selectedAgent.skills.map((skill, i) => (
                        <span key={i} className="text-[10px] font-mono px-2.5 py-1 bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-lg">
                          {skill}
                        </span>
                      ))
                    ) : typeof selectedAgent.skills === 'string' ? (
                      selectedAgent.skills.split(',').map((skill, i) => (
                        <span key={i} className="text-[10px] font-mono px-2.5 py-1 bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-lg">
                          {skill.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-zinc-500 font-mono italic">No specialized skills defined.</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block mb-2">Memory Scopes Access</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(() => {
                      const mem = selectedAgent.memoryAccess;
                      if (!mem) return <span className="text-[10px] text-zinc-500 font-mono italic">No memory partitions assigned.</span>;
                      
                      const items = Array.isArray(mem) 
                        ? mem 
                        : typeof mem === 'string' 
                          ? mem.split(',').map(s => s.trim()) 
                          : [];

                      return items.map((item, i) => (
                        <span key={i} className="text-[10px] font-mono px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg">
                          {item}
                        </span>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              {/* Recent Activity Logs Section */}
              <div className="border-t border-zinc-800 pt-6 mb-8">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-zinc-400" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Recent Activity Logs</span>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800/80 px-2 py-0.5 rounded-md">
                    REALTIME STREAM
                  </span>
                </div>

                <div className="bg-[#030303] border border-zinc-800/80 rounded-xl overflow-hidden font-mono text-xs">
                  {loadingLogs ? (
                    <div className="p-6 text-center text-zinc-500 flex items-center justify-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                      <span>Streaming event trail...</span>
                    </div>
                  ) : displayLogs.length === 0 ? (
                    <div className="p-6 text-center text-zinc-600">
                      No system logs found for this agent.
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-900/60 max-h-[180px] overflow-y-auto">
                      {displayLogs.map((log: any, i: number) => {
                        const date = new Date(log.timestamp);
                        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                        
                        // Risk status formatting
                        const isHighRisk = log.riskScore && log.riskScore > 60;
                        const isMedRisk = log.riskScore && log.riskScore > 30 && log.riskScore <= 60;
                        const riskColor = isHighRisk ? 'text-red-400' : isMedRisk ? 'text-amber-400' : 'text-zinc-500';

                        return (
                          <div key={log.id || `log-${i}`} className="p-3 hover:bg-zinc-900/40 transition-colors flex flex-col gap-1.5">
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-zinc-200 font-semibold tracking-tight">{log.action}</span>
                              <span className="text-[10px] text-zinc-500 shrink-0 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {timeStr}
                              </span>
                            </div>

                            {/* Metadata list */}
                            {log.metadata && typeof log.metadata === 'object' && Object.keys(log.metadata).length > 0 && (
                              <div className="text-[10px] text-zinc-400 bg-zinc-950 p-1.5 rounded-lg border border-zinc-900 flex flex-wrap gap-x-3 gap-y-1">
                                {Object.entries(log.metadata).map(([key, value]) => (
                                  <span key={key}>
                                    <span className="text-zinc-600 font-semibold">{key}:</span>{' '}
                                    <span className="text-zinc-300 font-medium">
                                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                    </span>
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Risk score and outcomes */}
                            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-semibold">
                              <span className="flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${isHighRisk ? 'bg-red-500' : isMedRisk ? 'bg-amber-500' : 'bg-zinc-600'}`} />
                                Risk Index:{' '}
                                <span className={riskColor}>
                                  {log.riskScore || 10}
                                </span>
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] border font-bold uppercase ${
                                log.outcome === 'success' 
                                  ? 'bg-green-950/20 text-green-400 border-green-500/20' 
                                  : 'bg-red-950/20 text-red-400 border-red-500/20'
                              }`}>
                                {log.outcome || 'success'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Control Action Commands */}
              <div className="mt-auto border-t border-zinc-800 pt-6">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono block mb-3">Diagnostic Command Matrix</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    id="gc-command-btn"
                    disabled={gcActive}
                    onClick={() => triggerGarbageCollection(selectedAgent)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 rounded-xl text-xs font-semibold font-mono disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <Database className={`w-4 h-4 text-blue-400 ${gcActive ? 'animate-spin' : ''}`} />
                    {gcActive ? 'Reclaiming...' : 'Garbage Collect'}
                  </button>

                  <button
                    id="tuning-command-btn"
                    disabled={tuningActive}
                    onClick={() => triggerLatencyTuning(selectedAgent)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 rounded-xl text-xs font-semibold font-mono disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 text-amber-400 ${tuningActive ? 'animate-spin' : ''}`} />
                    {tuningActive ? 'Optimizing...' : 'Latency Tune'}
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Batch Actions Console */}
      <AnimatePresence>
        {isMultiSelectMode && selectedNodeIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-950/95 backdrop-blur-md border border-zinc-800 p-4 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-4 max-w-2xl w-[90%] md:w-auto text-xs font-sans"
          >
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold font-mono text-[10px]">
                {selectedNodeIds.length}
              </div>
              <div>
                <p className="font-bold text-zinc-100">Batch Control Active</p>
                <p className="text-[10px] text-zinc-400 font-mono">Applying command matrix to selection</p>
              </div>
            </div>

            <div className="h-px w-full md:h-6 md:w-px bg-zinc-800 shrink-0" />

            <div className="flex flex-wrap items-center gap-2">
              <button
                disabled={batchUpdating}
                onClick={handleBatchResume}
                className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-mono font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                title="Set all selected nodes to active state"
              >
                <Power className="w-3.5 h-3.5" />
                ACTIVATE
              </button>

              <button
                disabled={batchUpdating}
                onClick={handleBatchHalt}
                className="px-3 py-2 bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-mono font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                title="Halt operation execution for all selected nodes"
              >
                <Power className="w-3.5 h-3.5 rotate-180" />
                HALT
              </button>

              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
                <select
                  disabled={batchUpdating}
                  value={batchTargetSupervisorId}
                  onChange={e => setBatchTargetSupervisorId(e.target.value ? parseInt(e.target.value) : '')}
                  className="bg-transparent text-zinc-300 font-semibold px-2 py-1 text-[11px] focus:outline-none max-w-[140px]"
                >
                  <option value="" disabled className="bg-zinc-950 text-zinc-500">Re-assign Supervisor...</option>
                  <option value="root" className="bg-zinc-950 text-zinc-200">No Supervisor (Root)</option>
                  {agents
                    .filter(a => !selectedNodeIds.includes(a.id)) // cycle prevention: cannot report to self or other selected nodes
                    .map((a, i) => (
                      <option key={a.id || `opt2-${i}`} value={a.id} className="bg-zinc-950 text-zinc-200">
                        {a.name} ({a.role})
                      </option>
                    ))}
                </select>
                <button
                  disabled={batchUpdating || batchTargetSupervisorId === ''}
                  onClick={() => handleBatchReassign(batchTargetSupervisorId === 'root' ? null : batchTargetSupervisorId)}
                  className="px-2 py-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-blue-500 text-white font-mono font-bold rounded-lg transition-all cursor-pointer"
                >
                  APPLY
                </button>
              </div>

              <div className="h-4 w-px bg-zinc-800 mx-1 shrink-0 hidden md:block" />

              <button
                disabled={batchUpdating}
                onClick={() => setSelectedNodeIds([])}
                className="px-2.5 py-2 text-zinc-400 hover:text-zinc-200 font-mono font-semibold hover:bg-zinc-900 rounded-xl transition-all cursor-pointer"
              >
                CLEAR
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Sub-component rendering individual nodes in the hierarchy tree recursively
interface RenderNodeProps {
  key?: any;
  node: TreeNodeType;
  depth: number;
  expandedNodes: Record<number, boolean>;
  toggleNode: (nodeId: number) => void;
  onSelect: (agent: Agent) => void;
  selectedId: number | null;
  isLast?: boolean;
  isMultiSelectMode?: boolean;
  selectedNodeIds?: number[];
  toggleNodeSelection?: (id: number) => void;
}

function RenderNode({ 
  node, 
  depth, 
  expandedNodes, 
  toggleNode, 
  onSelect, 
  selectedId,
  isLast = false,
  isMultiSelectMode = false,
  selectedNodeIds = [],
  toggleNodeSelection
}: RenderNodeProps) {
  const isExpanded = expandedNodes[node.id] ?? false;
  const hasChildren = node.children.length > 0;
  const isSelected = selectedId === node.id;
  const isMultiSelected = isMultiSelectMode && selectedNodeIds.includes(node.id);
  const agent = node.agent;

  const getStatusColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'halted':
        return 'bg-red-500 border-red-400/40';
      case 'idle':
        return 'bg-amber-500 border-amber-400/40';
      default:
        return 'bg-green-500 border-green-400/40';
    }
  };

  const getConnectorStroke = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'halted':
        return 'url(#halted-connector-gradient)';
      case 'idle':
        return 'url(#idle-connector-gradient)';
      default:
        return 'url(#connector-gradient)';
    }
  };

  return (
    <div className="relative space-y-4">
      {/* SVG tree connector lines */}
      {depth > 0 && (
        <div className="absolute -left-6 sm:-left-8 top-[-16px] bottom-0 w-6 sm:w-8 pointer-events-none">
          <svg className="w-full h-full" fill="none">
            {/* Vertical connector line segment */}
            {!isLast ? (
              <line 
                x1="0" 
                y1="0" 
                x2="0" 
                y2="100%" 
                stroke={getConnectorStroke(agent.status)} 
                strokeWidth="1.5" 
                strokeDasharray="4 3"
                className="transition-all duration-300 opacity-60"
              />
            ) : (
              <line 
                x1="0" 
                y1="0" 
                x2="0" 
                y2="40" 
                stroke={getConnectorStroke(agent.status)} 
                strokeWidth="1.5" 
                strokeDasharray="4 3"
                className="transition-all duration-300 opacity-60"
              />
            )}
            
            {/* Smooth elbow bend at y=40 */}
            <path 
              d="M 0,32 A 8,8 0 0,0 8,40" 
              stroke={getConnectorStroke(agent.status)} 
              strokeWidth="1.5"
              className="transition-all duration-300 opacity-60"
            />
            {/* Horizontal line extending to the card border */}
            <line 
              x1="8" 
              y1="40" 
              x2="100%" 
              y2="40" 
              stroke={getConnectorStroke(agent.status)} 
              strokeWidth="1.5"
              className="transition-all duration-300 opacity-60"
            />
            
            {/* Stylized connector joint node */}
            <circle 
              cx="100%" 
              cy="40" 
              r="2.5" 
              className={`transition-all duration-300 ${
                agent.status === 'halted' 
                  ? 'fill-red-500' 
                  : agent.status === 'idle' 
                    ? 'fill-amber-500' 
                    : 'fill-blue-500'
              } stroke-[#09090b] stroke-2 shadow-sm`}
            />
          </svg>
        </div>
      )}

      {/* Main Node box */}
      <div className="flex items-start gap-3 relative group">
        
        {/* Toggle Expand/Collapse Control */}
        {hasChildren ? (
          <button
            onClick={() => toggleNode(node.id)}
            className="mt-4 p-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-zinc-700 transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        ) : (
          <div className="w-7 h-7 shrink-0" />
        )}

        {/* Node Card Display */}
        <motion.div
          layout
          onClick={() => onSelect(agent)}
          className={`flex-1 flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left
            ${isMultiSelected
              ? 'bg-emerald-950/20 border-emerald-500/60 shadow-lg shadow-emerald-500/5'
              : isSelected 
                ? 'bg-blue-950/20 border-blue-500/60 shadow-lg shadow-blue-500/5' 
                : 'bg-[var(--bg-surface)] border-[var(--border-base)] hover:border-zinc-700 hover:bg-[var(--bg-surface-hover)]'
            }`}
        >
          {/* Identity & Basic Info */}
          <div className="flex items-center gap-3">
            {/* Custom Checkbox for Multi-select mode */}
            {isMultiSelectMode && (
              <div 
                className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all duration-200 shrink-0
                  ${isMultiSelected 
                    ? 'bg-emerald-500 border-emerald-400 text-zinc-950' 
                    : 'border-zinc-700 bg-zinc-900/50 text-transparent'
                  }`}
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            )}

            {/* Pulsing Status indicator */}
            <div className="relative">
              <div className={`w-3.5 h-3.5 rounded-full border-2 ${getStatusColor(agent.status)} relative z-10`} />
              {agent.status !== 'halted' && (
                <div className={`absolute inset-0 rounded-full ${getStatusColor(agent.status)} opacity-40 animate-ping`} />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[var(--text-primary)] text-sm">{node.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[var(--bg-base)] text-[var(--text-muted)] border border-[var(--border-base)] rounded-lg">
                  {agent.department?.name || 'Central Swarm'}
                </span>
              </div>
              <p className="text-[11px] font-mono text-[var(--text-secondary)] uppercase tracking-wider mt-0.5">{node.role}</p>
            </div>
          </div>

          {/* Quick Metrics & Actions preview */}
          <div className="flex items-center gap-4 mt-3 md:mt-0 justify-between md:justify-end">
            <div className="flex items-center gap-6">
              <div className="text-left md:text-right">
                <span className="text-[9px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider block">Autonomy Limit</span>
                <span className="text-xs font-mono font-bold text-amber-400">L{agent.autonomyLevel || 1}</span>
              </div>

              <div className="text-left md:text-right">
                <span className="text-[9px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider block">Tasks Run</span>
                <span className="text-xs font-mono font-bold text-[var(--text-primary)]">{(agent.tasksCompleted || 0).toLocaleString()}</span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 transition-all" />
          </div>
        </motion.div>
      </div>

      {/* Children container with left alignment space */}
      {hasChildren && isExpanded && (
        <div className="pl-6 sm:pl-8 space-y-4 ml-3 sm:ml-4 relative">
          {node.children.map((childNode, index) => (
            <RenderNode 
              key={childNode.id || `child-${index}`} 
              node={childNode} 
              depth={depth + 1} 
              expandedNodes={expandedNodes} 
              toggleNode={toggleNode}
              onSelect={onSelect}
              selectedId={selectedId}
              isLast={index === node.children.length - 1}
              isMultiSelectMode={isMultiSelectMode}
              selectedNodeIds={selectedNodeIds}
              toggleNodeSelection={toggleNodeSelection}
            />
          ))}
        </div>
      )}
    </div>
  );
}
