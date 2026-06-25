import { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, Globe, Key, Link as LinkIcon, Plus, Server, ShieldCheck, Zap } from 'lucide-react';
import { auditService } from '../services/auditService';

export function IntegrationsView() {
  const [integrations, setIntegrations] = useState([
    { id: 'slack', name: 'Slack', category: 'Communication', status: 'Connected', lastSync: '10m ago', icon: 'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M9,10A1,1 0 0,1 10,9A1,1 0 0,1 11,10V14A1,1 0 0,1 10,15A1,1 0 0,1 9,14V10M13,10A1,1 0 0,1 14,9A1,1 0 0,1 15,10V14A1,1 0 0,1 14,15A1,1 0 0,1 13,14V10Z' },
    { id: 'google', name: 'Google Workspace', category: 'Productivity', status: 'Connected', lastSync: '2h ago', icon: 'M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z' },
    { id: 'github', name: 'GitHub', category: 'Development', status: 'Disconnected', lastSync: 'Never', icon: 'M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21V19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26V21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z' },
    { id: 'notion', name: 'Notion', category: 'Knowledge', status: 'Disconnected', lastSync: 'Never', icon: 'M4,4H20V20H4V4M6,6V18H18V6H6M8,8H16V16H8V8Z' }, // Simplified mock icon
    { id: 'salesforce', name: 'Salesforce', category: 'CRM', status: 'Disconnected', lastSync: 'Never', icon: 'M17.5,9.5A2.5,2.5 0 0,0 15,12H14.5V13H15A3.5,3.5 0 0,1 15,20H7A3,3 0 0,1 7,14V13H7.5A2.5,2.5 0 0,0 7.5,8H10A4,4 0 0,1 17.5,9.5M10.5,3A5,5 0 0,0 5.5,8V12H4.5A4.5,4.5 0 0,0 4.5,21H16A4.5,4.5 0 0,0 20.5,16.5C20.5,14.63 19.36,12.97 17.76,12.3A4.5,4.5 0 0,0 15,5H14.5C14.15,3.85 13.1,3 11.85,3H10.5Z' }, // Cloud-ish icon
  ]);

  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const handleConnect = async (id: string, name: string) => {
    setIsConnecting(id);
    // Simulate OAuth flow
    setTimeout(async () => {
      setIntegrations(integrations.map(i => i.id === id ? { ...i, status: 'Connected', lastSync: 'Just now' } : i));
      setIsConnecting(null);
      
      await auditService.logEvent({
        action: `Integration Connected`,
        metadata: { service: name, id },
        outcome: 'success'
      });
    }, 2000);
  };

  const handleDisconnect = async (id: string, name: string) => {
    if (!confirm(`Disconnect ${name}? External agents relying on this service might fail.`)) return;
    setIntegrations(integrations.map(i => i.id === id ? { ...i, status: 'Disconnected', lastSync: 'Never' } : i));
    
    await auditService.logEvent({
      action: `Integration Disconnected`,
      metadata: { service: name, id },
      outcome: 'success',
      riskScore: 20
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans pb-24">
      <div className="flex flex-col md:flex-row justify-between border-b border-[var(--border-base)] pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <Globe className="w-8 h-8 text-blue-500" />
            Integrations & Endpoints
          </h1>
          <p className="text-[var(--text-tertiary)] mt-2">Connect the OS to external SaaS platforms, APIs, and databases to power agent actions.</p>
        </div>
        <div className="flex gap-3 items-end">
          <button className="bg-[var(--bg-surface)] border border-[var(--border-base)] hover:border-[var(--border-muted)] text-[var(--text-primary)] px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
            <Key className="w-4 h-4" />
            Manage API Keys
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            Add Custom Webhook
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrations.map((integration, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={integration.id}
            className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-5 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--bg-base)] border border-[var(--border-base)] flex items-center justify-center">
                  <svg className="w-7 h-7 text-[var(--text-primary)]" viewBox="0 0 24 24">
                    <path fill="currentColor" d={integration.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)] text-lg">{integration.name}</h3>
                  <span className="text-xs uppercase tracking-wider font-bold text-[var(--text-tertiary)]">{integration.category}</span>
                </div>
              </div>
              <div>
                {integration.status === 'Connected' ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-tertiary)] bg-[var(--bg-base)] px-2.5 py-1 rounded-full border border-[var(--border-base)]">
                    <LinkIcon className="w-3.5 h-3.5" />
                    Disconnected
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[var(--border-base)] pt-4 mt-2">
              <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                <Clock className="w-3.5 h-3.5" />
                Last Sync: {integration.lastSync}
              </div>
              <div>
                {integration.status === 'Connected' ? (
                  <div className="flex items-center gap-2">
                    <button className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded bg-[var(--bg-base)] border border-[var(--border-base)] transition-colors">
                      Configure
                    </button>
                    <button 
                      onClick={() => handleDisconnect(integration.id, integration.name)}
                      className="text-xs font-bold text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded bg-rose-500/10 border border-rose-500/20 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleConnect(integration.id, integration.name)}
                    disabled={isConnecting === integration.id}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded transition-colors disabled:opacity-50"
                  >
                    {isConnecting === integration.id ? (
                      <>
                        <Zap className="w-3.5 h-3.5 animate-pulse" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-3.5 h-3.5" />
                        Connect
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 bg-blue-500/5 border border-blue-500/20 rounded-xl p-6 flex items-start gap-4">
        <ShieldCheck className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
        <div>
          <h4 className="font-bold text-[var(--text-primary)]">Data Minimization Engine Active</h4>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Overwatch is continuously monitoring external API payloads. Sensitive fields (SSN, internal keys, private IP ranges) are redacted automatically before exiting the organization perimeter unless an Executive Agent explicitly approves the transmission.
          </p>
        </div>
      </div>
    </div>
  );
}
