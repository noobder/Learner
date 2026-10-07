import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SessionView from "./pages/SessionView";
import SessionsEmpty from "./pages/SessionsEmpty";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/sessions" element={<SessionsEmpty />} />
        <Route path="/sessions/:sessionId" element={<SessionView />} />
      </Route>

      <Route path="*" element={<Navigate to="/sessions" replace />} />
    </Routes>
  );
}
