import { Edit2, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios.js";

const emptyForm = { name: "", email: "", password: "", role: "student", rollNumber: "", courseId: "", department: "" };

export default function Userspage() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const [usersRes, coursesRes] = await Promise.all([api.get("/users"), api.get("/courses")]);
    setUsers(usersRes.data);
    setCourses(coursesRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = query.toLowerCase();
    return users.filter((user) => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term));
  }, [query, users]);

  const openModal = (user = null) => {
    setEditing(user);
    setForm(user ? { ...emptyForm, name: user.name, email: user.email, role: user.role } : emptyForm);
    setModalOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (editing) {
        await api.put(`/users/${editing._id}`, { name: form.name, email: form.email, role: form.role });
        toast.success("User updated");
      } else {
        await api.post("/users", form);
        toast.success("User created");
      }
      setModalOpen(false);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "User action failed");
    }
  };

  const remove = async (user) => {
    if (!confirm(`Delete ${user.name}?`)) return;
    await api.delete(`/users/${user._id}`);
    toast.success("User deleted");
    load();
  };

  return (
    <section className="stack">
      <div className="page-row">
        <div className="page-heading">
          <h1>Users</h1>
          <p>Manage admins, teachers, and students.</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={() => openModal()}>
          <Plus size={18} /> Add User
        </button>
      </div>

      <div className="input-icon search-box">
        <Search size={18} />
        <input className="input" placeholder="Search by name or email" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge badge-${user.role}`}>{user.role}</span>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="icon-btn" type="button" onClick={() => openModal(user)} aria-label="Edit user">
                        <Edit2 size={16} />
                      </button>
                      <button className="icon-btn danger" type="button" onClick={() => remove(user)} aria-label="Delete user">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={() => setModalOpen(false)}>
          <form className="modal" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
            <h2>{editing ? "Edit User" : "Add User"}</h2>
            <input className="input" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            {!editing && (
              <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            )}
            <select className="select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
            {!editing && form.role === "student" && (
              <>
                <input className="input" placeholder="Roll number" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} required />
                <select className="select" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} required>
                  <option value="">Select course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.courseName}
                    </option>
                  ))}
                </select>
              </>
            )}
            {!editing && form.role === "teacher" && (
              <input className="input" placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required />
            )}
            <div className="modal-actions">
              <button className="btn btn-ghost" type="button" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" type="submit">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
