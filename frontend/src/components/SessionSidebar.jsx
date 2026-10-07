import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSessions } from "../context/SessionsContext";

export default function SessionSidebar() {
  const { sessions, loading, createSession, deleteSession } = useSessions();
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    const session = await createSession(name.trim());
    setName("");
    setCreating(false);
    navigate(`/sessions/${session.id}`);
  }

  async function handleDelete(e, id) {
    e.stopPropagation();
    if (!confirm("Delete this session and everything in it?")) return;
    await deleteSession(id);
    if (String(id) === sessionId) navigate("/sessions");
  }

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-white/10 bg-black/20">
      <div className="p-4">
        {creating ? (
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => !name && setCreating(false)}
              placeholder="Session name…"
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/95 px-3 py-2 text-sm text-brand-900 outline-none focus:ring-2 focus:ring-brand-400"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-gradient-to-r from-brand-600 to-brand-400 px-3 py-2 text-sm font-semibold text-white"
            >
              Add
            </button>
          </form>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-400 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
          >
            + New session
          </button>
        )}
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
        {loading && <p className="px-2 text-sm text-white/40">Loading sessions…</p>}
        {!loading && sessions.length === 0 && (
          <p className="px-2 text-sm text-white/40">
            No sessions yet. Create one to start dropping in YouTube links.
          </p>
        )}
        {sessions.map((session) => {
          const active = String(session.id) === sessionId;
          return (
            <div
              key={session.id}
              onClick={() => navigate(`/sessions/${session.id}`)}
              className={`group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 transition ${
                active ? "bg-gradient-to-r from-brand-600/90 to-brand-400/90" : "hover:bg-white/10"
              }`}
            >
              <div className="min-w-0">
                <p className={`truncate text-sm font-semibold ${active ? "text-white" : "text-white/80"}`}>
                  🗂️ {session.name}
                </p>
                <p className={`text-xs ${active ? "text-white/80" : "text-white/40"}`}>
                  {session.video_count} video{session.video_count === 1 ? "" : "s"}
                </p>
              </div>
              <button
                onClick={(e) => handleDelete(e, session.id)}
                className={`shrink-0 rounded-full px-2 py-1 text-xs opacity-0 transition group-hover:opacity-100 ${
                  active ? "text-white/80 hover:text-white" : "text-white/40 hover:text-red-300"
                }`}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
