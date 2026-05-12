import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { useAuth } from "./context/Authcontext.jsx";
import Admindashboard from "./pages/Admindashboard.jsx";
import Coursespage from "./pages/Coursespage.jsx";
import Loginpage from "./pages/Loginpage.jsx";
import Markattendancepage from "./pages/Markattendancepage.jsx";
import Reportspage from "./pages/Reportspage.jsx";
import Studentdashboard from "./pages/Studentdashboard.jsx";
import Teacherdashboard from "./pages/Teacherdashboard.jsx";
import Userspage from "./pages/Userspage.jsx";
import "./App.css";

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="spinner" />
    </div>
  );
}

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  if (user.role === "teacher") return <Navigate to="/teacher" replace />;
  return <Navigate to="/student" replace />;
}

function RequireAuth({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Loginpage />} />
      <Route path="/" element={<RoleRedirect />} />
      <Route
        path="/admin"
        element={
          <RequireAuth roles={["admin"]}>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Admindashboard />} />
        <Route path="users" element={<Userspage />} />
        <Route path="courses" element={<Coursespage />} />
      </Route>
      <Route
        path="/teacher"
        element={
          <RequireAuth roles={["teacher"]}>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Teacherdashboard />} />
        <Route path="attendance" element={<Markattendancepage />} />
        <Route path="reports" element={<Reportspage />} />
      </Route>
      <Route
        path="/student"
        element={
          <RequireAuth roles={["student"]}>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Studentdashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
