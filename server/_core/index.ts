import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import crypto from "crypto";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import * as db from "../db";
import { nanoid } from "nanoid";
import { seedTools } from "../tools/seedTools";
import { seedModelLibrary } from "../models/seedModelLibrary";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Affiliate redirect endpoint — tracks click then redirects to tool URL
  app.get('/api/tools/click/:toolId', async (req, res) => {
    const { toolId } = req.params;
    const userId = req.query.userId as string;
    const source = (req.query.source as string) || 'direct';
    try {
      const tool = await db.getTool(toolId);
      if (!tool || !tool.isApproved) {
        return res.redirect('/tools');
      }
      const ipHash = crypto
        .createHash('sha256')
        .update(req.ip || '')
        .digest('hex')
        .substring(0, 16);
      await db.logToolClick({
        clickId: nanoid(16),
        toolId,
        userId: userId ? parseInt(userId) : undefined,
        source,
        referrer: req.headers.referer || undefined,
        ipHash,
      });
      const destination = tool.affiliateUrl || tool.websiteUrl;
      return res.redirect(302, destination);
    } catch (e) {
      const tool = await db.getTool(toolId).catch(() => null);
      return res.redirect(tool?.websiteUrl || '/tools');
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    // Seed AI tools directory on first start (idempotent via upsert)
    seedTools().catch(e => console.warn('[Seed] Tools seed failed:', e.message));
    seedModelLibrary().catch(e => console.warn('[Seed] Model library seed failed:', e.message));
  });
}

startServer().catch(console.error);
