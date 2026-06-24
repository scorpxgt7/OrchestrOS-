export function ArchitectureView() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12 pb-24 text-[var(--text-secondary)] font-sans">
      <div className="border-b border-[var(--border-base)] pb-8">
        <h2 className="text-3xl font-bold text-[var(--text-base)] tracking-tight mb-4">OrchestrOS Product Design</h2>
        <p className="text-lg text-[var(--text-muted)] leading-relaxed text-balance">
          An Agentic Governance Orchestrator OS: a full-stack autonomous operating system for building, managing, monitoring, and improving an AI-powered organization.
        </p>
      </div>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-blue-400 tracking-tight">1. Core Architecture</h3>
        <p className="text-[var(--text-muted)] leading-relaxed">
          The OrchestrOS architecture combines traditional SaaS organizational tools (like Monday.com) with an autonomous agentic backbone. The system is split into three primary layers:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm text-[var(--text-secondary)] bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-base)]">
          <li><strong className="text-[var(--text-primary)]">The Interface Layer:</strong> Command Center, Visual Builders, Memory Maps, and Approval Queues. This is where human executives govern the system.</li>
          <li><strong className="text-[var(--text-primary)]">The Intelligence Core (Main Brain & Overwatch):</strong> Handles high-level routing, cost vs. latency triage, policy enforcement, and continuous learning from outcomes.</li>
          <li><strong className="text-[var(--text-primary)]">The Execution Swarm:</strong> A dynamic hierarchy of Executive, Departmental, and Specialist agents (incorporating both local LLMs for cheap tasks and remote models for complex reasoning).</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-blue-400 tracking-tight">2. The Main Brain & Overwatch</h3>
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div className="bg-purple-500/10 border border-purple-500/20 p-5 rounded-xl">
            <h4 className="font-bold text-purple-300 mb-2">Main Brain</h4>
            <p className="text-sm text-purple-200/80 leading-relaxed">
              Acts as the OS kernel. It takes high-level user goals and fragments them into organizational structures. It handles agent provisioning, macro-memory management, and inter-departmental task routing.
            </p>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-xl">
            <h4 className="font-bold text-rose-300 mb-2">Overwatch</h4>
            <p className="text-sm text-rose-200/80 leading-relaxed">
              The immune system. Constantly monitors workflows for policy violations, hallucinations, stalled tasks, and cost overruns. Automatically halts risky actions and escalates directly to human operators via the Approval Queue.
            </p>
          </div>
        </div>
      </section>

       <section className="space-y-4">
        <h3 className="text-xl font-bold text-blue-400 tracking-tight">3. Governance & Policy Engine</h3>
        <p className="text-[var(--text-muted)] leading-relaxed">
          Built around "Mini-Governance" structures. Every department operates within defined risk thresholds.
        </p>
        <div className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-base)] font-mono text-xs overflow-hidden">
          <div className="text-[var(--text-tertiary)] mb-2">// Example Policy Configuration</div>
          <div className="text-emerald-400">"Finance Dept" : {'{'}</div>
          <div className="pl-4 text-blue-300">"allowAutonomousDrafting": true,</div>
          <div className="pl-4 text-rose-300">"requireDualDualApprovalAmountsOver": 5000,</div>
          <div className="pl-4 text-amber-300">"haltOnComplianceRiskScoreOver": 75,</div>
          <div className="pl-4 text-blue-300">"escalationPath": ["Fin-Exec-Agent", "Human-CFO"]</div>
          <div className="text-emerald-400">{'}'}</div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-blue-400 tracking-tight">4. Autonomy Model & Routing</h3>
        <p className="text-[var(--text-muted)] leading-relaxed">
          The system uses dynamic cost/latency routing (Triage protocol).
        </p>
        <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
           <li className="flex gap-3"><span className="text-[var(--text-tertiary)] font-bold">L1-L2</span> <span><strong>Assisted:</strong> Low risk, predictable tasks. Routed to hyper-fast Local LLMs or small models. Results always require human click-to-approve.</span></li>
           <li className="flex gap-3"><span className="text-[var(--text-tertiary)] font-bold">L3-L4</span> <span><strong>Managed:</strong> Departmental workflows. Handled by domain-specific agents. Overwatch monitors continuously.</span></li>
           <li className="flex gap-3"><span className="text-[var(--text-tertiary)] font-bold">L5</span> <span><strong>Autonomous:</strong> Organization-wide initiatives. Coordinated by Executive agents and the Main Brain, utilizing top-tier reasoning models.</span></li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-blue-400 tracking-tight">5. Suggested Platform Names</h3>
        <div className="flex flex-wrap gap-3 mt-2">
          {['OrchestrOS', 'GovernAI OS', 'CommandGrid', 'AgentHQ', 'SynapseOps', 'Nexus Command', 'CortexGrid'].map(name => (
             <span key={name} className="px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-full text-sm text-[var(--text-secondary)]">{name}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
