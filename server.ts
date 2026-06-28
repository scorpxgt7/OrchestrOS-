import express from "express";
import path from "path";
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser } from './src/db/users.ts';

import agentsRouter from './src/api/routes/agents.ts';
import tasksRouter from './src/api/routes/tasks.ts';
import workflowsRouter from './src/api/routes/workflows.ts';
import memoryRouter from './src/api/routes/memory.ts';
import policiesRouter from './src/api/routes/policies.ts';
import incidentsRouter from './src/api/routes/incidents.ts';
import auditRouter from './src/api/routes/audit.ts';
import departmentsRouter from './src/api/routes/departments.ts';
import brainRouter from './src/api/routes/brain.ts';
import seedRouter from './src/api/routes/seed.ts';
import devRouter from './src/api/routes/dev.ts';
import dashboardRouter from './src/api/routes/dashboard.ts';
import organizationsRouter from './src/api/routes/organizations.ts';
import evaluationsRouter from './src/api/routes/evaluations.ts';
import integrationsRouter from './src/api/routes/integrations.ts';
import overwatchRouter from './src/api/routes/overwatch.ts';
import approvalsRouter from './src/api/routes/approvals.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Example auth route
  app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const user = await getOrCreateUser(req.user.uid, req.user.email || '');
      res.json({ user });
    } catch (error: any) {
      console.error("Auth sync error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.use('/api/agents', agentsRouter);
  app.use('/api/tasks', tasksRouter);
  app.use('/api/workflows', workflowsRouter);
  app.use('/api/memory', memoryRouter);
  app.use('/api/policies', policiesRouter);
  app.use('/api/incidents', incidentsRouter);
  app.use('/api/audit', auditRouter);
  app.use('/api/departments', departmentsRouter);
  app.use('/api/brain', brainRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/organizations', organizationsRouter);
  app.use('/api/evaluations', evaluationsRouter);
  app.use('/api/integrations', integrationsRouter);
  app.use('/api/overwatch', overwatchRouter);
  app.use('/api/approvals', approvalsRouter);
  app.use('/api/seed', seedRouter);
  app.use('/api/dev', devRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
