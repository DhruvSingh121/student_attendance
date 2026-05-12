import { ArrowRight, BarChart2, CheckSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/Authcontext.jsx";

export default function Teacherdashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    api.get("/classes/my").then((res) => setClasses(res.data));
  }, []);

  return (
    <section className="stack">
      <div className="page-heading">
        <h1>Hello, {user.name}</h1>
        <p>Review your assigned classes and mark attendance.</p>
      </div>

      <div className="grid two">
        <button className="action-card" type="button" onClick={() => navigate("/teacher/attendance")}>
          <CheckSquare size={26} />
          <span>
            <strong>Mark Attendance</strong>
            <small>Record today&apos;s class status</small>
          </span>
          <ArrowRight size={18} />
        </button>
        <button className="action-card" type="button" onClick={() => navigate("/teacher/reports")}>
          <BarChart2 size={26} />
          <span>
            <strong>View Reports</strong>
            <small>Analyze class attendance trends</small>
          </span>
          <ArrowRight size={18} />
        </button>
      </div>

      <div className="card">
        <h2>My Classes</h2>
        <div className="class-list">
          {classes.map((item) => (
            <div className="list-row" key={item._id}>
              <div>
                <strong>{item.className}</strong>
                <span>{item.courseId?.courseName} · Semester {item.semester}</span>
              </div>
              <button className="btn btn-sm btn-primary" type="button" onClick={() => navigate("/teacher/attendance")}>
                Mark
              </button>
            </div>
          ))}
          {classes.length === 0 && <div className="empty-state">No assigned classes yet.</div>}
        </div>
      </div>
    </section>
  );
}
