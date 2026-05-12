import { Edit2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios.js";

const emptyForm = { courseName: "", courseCode: "", description: "" };

export default function Coursespage() {
  const [courses, setCourses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const { data } = await api.get("/courses");
    setCourses(data);
  };

  useEffect(() => {
    load();
  }, []);

  const openModal = (course = null) => {
    setEditing(course);
    setForm(course ? { courseName: course.courseName, courseCode: course.courseCode, description: course.description || "" } : emptyForm);
    setModalOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (editing) {
        await api.put(`/courses/${editing._id}`, form);
        toast.success("Course updated");
      } else {
        await api.post("/courses", form);
        toast.success("Course created");
      }
      setModalOpen(false);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Course action failed");
    }
  };

  const remove = async (course) => {
    if (!confirm(`Delete ${course.courseName}?`)) return;
    await api.delete(`/courses/${course._id}`);
    toast.success("Course deleted");
    load();
  };

  return (
    <section className="stack">
      <div className="page-row">
        <div className="page-heading">
          <h1>Courses</h1>
          <p>Create and maintain academic course records.</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={() => openModal()}>
          <Plus size={18} /> Add Course
        </button>
      </div>

      <div className="card-grid">
        {courses.map((course) => (
          <article className="card course-card" key={course._id}>
            <div className="course-top">
              <span className="badge">{course.courseCode}</span>
              <div className="actions">
                <button className="icon-btn" type="button" onClick={() => openModal(course)} aria-label="Edit course">
                  <Edit2 size={16} />
                </button>
                <button className="icon-btn danger" type="button" onClick={() => remove(course)} aria-label="Delete course">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h2>{course.courseName}</h2>
            <p>{course.description || "No description added."}</p>
          </article>
        ))}
      </div>

      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={() => setModalOpen(false)}>
          <form className="modal" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
            <h2>{editing ? "Edit Course" : "Add Course"}</h2>
            <input className="input" placeholder="Course name" value={form.courseName} onChange={(e) => setForm({ ...form, courseName: e.target.value })} required />
            <input className="input" placeholder="Course code" value={form.courseCode} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} required />
            <textarea className="input textarea" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
