import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
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
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Candidates table for the voting system
 */
export const candidates = mysqlTable("candidates", {
  id: int("id").autoincrement().primaryKey(),
  number: int("number").notNull().unique(), // Electoral number (10, 20, 11, etc.)
  name: varchar("name", { length: 255 }).notNull(),
  party: varchar("party", { length: 100 }),
  position: varchar("position", { length: 100 }), // e.g., "Vereador", "Prefeito"
  photoUrl: text("photoUrl"), // URL to candidate photo
  bio: text("bio"), // Short biography
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = typeof candidates.$inferInsert;

/**
 * Voters table for registration
 */
export const voters = mysqlTable("voters", {
  id: int("id").autoincrement().primaryKey(),
  cpf: varchar("cpf", { length: 14 }).notNull().unique(), // CPF with formatting
  name: varchar("name", { length: 255 }).notNull(),
  birthDate: varchar("birthDate", { length: 10 }).notNull(), // DD/MM/YYYY
  state: varchar("state", { length: 2 }).notNull(), // UF
  municipality: varchar("municipality", { length: 100 }).notNull(),
  neighborhood: varchar("neighborhood", { length: 100 }).notNull(),
  hasVoted: boolean("hasVoted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Voter = typeof voters.$inferSelect;
export type InsertVoter = typeof voters.$inferInsert;

/**
 * Votes table to record voting
 */
export const votes = mysqlTable("votes", {
  id: int("id").autoincrement().primaryKey(),
  voterId: int("voterId").notNull(), // Reference to voter
  candidateId: int("candidateId").notNull(), // Reference to candidate
  candidateNumber: int("candidateNumber").notNull(), // Electoral number for reference
  state: varchar("state", { length: 2 }).notNull(),
  municipality: varchar("municipality", { length: 100 }).notNull(),
  neighborhood: varchar("neighborhood", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Vote = typeof votes.$inferSelect;
export type InsertVote = typeof votes.$inferInsert;

/**
 * Admin settings for the voting system
 */
export const adminSettings = mysqlTable("adminSettings", {
  id: int("id").autoincrement().primaryKey(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(), // Hashed password
  votingEnabled: boolean("votingEnabled").default(true).notNull(),
  registrationEnabled: boolean("registrationEnabled").default(true).notNull(),
  maxCandidates: int("maxCandidates").default(6).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminSettings = typeof adminSettings.$inferSelect;
export type InsertAdminSettings = typeof adminSettings.$inferInsert;