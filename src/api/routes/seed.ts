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

    // Create Integrations
    const { integrations } = await import('../../db/schema');
    await db.insert(integrations).values([
      { id: 'local_llm', organizationId: orgId, name: 'Android Local LLM Core', category: 'Privacy First AI', status: 'Connected', lastSync: 'Real-time', icon: 'M17,1H7A2,2 0 0,0 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3A2,2 0 0,0 17,1M17,19H7V5H17V19Z' },
      { id: 'github', organizationId: orgId, name: 'GitHub', category: 'Developer Tools', status: 'Connected', lastSync: '10 mins ago', icon: 'M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z' },
      { id: 'slack', organizationId: orgId, name: 'Slack', category: 'Communication', status: 'Connected', lastSync: '1 hour ago', icon: 'M17.9 10.9C17.9 12 17 12.9 15.9 12.9C14.8 12.9 13.9 12 13.9 10.9V6.9C13.9 5.8 14.8 4.9 15.9 4.9C17 4.9 17.9 5.8 17.9 6.9V10.9ZM11.9 10.9C11.9 12 11 12.9 9.9 12.9H5.9C4.8 12.9 3.9 12 3.9 10.9C3.9 9.8 4.8 8.9 5.9 8.9H9.9C11 8.9 11.9 9.8 11.9 10.9ZM10.9 17.9C9.8 17.9 8.9 17 8.9 15.9C8.9 14.8 9.8 13.9 10.9 13.9V9.9C10.9 8.8 11.8 7.9 12.9 7.9C14 7.9 14.9 8.8 14.9 9.9V13.9C14.9 15 14 15.9 12.9 15.9C11.8 15.9 10.9 15 10.9 17.9ZM17.9 15.9C17.9 17 17 17.9 15.9 17.9H11.9C10.8 17.9 9.9 17 9.9 15.9C9.9 14.8 10.8 13.9 11.9 13.9H15.9C17 13.9 17.9 14.8 17.9 15.9Z' },
      { id: 'google-drive', organizationId: orgId, name: 'Google Drive', category: 'Storage', status: 'Disconnected', lastSync: 'Never', icon: 'M7.71,3.5L1.15,15L4.58,21L11.13,9.5M9.73,15L6.3,21H19.42L22.85,15M22.28,14L15.72,2.5H8.85L15.42,14H22.28Z' },
      { id: 'notion', organizationId: orgId, name: 'Notion', category: 'Knowledge', status: 'Disconnected', lastSync: 'Never', icon: 'M4,4H20V20H4V4M6,6V18H18V6H6M8,8H16V16H8V8Z' },
      { id: 'salesforce', organizationId: orgId, name: 'Salesforce', category: 'CRM', status: 'Disconnected', lastSync: 'Never', icon: 'M17.5,9.5A2.5,2.5 0 0,0 15,12H14.5V13H15A3.5,3.5 0 0,1 15,20H7A3,3 0 0,1 7,14V13H7.5A2.5,2.5 0 0,0 7.5,8H10A4,4 0 0,1 17.5,9.5M10.5,3A5,5 0 0,0 5.5,8V12H4.5A4.5,4.5 0 0,0 4.5,21H16A4.5,4.5 0 0,0 20.5,16.5C20.5,14.63 19.36,12.97 17.76,12.3A4.5,4.5 0 0,0 15,5H14.5C14.15,3.85 13.1,3 11.85,3H10.5Z' },
    ]);

    res.json({ message: 'Seeded successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Failed to seed data' });
  }
});

export default router;
