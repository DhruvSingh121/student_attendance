import {
  BarChart2,
  BookOpen,
  CheckSquare,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/Authcontext.jsx";

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const roleItems = {
  admin: [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/courses", label: "Courses", icon: BookOpen },
  ],
  teacher: [
    { path: "/teacher", label: "Dashboard", icon: LayoutDashboard },
    { path: "/teacher/attendance", label: "Mark Attendance", icon: CheckSquare },
    { path: "/teacher/reports", label: "Reports", icon: BarChart2 },
  ],
  student: [{ path: "/student", label: "My Attendance", icon: LayoutDashboard }],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const items = roleItems[user?.role] || [];

  return (
    <div className="app-layout">
      <header className="header">
        <div className="mobile-brand">
          <button className="icon-btn" type="button" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="brand-mark sm">
            <GraduationCap size={18} />
          </div>
          <span>AttendX</span>
        </div>
        <div className="header-user">
          <span className={`badge badge-${user.role}`}>{user.role}</span>
          <span className="truncate">{user.name}</span>
        </div>
      </header>

      {open && <button className="sidebar-overlay" type="button" aria-label="Close navigation" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <div className="brand-mark">
              <GraduationCap size={24} />
            </div>
            <strong>AttendX</strong>
          </div>
          <div className="user-chip">
            <div className="avatar">{initials(user.name)}</div>
            <div className="user-meta">
              <strong>{user.name}</strong>
              <span className={`badge badge-${user.role}`}>{user.role}</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <NavLink key={item.path} to={item.path} className={`nav-item ${isActive ? "active" : ""}`} onClick={() => setOpen(false)}>
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button className="logout-btn" type="button" onClick={logout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="main-content">
        <div className="page-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
