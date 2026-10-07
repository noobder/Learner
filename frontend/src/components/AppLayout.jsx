import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import SessionSidebar from "./SessionSidebar";
import { SessionsProvider } from "../context/SessionsContext";

export default function AppLayout() {
  return (
    <SessionsProvider>
      <div className="flex h-screen flex-col bg-gradient-to-br from-brand-900 via-[#171433] to-[#0c0f22] font-body">
        <Navbar />
        <div className="flex min-h-0 flex-1">
          <SessionSidebar />
          <main className="min-w-0 flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SessionsProvider>
  );
}
