import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import crypto from "crypto";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { startDriveScheduler } from "../drive/driveScheduler";
import { startCalendarScheduler } from "../calendar/calendarScheduler";
import { exchangeCodeForTokens } from "../drive/googleDrive";
import { provisionAgentFolder } from "../drive/driveSync";
import { sdk } from "./sdk";
import * as db from "../db";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { nanoid } from "nanoid";
import { seedTools } from "../tools/seedTools";
import { seedModelLibrary } from "../models/seedModelLibrary";
import { google } from "googleapis";
import { ENV } from "./env";
import { getDb } from "../db";
import * as schema from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";

// ── CORS allowlist ──────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://asre-production-a9d5.up.railway.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

// ── Rate limiter for auth endpoints ────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please wait 15 minutes and try again." },
});

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

  // ── Security headers (Helmet) ─────────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: false, // Vite dev needs this off; revisit for prod hardening
    crossOriginEmbedderPolicy: false,
  }));

  // ── CORS ──────────────────────────────────────────────────────────────────
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
  }));

  // ── Rate limiting on auth routes ──────────────────────────────────────────
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);

  // ── Stripe webhook — MUST be registered BEFORE express.json() ────────────
  // (imported lazily to avoid top-level Stripe instantiation without a key)
  app.post(
    "/api/webhooks/stripe",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"] as string;
      const webhookSecret = ENV.stripeWebhookSecret;

      if (!webhookSecret) {
        console.warn("[Stripe] Webhook secret not configured — skipping verification");
        res.json({ received: true });
        return;
      }

      let event: import("stripe").Stripe.Event;

      try {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(ENV.stripeSecretKey);
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err: any) {
        console.error("[Stripe] Webhook signature verification failed:", err.message);
        res.status(400).json({ error: "Webhook signature invalid" });
        return;
      }

      try {
        const { handleStripeEvent } = await import("../stripe/webhookHandler");
        await handleStripeEvent(event);
        res.json({ received: true });
      } catch (err) {
        console.error("[Stripe] Event handler error:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  );

  // ── Body parsers (AFTER raw Stripe webhook route) ─────────────────────────
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Standalone auth routes: POST /api/auth/login, /api/auth/register, /api/auth/logout
  registerOAuthRoutes(app);

  // Google Drive OAuth callback — GET /api/drive/callback?code=...
  app.get('/api/drive/callback', async (req, res) => {
    const code = req.query.code as string;
    if (!code) return res.status(400).send('Missing code');
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user) return res.redirect('/login?error=unauthenticated');
      const tokens = await exchangeCodeForTokens(code);
      await db.saveDriveTokens(
        user.id,
        tokens.access_token!,
        tokens.refresh_token!,
        tokens.expiry_date ? new Date(tokens.expiry_date) : undefined
      );
      const profile = await db.getAgentProfile(user.id);
      await provisionAgentFolder(user.id, (profile as any)?.name ?? 'Agent', (profile as any)?.email ?? '');
      return res.redirect('/settings?tab=integrations&drive=connected');
    } catch (err) {
      console.error('[Drive] OAuth callback error:', err);
      return res.redirect('/settings?tab=integrations&drive=error');
    }
  });

  // Google Calendar OAuth callback — GET /api/calendar/callback?code=...&state=cal:{userId}
  app.get('/api/calendar/callback', async (req, res) => {
    const code = req.query.code as string;
    if (!code) return res.status(400).send('Missing code');
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user) return res.redirect('/login?error=unauthenticated');

      const auth = new google.auth.OAuth2(
        ENV.googleClientId,
        ENV.googleClientSecret,
        ENV.googleRedirectUri
      );
      const { tokens } = await auth.getToken(code);
      const dbConn = await getDb();
      if (!dbConn) throw new Error('Database not available');

      const existing = await dbConn.select().from(schema.calendarSettings)
        .where(eq(schema.calendarSettings.userId, user.id)).limit(1);

      if (existing[0]) {
        await dbConn.update(schema.calendarSettings)
          .set({
            gcalAccessToken: tokens.access_token ?? null,
            gcalRefreshToken: tokens.refresh_token ?? null,
          })
          .where(eq(schema.calendarSettings.userId, user.id));
      } else {
        await dbConn.insert(schema.calendarSettings).values({
          userId: user.id,
          gcalAccessToken: tokens.access_token ?? null,
          gcalRefreshToken: tokens.refresh_token ?? null,
        });
      }
      return res.redirect('/action-engine?cal=connected');
    } catch (err) {
      console.error('[Calendar] OAuth callback error:', err);
      return res.redirect('/action-engine?cal=error');
    }
  });

  // Google Calendar webhook — POST /api/calendar/webhook
  app.post('/api/calendar/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    // Acknowledge immediately — process async
    res.status(200).send('ok');
    const channelId = req.headers['x-goog-channel-id'] as string;
    console.log('[Calendar] Webhook received for channel:', channelId);
  });

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

  // TEMPORARY — remove before beta launch
  app.get('/api/debug/session', async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      res.json({ authenticated: true, userId: user.id, email: user.email });
    } catch {
      res.json({ authenticated: false, cookies: Object.keys(req.cookies ?? {}) });
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
    startDriveScheduler();
    startCalendarScheduler();
  });
}

startServer().catch(console.error);
