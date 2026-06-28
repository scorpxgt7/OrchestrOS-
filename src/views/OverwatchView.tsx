import { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';
import { ShieldAlert, Activity, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../contexts/ToastContext';

interface Finding {
  type: string;
  details?: any;
  severity?: string;
  agentId?: number;
  taskId?: number;
  reason?: string;
}

export function OverwatchView() {
  const { showToast } = useToast();
  const [findings, setFindings] = useState<Finding[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);

  const runScan = async () => {
    setIsScanning(true);
    try {
      const response = await fetchApi('/overwatch/scan', { method: 'POST' });
      setFindings(response.findings || []);
      setLastScan(new Date());
      showToast('Overwatch scan completed', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to run Overwatch scan', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    runScan();
    // Simulate routine worker monitoring
    const interval = setInterval(runScan, 30000); // 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 h-full flex flex-col font-sans overflow-hidden">
      <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-base)] tracking-tight mb-1 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-500" /> Overwatch Monitoring
          </h2>
          <p className="text-[var(--text-muted)] text-sm">Policy enforcement, hallucination detection, and risk evaluation.</p>
        </div>
        <button
          onClick={runScan}
          disabled={isScanning}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
        >
          {isScanning ? <Activity className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
          {isScanning ? 'Scanning...' : 'Force System Scan'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {findings.length === 0 ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-8 text-center text-emerald-400">
            <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h3 className="text-lg font-bold mb-2">System Secure</h3>
            <p className="text-sm">No policy violations or risks detected in the active environment.</p>
            {lastScan && <p className="text-xs mt-4 opacity-60">Last scan: {lastScan.toLocaleTimeString()}</p>}
          </div>
        ) : (
          findings.map((finding, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-4 rounded-xl border ${
                finding.type === 'llm_alert' || finding.severity === 'high'
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold mb-1">
                    {finding.type === 'llm_alert' ? 'Overwatch AI Alert' : 'System Policy Violation'}
                  </h4>
                  {finding.type === 'llm_alert' ? (
                    <div className="text-sm space-y-1">
                      <p><span className="font-semibold">Action:</span> {finding.details?.name}</p>
                      <pre className="mt-2 text-xs bg-black/20 p-2 rounded overflow-x-auto">
                        {JSON.stringify(finding.details?.args, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-sm">
                      {finding.reason}
                      {finding.agentId && <span className="block mt-1 opacity-80">Agent ID: {finding.agentId}</span>}
                      {finding.taskId && <span className="block mt-1 opacity-80">Task ID: {finding.taskId}</span>}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
