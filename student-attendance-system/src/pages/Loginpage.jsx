import { Eye, EyeOff, GraduationCap, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/Authcontext.jsx";

const targetForRole = (role) => (role === "admin" ? "/admin" : role === "teacher" ? "/teacher" : "/student");

export default function Loginpage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "admin@demo.com", password: "Admin@123" });

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(targetForRole(user.role), { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-brand">
          <div className="brand-mark lg">
            <GraduationCap size={32} />
          </div>
          <h1>AttendX</h1>
          <p>Student Attendance Management System</p>
        </div>

        <form className="card login-card" onSubmit={submit}>
          <label className="field">
            <span>Email</span>
            <div className="input-icon">
              <Mail size={18} />
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))}
                required
              />
            </div>
          </label>

          <label className="field">
            <span>Password</span>
            <div className="input-icon">
              <Lock size={18} />
              <input
                className="input"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))}
                required
              />
              <button className="input-action" type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <button className="btn btn-primary full" type="submit" disabled={loading}>
            {loading ? <span className="spinner sm-spinner" /> : "Sign in"}
          </button>

          <div className="demo-box">
            <strong>Demo credentials</strong>
            <span>admin@demo.com / Admin@123</span>
            <span>teacher@demo.com / Teacher@123</span>
            <span>student@demo.com / Student@123</span>
          </div>
        </form>
      </section>
    </main>
  );
}
