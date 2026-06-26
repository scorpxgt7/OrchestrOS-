import { Router } from 'express';
import { db } from '../../db/index.ts';
import { agents, tasks, memoryRecords, workflows, policies, riskEvaluations, departments } from '../../db/schema.ts';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../../middleware/auth.ts';

const router = Router();

router.post('/', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }
    const orgId = user.organizationId;

    // Check if seeded
    const existingAgents = await db.query.agents.findMany({ where: eq(agents.organizationId, orgId) });
    if (existingAgents.length > 0) {
      return res.json({ message: 'Already seeded' });
    }

    const dept = await db.query.departments.findFirst({ where: eq(departments.organizationId, orgId) });
    const deptId = dept?.id;

    // Create Workflows
    const wfResult = await db.insert(workflows).values([
      { organizationId: orgId, name: 'Default Workflow' }
    ]).returning();
    const wfId = wfResult[0].id;

    // Create Agents
    const alphaAgentResult = await db.insert(agents).values([
      {
        organizationId: orgId,
        departmentId: deptId,
        name: 'Alpha-1 (Main Brain)',
        role: 'Orchestrator',
        mission: 'Decompose goals and route tasks',
        autonomyLevel: 5,
        skills: ['Task Decomposition', 'Routing', 'Strategy'],
        status: 'active'
      }
    ]).returning();
    const alphaAgent = alphaAgentResult[0];

    const childAgentsResult = await db.insert(agents).values([
      {
        organizationId: orgId,
        departmentId: deptId,
        name: 'Omega-Watch',
        role: 'Overwatch',
        mission: 'Monitor system activity and detect anomalies',
        autonomyLevel: 4,
        skills: ['Monitoring', 'Risk Assessment'],
        status: 'active',
        reportingManager: alphaAgent.id
      },
      {
        organizationId: orgId,
        departmentId: deptId,
        name: 'Delta-Coder',
        role: 'Specialist',
        mission: 'Write and review code',
        autonomyLevel: 2,
        skills: ['TypeScript', 'React', 'Node.js'],
        status: 'active',
        reportingManager: alphaAgent.id
      }
    ]).returning();

    const createdAgents = [alphaAgent, ...childAgentsResult];

    // Create Tasks
    await db.insert(tasks).values([
      {
        organizationId: orgId,
        departmentId: deptId,
        workflowId: wfId,
        title: 'Analyze User Feedback',
        description: 'Process Q3 feedback forms and extract insights.',
        status: 'In Progress',
        assignedAgentId: createdAgents[0].id,
        ownerUserId: user.id,
      },
      {
        organizationId: orgId,
        departmentId: deptId,
        workflowId: wfId,
        title: 'Security Audit',
        description: 'Review access logs for suspicious patterns.',
        status: 'Backlog',
        assignedAgentId: createdAgents[1].id,
        ownerUserId: user.id,
      }
    ]);

    // Create Memory
    await db.insert(memoryRecords).values([
      {
        organizationId: orgId,
        category: 'governance',
        content: 'System should default to zero-trust for all new agent provisioning.',
      },
      {
        organizationId: orgId,
        category: 'organization',
        content: 'Project Alpha is targeting Q4 release. High priority on performance.',
      }
    ]);

    // Create Policy
    await db.insert(policies).values([
      {
        organizationId: orgId,
        scope: 'global',
        subjectType: 'agent',
        action: 'provision',
        condition: 'autonomyLevel > 3',
        severity: 'high',
        status: 'active'
      }
    ]);

    res.json({ message: 'Seeded successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Failed to seed data' });
  }
});

export default router;
