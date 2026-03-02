import { useEffect, useRef, useCallback, useState } from "react";

export interface VoteUpdate {
  candidateName: string;
  state: string;
  municipality: string;
  neighborhood: string;
  timestamp: number;
}

export interface ResultsUpdate {
  totalVotes: number;
  votesByCandidate: Record<string, number>;
  votesByState: Record<string, number>;
  votesByMunicipality: Record<string, number>;
  timestamp: number;
}

type VoteCallback = (vote: VoteUpdate) => void;
type ResultsCallback = (results: ResultsUpdate) => void;

/**
 * Hook for real-time vote updates via WebSocket
 * Automatically connects and reconnects to the WebSocket server
 */
export function useRealTimeVotes(
  onNewVote?: VoteCallback,
  onResultsUpdate?: ResultsCallback
) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const connect = useCallback(() => {
    // Don't reconnect if already connecting
    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log(`[useRealTimeVotes] Connecting to ${wsUrl}`);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("[useRealTimeVotes] Connected to WebSocket");
        setIsConnected(true);
        setReconnectAttempts(0);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === "new_vote" && onNewVote) {
            onNewVote(message.data);
          } else if (message.type === "results_update" && onResultsUpdate) {
            onResultsUpdate(message.data);
          } else if (message.type === "connected") {
            console.log("[useRealTimeVotes]", message.message);
          }
        } catch (error) {
          console.error("[useRealTimeVotes] Error parsing message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("[useRealTimeVotes] WebSocket error:", error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log("[useRealTimeVotes] Disconnected from WebSocket");
        setIsConnected(false);

        // Attempt to reconnect with exponential backoff
        const maxAttempts = 5;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);

        if (reconnectAttempts < maxAttempts) {
          console.log(
            `[useRealTimeVotes] Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxAttempts})`
          );
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts((prev) => prev + 1);
            connect();
          }, delay);
        } else {
          console.error("[useRealTimeVotes] Max reconnection attempts reached");
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("[useRealTimeVotes] Error creating WebSocket:", error);
      setIsConnected(false);
    }
  }, [onNewVote, onResultsUpdate, reconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    reconnectAttempts,
    disconnect,
    reconnect: () => {
      setReconnectAttempts(0);
      connect();
    }
  };
}
