import { useState } from "react";

export default function PasswordInput({ value, onChange, placeholder, minLength, className = "" }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        required
        minLength={minLength}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 pr-11 text-brand-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-brand-900/40 transition hover:text-brand-700"
      >
        {visible ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3l18 18M10.58 10.58a2 2 0 1 0 2.83 2.83M9.88 5.09A9.77 9.77 0 0 1 12 5c5 0 9 4.5 10 7-.42 1.07-1.1 2.24-2.02 3.31M6.1 6.1C3.86 7.53 2.24 9.6 2 12c1 2.5 5 7 10 7 1.35 0 2.62-.28 3.77-.77" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
