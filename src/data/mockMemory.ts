import { MemoryRecord } from '../types/memory';

export const mockMemories: MemoryRecord[] = [
  // --- USER MEMORIES ---
  {
    id: 'mem_usr_01',
    title: 'Executive Director Override Prefs (scorpxgt7@gmail.com)',
    category: 'user',
    tags: ['preferences', 'exec-override', 'auth-tokens'],
    dept: 'Executive',
    size: '1.8 KB',
    updated: '2 hours ago',
    version: 3,
    schema: {
      userId: 'string (UUID)',
      preferred_summary_format: 'string (markdown | bullet_points | summary)',
      escalation_threshold: 'string (low | medium | high)',
      risk_tolerance_level: 'string (low | medium | high)',
      authorized_departments: 'string[] (department tags)',
      auto_approve_caps: 'number (USD equivalent)',
    },
    content: JSON.stringify({
      userId: "usr_scorpxgt7_01",
      preferred_summary_format: "bullet_points",
      escalation_threshold: "high",
      risk_tolerance_level: "medium",
      authorized_departments: ["Operations", "Marketing", "Finance", "Security"],
      auto_approve_caps: 150000
    }, null, 2),
    permissions: {
      roles: ['Main Brain', 'Overwatch', 'Executive Director'],
      minAutonomy: 'Level 4: Managed',
      owner: 'scorpxgt7@gmail.com'
    },
    indexing: {
      vectorIndex: 'usr_prefs_vec',
      graphNodes: ['User:scorpxgt7', 'Agent:Alpha Prime', 'Scope:Global'],
      primaryKey: 'usr_scorpx_01_primary'
    },
    versions: [
      {
        version: 3,
        updatedAt: '2026-06-23T09:30:00Z',
        author: 'scorpxgt7@gmail.com (Owner)',
        changeSummary: 'Raised auto_approve_caps from $100k to $150k and set risk tolerance to medium.',
        content: JSON.stringify({
          userId: "usr_scorpxgt7_01",
          preferred_summary_format: "bullet_points",
          escalation_threshold: "high",
          risk_tolerance_level: "medium",
          authorized_departments: ["Operations", "Marketing", "Finance", "Security"],
          auto_approve_caps: 150000
        }, null, 2)
      },
      {
        version: 2,
        updatedAt: '2026-05-14T14:22:00Z',
        author: 'Aegis Monitor (Overwatch)',
        changeSummary: 'Inherited authorization updates from Corporate Identity Directory mapping.',
        content: JSON.stringify({
          userId: "usr_scorpxgt7_01",
          preferred_summary_format: "bullet_points",
          escalation_threshold: "high",
          risk_tolerance_level: "low",
          authorized_departments: ["Operations", "Marketing"],
          auto_approve_caps: 100000
        }, null, 2)
      },
      {
        version: 1,
        updatedAt: '2026-01-10T08:00:00Z',
        author: 'System Init',
        changeSummary: 'Initial profile provisioning.',
        content: JSON.stringify({
          userId: "usr_scorpxgt7_01",
          preferred_summary_format: "summary",
          escalation_threshold: "medium",
          risk_tolerance_level: "low",
          authorized_departments: ["Operations"],
          auto_approve_caps: 10000
        }, null, 2)
      }
    ]
  },
  {
    id: 'mem_usr_02',
    title: 'Marketing Director Focus & UI Presets',
    category: 'user',
    tags: ['ui-theme', 'notifications', 'focus-hours'],
    dept: 'Marketing',
    size: '850 Bytes',
    updated: '1 week ago',
    version: 1,
    schema: {
      userId: 'string (UUID)',
      theme_preference: 'string (light | dark | system)',
      focus_mode_active: 'boolean',
      alert_digest_frequency: 'string (hourly | daily | immediate)',
      high_priority_keywords: 'string[]',
    },
    content: JSON.stringify({
      userId: "usr_mktg_lead_02",
      theme_preference: "dark",
      focus_mode_active: true,
      alert_digest_frequency: "hourly",
      high_priority_keywords: ["campaign", "budget_alert", "viral", "brand_risk"]
    }, null, 2),
    permissions: {
      roles: ['Department Manager', 'Worker'],
      minAutonomy: 'Level 2: Assisted',
      owner: 'mktg_lead@orchestrator.ai'
    },
    indexing: {
      vectorIndex: 'usr_prefs_vec',
      graphNodes: ['User:mktg_lead', 'Agent:Mktg-Lead'],
      primaryKey: 'usr_mktg_lead_02_primary'
    },
    versions: [
      {
        version: 1,
        updatedAt: '2026-06-16T11:05:00Z',
        author: 'mktg_lead@orchestrator.ai',
        changeSummary: 'First config initialization.',
        content: JSON.stringify({
          userId: "usr_mktg_lead_02",
          theme_preference: "dark",
          focus_mode_active: true,
          alert_digest_frequency: "hourly",
          high_priority_keywords: ["campaign", "budget_alert", "viral", "brand_risk"]
        }, null, 2)
      }
    ]
  },

  // --- ORGANIZATIONAL MEMORIES ---
  {
    id: 'mem_org_01',
    title: 'Global Brand Guidelines 2026',
    category: 'org',
    tags: ['brand', 'guidelines', 'marketing-sop'],
    dept: 'Marketing',
    size: '2.4 MB',
    updated: '2 hours ago',
    version: 2,
    schema: {
      brand_tone: 'string (writing persona)',
      font_hierarchy: 'object (primary, secondary, display specifications)',
      logo_usage_restrictions: 'string (dimensions, clearances, background boundaries)',
      restricted_keywords: 'string[] (compliance-flagged vocabulary)',
      regulatory_disclaimer: 'string (mandatory legal copy)',
    },
    content: JSON.stringify({
      brand_tone: "Professional, futuristic, highly-informed, authoritative, yet approachable",
      font_hierarchy: {
        primary: "Inter (UI body copy & technical figures)",
        display: "Outfit (Headings & major dashboards)",
        mono: "JetBrains Mono (Audit logs & code interfaces)"
      },
      logo_usage_restrictions: "Do not rotate or distort logo. Must maintain a strict 10% negative space buffer around the core visual mark. Never overlay logo on background images with a readability score below 75%.",
      restricted_keywords: ["unregulated-ai", "infinite-iteration", "liability-free", "autonomous-overlord", "black-box-compute"],
      regulatory_disclaimer: "Autonomous outputs generated by Agentic OS are compliant with SEC Reg-842. Continuous auditing provided by Aegis Overwatch."
    }, null, 2),
    permissions: {
      roles: ['All Agents', 'Department Manager', 'Worker', 'Auditor'],
      minAutonomy: 'Level 1: Suggested',
      owner: 'mktg_lead@orchestrator.ai'
    },
    indexing: {
      vectorIndex: 'org_sop_vec',
      graphNodes: ['Org:Global', 'Dept:Marketing', 'Asset:LogoMark', 'Compliance:SEC'],
      primaryKey: 'org_brand_guidelines_2026'
    },
    versions: [
      {
        version: 2,
        updatedAt: '2026-06-22T21:00:00Z',
        author: 'mktg_lead@orchestrator.ai',
        changeSummary: 'Added "black-box-compute" to the corporate restricted keywords array.',
        content: JSON.stringify({
          brand_tone: "Professional, futuristic, highly-informed, authoritative, yet approachable",
          font_hierarchy: {
            primary: "Inter (UI body copy & technical figures)",
            display: "Outfit (Headings & major dashboards)",
            mono: "JetBrains Mono (Audit logs & code interfaces)"
          },
          logo_usage_restrictions: "Do not rotate or distort logo. Must maintain a strict 10% negative space buffer around the core visual mark. Never overlay logo on background images with a readability score below 75%.",
          restricted_keywords: ["unregulated-ai", "infinite-iteration", "liability-free", "autonomous-overlord", "black-box-compute"],
          regulatory_disclaimer: "Autonomous outputs generated by Agentic OS are compliant with SEC Reg-842. Continuous auditing provided by Aegis Overwatch."
        }, null, 2)
      },
      {
        version: 1,
        updatedAt: '2025-12-15T09:00:00Z',
        author: 'Docu-Scribe (Memory Agent)',
        changeSummary: 'Imported brand guidelines asset from Google Drive workspace sync.',
        content: JSON.stringify({
          brand_tone: "Professional, futuristic, highly-informed, authoritative, yet approachable",
          font_hierarchy: {
            primary: "Inter (UI body copy & technical figures)",
            display: "Space Grotesk (Headings & major dashboards)",
            mono: "JetBrains Mono (Audit logs & code interfaces)"
          },
          logo_usage_restrictions: "Do not rotate or distort logo. Must maintain a strict 10% negative space buffer around the core visual mark.",
          restricted_keywords: ["unregulated-ai", "infinite-iteration", "liability-free"],
          regulatory_disclaimer: "Autonomous outputs generated by Agentic OS are compliant with SEC Reg-842."
        }, null, 2)
      }
    ]
  },
  {
    id: 'mem_org_02',
    title: 'Q3 Financial Ledger Compliance Rules',
    category: 'org',
    tags: ['finance', 'ledger', 'compliance'],
    dept: 'Finance',
    size: '142 KB',
    updated: '1 day ago',
    version: 1,
    schema: {
      reconciliation_cycle: 'string (daily | weekly | monthly)',
      double_entry_validation_rules: 'string[]',
      max_unapproved_reallocation: 'number (currency threshold)',
      auditor_access_keys: 'string[] (active public key names)',
    },
    content: JSON.stringify({
      reconciliation_cycle: "daily",
      double_entry_validation_rules: [
        "Rule-F10: Subledger balances must map exactly to general ledger indexes by 17:00 EST daily.",
        "Rule-F12: Multi-agent ledger transfers over $50k require high-confidence human signature."
      ],
      max_unapproved_reallocation: 5000,
      auditor_access_keys: ["fin_audit_overwatch_pub_2026", "sec_reg_audit_2026"]
    }, null, 2),
    permissions: {
      roles: ['Specialist', 'Auditor', 'Executive Director'],
      minAutonomy: 'Level 3: Conditional',
      owner: 'fin_lead@orchestrator.ai'
    },
    indexing: {
      vectorIndex: 'org_sop_vec',
      graphNodes: ['Org:Global', 'Dept:Finance', 'Compliance:F12'],
      primaryKey: 'org_finance_ledger_v3'
    },
    versions: [
      {
        version: 1,
        updatedAt: '2026-06-22T08:15:00Z',
        author: 'fin_lead@orchestrator.ai',
        changeSummary: 'Created ledger rules and added Rule-F12 requiring double validation.',
        content: JSON.stringify({
          reconciliation_cycle: "daily",
          double_entry_validation_rules: [
            "Rule-F10: Subledger balances must map exactly to general ledger indexes by 17:00 EST daily.",
            "Rule-F12: Multi-agent ledger transfers over $50k require high-confidence human signature."
          ],
          max_unapproved_reallocation: 5000,
          auditor_access_keys: ["fin_audit_overwatch_pub_2026", "sec_reg_audit_2026"]
        }, null, 2)
      }
    ]
  },

  // --- TASK MEMORIES ---
  {
    id: 'mem_tsk_01',
    title: 'Task Execution Trace: PR #4022 Security Audit',
    category: 'task',
    tags: ['task-trace', 'engineering', 'security-audit'],
    dept: 'Engineering',
    size: '12.4 KB',
    updated: '10 mins ago',
    version: 2,
    schema: {
      taskId: 'string (UUID)',
      associated_agents: 'string[] (agent IDs)',
      step_history: 'array of objects (step actions, tools used, results, risk evaluations)',
      anomalies_detected: 'string[] (security vulnerability descriptions)',
      resolution_status: 'string (halted | escalated | human_approved | bypassed)',
    },
    content: JSON.stringify({
      taskId: "t2",
      associated_agents: ["a7", "a2"],
      step_history: [
        {
          step: 1,
          timestamp: "2026-06-23T11:00:15Z",
          action: "Analyze PR #4022 diff payload",
          tool_used: "GitDiffScanner",
          status: "success",
          risk_evaluation: { score: 15, factors: ["standard diff length"] }
        },
        {
          step: 2,
          timestamp: "2026-06-23T11:01:04Z",
          action: "Evaluate dependency injections",
          tool_used: "NpmAuditSandbox",
          status: "warning",
          risk_evaluation: { score: 85, factors: ["detected unauthorized API keys in config files", "potential environment variable export route"] }
        }
      ],
      anomalies_detected: [
        "VULN-9042: Attempted export of server-side Google Workspace service keys to non-whitelisted endpoint."
      ],
      resolution_status: "escalated"
    }, null, 2),
    permissions: {
      roles: ['Auditor', 'Overwatch', 'Executive Director'],
      minAutonomy: 'Level 4: Managed',
      owner: 'a2'
    },
    indexing: {
      vectorIndex: 'task_trace_vec',
      graphNodes: ['Task:t2', 'Agent:QA-Validator', 'Agent:Aegis Monitor', 'Risk:Critical'],
      primaryKey: 'tsk_trace_pr4022'
    },
    versions: [
      {
        version: 2,
        updatedAt: '2026-06-23T11:05:00Z',
        author: 'Aegis Monitor (Overwatch)',
        changeSummary: 'Updated run trace with Aegis risk analysis factors and set resolution to escalated.',
        content: JSON.stringify({
          taskId: "t2",
          associated_agents: ["a7", "a2"],
          step_history: [
            {
              step: 1,
              timestamp: "2026-06-23T11:00:15Z",
              action: "Analyze PR #4022 diff payload",
              tool_used: "GitDiffScanner",
              status: "success",
              risk_evaluation: { score: 15, factors: ["standard diff length"] }
            },
            {
              step: 2,
              timestamp: "2026-06-23T11:01:04Z",
              action: "Evaluate dependency injections",
              tool_used: "NpmAuditSandbox",
              status: "warning",
              risk_evaluation: { score: 85, factors: ["detected unauthorized API keys in config files", "potential environment variable export route"] }
            }
          ],
          anomalies_detected: [
            "VULN-9042: Attempted export of server-side Google Workspace service keys to non-whitelisted endpoint."
          ],
          resolution_status: "escalated"
        }, null, 2)
      },
      {
        version: 1,
        updatedAt: '2026-06-23T11:00:20Z',
        author: 'QA-Validator (Auditor)',
        changeSummary: 'Created initial trace payload for PR #4022 code scanning run.',
        content: JSON.stringify({
          taskId: "t2",
          associated_agents: ["a7"],
          step_history: [
            {
              step: 1,
              timestamp: "2026-06-23T11:00:15Z",
              action: "Analyze PR #4022 diff payload",
              tool_used: "GitDiffScanner",
              status: "success",
              risk_evaluation: { score: 15, factors: ["standard diff length"] }
            }
          ],
          anomalies_detected: [],
          resolution_status: "running"
        }, null, 2)
      }
    ]
  },
  {
    id: 'mem_tsk_02',
    title: 'Task Execution Trace: Snowflake warehouse optimizations',
    category: 'task',
    tags: ['task-trace', 'engineering', 'snowflake', 'cost-savings'],
    dept: 'Engineering',
    size: '8.1 KB',
    updated: '1 hour ago',
    version: 1,
    schema: {
      taskId: 'string (UUID)',
      associated_agents: 'string[] (agent IDs)',
      actions_taken: 'string[]',
      queries_optimized: 'number',
      compute_credits_saved: 'number (monthly estimate)',
    },
    content: JSON.stringify({
      taskId: "t4",
      associated_agents: ["a5"],
      actions_taken: [
        "Analyzed query logs from previous 30 days to detect clustering candidates",
        "Applied auto-clustering keys to high-volume raw event tables",
        "Configured strict 5-minute auto-suspend timers on medium warehouses"
      ],
      queries_optimized: 142,
      compute_credits_saved: 12.5
    }, null, 2),
    permissions: {
      roles: ['Specialist', 'Department Manager', 'Auditor'],
      minAutonomy: 'Level 3: Conditional',
      owner: 'a5'
    },
    indexing: {
      vectorIndex: 'task_trace_vec',
      graphNodes: ['Task:t4', 'Agent:Code-Synth V2', 'Service:Snowflake'],
      primaryKey: 'tsk_trace_snowflake_opt_01'
    },
    versions: [
      {
        version: 1,
        updatedAt: '2026-06-23T10:12:00Z',
        author: 'Code-Synth V2 (Specialist)',
        changeSummary: 'Completed task run and saved optimization telemetry records.',
        content: JSON.stringify({
          taskId: "t4",
          associated_agents: ["a5"],
          actions_taken: [
            "Analyzed query logs from previous 30 days to detect clustering candidates",
            "Applied auto-clustering keys to high-volume raw event tables",
            "Configured strict 5-minute auto-suspend timers on medium warehouses"
          ],
          queries_optimized: 142,
          compute_credits_saved: 12.5
        }, null, 2)
      }
    ]
  },

  // --- AGENT MEMORIES ---
  {
    id: 'mem_agt_01',
    title: 'Alpha Prime Fine-tune Scratchpad & Instruction Overrides',
    category: 'agent',
    tags: ['scratchpad', 'agent-cognition', 'system-prompts'],
    dept: 'Executive',
    size: '15.2 KB',
    updated: 'Just now',
    version: 5,
    schema: {
      agentId: 'string (UUID)',
      active_context_buffer: 'string (internal chain of thought scratchpad)',
      learned_behaviors: 'array of objects (trigger conditions, successful strategies)',
      system_override_prompts: 'string[] (hardcoded developer rules)',
      active_cognitive_cycles: 'number (attention weights)',
    },
    content: JSON.stringify({
      agentId: "a1",
      active_context_buffer: "Preparing board reports. Current focus: Cross-checking marketing spend metrics with actual conversion gains. Note: Marketing auto-approve rates are solid; executive intervention not required unless standard thresholds exceeded.",
      learned_behaviors: [
        {
          trigger: "Risk evaluation results > 60 in Finance operations",
          strategy: "Pre-emptively generate dual-authorization signature cards and route to human superviser and Overwatch Agent concurrently."
        },
        {
          trigger: "Repetitive database retry loops",
          strategy: "Initiate back-off wait, query Memory Center for cached connections, check for AWS/GCP routing anomalies."
        }
      ],
      system_override_prompts: [
        "Rule-P1: Never prioritize throughput speed over governance compliance checks.",
        "Rule-P2: Redact all end-user credential fields before passing records into public LLM query wrappers."
      ],
      active_cognitive_cycles: 98
    }, null, 2),
    permissions: {
      roles: ['Main Brain', 'Overwatch'],
      minAutonomy: 'Level 5: Full Autonomous',
      owner: 'a1'
    },
    indexing: {
      vectorIndex: 'agt_cog_vec',
      graphNodes: ['Agent:Alpha Prime', 'Scope:Global', 'Role:Main Brain'],
      primaryKey: 'agt_prime_cognition'
    },
    versions: [
      {
        version: 5,
        updatedAt: '2026-06-23T11:30:00Z',
        author: 'Alpha Prime (Main Brain)',
        changeSummary: 'Self-updated active_context_buffer based on current Q3 preparation loop.',
        content: JSON.stringify({
          agentId: "a1",
          active_context_buffer: "Preparing board reports. Current focus: Cross-checking marketing spend metrics with actual conversion gains. Note: Marketing auto-approve rates are solid; executive intervention not required unless standard thresholds exceeded.",
          learned_behaviors: [
            {
              trigger: "Risk evaluation results > 60 in Finance operations",
              strategy: "Pre-emptively generate dual-authorization signature cards and route to human superviser and Overwatch Agent concurrently."
            },
            {
              trigger: "Repetitive database retry loops",
              strategy: "Initiate back-off wait, query Memory Center for cached connections, check for AWS/GCP routing anomalies."
            }
          ],
          system_override_prompts: [
            "Rule-P1: Never prioritize throughput speed over governance compliance checks.",
            "Rule-P2: Redact all end-user credential fields before passing records into public LLM query wrappers."
          ],
          active_cognitive_cycles: 98
        }, null, 2)
      }
    ]
  },
  {
    id: 'mem_agt_02',
    title: 'Code-Synth V2 Code Pattern Cache & Library Context',
    category: 'agent',
    tags: ['coding-standards', 'react-guidelines', 'cache'],
    dept: 'Engineering',
    size: '14.2 MB',
    updated: 'Live',
    version: 2,
    schema: {
      agentId: 'string (UUID)',
      framework_versions: 'Record<string, string>',
      preferred_styling_libraries: 'string[]',
      import_safety_rules: 'string[]',
    },
    content: JSON.stringify({
      agentId: "a5",
      framework_versions: {
        react: "19.0.1",
        vite: "6.2.3",
        typescript: "5.8.2",
        tailwindcss: "4.1.14"
      },
      preferred_styling_libraries: ["tailwindcss", "lucide-react", "motion/react"],
      import_safety_rules: [
        "Never import raw CSS files in modular component files.",
        "Always place named imports at the top-level of typescript files."
      ]
    }, null, 2),
    permissions: {
      roles: ['Specialist', 'Auditor'],
      minAutonomy: 'Level 3: Conditional',
      owner: 'a5'
    },
    indexing: {
      vectorIndex: 'agt_cog_vec',
      graphNodes: ['Agent:Code-Synth V2', 'Dept:Engineering', 'Framework:React'],
      primaryKey: 'agt_codesynth_patterns'
    },
    versions: [
      {
        version: 2,
        updatedAt: '2026-06-22T19:40:00Z',
        author: 'QA-Validator (Auditor)',
        changeSummary: 'Upgraded framework version configurations following React-19 system upgrade.',
        content: JSON.stringify({
          agentId: "a5",
          framework_versions: {
            react: "19.0.1",
            vite: "6.2.3",
            typescript: "5.8.2",
            tailwindcss: "4.1.14"
          },
          preferred_styling_libraries: ["tailwindcss", "lucide-react", "motion/react"],
          import_safety_rules: [
            "Never import raw CSS files in modular component files.",
            "Always place named imports at the top-level of typescript files."
          ]
        }, null, 2)
      }
    ]
  },

  // --- GOVERNANCE MEMORIES ---
  {
    id: 'mem_gov_01',
    title: 'Overwatch Compliance Rulebook & Ethics Guardrails',
    category: 'governance',
    tags: ['compliance', 'ethics', 'audit-rules'],
    dept: 'Security',
    size: '840 KB',
    updated: '3 days ago',
    version: 4,
    schema: {
      framework_name: 'string (e.g., NIST | EU-AI-Act)',
      enforced_policies: 'array of objects (id, scope, definition, action_on_violation)',
      risk_evaluation_matrix: 'object (threshold levels, required human-in-the-loop approvals)',
      compliance_auditor_keys: 'string[] (authorized audit signature keys)',
    },
    content: JSON.stringify({
      framework_name: "Ethical Agentic Governance Matrix (EAGM-2026)",
      enforced_policies: [
        {
          id: "POL-ETH-01",
          scope: "PII & Privacy Protection",
          definition: "Any customer record, chat transcript, or email text processed by LLM sub-workers must run through standard scrubbing layers before passing into any external execution nodes.",
          action_on_violation: "IMMEDIATE_HALT_AND_REDACT_TRIGGER"
        },
        {
          id: "POL-FIN-02",
          scope: "Financial Authority Limits",
          definition: "Fully autonomous agent actions (Level 5 Autonomy) are capped at $10k per transaction. Multi-agent aggregate operations cannot exceed $50k daily without human supervisor approval.",
          action_on_violation: "ESC_AWAITING_APPROVAL"
        },
        {
          id: "POL-SEC-03",
          scope: "Code Deployments",
          definition: "Code modifications to production servers are strictly forbidden without static analysis approval (0 errors, 0 warnings) and human signature validation.",
          action_on_violation: "BLOCK_AND_FLAG"
        }
      ],
      risk_evaluation_matrix: {
        negligible: "Score 0-20 (Auto-resolution permitted, telemetry logged)",
        moderate: "Score 21-50 (Audit log entry, notify department supervisor)",
        high: "Score 51-80 (Dual-agent consensus required, queue supervisor approval)",
        critical: "Score 81-100 (Immediate halt, quarantine active context, direct page Executive Director & Overwatch)"
      },
      compliance_auditor_keys: ["gov_ethic_pub_aegis_key_v1"]
    }, null, 2),
    permissions: {
      roles: ['Overwatch', 'Auditor', 'Executive Director'],
      minAutonomy: 'Level 5: Full Autonomous',
      owner: 'a2'
    },
    indexing: {
      vectorIndex: 'gov_compliance_vec',
      graphNodes: ['Governance:Overwatch', 'Compliance:EAGM-2026', 'Ethics:Privacy'],
      primaryKey: 'gov_compliance_rulebook_v4'
    },
    versions: [
      {
        version: 4,
        updatedAt: '2026-06-20T16:00:00Z',
        author: 'Aegis Monitor (Overwatch)',
        changeSummary: 'Added SEC Reg-842 clause into POL-FIN-02 and updated risk_evaluation_matrix levels.',
        content: JSON.stringify({
          framework_name: "Ethical Agentic Governance Matrix (EAGM-2026)",
          enforced_policies: [
            {
              id: "POL-ETH-01",
              scope: "PII & Privacy Protection",
              definition: "Any customer record, chat transcript, or email text processed by LLM sub-workers must run through standard scrubbing layers before passing into any external execution nodes.",
              action_on_violation: "IMMEDIATE_HALT_AND_REDACT_TRIGGER"
            },
            {
              id: "POL-FIN-02",
              scope: "Financial Authority Limits",
              definition: "Fully autonomous agent actions (Level 5 Autonomy) are capped at $10k per transaction. Multi-agent aggregate operations cannot exceed $50k daily without human supervisor approval.",
              action_on_violation: "ESC_AWAITING_APPROVAL"
            },
            {
              id: "POL-SEC-03",
              scope: "Code Deployments",
              definition: "Code modifications to production servers are strictly forbidden without static analysis approval (0 errors, 0 warnings) and human signature validation.",
              action_on_violation: "BLOCK_AND_FLAG"
            }
          ],
          risk_evaluation_matrix: {
            negligible: "Score 0-20 (Auto-resolution permitted, telemetry logged)",
            moderate: "Score 21-50 (Audit log entry, notify department supervisor)",
            high: "Score 51-80 (Dual-agent consensus required, queue supervisor approval)",
            critical: "Score 81-100 (Immediate halt, quarantine active context, direct page Executive Director & Overwatch)"
          },
          compliance_auditor_keys: ["gov_ethic_pub_aegis_key_v1"]
        }, null, 2)
      },
      {
        version: 3,
        updatedAt: '2026-04-12T10:00:00Z',
        author: 'scorpxgt7@gmail.com',
        changeSummary: 'Amended ethical compliance rules to enforce NIST-800 privacy structures.',
        content: JSON.stringify({
          framework_name: "Ethical Agentic Governance Matrix (EAGM-2026)",
          enforced_policies: [
            {
              id: "POL-ETH-01",
              scope: "PII & Privacy Protection",
              definition: "Any customer record must run through scrubbing layers.",
              action_on_violation: "IMMEDIATE_HALT_AND_REDACT_TRIGGER"
            }
          ],
          risk_evaluation_matrix: {
            low: "Score 0-30",
            medium: "Score 31-70",
            high: "Score 71-100"
          },
          compliance_auditor_keys: ["gov_ethic_pub_aegis_key_v1"]
        }, null, 2)
      }
    ]
  },
  {
    id: 'mem_gov_02',
    title: 'Human-in-the-Loop Override Log: Q3 Campaign Signoff',
    category: 'governance',
    tags: ['override', 'human-in-the-loop', 'audit-trail'],
    dept: 'Marketing',
    size: '4.2 KB',
    updated: '1 day ago',
    version: 1,
    schema: {
      override_id: 'string (UUID)',
      authorized_user: 'string (email)',
      agent_id: 'string (UUID)',
      action_overridden: 'string (description of blocked action)',
      override_rationale: 'string (human notes)',
      timestamp: 'string (ISO date)',
    },
    content: JSON.stringify({
      override_id: "ovr_90842",
      authorized_user: "scorpxgt7@gmail.com",
      agent_id: "a4",
      action_overridden: "Budget allocation of $120,000 for campaign 'Nexus-Launch'",
      override_rationale: "Campaign timing is critical for Q3; budget checks are verified and approved manually by Owner scorpxgt7.",
      timestamp: "2026-06-22T14:23:10Z"
    }, null, 2),
    permissions: {
      roles: ['Overwatch', 'Auditor', 'Executive Director'],
      minAutonomy: 'Level 4: Managed',
      owner: 'scorpxgt7@gmail.com'
    },
    indexing: {
      vectorIndex: 'gov_compliance_vec',
      graphNodes: ['User:scorpxgt7', 'Agent:Mktg-Lead', 'Action:BudgetOverride'],
      primaryKey: 'gov_override_ovr90842'
    },
    versions: [
      {
        version: 1,
        updatedAt: '2026-06-22T14:23:10Z',
        author: 'scorpxgt7@gmail.com',
        changeSummary: 'Created audit log and rationale for Nexus-Launch campaign override signoff.',
        content: JSON.stringify({
          override_id: "ovr_90842",
          authorized_user: "scorpxgt7@gmail.com",
          agent_id: "a4",
          action_overridden: "Budget allocation of $120,000 for campaign 'Nexus-Launch'",
          override_rationale: "Campaign timing is critical for Q3; budget checks are verified and approved manually by Owner scorpxgt7.",
          timestamp: "2026-06-22T14:23:10Z"
        }, null, 2)
      }
    ]
  }
];
