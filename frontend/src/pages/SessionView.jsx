import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, extractErrorMessage } from "../api/client";
import { useSessions } from "../context/SessionsContext";
import MarkdownMessage from "../components/MarkdownMessage";

const THINKING_PHRASES = [
  "Searching the transcripts…",
  "Connecting the dots…",
  "Thinking it through…",
  "Almost there…",
];

const INGEST_PHRASES = [
  "Fetching the transcript…",
  "Reading through the video…",
  "Embedding into this session…",
  "Almost ready…",
];

export default function SessionView() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { sessions, bumpVideoCount } = useSessions();

  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [url, setUrl] = useState("");
  const [ingesting, setIngesting] = useState(false);
  const [ingestError, setIngestError] = useState("");

  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [thinkingPhrase, setThinkingPhrase] = useState(THINKING_PHRASES[0]);
  const [ingestPhrase, setIngestPhrase] = useState(INGEST_PHRASES[0]);
  const bottomRef = useRef(null);

  const session = sessions.find((s) => String(s.id) === sessionId);

  useEffect(() => {
    if (!ingesting) return;
    let i = 0;
    setIngestPhrase(INGEST_PHRASES[0]);
    const interval = setInterval(() => {
      i = (i + 1) % INGEST_PHRASES.length;
      setIngestPhrase(INGEST_PHRASES[i]);
    }, 1300);
    return () => clearInterval(interval);
  }, [ingesting]);

  useEffect(() => {
    if (!asking) return;
    let i = 0;
    setThinkingPhrase(THINKING_PHRASES[0]);
    const interval = setInterval(() => {
      i = (i + 1) % THINKING_PHRASES.length;
      setThinkingPhrase(THINKING_PHRASES[i]);
    }, 1400);
    return () => clearInterval(interval);
  }, [asking]);

  useEffect(() => {
    let cancelled = false;
    setLoadingVideos(true);
    setSelectedVideoId("");
    api
      .get(`/sessions/${sessionId}/videos`)
      .then((res) => {
        if (!cancelled) setVideos(res.data);
      })
      .finally(() => !cancelled && setLoadingVideos(false));
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    let cancelled = false;
    setLoadingMessages(true);
    api
      .get(`/sessions/${sessionId}/chat/messages`)
      .then((res) => {
        if (!cancelled) {
          setMessages(
            res.data.map((m) => ({
              role: m.role,
              content: m.content,
              sources: m.sources,
            }))
          );
        }
      })
      .finally(() => !cancelled && setLoadingMessages(false));
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, asking]);

  async function handleIngest(e) {
    e.preventDefault();
    setIngestError("");
    setIngesting(true);
    try {
      const res = await api.post(`/sessions/${sessionId}/videos`, { url });
      setUrl("");
      setVideos((prev) => [res.data, ...prev]);
      bumpVideoCount(Number(sessionId), 1);
    } catch (err) {
      setIngestError(extractErrorMessage(err, "Could not process that video link."));
    } finally {
      setIngesting(false);
    }
  }

  async function handleDeleteVideo(videoPk) {
    try {
      await api.delete(`/sessions/${sessionId}/videos/${videoPk}`);
      setVideos((prev) => prev.filter((v) => v.id !== videoPk));
      bumpVideoCount(Number(sessionId), -1);
    } catch (err) {
      setIngestError(extractErrorMessage(err, "Could not remove that video."));
    }
  }

  async function handleAsk(e) {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setQuestion("");
    setAsking(true);

    try {
      const res = await api.post(`/sessions/${sessionId}/chat/ask`, {
        question: trimmed,
        video_id: selectedVideoId || null,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.answer, sources: res.data.sources },
      ]);
    } catch (err) {
      const msg = extractErrorMessage(err, "The assistant couldn't answer that.");
      setMessages((prev) => [...prev, { role: "assistant", content: msg, isError: true }]);
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="rounded-2xl bg-gradient-to-br from-brand-700/90 to-brand-500/90 p-5 shadow-glow">
        <h1 className="font-display text-xl font-extrabold text-white">
          🗂️ {session?.name || "Session"}
        </h1>
        <p className="mt-1 text-sm text-white/80">
          Only YouTube links are accepted — drop one in and it becomes searchable knowledge for
          this session only.
        </p>
        <form onSubmit={handleIngest} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            disabled={ingesting}
            className="flex-1 rounded-xl border border-white/20 bg-white/95 px-4 py-2.5 text-sm text-brand-900 outline-none placeholder:text-brand-900/40 focus:ring-4 focus:ring-white/30 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={ingesting}
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 shadow-lg transition hover:brightness-95 disabled:opacity-80"
          >
            {ingesting ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
                {ingestPhrase}
              </>
            ) : (
              "Add video"
            )}
          </button>
        </form>
        {ingestError && (
          <div className="mt-3 rounded-xl bg-red-500/20 border border-red-300/40 px-4 py-2 text-sm text-white">
            {ingestError}
          </div>
        )}
      </div>

      <div className="min-h-0 min-w-0 flex-1 grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl border border-white/10 bg-white/5 p-3 overflow-y-auto scrollbar-thin">
          <h2 className="mb-2 px-1 font-display text-xs font-bold uppercase tracking-wide text-white/50">
            Ask about
          </h2>
          <button
            onClick={() => setSelectedVideoId("")}
            className={`mb-1.5 w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
              !selectedVideoId
                ? "bg-gradient-to-r from-brand-600 to-brand-400 text-white"
                : "text-white/70 hover:bg-white/10"
            }`}
          >
            🌐 Entire session
          </button>
          {loadingVideos && <p className="px-2 text-sm text-white/40">Loading…</p>}
          {!loadingVideos && videos.length === 0 && (
            <p className="px-2 text-sm text-white/40">Add a YouTube link above to begin.</p>
          )}
          {videos.map((video) => (
            <div
              key={video.id}
              className={`group mb-1.5 flex items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                selectedVideoId === video.video_id
                  ? "bg-gradient-to-r from-brand-600 to-brand-400 text-white"
                  : "text-white/70 hover:bg-white/10"
              }`}
            >
              <button
                onClick={() => setSelectedVideoId(video.video_id)}
                className="min-w-0 flex-1 truncate text-left font-medium"
                title={video.title}
              >
                🎬 {video.title}
              </button>
              <button
                onClick={() => handleDeleteVideo(video.id)}
                className="ml-1 shrink-0 rounded-full px-1.5 text-xs opacity-0 transition group-hover:opacity-100 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          ))}
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col rounded-2xl border border-white/10 bg-white/5">
          <div className="min-w-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 scrollbar-thin">
            {loadingMessages && (
              <div className="mt-10 text-center text-white/40">Loading conversation…</div>
            )}
            {!loadingMessages && messages.length === 0 && (
              <div className="mt-10 text-center text-white/40">
                💡 Try: "Summarize the key points" or "What did they say about X?"
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex min-w-0 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`min-w-0 rounded-2xl px-4 py-3 text-sm shadow-md ${
                    m.role === "user"
                      ? "max-w-[80%] bg-gradient-to-br from-brand-600 to-brand-400 text-white"
                      : m.isError
                      ? "max-w-[80%] bg-red-500/20 border border-red-300/40 text-white"
                      : "w-full max-w-[90%] bg-white text-brand-900 sm:max-w-[85%]"
                  }`}
                >
                  {m.role === "user" || m.isError ? (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  ) : (
                    <MarkdownMessage content={m.content} />
                  )}
                  {m.sources?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.sources.map((s, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700"
                        >
                          📎 {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {asking && (
              <div className="flex justify-start">
                <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-md">
                  <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                    <span className="absolute h-5 w-5 animate-ping rounded-full bg-brand-400/30" />
                    <span className="absolute h-5 w-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
                    <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-brand-600 to-brand-400" />
                  </span>
                  <span className="shimmer-text text-sm font-semibold">{thinkingPhrase}</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleAsk} className="flex gap-3 border-t border-white/10 p-4">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={videos.length ? "Ask a question…" : "Add a video first…"}
              disabled={!videos.length}
              className="flex-1 rounded-xl border border-white/10 bg-white/95 px-4 py-3 text-brand-900 outline-none focus:ring-4 focus:ring-brand-400/30 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={asking || !videos.length}
              className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-400 px-6 py-3 font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-60"
            >
              Send
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
