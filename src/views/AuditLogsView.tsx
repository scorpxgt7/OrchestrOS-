import { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';
import { Shield, Clock, AlertTriangle, User, Bot, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export function AuditLogsView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/audit');
      setLogs(res);
    } catch (e) {
      console.error('Failed to fetch logs:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[var(--border-base)] pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-[var(--text-primary)] flex items-center gap-3">
            <Shield className="w-8 h-8 text-emerald-400" />
            Audit Logs
          </h1>
          <p className="text-[var(--text-tertiary)] mt-2">Comprehensive immutable record of all organizational events and agent actions.</p>
        </div>
        <div className="flex items-center">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-emerald-400 tracking-wide">Audit Sync: Master</span>
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-base)]/50 border-b border-[var(--border-base)] text-[var(--text-tertiary)] font-medium text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Risk Score</th>
                <th className="px-6 py-4">Outcome</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-base)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[var(--text-tertiary)]">
                    <div className="animate-pulse flex flex-col items-center gap-2">
                      <div className="h-4 w-24 bg-[var(--bg-base)] rounded"></div>
                      <div className="text-xs">Loading audit trail...</div>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[var(--text-tertiary)] italic">
                    No audit logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--bg-base)]/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <Clock className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                        <span className="font-mono text-xs">{format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-[var(--text-primary)]">{log.action}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        {log.actorAgentId ? (
                          <><Bot className="w-3.5 h-3.5 text-blue-400" /><span className="text-xs">Agent #{log.actorAgentId}</span></>
                        ) : log.actorUserId ? (
                          <><User className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs">User</span></>
                        ) : (
                          <span className="text-xs text-[var(--text-tertiary)]">System</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {log.riskScore > 60 ? (
                          <span className="flex items-center gap-1.5 text-rose-400 text-xs font-bold bg-rose-400/10 px-2 py-1 rounded">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {log.riskScore}
                          </span>
                        ) : log.riskScore > 30 ? (
                          <span className="text-amber-400 text-xs font-bold bg-amber-400/10 px-2 py-1 rounded">
                            {log.riskScore}
                          </span>
                        ) : (
                          <span className="text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded">
                            {log.riskScore}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.outcome === 'success' ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Success
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-rose-400 text-xs font-medium">
                          <XCircle className="w-3.5 h-3.5" /> {log.outcome}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.metadata && Object.keys(log.metadata).length > 0 ? (
                        <div className="group relative inline-block">
                          <FileText className="w-4 h-4 text-[var(--text-tertiary)] hover:text-blue-400 cursor-pointer transition-colors inline" />
                          <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <pre className="text-left text-[10px] text-zinc-300 font-mono whitespace-pre-wrap overflow-hidden">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[var(--text-tertiary)] text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
