import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { broadcastVote } from "./websocket";

// Validation schemas
const candidateSchema = z.object({
  number: z.number().int(),
  name: z.string().min(1),
  party: z.string().optional(),
  position: z.string().optional(),
  photoUrl: z.string().optional(),
  bio: z.string().optional(),
});

const voterSchema = z.object({
  cpf: z.string().min(14).max(14),
  name: z.string().min(1),
  birthDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/),
  state: z.string().length(2),
  municipality: z.string().min(1),
  neighborhood: z.string().min(1),
});

const voteSchema = z.object({
  voterId: z.number().int(),
  candidateId: z.number().int(),
  candidateNumber: z.number().int(),
  state: z.string().length(2),
  municipality: z.string().min(1),
  neighborhood: z.string().min(1),
});

// Helper to verify admin password
async function verifyAdminPassword(password: string): Promise<boolean> {
  // Simple password check for demo (in production, use bcrypt)
  return password === "1234";
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Candidates router
  candidates: router({
    list: publicProcedure.query(async () => {
      return await db.getCandidates();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number().int() }))
      .query(async ({ input }) => {
        return await db.getCandidateById(input.id);
      }),

    create: publicProcedure
      .input(candidateSchema)
      .mutation(async ({ input }) => {
        return await db.createCandidate(input);
      }),

    update: publicProcedure
      .input(z.object({ id: z.number().int(), data: candidateSchema.partial() }))
      .mutation(async ({ input }) => {
        await db.updateCandidate(input.id, input.data);
        return await db.getCandidateById(input.id);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        await db.deleteCandidate(input.id);
        return { success: true };
      }),
  }),

  // Voters router
  voters: router({
    checkCPF: publicProcedure
      .input(z.object({ cpf: z.string() }))
      .query(async ({ input }) => {
        const voter = await db.getVoterByCPF(input.cpf);
        return {
          exists: !!voter,
          hasVoted: voter?.hasVoted || false,
          voter: voter || null,
        };
      }),

    register: publicProcedure
      .input(voterSchema)
      .mutation(async ({ input }) => {
        // Check if voter already exists
        const existing = await db.getVoterByCPF(input.cpf);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Este CPF já foi registrado",
          });
        }

        const voter = await db.createVoter(input);
        return voter;
      }),
  }),

  // Votes router
  votes: router({
    cast: publicProcedure
      .input(voteSchema)
      .mutation(async ({ input }) => {
        // Verify voter exists and hasn't voted
        const voter = await db.getVoterByCPF(""); // This would need CPF from input
        if (!voter) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Eleitor não encontrado",
          });
        }

        if (voter.hasVoted) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Este eleitor já votou",
          });
        }

        await db.createVote(input);

        // Broadcast vote to all connected clients
        const candidate = await db.getCandidateById(input.candidateId);
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
      return await db.getVotingStats();
    }),

    getByCandidate: publicProcedure
      .input(z.object({ candidateId: z.number().int() }))
      .query(async ({ input }) => {
        return await db.getVotesByCandidate(input.candidateId);
      }),

    getByNeighborhood: publicProcedure
      .input(z.object({ neighborhood: z.string() }))
      .query(async ({ input }) => {
        return await db.getVotesByNeighborhood(input.neighborhood);
      }),

    getByMunicipality: publicProcedure
      .input(z.object({ municipality: z.string() }))
      .query(async ({ input }) => {
        return await db.getVotesByMunicipality(input.municipality);
      }),
  }),

  // Admin router
  admin: router({
    login: publicProcedure
      .input(z.object({ password: z.string() }))
      .mutation(async ({ input }) => {
        const isValid = await verifyAdminPassword(input.password);
        if (!isValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Senha incorreta",
          });
        }
        return { success: true, token: "admin-session" };
      }),

    getStats: publicProcedure.query(async () => {
      return await db.getVotingStats();
    }),

    getCandidates: publicProcedure.query(async () => {
      return await db.getCandidates();
    }),

    addCandidate: publicProcedure
      .input(candidateSchema)
      .mutation(async ({ input }) => {
        const candidates = await db.getCandidates();
        if (candidates.length >= 6) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Máximo de 6 candidatos atingido",
          });
        }
        return await db.createCandidate(input);
      }),

    removeCandidate: publicProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        await db.deleteCandidate(input.id);
        return { success: true };
      }),

    getElectionConfig: publicProcedure.query(async () => {
      return await db.getElectionConfig();
    }),

    saveElectionConfig: publicProcedure
      .input(z.object({
        state: z.string().length(2),
        municipality: z.string().min(1),
        electionName: z.string().optional(),
        electionYear: z.number().int(),
      }))
      .mutation(async ({ input }) => {
        return await db.saveElectionConfig(input);
      }),

    generateTestData: publicProcedure.mutation(async () => {
      // Create test candidates
      const testCandidates = [
        {
          number: 10,
          name: "Capitão Boanerges",
          party: "Partido A",
          position: "Vereador",
          bio: "Candidato 1",
        },
        {
          number: 20,
          name: "Judite Alapenha",
          party: "Partido B",
          position: "Vereadora",
          bio: "Candidata 2",
        },
        {
          number: 11,
          name: "Coronel Alexandre Bilica",
          party: "Partido C",
          position: "Vereador",
          bio: "Candidato 3",
        },
        {
          number: 40,
          name: "Washington Azevedo",
          party: "Partido D",
          position: "Vereador",
          bio: "Candidato 4",
        },
        {
          number: 50,
          name: "Daniel Godoy",
          party: "Partido E",
          position: "Vereador",
          bio: "Candidato 5",
        },
      ];

      for (const candidate of testCandidates) {
        try {
          await db.createCandidate(candidate);
        } catch (e) {
          // Candidate might already exist
        }
      }

      return { success: true, message: "Dados de teste criados" };
    }),
  }),
});

export type AppRouter = typeof appRouter;
