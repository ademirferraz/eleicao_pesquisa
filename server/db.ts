import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, candidates, voters, votes, InsertCandidate, InsertVoter, InsertVote, adminSettings } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Candidates
export async function getCandidates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(candidates).where(eq(candidates.isActive, true));
}

export async function getCandidateById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(candidates).where(eq(candidates.id, id)).limit(1);
  return result[0];
}

export async function createCandidate(data: InsertCandidate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(candidates).values(data);
  return result;
}

export async function updateCandidate(id: number, data: Partial<InsertCandidate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(candidates).set(data).where(eq(candidates.id, id));
}

export async function deleteCandidate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(candidates).set({ isActive: false }).where(eq(candidates.id, id));
}

// Voters
export async function getVoterByCPF(cpf: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(voters).where(eq(voters.cpf, cpf)).limit(1);
  return result[0];
}

export async function createVoter(data: InsertVoter) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(voters).values(data);
  return getVoterByCPF(data.cpf);
}

// Votes
export async function createVote(data: InsertVote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(votes).values(data);
  await db.update(voters).set({ hasVoted: true }).where(eq(voters.id, data.voterId));
}

export async function getVotesByCandidate(candidateId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(votes).where(eq(votes.candidateId, candidateId));
}

export async function getVotesByNeighborhood(neighborhood: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(votes).where(eq(votes.neighborhood, neighborhood));
}

export async function getVotesByMunicipality(municipality: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(votes).where(eq(votes.municipality, municipality));
}

export async function getTotalVotes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(votes);
}

export async function getVotingStats() {
  const db = await getDb();
  if (!db) return { totalVotes: 0, totalVoters: 0, candidates: [] };
  
  const allVotes = await db.select().from(votes);
  const allVoters = await db.select().from(voters);
  const allCandidates = await db.select().from(candidates).where(eq(candidates.isActive, true));
  
  const candidateStats = allCandidates.map(candidate => {
    const candidateVotes = allVotes.filter(v => v.candidateId === candidate.id);
    return {
      ...candidate,
      voteCount: candidateVotes.length,
      percentage: allVotes.length > 0 ? (candidateVotes.length / allVotes.length) * 100 : 0,
    };
  });
  
  return {
    totalVotes: allVotes.length,
    totalVoters: allVoters.length,
    candidates: candidateStats,
  };
}

// Admin Settings
export async function getAdminSettings() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(adminSettings).limit(1);
  return result[0] || null;
}
