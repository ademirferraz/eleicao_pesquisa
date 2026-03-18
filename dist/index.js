// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var candidates = mysqlTable("candidates", {
  id: int("id").autoincrement().primaryKey(),
  number: int("number").notNull().unique(),
  // Electoral number (10, 20, 11, etc.)
  name: varchar("name", { length: 255 }).notNull(),
  party: varchar("party", { length: 100 }),
  position: varchar("position", { length: 100 }),
  // e.g., "Vereador", "Prefeito"
  photoUrl: text("photoUrl"),
  // URL to candidate photo
  bio: text("bio"),
  // Short biography
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var voters = mysqlTable("voters", {
  id: int("id").autoincrement().primaryKey(),
  cpf: varchar("cpf", { length: 14 }).notNull().unique(),
  // CPF with formatting
  name: varchar("name", { length: 255 }).notNull(),
  birthDate: varchar("birthDate", { length: 10 }).notNull(),
  // DD/MM/YYYY
  state: varchar("state", { length: 2 }).notNull(),
  // UF
  municipality: varchar("municipality", { length: 100 }).notNull(),
  neighborhood: varchar("neighborhood", { length: 100 }).notNull(),
  hasVoted: boolean("hasVoted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var votes = mysqlTable("votes", {
  id: int("id").autoincrement().primaryKey(),
  voterId: int("voterId").notNull(),
  // Reference to voter
  candidateId: int("candidateId").notNull(),
  // Reference to candidate
  candidateNumber: int("candidateNumber").notNull(),
  // Electoral number for reference
  state: varchar("state", { length: 2 }).notNull(),
  municipality: varchar("municipality", { length: 100 }).notNull(),
  neighborhood: varchar("neighborhood", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var adminSettings = mysqlTable("adminSettings", {
  id: int("id").autoincrement().primaryKey(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  // Hashed password
  votingEnabled: boolean("votingEnabled").default(true).notNull(),
  registrationEnabled: boolean("registrationEnabled").default(true).notNull(),
  maxCandidates: int("maxCandidates").default(6).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var electionConfig = mysqlTable("electionConfig", {
  id: int("id").autoincrement().primaryKey(),
  state: varchar("state", { length: 2 }).notNull(),
  // UF (e.g., SP, MG)
  municipality: varchar("municipality", { length: 100 }).notNull(),
  // City name
  electionName: varchar("electionName", { length: 255 }),
  // Optional election name
  electionYear: int("electionYear").notNull(),
  // Year of election
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getCandidates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(candidates).where(eq(candidates.isActive, true));
}
async function getCandidateById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(candidates).where(eq(candidates.id, id)).limit(1);
  return result[0];
}
async function createCandidate(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(candidates).values(data);
  return result;
}
async function updateCandidate(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(candidates).set(data).where(eq(candidates.id, id));
}
async function deleteCandidate(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(candidates).set({ isActive: false }).where(eq(candidates.id, id));
}
async function getVoterByCPF(cpf) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(voters).where(eq(voters.cpf, cpf)).limit(1);
  return result[0];
}
async function createVoter(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(voters).values(data);
  return getVoterByCPF(data.cpf);
}
async function createVote(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(votes).values(data);
  await db.update(voters).set({ hasVoted: true }).where(eq(voters.id, data.voterId));
}
async function getVotesByCandidate(candidateId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(votes).where(eq(votes.candidateId, candidateId));
}
async function getVotesByNeighborhood(neighborhood) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(votes).where(eq(votes.neighborhood, neighborhood));
}
async function getVotesByMunicipality(municipality) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(votes).where(eq(votes.municipality, municipality));
}
async function getVotingStats() {
  const db = await getDb();
  if (!db) return { totalVotes: 0, totalVoters: 0, candidates: [] };
  const allVotes = await db.select().from(votes);
  const allVoters = await db.select().from(voters);
  const allCandidates = await db.select().from(candidates).where(eq(candidates.isActive, true));
  const candidateStats = allCandidates.map((candidate) => {
    const candidateVotes = allVotes.filter((v) => v.candidateId === candidate.id);
    return {
      ...candidate,
      voteCount: candidateVotes.length,
      percentage: allVotes.length > 0 ? candidateVotes.length / allVotes.length * 100 : 0
    };
  });
  return {
    totalVotes: allVotes.length,
    totalVoters: allVoters.length,
    candidates: candidateStats
  };
}
async function getElectionConfig() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(electionConfig).limit(1);
  return result[0] || null;
}
async function saveElectionConfig(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(electionConfig);
  await db.insert(electionConfig).values(data);
  return data;
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { z as z2 } from "zod";
import { TRPCError as TRPCError3 } from "@trpc/server";

// server/websocket.ts
import { WebSocketServer, WebSocket } from "ws";
var clients = /* @__PURE__ */ new Set();
function setupWebSocket(server) {
  const wss = new WebSocketServer({ server, path: "/ws" });
  wss.on("connection", (ws) => {
    console.log("[WebSocket] New client connected");
    clients.add(ws);
    ws.send(JSON.stringify({ type: "connected", message: "Connected to vote updates" }));
    ws.on("close", () => {
      console.log("[WebSocket] Client disconnected");
      clients.delete(ws);
    });
    ws.on("error", (error) => {
      console.error("[WebSocket] Error:", error);
      clients.delete(ws);
    });
  });
  return wss;
}
function broadcastVote(voteData) {
  const message = JSON.stringify({
    type: "new_vote",
    data: voteData
  });
  console.log(`[WebSocket] Broadcasting vote from ${voteData.municipality}, ${voteData.state}`);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// server/routers.ts
var candidateSchema = z2.object({
  number: z2.number().int(),
  name: z2.string().min(1),
  party: z2.string().optional(),
  position: z2.string().optional(),
  photoUrl: z2.string().optional(),
  bio: z2.string().optional()
});
var voterSchema = z2.object({
  cpf: z2.string().min(14).max(14),
  name: z2.string().min(1),
  birthDate: z2.string().regex(/^\d{2}\/\d{2}\/\d{4}$/),
  state: z2.string().length(2),
  municipality: z2.string().min(1),
  neighborhood: z2.string().min(1)
});
var voteSchema = z2.object({
  voterId: z2.number().int(),
  candidateId: z2.number().int(),
  candidateNumber: z2.number().int(),
  state: z2.string().length(2),
  municipality: z2.string().min(1),
  neighborhood: z2.string().min(1)
});
async function verifyAdminPassword(password) {
  return password === "1234";
}
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  // Candidates router
  candidates: router({
    list: publicProcedure.query(async () => {
      return await getCandidates();
    }),
    getById: publicProcedure.input(z2.object({ id: z2.number().int() })).query(async ({ input }) => {
      return await getCandidateById(input.id);
    }),
    create: publicProcedure.input(candidateSchema).mutation(async ({ input }) => {
      return await createCandidate(input);
    }),
    update: publicProcedure.input(z2.object({ id: z2.number().int(), data: candidateSchema.partial() })).mutation(async ({ input }) => {
      await updateCandidate(input.id, input.data);
      return await getCandidateById(input.id);
    }),
    delete: publicProcedure.input(z2.object({ id: z2.number().int() })).mutation(async ({ input }) => {
      await deleteCandidate(input.id);
      return { success: true };
    })
  }),
  // Voters router
  voters: router({
    checkCPF: publicProcedure.input(z2.object({ cpf: z2.string() })).query(async ({ input }) => {
      const voter = await getVoterByCPF(input.cpf);
      return {
        exists: !!voter,
        hasVoted: voter?.hasVoted || false,
        voter: voter || null
      };
    }),
    register: publicProcedure.input(voterSchema).mutation(async ({ input }) => {
      const existing = await getVoterByCPF(input.cpf);
      if (existing) {
        throw new TRPCError3({
          code: "CONFLICT",
          message: "Este CPF j\xE1 foi registrado"
        });
      }
      const voter = await createVoter(input);
      return voter;
    })
  }),
  // Votes router
  votes: router({
    cast: publicProcedure.input(voteSchema).mutation(async ({ input }) => {
      const voter = await getVoterByCPF("");
      if (!voter) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Eleitor n\xE3o encontrado"
        });
      }
      if (voter.hasVoted) {
        throw new TRPCError3({
          code: "CONFLICT",
          message: "Este eleitor j\xE1 votou"
        });
      }
      await createVote(input);
      const candidate = await getCandidateById(input.candidateId);
      broadcastVote({
        candidateName: candidate?.name || `Candidato ${input.candidateNumber}`,
        state: input.state,
        municipality: input.municipality,
        neighborhood: input.neighborhood,
        timestamp: Date.now()
      });
      return { success: true };
    }),
    getStats: publicProcedure.query(async () => {
      return await getVotingStats();
    }),
    getByCandidate: publicProcedure.input(z2.object({ candidateId: z2.number().int() })).query(async ({ input }) => {
      return await getVotesByCandidate(input.candidateId);
    }),
    getByNeighborhood: publicProcedure.input(z2.object({ neighborhood: z2.string() })).query(async ({ input }) => {
      return await getVotesByNeighborhood(input.neighborhood);
    }),
    getByMunicipality: publicProcedure.input(z2.object({ municipality: z2.string() })).query(async ({ input }) => {
      return await getVotesByMunicipality(input.municipality);
    })
  }),
  // Admin router
  admin: router({
    login: publicProcedure.input(z2.object({ password: z2.string() })).mutation(async ({ input }) => {
      const isValid = await verifyAdminPassword(input.password);
      if (!isValid) {
        throw new TRPCError3({
          code: "UNAUTHORIZED",
          message: "Senha incorreta"
        });
      }
      return { success: true, token: "admin-session" };
    }),
    getStats: publicProcedure.query(async () => {
      return await getVotingStats();
    }),
    getCandidates: publicProcedure.query(async () => {
      return await getCandidates();
    }),
    addCandidate: publicProcedure.input(candidateSchema).mutation(async ({ input }) => {
      const candidates2 = await getCandidates();
      if (candidates2.length >= 6) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "M\xE1ximo de 6 candidatos atingido"
        });
      }
      return await createCandidate(input);
    }),
    removeCandidate: publicProcedure.input(z2.object({ id: z2.number().int() })).mutation(async ({ input }) => {
      await deleteCandidate(input.id);
      return { success: true };
    }),
    getElectionConfig: publicProcedure.query(async () => {
      return await getElectionConfig();
    }),
    saveElectionConfig: publicProcedure.input(z2.object({
      state: z2.string().length(2),
      municipality: z2.string().min(1),
      electionName: z2.string().optional(),
      electionYear: z2.number().int()
    })).mutation(async ({ input }) => {
      return await saveElectionConfig(input);
    }),
    generateTestData: publicProcedure.mutation(async () => {
      const testCandidates = [
        {
          number: 10,
          name: "Capit\xE3o Boanerges",
          party: "Partido A",
          position: "Vereador",
          bio: "Candidato 1"
        },
        {
          number: 20,
          name: "Judite Alapenha",
          party: "Partido B",
          position: "Vereadora",
          bio: "Candidata 2"
        },
        {
          number: 11,
          name: "Coronel Alexandre Bilica",
          party: "Partido C",
          position: "Vereador",
          bio: "Candidato 3"
        },
        {
          number: 40,
          name: "Washington Azevedo",
          party: "Partido D",
          position: "Vereador",
          bio: "Candidato 4"
        },
        {
          number: 50,
          name: "Daniel Godoy",
          party: "Partido E",
          position: "Vereador",
          bio: "Candidato 5"
        }
      ];
      for (const candidate of testCandidates) {
        try {
          await createCandidate(candidate);
        } catch (e) {
        }
      }
      return { success: true, message: "Dados de teste criados" };
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
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
  setupWebSocket(server);
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`WebSocket available at ws://localhost:${port}/ws`);
  });
}
startServer().catch(console.error);
