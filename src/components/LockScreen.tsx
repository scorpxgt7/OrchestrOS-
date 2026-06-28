import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ShieldAlert, Key, Unlock, Clock, Eye, EyeOff, User, RefreshCw, Settings, Sliders } from 'lucide-react';
import { auditService } from '../services/auditService';
import { useToast } from '../contexts/ToastContext';
import { fetchApi } from '../lib/api';
import { auth } from '../lib/firebase';

export function LockScreen() {
  const { showToast } = useToast();
  const [isLocked, setIsLocked] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningCountdown, setWarningCountdown] = useState(15);
  const [timeoutMinutes, setTimeoutMinutes] = useState(2); // default 2 minutes
  const [showSettings, setShowSettings] = useState(false);

  // Lockscreen inputs
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const lastActivityTime = useRef<number>(Date.now());
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mainCheckTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [inactivityLockEnabled, setInactivityLockEnabled] = useState(true);

  // Fetch current user email and org settings on load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const org = await fetchApi('/organizations/current');
        const firebaseUser = auth.currentUser;
        if (org) {
          setCurrentUser({
            email: firebaseUser?.email || 'User',
            orgName: org.name || 'OrchestrOS'
          });
          if (org.settings?.inactivityLockEnabled !== undefined) {
            setInactivityLockEnabled(org.settings.inactivityLockEnabled);
          }
        }
      } catch (err) {
        console.error('Failed to load user for lock screen:', err);
        const firebaseUser = auth.currentUser;
        setCurrentUser({ email: firebaseUser?.email || 'User', orgName: 'OrchestrOS' });
      }
    };
    fetchUser();
  }, []);

  // Update activity timestamp on user interaction
  const resetActivity = () => {
    lastActivityTime.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      setWarningCountdown(15);
      // Log event
      auditService.logEvent({
        action: 'Session Active Restored',
        metadata: { trigger: 'User interaction during warning' },
        outcome: 'success'
      });
    }
  };

  // Listen to mouse, touch, key events to keep session active
  useEffect(() => {
    if (isLocked) return;

    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, resetActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetActivity);
      });
    };
  }, [isLocked, showWarning]);

  // Main inactivity checker
  useEffect(() => {
    if (isLocked) {
      if (mainCheckTimerRef.current) clearInterval(mainCheckTimerRef.current);
      return;
    }

    // Check inactivity every second
    mainCheckTimerRef.current = setInterval(() => {
      if (!inactivityLockEnabled || timeoutMinutes === 0) return; // Inactivity lock disabled

      const inactiveDurationMs = Date.now() - lastActivityTime.current;
      const thresholdMs = timeoutMinutes * 60 * 1000;
      const warningThresholdMs = thresholdMs - 15000; // Warn 15s before threshold

      if (inactiveDurationMs >= thresholdMs) {
        // LOCK THE SCREEN completely
        lockSession();
      } else if (inactiveDurationMs >= warningThresholdMs && !showWarning) {
        // Show warning countdown
        setShowWarning(true);
        const remainingSeconds = Math.max(1, Math.round((thresholdMs - inactiveDurationMs) / 1000));
        setWarningCountdown(remainingSeconds);
      } else if (showWarning) {
        const remainingSeconds = Math.max(0, Math.round((thresholdMs - inactiveDurationMs) / 1000));
        setWarningCountdown(remainingSeconds);
        if (remainingSeconds <= 0) {
          lockSession();
        }
      }
    }, 1000);

    return () => {
      if (mainCheckTimerRef.current) clearInterval(mainCheckTimerRef.current);
    };
  }, [isLocked, timeoutMinutes, showWarning, inactivityLockEnabled]);

  const lockSession = () => {
    setIsLocked(true);
    setShowWarning(false);
    setPasscode('');
    // Log event
    auditService.logEvent({
      action: 'Session Auto-Locked',
      metadata: { inactivityMinutes: timeoutMinutes },
      outcome: 'success'
    });
    showToast('Dashboard locked due to inactivity', 'info');
  };

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passcode.trim()) return;

    setIsVerifying(true);
    setHasError(false);

    // Simulate verification
    setTimeout(() => {
      if (passcode === 'admin' || passcode === '1234') {
        setIsLocked(false);
        setPasscode('');
        auditService.logEvent({
          action: 'Dashboard Re-authenticated',
          metadata: { method: 'PIN/Passcode verification' },
          outcome: 'success'
        });
        showToast('Dashboard successfully unlocked', 'success');
        lastActivityTime.current = Date.now();
      } else {
        setHasError(true);
        auditService.logEvent({
          action: 'Failed Re-authentication Attempt',
          metadata: { enteredValue: '[REDACTED]' },
          outcome: 'failure'
        });
        showToast('Invalid passcode. Use "admin" or "1234" to bypass.', 'error');
      }
      setIsVerifying(false);
    }, 800);
  };

  const handleQuickBypass = () => {
    setIsLocked(false);
    setPasscode('');
    auditService.logEvent({
      action: 'Dashboard Re-authenticated',
      metadata: { method: 'Quick developer bypass' },
      outcome: 'success'
    });
    showToast('Dashboard unlocked via Quick Bypass', 'success');
    lastActivityTime.current = Date.now();
  };

  const handleNumpadClick = (num: string) => {
    setPasscode(prev => prev + num);
    setHasError(false);
  };

  const handleNumpadClear = () => {
    setPasscode('');
    setHasError(false);
  };

  const handleNumpadBackspace = () => {
    setPasscode(prev => prev.slice(0, -1));
    setHasError(false);
  };

  return (
    <>
      {/* 1. WARNING BANNER/MODAL */}
      <AnimatePresence>
        {showWarning && !isLocked && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={resetActivity}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[var(--bg-surface)] border border-amber-500/20 w-full max-w-sm rounded-2xl shadow-2xl relative overflow-hidden z-10 p-6 text-center space-y-6"
            >
              <div className="mx-auto w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-amber-400 animate-pulse">
                <ShieldAlert className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-[var(--text-primary)] text-xl">Inactivity Timeout Warning</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  You have been inactive. The OrchestrOS workspace will lock automatically to protect sovereign keys and agents.
                </p>
              </div>

              {/* Circular countdown and warning ticker */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative flex items-center justify-center w-24 h-24">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      className="text-[var(--border-base)]"
                      strokeWidth="6"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    <motion.circle
                      cx="48"
                      cy="48"
                      r="40"
                      className="text-amber-500"
                      strokeWidth="6"
                      strokeDasharray={251.2}
                      initial={{ strokeDashoffset: 0 }}
                      animate={{ strokeDashoffset: 251.2 * (1 - warningCountdown / 15) }}
                      transition={{ duration: 1, ease: 'linear' }}
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>
                  <span className="absolute text-2xl font-bold font-mono text-amber-400">
                    {warningCountdown}s
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={lockSession}
                  className="flex-1 px-4 py-2.5 border border-[var(--border-base)] hover:bg-[var(--border-base)]/20 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Lock Now
                </button>
                <button
                  onClick={resetActivity}
                  className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Keep Active
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. FULL SCREEN LOCKSCREEN OVERLAY */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 bg-[var(--bg-base)]/80 backdrop-blur-xl flex flex-col items-center justify-center p-4 select-none overflow-y-auto"
          >
            {/* Top Security Banner */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-xs font-mono text-[var(--text-tertiary)] max-w-5xl mx-auto w-full px-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>WORKSPACE LOCKED // SECURE OVERWATCH ROUTE</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" /> Timeout: {timeoutMinutes === 0 ? 'Disabled' : `${timeoutMinutes}m`}
                </button>
                <span>UTC: {new Date().toISOString().substring(11, 19)}</span>
              </div>
            </div>

            {/* Timeout Settings Panel Dropdown */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-16 right-10 z-50 bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-4 shadow-xl w-60 text-xs space-y-3"
                >
                  <div className="font-bold text-[var(--text-primary)] mb-1">Inactivity Threshold Settings</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 5, 0].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => {
                          setTimeoutMinutes(mins);
                          setShowSettings(false);
                          showToast(mins === 0 ? 'Inactivity lock disabled' : `Inactivity threshold set to ${mins}m`, 'success');
                        }}
                        className={`py-1.5 rounded font-mono border text-center transition-all ${
                          timeoutMinutes === mins
                            ? 'bg-blue-600/20 text-blue-400 border-blue-500/40 font-bold'
                            : 'border-[var(--border-base)] hover:border-[var(--border-muted)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {mins === 0 ? 'Off' : `${mins}m`}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-[var(--text-tertiary)] leading-relaxed">
                    Set the inactivity delay before the OrchestrOS terminal automatically triggers re-authentication.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lock Screen Centered Card */}
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
              className="w-full max-w-sm space-y-8 text-center my-8"
            >
              {/* Header Icon */}
              <div className="relative mx-auto w-20 h-20">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="w-full h-full bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 shadow-2xl shadow-blue-500/10"
                >
                  <Lock className="w-9 h-9" />
                </motion.div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-rose-500 border-4 border-[var(--bg-base)] flex items-center justify-center animate-ping" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-rose-500 border-4 border-[var(--bg-base)] flex items-center justify-center" />
              </div>

              {/* Title / User info */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Session Suspended</h2>
                <div className="flex items-center justify-center gap-2 bg-[var(--bg-surface)] border border-[var(--border-base)] px-3 py-1.5 rounded-full w-fit mx-auto text-xs text-[var(--text-secondary)]">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-medium">{currentUser?.email || 'scorpxgt7@gmail.com'}</span>
                </div>
                <p className="text-xs text-[var(--text-tertiary)]">
                  Active Org: <span className="text-blue-400 font-semibold">{currentUser?.orgName || 'OrchestrOS'}</span>
                </p>
              </div>

              {/* Passcode Unlock Form */}
              <form onSubmit={handleUnlock} className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center text-[var(--text-tertiary)]">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      setHasError(false);
                    }}
                    placeholder="Enter security PIN or passcode..."
                    className={`w-full bg-[var(--bg-surface)] border ${
                      hasError ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[var(--border-base)] focus:border-blue-500/40'
                    } rounded-xl pl-11 pr-12 py-3 text-sm text-[var(--text-primary)] focus:outline-none text-center font-mono tracking-widest placeholder:tracking-normal placeholder:font-sans transition-all`}
                    disabled={isVerifying}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute inset-y-0 right-4 flex items-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {hasError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-rose-400 font-semibold"
                  >
                    Authentication failed. Try 'admin' or '1234'.
                  </motion.p>
                )}

                {/* Touch friendly Numeric Keypad */}
                <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto pt-3">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleNumpadClick(num)}
                      className="bg-[var(--bg-surface)] hover:bg-[var(--border-base)] active:scale-95 text-[var(--text-primary)] font-semibold font-mono rounded-xl py-3 border border-[var(--border-base)] transition-all flex items-center justify-center cursor-pointer text-sm"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleNumpadClear}
                    className="text-xs font-semibold text-rose-400 hover:text-rose-300 rounded-xl py-3 flex items-center justify-center cursor-pointer font-mono"
                  >
                    CLEAR
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNumpadClick('0')}
                    className="bg-[var(--bg-surface)] hover:bg-[var(--border-base)] active:scale-95 text-[var(--text-primary)] font-semibold font-mono rounded-xl py-3 border border-[var(--border-base)] transition-all flex items-center justify-center cursor-pointer text-sm"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={handleNumpadBackspace}
                    className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl py-3 flex items-center justify-center cursor-pointer font-mono"
                  >
                    DELETE
                  </button>
                </div>

                {/* Primary Button Stack */}
                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={handleQuickBypass}
                    className="flex-1 px-4 py-2.5 border border-blue-500/10 text-blue-400 hover:bg-blue-500/5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    Quick Bypass
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifying || !passcode}
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10 cursor-pointer"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        Unlock
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Bottom Status / Footer Ticker */}
            <div className="absolute bottom-6 text-center text-[10px] font-mono text-[var(--text-tertiary)] space-y-1">
              <p>PROTRACTED SYSTEM STATE // ORCHESTROS CONSOLE v4.2.0-SECURE</p>
              <p className="opacity-60">Enter "admin" or "1234" passcode to bypass security screen.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
