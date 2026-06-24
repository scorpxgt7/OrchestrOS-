import { BookOpen, Database, Eye, Share2, Layers, Shield, RefreshCw, Key, Network } from 'lucide-react';
import { useState } from 'react';

export function MemoryArchitectureSpec() {
  const [activeTab, setActiveTab] = useState<'overview' | 'storage' | 'pipelines' | 'security'>('overview');
  const [copied, setCopied] = useState(false);

  const handleCopySpec = () => {
    const specText = `AGENTIC GOVERNANCE ORCHESTRATOR OS - PERSISTENT MEMORY ARCHITECTURE BLUEPRINT

1. LAYERED MEMORY TAXONOMY
==========================
- User Memory (usr_*): Personas, direct configurations, session override records, identity/credential boundaries.
- Organizational Memory (org_*): Standard Operating Procedures (SOPs), brand tones, departmental glossaries, policy rulebooks.
- Task Memory (tsk_*): Step-by-step trace histories, input/output artifacts, recovery schemas, latency & token costs.
- Agent Memory (agt_*): Internal cognitive workspace buffers (scratchpads), fine-tuning adapters, constraint records.
- Governance Memory (gov_*): Human-In-The-Loop (HITL) overrides, compliance checklists, risk scores, incident trails.

2. STORAGE & STORAGE ENGINES
============================
- Relational Layer (PostgreSQL / Cloud SQL): Handles ACID-compliant schemas, version control states, permission matrices.
- Vector Layer (pgvector / Pinecone): Handles 1536-dimensional embeddings (text-embedding-3) for hybrid semantic retrieval.
- Graph Layer (Neo4j / NetworkX): Handles semantic links (e.g., [User:X] -> [Approved] -> [Task:Y] -> [Utilized] -> [Agent:Z]).

3. RETRIEVAL & INGESTION PIPELINE
================================
- Context Retrieval: Performs dynamic hybrid search (BM25 + Semantic Cosine similarity).
- Reranking Layer: Uses Cohere/FlashRank models to select top-k context tokens.
- Security Filter Overlay: Strips PII and validates Agent RBAC permissions on individual memory nodes.

4. VERSIONING, COMPLIANCE & EXPORT
==================================
- Log-structured differential states (diff-logging) track all memory changes.
- Access logs automatically streamed into immutable Governance logs.
- Native export options support raw JSON payloads, clean markdown rulebooks, and encrypted YAML packages.`;

    navigator.clipboard.writeText(specText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl overflow-hidden font-sans">
      {/* Header */}
      <div className="p-6 border-b border-[var(--border-base)] bg-[var(--bg-base)]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-base)] tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            Architectural Specifications
          </h3>
          <p className="text-[var(--text-muted)] text-xs mt-1">Formal technical blueprint for the multi-tiered Agentic Persistent Memory OS.</p>
        </div>
        <button 
          onClick={handleCopySpec}
          className="self-start sm:self-center px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-lg border border-blue-500/25 transition-all flex items-center gap-1.5"
        >
          <Share2 className="w-3.5 h-3.5" />
          {copied ? 'Copied Blueprint!' : 'Copy Blueprint'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-base)] overflow-x-auto scrollbar-none bg-[var(--bg-base)]/10">
        {[
          { id: 'overview', label: '1. Memory Taxonomy', icon: Layers },
          { id: 'storage', label: '2. Hybrid Storage', icon: Database },
          { id: 'pipelines', label: '3. Query Pipeline', icon: Network },
          { id: 'security', label: '4. Permissions & Versioning', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
                isActive 
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contents */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { 
                  title: 'User Memory', 
                  desc: 'Individual preferences, user-specific presets, direct instruction overrides, and historic session overrides.', 
                  scope: 'Local user-to-agent channel overrides',
                  schema: 'userId, UI configs, focusHours, authOverrides',
                  color: 'text-sky-400',
                  bg: 'bg-sky-500/10 border-sky-500/20'
                },
                { 
                  title: 'Organizational Memory', 
                  desc: 'Shared standard operating procedures (SOPs), marketing guidelines, brand voice parameters, corporate policies, and department glossaries.', 
                  scope: 'Corporate-wide or department-wide access',
                  schema: 'deptScope, policyList, brandTone, prohibitedKeywords',
                  color: 'text-indigo-400',
                  bg: 'bg-indigo-500/10 border-indigo-500/20'
                },
                { 
                  title: 'Task Memory', 
                  desc: 'Structured execution traces, step-by-step logs, tool inputs, outputs, errors, costs, and dynamic run trace diagnostics.', 
                  scope: 'Job execution contexts & audit trails',
                  schema: 'taskId, agentId, stepsTaken, tokensCharged, status',
                  color: 'text-amber-400',
                  bg: 'bg-amber-500/10 border-amber-500/20'
                },
                { 
                  title: 'Agent Memory', 
                  desc: 'Workspace buffers, internal scratchpads, cognitive attention loops, fine-tuned capability weights, and behavioral safety limits.', 
                  scope: 'Agent-private scratch space & overrides',
                  schema: 'agentId, cognitiveScore, promptOverrides, bufferWeights',
                  color: 'text-emerald-400',
                  bg: 'bg-emerald-500/10 border-emerald-500/20'
                },
                { 
                  title: 'Governance Memory', 
                  desc: 'Human-In-The-Loop signatures, dual-authorization trails, regulatory compliance checklists, and risk evaluation parameters.', 
                  scope: 'Overwatch system and secure legal audit trail',
                  schema: 'governanceId, riskTolerance, approvalsRequired, HITLSignatures',
                  color: 'text-rose-400',
                  bg: 'bg-rose-500/10 border-rose-500/20'
                }
              ].map((item, i) => (
                <div key={i} className={`p-4 rounded-xl border ${item.bg} flex flex-col justify-between h-full`}>
                  <div>
                    <h4 className={`text-sm font-bold ${item.color} mb-1.5`}>{item.title}</h4>
                    <p className="text-[var(--text-muted)] text-[11px] leading-relaxed mb-3">{item.desc}</p>
                  </div>
                  <div className="pt-3 border-t border-[var(--border-base)] mt-auto space-y-1.5">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[var(--text-tertiary)] block">Scope</span>
                      <span className="text-[10px] text-[var(--text-primary)] font-medium leading-tight">{item.scope}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[var(--text-tertiary)] block">Core Schema Keys</span>
                      <code className="text-[9px] text-blue-300 font-mono block bg-black/30 px-1 py-0.5 rounded mt-0.5 overflow-x-auto whitespace-nowrap scrollbar-none">{item.schema}</code>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-blue-500/5 border border-blue-500/15 rounded-xl space-y-2 mt-4">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                Inter-Memory Interaction Matrix
              </h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                When an Agent initiates a Task execution, the orchestrator triggers a three-phase semantic lookup: (1) <strong>Grounding Phase</strong> fetches brand rules from <span className="text-indigo-400">Organizational Memory</span>; (2) <strong>Personalization Phase</strong> merges user instructions from <span className="text-sky-400">User Memory</span>; (3) <strong>Execution Phase</strong> logs step outputs in <span className="text-amber-400">Task Memory</span>. All steps are evaluated against boundaries in <span className="text-rose-400">Governance Memory</span>, forcing a quarantine if a boundary is violated.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'storage' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-[var(--bg-base)]/50 border border-[var(--border-base)] rounded-xl space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><Database className="w-4.5 h-4.5" /></div>
                  <h4 className="text-sm font-bold text-[var(--text-base)]">1. Relational Layer</h4>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Utilizes <strong>PostgreSQL / Google Cloud SQL</strong> for structured, transactional indexes. Handles user account linkages, version history diffs, lock states, permissions matrices, and general audit metadata.
                </p>
                <div className="bg-black/20 p-3 rounded-lg font-mono text-[10px] text-emerald-400 space-y-1">
                  <div>// Ensures 100% ACID compliance</div>
                  <div>CREATE TABLE memory_records (</div>
                  <div className="pl-4">id VARCHAR(64) PRIMARY KEY,</div>
                  <div className="pl-4">version INT NOT NULL,</div>
                  <div className="pl-4">category memory_type NOT NULL...</div>
                  <div>);</div>
                </div>
              </div>

              <div className="p-5 bg-[var(--bg-base)]/50 border border-[var(--border-base)] rounded-xl space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg"><Layers className="w-4.5 h-4.5" /></div>
                  <h4 className="text-sm font-bold text-[var(--text-base)]">2. Vector Layer</h4>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Utilizes <strong>pgvector</strong> with HNSW indexes for sub-10ms semantic similarity search across embedded documents (such as PDF guidelines and text files embedded using 1536-dim models).
                </p>
                <div className="bg-black/20 p-3 rounded-lg font-mono text-[10px] text-emerald-400 space-y-1">
                  <div>// Semantic lookup capability</div>
                  <div>SELECT id, title, (embedding &lt;=&gt; $1)</div>
                  <div>AS distance FROM memory_vector_store</div>
                  <div>WHERE category = 'org' AND dept = 'Finance'</div>
                  <div>ORDER BY distance LIMIT 5;</div>
                </div>
              </div>

              <div className="p-5 bg-[var(--bg-base)]/50 border border-[var(--border-base)] rounded-xl space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg"><Network className="w-4.5 h-4.5" /></div>
                  <h4 className="text-sm font-bold text-[var(--text-base)]">3. Graph Layer</h4>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Integrates a lightweight semantic graph (e.g., Neo4j or in-memory networks) mapping dependencies, ownerships, and governance nodes to allow recursive trace routes and deep context grounding.
                </p>
                <div className="bg-black/20 p-3 rounded-lg font-mono text-[10px] text-emerald-400 space-y-1">
                  <div>// Cypher Relationship Trace</div>
                  <div>{"MATCH (u:User)-[:AUTHORIZES]->(a:Agent)"}</div>
                  <div>{"MATCH (a)-[:PERFORMS]->(t:Task)"}</div>
                  <div>{"MATCH (t)-[:VIOLATES]->(g:GovPolicy)"}</div>
                  <div>RETURN u, a, t, g;</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pipelines' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-6 items-stretch">
              <div className="flex-1 p-5 bg-[var(--bg-base)]/30 border border-[var(--border-base)] rounded-xl space-y-4">
                <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  Context Retrieval Pipeline
                </h4>
                <div className="relative pl-6 border-l-2 border-blue-500/20 space-y-4 text-xs">
                  <div className="relative">
                    <div className="absolute -left-7.5 top-0.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-[var(--bg-surface)]" />
                    <span className="font-bold text-[var(--text-primary)]">Phase 1: Query Extraction</span>
                    <p className="text-[var(--text-muted)] text-[11px] mt-0.5">User question is converted to hypothetical document embeddings (HyDE) and keyword hashes.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-7.5 top-0.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-[var(--bg-surface)]" />
                    <span className="font-bold text-[var(--text-primary)]">Phase 2: Hybrid Index Match</span>
                    <p className="text-[var(--text-muted)] text-[11px] mt-0.5">Concurrent searches query the pgvector database and full-text inverted indexes.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-7.5 top-0.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-[var(--bg-surface)]" />
                    <span className="font-bold text-[var(--text-primary)]">Phase 3: Cross-Context Re-ranking</span>
                    <p className="text-[var(--text-muted)] text-[11px] mt-0.5">Top results from both tracks are normalized, scoring weights are applied, and redundant files are filtered.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-7.5 top-0.5 w-3 h-3 rounded-full bg-red-400 border-2 border-[var(--bg-surface)] animate-pulse" />
                    <span className="font-bold text-red-400">Phase 4: Governance Guardrail Overlays</span>
                    <p className="text-[var(--text-muted)] text-[11px] mt-0.5">Active access controls (RBAC & minimum autonomy checks) evaluate each chunk. Unauthorized sections are automatically scrubbed.</p>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-80 bg-black/20 p-5 rounded-xl border border-[var(--border-base)] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-2">Relevance Scanners</span>
                  <h4 className="text-sm font-bold text-[var(--text-base)] mb-2">BM25 + Semantic Weights</h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
                    The orchestrator combines keywords and cosine values using Reciprocal Rank Fusion (RRF):
                  </p>
                  <code className="text-[11px] font-mono text-emerald-400 block bg-black/40 p-2 rounded text-center">
                    RRF_Score = w₁ × S_semantic + w₂ × S_keyword
                  </code>
                  <p className="text-[11px] text-[var(--text-tertiary)] italic mt-3 leading-snug">
                    *Defaults to w₁=0.7, w₂=0.3. Weights are dynamic per department context.
                  </p>
                </div>
                <div className="pt-4 border-t border-[var(--border-base)] mt-4">
                  <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] block">Retrieval Latency</span>
                  <span className="text-lg font-mono font-bold text-emerald-400">~12 ms <span className="text-xs text-[var(--text-tertiary)] font-sans font-normal">avg response</span></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-[var(--bg-base)]/30 border border-[var(--border-base)] rounded-xl space-y-3">
                <h4 className="text-sm font-bold text-[var(--text-base)] flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-emerald-400" />
                  RBAC & Autonomy Restrictions
                </h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Each memory node contains a strict <code>permissions</code> profile detailing:
                </p>
                <ul className="text-xs text-[var(--text-muted)] space-y-2 pl-4 list-disc">
                  <li><strong>Roles (RBAC):</strong> Only agents or user roles explicitly matching the allowed roles array can pull content.</li>
                  <li><strong>Min Autonomy Check:</strong> Prevents low-autonomy worker agents from accessing sensitive raw logs, ensuring strict operational boundary control.</li>
                  <li><strong>Data Masking:</strong> Fields designated as PII are dynamically masked before rendering.</li>
                </ul>
              </div>

              <div className="p-5 bg-[var(--bg-base)]/30 border border-[var(--border-base)] rounded-xl space-y-3">
                <h4 className="text-sm font-bold text-[var(--text-base)] flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-indigo-400" />
                  Differential Versioning Engine
                </h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Memory changes are saved via a <strong>log-structured append-only ledger</strong>. Every edit results in a new immutable transaction version containing:
                </p>
                <ul className="text-xs text-[var(--text-muted)] space-y-2 pl-4 list-disc">
                  <li><strong>Change Summary:</strong> Short record detailing the modification intent.</li>
                  <li><strong>Author Signature:</strong> Cryptographically signed email of user or ID of agent applying the change.</li>
                  <li><strong>Rollback Guarantee:</strong> Users can preview and restore historical versions instantly, updating parent indexes immediately.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
