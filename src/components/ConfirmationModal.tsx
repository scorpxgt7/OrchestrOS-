import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, Settings, Info, Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  showProgressBar?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  showProgressBar = true,
}: ConfirmationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
      setProgress(0);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    if (showProgressBar) {
      // Simulate/Show progress bar incrementing
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 50);

      try {
        await onConfirm();
        setProgress(100);
        setTimeout(() => {
          onClose();
        }, 300);
      } catch (err) {
        clearInterval(interval);
        setIsSubmitting(false);
        setProgress(0);
      }
    } else {
      try {
        await onConfirm();
        onClose();
      } catch (err) {
        setIsSubmitting(false);
      }
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 className="w-5 h-5 text-rose-400" />,
          iconBg: 'bg-rose-500/10 border-rose-500/20',
          confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/10',
          accentColor: 'rose',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
          iconBg: 'bg-amber-500/10 border-amber-500/20',
          confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/10',
          accentColor: 'amber',
        };
      case 'info':
      default:
        return {
          icon: <Settings className="w-5 h-5 text-blue-400" />,
          iconBg: 'bg-blue-500/10 border-blue-500/20',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10',
          accentColor: 'blue',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isSubmitting && onClose()}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-[var(--bg-surface)] border border-[var(--border-base)] w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden z-10"
          >
            {/* Header / Icon */}
            <div className="p-5 border-b border-[var(--border-base)] flex justify-between items-center bg-[var(--bg-base)]/40">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${styles.iconBg} flex items-center justify-center`}>
                  {styles.icon}
                </div>
                <h3 className="font-bold text-[var(--text-primary)] text-lg leading-none">{title}</h3>
              </div>
              {!isSubmitting && (
                <button
                  onClick={onClose}
                  className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-base)] p-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {message}
              </p>
              {description && (
                <div className="p-3 bg-[var(--bg-base)] rounded-xl border border-[var(--border-base)] flex gap-2.5">
                  <Info className="w-4 h-4 text-[var(--text-muted)] mt-0.5 shrink-0" />
                  <div className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                    {description}
                  </div>
                </div>
              )}

              {/* Progress Bar Component */}
              {isSubmitting && showProgressBar && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                    <span>Processing Action...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--bg-base)] rounded-full overflow-hidden border border-[var(--border-base)]">
                    <motion.div
                      className={`h-full ${
                        variant === 'danger'
                          ? 'bg-rose-500'
                          : variant === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                      initial={{ width: '0%' }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions / Footer */}
            <div className="p-4 bg-[var(--bg-base)]/40 border-t border-[var(--border-base)] flex justify-end gap-3">
              <button
                disabled={isSubmitting}
                onClick={onClose}
                className="px-4 py-2 border border-[var(--border-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleConfirm}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5 ${styles.confirmBtn} disabled:opacity-50`}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    {confirmText}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
