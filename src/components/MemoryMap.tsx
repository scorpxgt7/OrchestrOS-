import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { MemoryRecord } from '../types/memory';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Hash, Link as LinkIcon, Calendar, Info } from 'lucide-react';

interface MemoryMapProps {
  memories: MemoryRecord[];
}

interface TooltipData {
  x: number;
  y: number;
  node: any;
  memoryData?: MemoryRecord;
}

export function MemoryMap({ memories }: MemoryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Build graph data
    const nodes: any[] = [];
    const links: any[] = [];
    const nodeSet = new Set<string>();
    
    // Add memory nodes
    memories.forEach(m => {
      nodes.push({ id: m.id, group: 'memory', title: m.title, category: m.category, memoryData: m });
      nodeSet.add(m.id);
    });
    
    // Add graphNodes and tags as entity nodes
    memories.forEach(m => {
      m.indexing.graphNodes.forEach(gn => {
        if (!nodeSet.has(gn)) {
          nodes.push({ id: gn, group: 'entity', title: gn });
          nodeSet.add(gn);
        }
        links.push({ source: m.id, target: gn, value: 1 });
      });
      
      m.tags.forEach(t => {
        const tagId = `tag:${t}`;
        if (!nodeSet.has(tagId)) {
          nodes.push({ id: tagId, group: 'tag', title: `#${t}` });
          nodeSet.add(tagId);
        }
        links.push({ source: m.id, target: tagId, value: 1 });
      });
    });

    const width = containerRef.current.clientWidth || 800;
    const height = 600;

    d3.select(containerRef.current).selectAll('svg').remove();

    const svg = d3.select(containerRef.current)
      .append("svg")
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(30));

    // Define drag behavior
    const drag = (sim: any) => {
      function dragstarted(event: any) {
        if (!event.active) sim.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event: any) {
        if (!event.active) sim.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    };

    const link = svg.append("g")
      .attr("stroke", "rgba(255, 255, 255, 0.15)")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d: any) => Math.sqrt(d.value));

    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag(simulation) as any)
      .on('mouseover', (event, d) => {
        setTooltip({
          x: event.clientX,
          y: event.clientY,
          node: d,
          memoryData: d.memoryData
        });
        d3.select(event.currentTarget).select("circle").attr("stroke", "#fff").attr("stroke-width", 2.5);
      })
      .on('mousemove', (event, d) => {
        setTooltip({
          x: event.clientX,
          y: event.clientY,
          node: d,
          memoryData: d.memoryData
        });
      })
      .on('mouseout', (event) => {
        setTooltip(null);
        d3.select(event.currentTarget).select("circle").attr("stroke", "rgba(0,0,0,0.5)").attr("stroke-width", 1.5);
      });

    node.append("circle")
      .attr("r", (d: any) => d.group === 'memory' ? 12 : (d.group === 'tag' ? 6 : 8))
      .attr("fill", (d: any) => {
        if (d.group === 'memory') {
          if (d.category === 'user') return '#38bdf8';
          if (d.category === 'org') return '#818cf8';
          if (d.category === 'task') return '#fbbf24';
          if (d.category === 'agent') return '#34d399';
          return '#fb7185';
        }
        if (d.group === 'tag') return '#94a3b8';
        return '#cbd5e1';
      })
      .attr("stroke", "rgba(0,0,0,0.5)")
      .attr("stroke-width", 1.5);
      
    // Text label
    node.append("text")
      .text((d: any) => d.title)
      .attr('x', 14)
      .attr('y', 4)
      .attr('font-size', '11px')
      .attr('fill', '#94a3b8')
      .attr('font-weight', (d: any) => d.group === 'memory' ? 'bold' : 'normal')
      .attr('font-family', 'ui-sans-serif, system-ui, -apple-system, sans-serif')
      .style('pointer-events', 'none');

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

  }, [memories]);

  return (
    <div className="relative w-full">
      <div 
        ref={containerRef} 
        className="w-full bg-[#0a0a0a] border border-[var(--border-base)] rounded-xl overflow-hidden shadow-inner cursor-grab active:cursor-grabbing" 
        style={{ minHeight: '600px' }}
      />
      
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 pointer-events-none"
            style={{ 
              left: tooltip.x + 15, 
              top: tooltip.y + 15,
              transform: 'translate(0, 0)' // Prevent off-screen issues roughly
            }}
          >
            <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] p-4 rounded-xl shadow-2xl max-w-xs w-[320px]">
              {tooltip.node.group === 'memory' && tooltip.memoryData ? (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-blue-400">
                      <Brain className="w-4 h-4" />
                      <span className="text-[10px] uppercase tracking-wider font-bold">{tooltip.memoryData.category} memory</span>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">{tooltip.memoryData.id.split('-')[0]}</span>
                  </div>
                  
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">{tooltip.memoryData.title}</h4>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-3">{tooltip.memoryData.content}</p>
                  
                  <div className="pt-2 border-t border-[var(--border-base)]/50 grid grid-cols-2 gap-2 text-[10px]">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[var(--text-tertiary)] flex items-center gap-1"><Info className="w-3 h-3" /> Dept</span>
                      <span className="font-medium text-[var(--text-secondary)]">{tooltip.memoryData.dept || 'System'}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[var(--text-tertiary)] flex items-center gap-1"><Calendar className="w-3 h-3" /> Updated</span>
                      <span className="font-medium text-[var(--text-secondary)]">{tooltip.memoryData.updated}</span>
                    </div>
                  </div>
                </div>
              ) : tooltip.node.group === 'tag' ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Hash className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">{tooltip.node.title}</h4>
                    <p className="text-xs text-[var(--text-muted)]">Topic / Category Tag</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">{tooltip.node.title}</h4>
                    <p className="text-xs text-[var(--text-muted)]">Knowledge Graph Entity</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
