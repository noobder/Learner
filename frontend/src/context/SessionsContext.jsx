import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const SessionsContext = createContext(null);

export function SessionsProvider({ children }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/sessions");
      setSessions(res.data);
      return res.data;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function createSession(name) {
    const res = await api.post("/sessions", { name: name || "Untitled session" });
    setSessions((prev) => [res.data, ...prev]);
    return res.data;
  }

  async function deleteSession(sessionId) {
    await api.delete(`/sessions/${sessionId}`);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  }

  function bumpVideoCount(sessionId, delta) {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, video_count: s.video_count + delta } : s))
    );
  }

  return (
    <SessionsContext.Provider
      value={{ sessions, loading, refresh, createSession, deleteSession, bumpVideoCount }}
    >
      {children}
    </SessionsContext.Provider>
  );
}

export function useSessions() {
  const ctx = useContext(SessionsContext);
  if (!ctx) throw new Error("useSessions must be used within a SessionsProvider");
  return ctx;
}
