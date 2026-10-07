import Logo from "./Logo";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-brand-900 via-[#151233] to-brand-800 bg-grid-fade px-4 py-10 font-body relative overflow-hidden">
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-slate-500/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/90 backdrop-blur-md border border-white/20">
            <Logo size={20} />
            AI Learner
          </div>
          <h1 className="mt-4 text-3xl font-display font-extrabold text-white drop-shadow-sm">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-white/70">{subtitle}</p>}
        </div>

        <div className="rounded-3xl bg-white/95 shadow-glow p-8 backdrop-blur-xl border border-white/40">
          {children}
        </div>
      </div>
    </div>
  );
}
