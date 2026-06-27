import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight } from 'lucide-react';

export function GuidedTour({ currentView }: { currentView: string }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasCompletedTour = localStorage.getItem('tour-completed');
    if (!hasCompletedTour && currentView === 'dashboard') {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [currentView]);

  const completeTour = () => {
    localStorage.setItem('tour-completed', 'true');
    setIsVisible(false);
  };

  if (!isVisible || currentView !== 'dashboard') return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] pointer-events-none">
        {/* Highlight window for sidebar */}
        <div className="absolute top-2 bottom-2 left-2 w-60 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] ring-2 ring-blue-500/50 pointer-events-auto backdrop-blur-none transition-all" />

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="absolute top-24 left-[270px] w-80 max-w-[calc(100vw-290px)] bg-[var(--bg-surface)] border border-blue-500/30 p-5 rounded-xl shadow-2xl pointer-events-auto"
        >
          {/* Arrow pointing left */}
          <div className="absolute top-6 -left-3 w-3 h-3 bg-[var(--bg-surface)] border-l border-b border-blue-500/30 transform rotate-45" />

          <button 
            onClick={completeTour}
            className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--text-base)] transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
          
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Welcome to OrchestrOS</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-5 leading-relaxed">
            This is your main navigation panel. Use it to access the Command Center, build organizations, monitor agents, and view audit logs.
          </p>
          
          <div className="flex justify-end">
            <button
              onClick={completeTour}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-blue-500/10"
            >
              Get Started <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
