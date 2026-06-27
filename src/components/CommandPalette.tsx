import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Command, Home, CheckSquare, Users, Database, ShieldAlert, History, Workflow, Gavel, Monitor, Settings } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  const commands = [
    { id: 'dashboard', icon: <Home className="w-4 h-4" />, label: 'Go to Dashboard', action: () => onNavigate('dashboard') },
    { id: 'command-center', icon: <Monitor className="w-4 h-4" />, label: 'Go to Command Center', action: () => onNavigate('command-center') },
    { id: 'tasks', icon: <CheckSquare className="w-4 h-4" />, label: 'Go to Tasks & Workflows', action: () => onNavigate('tasks') },
    { id: 'agent-builder', icon: <Users className="w-4 h-4" />, label: 'Go to Agent Builder', action: () => onNavigate('agent-builder') },
    { id: 'memory', icon: <Database className="w-4 h-4" />, label: 'Go to System Memory', action: () => onNavigate('memory') },
    { id: 'risk', icon: <ShieldAlert className="w-4 h-4" />, label: 'Go to Risk Engine', action: () => onNavigate('risk') },
    { id: 'automation', icon: <Workflow className="w-4 h-4" />, label: 'Go to Automation', action: () => onNavigate('automation') },
    { id: 'governance', icon: <Gavel className="w-4 h-4" />, label: 'Go to Governance', action: () => onNavigate('governance') },
    { id: 'audit', icon: <History className="w-4 h-4" />, label: 'Go to Audit Logs', action: () => onNavigate('audit') },
    { id: 'settings', icon: <Settings className="w-4 h-4" />, label: 'Go to Settings', action: () => onNavigate('settings') },
  ];

  const filteredCommands = commands.filter(c => c.label.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex + 1] as HTMLElement; // +1 for the section title
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4 font-sans">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="flex items-center px-4 py-3 border-b border-[var(--border-base)]">
            <Search className="w-5 h-5 text-[var(--text-muted)] mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)] text-base"
              onKeyDown={(e) => {
                if (e.key === 'Escape') onClose();
                else if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setSelectedIndex((prev) => Math.max(prev - 1, 0));
                } else if (e.key === 'Enter' && filteredCommands.length > 0) {
                  filteredCommands[selectedIndex].action();
                  onClose();
                }
              }}
            />
            <div className="flex items-center gap-1 ml-2 px-1.5 py-1 rounded bg-[var(--bg-base)] border border-[var(--border-base)] text-[var(--text-tertiary)] text-[10px] font-mono font-bold tracking-widest">
              ESC
            </div>
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto p-2 no-scrollbar" ref={listRef}>
            {filteredCommands.length > 0 ? (
              <>
                <div className="px-3 py-2 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Navigation</div>
                {filteredCommands.map((cmd, index) => (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      index === selectedIndex 
                        ? 'bg-[var(--bg-base)] text-[var(--text-base)]' 
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-base)]/50'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-md border flex items-center justify-center transition-colors ${
                      index === selectedIndex ? 'bg-[var(--bg-surface)] border-[var(--border-muted)] text-[var(--text-base)]' : 'bg-[var(--bg-base)] border-[var(--border-base)] text-[var(--text-muted)]'
                    }`}>
                      {cmd.icon}
                    </div>
                    <span className="text-sm font-medium">{cmd.label}</span>
                  </button>
                ))}
              </>
            ) : (
              <div className="py-10 px-4 text-center text-[var(--text-muted)]">
                <p className="text-sm">No commands found for "{search}"</p>
              </div>
            )}
          </div>
          <div className="bg-[var(--bg-base)]/50 border-t border-[var(--border-base)] px-4 py-2.5 flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><kbd className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded px-1.5 py-0.5 font-mono shadow-sm">↑</kbd><kbd className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded px-1.5 py-0.5 font-mono shadow-sm">↓</kbd> navigate</span>
              <span className="flex items-center gap-1.5"><kbd className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded px-1.5 py-0.5 font-mono shadow-sm">↵</kbd> select</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
