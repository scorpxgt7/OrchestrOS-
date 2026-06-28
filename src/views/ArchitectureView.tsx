import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { fetchApi } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { motion, AnimatePresence } from 'motion/react';

interface Agent {
  id: number;
  name: string;
  role: string;
  reportingManager: number | null;
  status: string;
}

export function ArchitectureView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const { showToast } = useToast();

  const [nodes, setNodes] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null);

  const [draggedNodeId, setDraggedNodeId] = useState<number | null>(null);
  const [targetNodeId, setTargetNodeId] = useState<number | null>(null);
  const [transform, setTransform] = useState(d3.zoomIdentity);

  const loadAgents = async () => {
    try {
      const data = await fetchApi('/agents');
      setAgents(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load agents');
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  useEffect(() => {
    if (!agents.length || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const newNodes = agents.map(d => {
      const existingNode = nodes.find(n => n.id === d.id);
      return {
        ...d,
        x: existingNode ? existingNode.x : width / 2 + (Math.random() - 0.5) * 100,
        y: existingNode ? existingNode.y : height / 2 + (Math.random() - 0.5) * 100,
        vx: existingNode?.vx || 0,
        vy: existingNode?.vy || 0,
        fx: existingNode?.fx,
        fy: existingNode?.fy
      };
    });

    const newLinks = agents
      .filter(d => d.reportingManager !== null)
      .map(d => ({
        source: newNodes.find(n => n.id === d.reportingManager) || newNodes[0],
        target: newNodes.find(n => n.id === d.id)!
      }))
      .filter(l => l.source && l.target);

    const simulation = d3.forceSimulation(newNodes)
      .force("link", d3.forceLink(newLinks).id((d: any) => d.id).distance(180))
      .force("charge", d3.forceManyBody().strength(-600))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(70));

    simulation.on("tick", () => {
      setNodes([...newNodes]);
      setLinks([...newLinks]);
    });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [agents]);

  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        setTransform(event.transform);
      });
    svg.call(zoom);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)]">
      <div className="p-6 border-b border-[var(--border-base)] flex flex-col md:flex-row gap-4 items-start md:items-center justify-between z-10 bg-[var(--bg-base)]">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-base)]">Architecture Canvas</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">Interactive graph of your organizational swarm. Drag an agent onto another to change the reporting structure.</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span> Active
           </div>
           <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span className="w-3 h-3 rounded-full bg-slate-500 inline-block"></span> Inactive
           </div>
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden" ref={containerRef}>
        <svg 
          ref={svgRef} 
          className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing"
          style={{ background: 'var(--bg-surface)' }}
        >
          <defs>
            <marker
              id="arrowhead"
              viewBox="-0 -5 10 10"
              refX="35"
              refY="0"
              orient="auto"
              markerWidth="8"
              markerHeight="8"
            >
              <path d="M 0,-5 L 10 ,0 L 0,5" fill="#64748b" style={{ stroke: "none" }} />
            </marker>
          </defs>
          <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
            <g className="links">
              {links.map((link, i) => (
                <line
                  key={`link-${i}`}
                  x1={link.source.x}
                  y1={link.source.y}
                  x2={link.target.x}
                  y2={link.target.y}
                  stroke="#64748b"
                  strokeOpacity={0.6}
                  strokeWidth={2}
                  markerEnd="url(#arrowhead)"
                />
              ))}
            </g>
            <g className="nodes">
              <AnimatePresence>
                {nodes.map(node => (
                  <motion.g
                    key={node.id}
                    transform={`translate(${node.x || 0}, ${node.y || 0})`}
                    animate={{
                      scale: draggedNodeId === node.id ? 1.15 : targetNodeId === node.id ? 1.25 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    onPanStart={(e, info) => {
                      setDraggedNodeId(node.id);
                      if (simulationRef.current) simulationRef.current.alphaTarget(0.3).restart();
                      node.fx = node.x;
                      node.fy = node.y;
                    }}
                    onPan={(e, info) => {
                      node.fx = node.fx + info.delta.x / transform.k;
                      node.fy = node.fy + info.delta.y / transform.k;
                      
                      const hoveredNode = nodes.find((n: any) => 
                        n.id !== node.id && 
                        Math.hypot(n.x - node.fx, n.y - node.fy) < 50
                      );
                      setTargetNodeId(hoveredNode ? hoveredNode.id : null);
                    }}
                    onPanEnd={async (e, info) => {
                      node.fx = null;
                      node.fy = null;
                      if (simulationRef.current) simulationRef.current.alphaTarget(0);

                      if (targetNodeId && targetNodeId !== node.id) {
                        const draggedAgent = agents.find(a => a.id === node.id);
                        const targetAgent = agents.find(a => a.id === targetNodeId);
                        if (draggedAgent && targetAgent) {
                          try {
                            showToast(`Updating ${draggedAgent.name}'s manager to ${targetAgent.name}...`);
                            await fetchApi(`/agents/${node.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ reportingManager: targetNodeId })
                            });
                            loadAgents();
                          } catch (error) {
                            console.error(error);
                            showToast(`Failed to update ${draggedAgent.name}`);
                          }
                        }
                      }
                      setDraggedNodeId(null);
                      setTargetNodeId(null);
                    }}
                    style={{ cursor: draggedNodeId === node.id ? 'grabbing' : 'grab', touchAction: 'none' }}
                  >
                    <motion.circle
                      r={30}
                      fill={node.status === 'active' ? '#3b82f6' : '#64748b'}
                      animate={{
                         stroke: targetNodeId === node.id ? '#22c55e' : '#1e293b',
                         strokeWidth: targetNodeId === node.id ? 5 : 3
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                    <text
                      dy={-40}
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize="14px"
                      fontWeight="bold"
                      style={{ pointerEvents: 'none' }}
                    >
                      {node.name}
                    </text>
                    <text
                      dy={45}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="12px"
                      style={{ pointerEvents: 'none' }}
                    >
                      {node.role}
                    </text>
                  </motion.g>
                ))}
              </AnimatePresence>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}

