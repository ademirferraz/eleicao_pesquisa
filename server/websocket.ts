import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";

// Store all connected clients
const clients = new Set<WebSocket>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    console.log("[WebSocket] New client connected");
    clients.add(ws);

    // Send initial connection confirmation
    ws.send(JSON.stringify({ type: "connected", message: "Connected to vote updates" }));

    // Handle client disconnect
    ws.on("close", () => {
      console.log("[WebSocket] Client disconnected");
      clients.delete(ws);
    });

    // Handle errors
    ws.on("error", (error) => {
      console.error("[WebSocket] Error:", error);
      clients.delete(ws);
    });
  });

  return wss;
}

/**
 * Broadcast a new vote to all connected clients
 */
export function broadcastVote(voteData: {
  candidateName: string;
  state: string;
  municipality: string;
  neighborhood: string;
  timestamp: number;
}) {
  const message = JSON.stringify({
    type: "new_vote",
    data: voteData
  });

  console.log(`[WebSocket] Broadcasting vote from ${voteData.municipality}, ${voteData.state}`);

  // Send to all connected clients
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

/**
 * Broadcast updated results to all connected clients
 */
export function broadcastResults(resultsData: {
  totalVotes: number;
  votesByCandidate: Record<string, number>;
  votesByState: Record<string, number>;
  votesByMunicipality: Record<string, number>;
  timestamp: number;
}) {
  const message = JSON.stringify({
    type: "results_update",
    data: resultsData
  });

  console.log("[WebSocket] Broadcasting updated results");

  // Send to all connected clients
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

/**
 * Get number of connected clients
 */
export function getConnectedClientsCount(): number {
  return clients.size;
}
