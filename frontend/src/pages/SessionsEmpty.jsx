import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSessions } from "../context/SessionsContext";

export default function SessionsEmpty() {
  const { sessions, loading, createSession } = useSessions();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  if (!loading && sessions.length > 0) {
    navigate(`/sessions/${sessions[0].id}`, { replace: true });
    return null;
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const session = await createSession(name.trim());
      navigate(`/sessions/${session.id}`);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-4xl">🗂️</p>
        <h1 className="mt-3 font-display text-xl font-bold text-white">Create your first session</h1>
        <p className="mt-2 text-sm text-white/60">
          A session holds a set of YouTube videos and its own private knowledge base — start one
          to add links and start asking questions.
        </p>
        <form onSubmit={handleCreate} className="mt-6 flex gap-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Machine Learning Crash Course"
            className="flex-1 rounded-xl border border-white/10 bg-white/95 px-4 py-2.5 text-sm text-brand-900 outline-none focus:ring-4 focus:ring-brand-400/30"
          />
          <button
            type="submit"
            disabled={creating}
            className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-400 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-60"
          >
            Create
          </button>
        </form>
      </div>
    </div>
  );
}
