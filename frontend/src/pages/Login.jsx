import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../api/client";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(location.state?.from?.pathname || "/sessions", { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, "Could not log in with those details."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to keep learning from your videos">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3">
            {error}
          </div>
        )}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-400 py-3 font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-brand-900/70">
        New here?{" "}
        <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
