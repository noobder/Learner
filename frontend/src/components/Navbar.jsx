import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="z-20 shrink-0 border-b border-white/10 bg-brand-900/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5 text-white">
          <Logo size={30} />
          <span className="font-display text-lg font-bold">AI Learner</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-400 font-bold text-white">
            {user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <span className="hidden sm:inline text-sm text-white/80">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
