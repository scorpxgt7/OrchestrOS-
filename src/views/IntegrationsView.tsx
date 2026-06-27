import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, Globe, Key, Link as LinkIcon, Plus, Server, ShieldCheck, Zap } from 'lucide-react';
import { auditService } from '../services/auditService';
import { LocalLLMBridge } from '../components/LocalLLMBridge';
import { fetchApi } from '../lib/api';

interface Integration {
  id: string;
  name: string;
  category: string;
  status: string;
  lastSync: string | null;
  icon: string;
}

export function IntegrationsView() {
  const [showLocalLLMBridge, setShowLocalLLMBridge] = useState(false);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  useEffect(() => {
    fetchApi('/integrations').then(setIntegrations);
  }, []);

  const handleConnect = async (id: string, name: string) => {
    if (id === 'local_llm') {
      setShowLocalLLMBridge(true);
      return;
    }
    setIsConnecting(id);
    
    // Simulate OAuth flow
    setTimeout(async () => {
      try {
        const updated = await fetchApi(`/integrations/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Connected', lastSync: 'Just now' })
        });
        setIntegrations(integrations.map(i => i.id === id ? updated : i));
      } catch (err) {
        console.error("Failed to connect", err);
      }
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
    
    try {
      const updated = await fetchApi(`/integrations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Disconnected', lastSync: 'Never' })
      });
      setIntegrations(integrations.map(i => i.id === id ? updated : i));
    } catch (err) {
      console.error("Failed to disconnect", err);
    }
    
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
                    <button 
                      onClick={() => {
                        if (integration.id === 'local_llm') {
                          setShowLocalLLMBridge(true);
                        }
                      }}
                      className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded bg-[var(--bg-base)] border border-[var(--border-base)] transition-colors"
                    >
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

      {/* Local LLM Bridge Modal Overlay */}
      {showLocalLLMBridge && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-4xl w-full bg-[var(--bg-surface)] rounded-2xl shadow-2xl border border-[var(--border-base)]"
          >
            <LocalLLMBridge onClose={() => setShowLocalLLMBridge(false)} />
          </motion.div>
        </div>
      )}
    </div>
  );
}
