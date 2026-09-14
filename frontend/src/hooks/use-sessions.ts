import { useEffect, useState, useCallback } from "react";
import { Session } from "@/types";
import { ApiClient } from "@/lib/api-client";

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await ApiClient.listSessions();
      setSessions(data);
      if (data.length > 0 && !activeSessionId) {
        setActiveSessionId(data[0].id);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  }, [activeSessionId]);

  useEffect(() => {
    refreshSessions();
  }, []);

  const createNewSession = async (title?: string) => {
    try {
      const newSession = await ApiClient.createSession(title);
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      return newSession;
    } catch (err: any) {
      setError(err.message || "Failed to create new session");
      return null;
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await ApiClient.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        const remaining = sessions.filter((s) => s.id !== sessionId);
        setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete session");
    }
  };

  return {
    sessions,
    activeSessionId,
    setActiveSessionId,
    isLoading,
    error,
    refreshSessions,
    createNewSession,
    deleteSession,
  };
}
