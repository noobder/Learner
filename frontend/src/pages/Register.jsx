import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../api/client";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate("/sessions", { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, "Could not create your account."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Turn any YouTube video into a study buddy">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-semibold text-brand-900 mb-1.5">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
            className="w-full rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-brand-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-900 mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-brand-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-900 mb-1.5">Password</label>
          <PasswordInput
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-400 py-3 font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-60"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-brand-900/70">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
