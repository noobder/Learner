import { useEffect, useState } from "react";
import Logo from "./Logo";

const STAGES = [
  { icon: "🔗", label: "Link" },
  { icon: "✨", label: "Understand" },
  { icon: "💬", label: "Chat" },
];

const PHRASES = [
  "Securing your session…",
  "Loading your video sessions…",
  "Waking up the assistant…",
];

export default function LoadingScreen({ label }) {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % PHRASES.length);
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-brand-900 via-[#171433] to-[#0c0f22] px-4 font-body">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <span className="logo-pulse-ring absolute h-20 w-20 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400" />
        <Logo size={64} />
      </div>

      <div className="mt-8 flex items-center gap-3">
        {STAGES.map((stage, i) => (
          <div key={stage.label} className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-base">
                {stage.icon}
              </span>
              <span className="text-[11px] font-medium text-white/40">{stage.label}</span>
            </div>
            {i < STAGES.length - 1 && (
              <div className="loading-track mb-4 h-1 w-10 rounded-full bg-white/10">
                <span className="loading-bar" />
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="shimmer-text mt-8 text-sm font-semibold">{label || PHRASES[phraseIndex]}</p>
    </div>
  );
}
