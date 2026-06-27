import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  settings: jsonb('settings').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  organizationId: integer('organization_id').references(() => organizations.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const departments = pgTable('departments', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  region: text('region'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const agents = pgTable('agents', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  departmentId: integer('department_id').references(() => departments.id),
  name: text('name').notNull(),
  role: text('role').notNull(),
  mission: text('mission'),
  responsibilities: jsonb('responsibilities').default([]),
  skills: jsonb('skills').default([]),
  toolPermissions: jsonb('tool_permissions').default([]),
  memoryAccess: text('memory_access'),
  autonomyLevel: integer('autonomy_level').default(0),
  approvalRequirements: jsonb('approval_requirements'),
  escalationRules: jsonb('escalation_rules'),
  reportingManager: integer('reporting_manager'),
  performanceMetrics: jsonb('performance_metrics'),
  riskLimits: jsonb('risk_limits'),
  outputFormat: text('output_format'),
  failureBehavior: text('failure_behavior'),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const workflows = pgTable('workflows', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const riskEvaluations = pgTable('risk_evaluations', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  security: integer('security').default(0),
  privacy: integer('privacy').default(0),
  legal: integer('legal').default(0),
  financial: integer('financial').default(0),
  operational: integer('operational').default(0),
  reputation: integer('reputation').default(0),
  compliance: integer('compliance').default(0),
  hallucination: integer('hallucination').default(0),
  dataLoss: integer('data_loss').default(0),
  toolMisuse: integer('tool_misuse').default(0),
  autonomyRisk: integer('autonomy_risk').default(0),
  totalScore: integer('total_score').default(0),
  reasoningSummary: text('reasoning_summary'),
  recommendedControls: jsonb('recommended_controls'),
  requiredApprovalLevel: text('required_approval_level'),
  escalationRecommendation: text('escalation_recommendation'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const policies = pgTable('policies', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  scope: text('scope').notNull(),
  departmentId: integer('department_id').references(() => departments.id),
  subjectType: text('subject_type'),
  action: text('action'),
  condition: text('condition'),
  severity: text('severity').notNull(),
  status: text('status').default('active'),
  version: integer('version').default(1),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const approvalRequests = pgTable('approval_requests', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  requesterUserId: integer('requester_user_id').references(() => users.id),
  requesterAgentId: integer('requester_agent_id').references(() => agents.id),
  resourceType: text('resource_type').notNull(),
  resourceId: text('resource_id').notNull(),
  action: text('action').notNull(),
  reason: text('reason'),
  policyId: integer('policy_id').references(() => policies.id),
  riskEvaluationId: integer('risk_evaluation_id').references(() => riskEvaluations.id),
  requiredApprovers: jsonb('required_approvers'),
  status: text('status').default('pending'),
  decision: text('decision'),
  decidedBy: integer('decided_by').references(() => users.id),
  decidedAt: timestamp('decided_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  ownerUserId: integer('owner_user_id').references(() => users.id),
  assignedAgentId: integer('assigned_agent_id').references(() => agents.id),
  departmentId: integer('department_id').references(() => departments.id),
  workflowId: integer('workflow_id').references(() => workflows.id),
  status: text('status').notNull(),
  priority: text('priority').default('medium'),
  deadline: timestamp('deadline'),
  dependencies: jsonb('dependencies').default([]),
  riskLevel: text('risk_level'),
  riskEvaluationId: integer('risk_evaluation_id').references(() => riskEvaluations.id),
  approvalStatus: text('approval_status'),
  approvalRequestIds: jsonb('approval_request_ids').default([]),
  relatedMemoryIds: jsonb('related_memory_ids').default([]),
  relatedFileIds: jsonb('related_file_ids').default([]),
  relatedAgentIds: jsonb('related_agent_ids').default([]),
  toolUsage: jsonb('tool_usage').default([]),
  decisionHistory: jsonb('decision_history').default([]),
  output: jsonb('output'),
  auditLogIds: jsonb('audit_log_ids').default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const memoryRecords = pgTable('memory_records', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  category: text('category').notNull(), // user, organization, task, agent, governance
  content: text('content').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  actorUserId: integer('actor_user_id').references(() => users.id),
  actorAgentId: integer('actor_agent_id').references(() => agents.id),
  taskId: integer('task_id').references(() => tasks.id),
  toolId: text('tool_id'),
  memoryRecordId: integer('memory_record_id').references(() => memoryRecords.id),
  policyId: integer('policy_id').references(() => policies.id),
  approvalId: integer('approval_id').references(() => approvalRequests.id),
  action: text('action').notNull(),
  decision: text('decision'),
  approvalRequired: boolean('approval_required').default(false),
  timestamp: timestamp('timestamp').defaultNow(),
  riskScore: integer('risk_score'),
  riskDimensions: jsonb('risk_dimensions'),
  outcome: text('outcome'),
  error: text('error'),
  warning: text('warning'),
  escalationPath: text('escalation_path'),
  metadata: jsonb('metadata'),
});

export const incidents = pgTable('incidents', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  severity: text('severity').notNull(),
  status: text('status').default('open'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  tasks: many(tasks),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  departments: many(departments),
  agents: many(agents),
  tasks: many(tasks),
  workflows: many(workflows),
  policies: many(policies),
  approvalRequests: many(approvalRequests),
  memoryRecords: many(memoryRecords),
  auditLogs: many(auditLogs),
  incidents: many(incidents),
}));

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [departments.organizationId],
    references: [organizations.id],
  }),
  agents: many(agents),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [agents.organizationId],
    references: [organizations.id],
  }),
  department: one(departments, {
    fields: [agents.departmentId],
    references: [departments.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  organization: one(organizations, {
    fields: [tasks.organizationId],
    references: [organizations.id],
  }),
  assignedAgent: one(agents, {
    fields: [tasks.assignedAgentId],
    references: [agents.id],
  }),
  ownerUser: one(users, {
    fields: [tasks.ownerUserId],
    references: [users.id],
  }),
  workflow: one(workflows, {
    fields: [tasks.workflowId],
    references: [workflows.id],
  }),
  department: one(departments, {
    fields: [tasks.departmentId],
    references: [departments.id],
  }),
}));
