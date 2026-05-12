import { CalendarCheck, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios.js";

const today = new Date().toISOString().slice(0, 10);

export default function Markattendancepage() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(today);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/classes/my").then((res) => {
      setClasses(res.data);
      setClassId(res.data[0]?._id || "");
    });
  }, []);

  const counts = useMemo(() => {
    return Object.values(records).reduce(
      (acc, status) => {
        acc[status] += 1;
        return acc;
      },
      { present: 0, absent: 0, late: 0 }
    );
  }, [records]);

  const loadStudents = async () => {
    if (!classId) return;
    const { data } = await api.get(`/attendance/students?classId=${classId}`);
    setStudents(data);
    setRecords(Object.fromEntries(data.map((student) => [student._id, "absent"])));
    setSaved(false);
  };

  const setAll = (status) => {
    setRecords(Object.fromEntries(students.map((student) => [student._id, status])));
  };

  const submit = async () => {
    const payload = {
      classId,
      date,
      records: students.map((student) => ({ studentId: student._id, status: records[student._id] || "absent" })),
    };
    await api.post("/attendance/mark", payload);
    setSaved(true);
    toast.success("Attendance submitted");
  };

  return (
    <section className="stack">
      <div className="page-heading">
        <h1>Mark Attendance</h1>
        <p>Select a class, load students, and submit P/A/L records.</p>
      </div>

      <div className="card filter-card">
        <select className="select" value={classId} onChange={(event) => setClassId(event.target.value)}>
          {classes.map((item) => (
            <option key={item._id} value={item._id}>
              {item.className} · {item.courseId?.courseCode}
            </option>
          ))}
        </select>
        <input className="input" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        <button className="btn btn-primary" type="button" onClick={loadStudents}>
          <CalendarCheck size={18} /> Load Students
        </button>
      </div>

      {students.length > 0 && (
        <>
          <div className="summary-bar">
            <span className="badge badge-present">Present {counts.present}</span>
            <span className="badge badge-absent">Absent {counts.absent}</span>
            <span className="badge badge-late">Late {counts.late}</span>
            <button className="btn btn-sm btn-success" type="button" onClick={() => setAll("present")}>
              All Present
            </button>
            <button className="btn btn-sm btn-danger" type="button" onClick={() => setAll("absent")}>
              All Absent
            </button>
          </div>

          <div className="card student-list">
            {students.map((student) => (
              <div className="attendance-row" key={student._id}>
                <div className="student-mini">
                  <div className="avatar">{student.user?.name?.[0] || "S"}</div>
                  <div>
                    <strong>{student.user?.name}</strong>
                    <span>Roll {student.rollNumber}</span>
                  </div>
                </div>
                <div className="att-toggle">
                  {["present", "absent", "late"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`att-btn ${records[student._id] === status ? status : ""}`}
                      onClick={() => setRecords((value) => ({ ...value, [student._id]: status }))}
                    >
                      {status[0].toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button className="btn btn-primary submit-att" type="button" onClick={submit}>
            Submit Attendance
          </button>

          {saved && (
            <div className="success-box">
              <CheckCircle2 size={20} /> Attendance saved and notification checks completed.
            </div>
          )}
        </>
      )}
    </section>
  );
}
