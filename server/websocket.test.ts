import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { broadcastVote, getConnectedClientsCount } from "./websocket";

describe("WebSocket Broadcasting", () => {
  describe("broadcastVote", () => {
    it("should broadcast vote data with correct structure", () => {
      const voteData = {
        candidateName: "João Silva",
        state: "SP",
        municipality: "São Paulo",
        neighborhood: "Centro",
        timestamp: Date.now()
      };

      // Should not throw error
      expect(() => broadcastVote(voteData)).not.toThrow();
    });

    it("should handle vote with special characters", () => {
      const voteData = {
        candidateName: "José da Silva Pereira",
        state: "RJ",
        municipality: "Rio de Janeiro",
        neighborhood: "Zona Norte",
        timestamp: Date.now()
      };

      expect(() => broadcastVote(voteData)).not.toThrow();
    });

    it("should handle vote with different states", () => {
      const states = ["SP", "RJ", "MG", "BA", "PE"];

      states.forEach((state) => {
        const voteData = {
          candidateName: "Test Candidate",
          state,
          municipality: "Test City",
          neighborhood: "Test Neighborhood",
          timestamp: Date.now()
        };

        expect(() => broadcastVote(voteData)).not.toThrow();
      });
    });
  });

  describe("getConnectedClientsCount", () => {
    it("should return a number", () => {
      const count = getConnectedClientsCount();
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});
