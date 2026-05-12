import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import api from "../api/axios.js";
import { useAuth } from "../context/Authcontext.jsx";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Studentdashboard() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState({ records: [], stats: { total: 0, present: 0, absent: 0, percentage: 0 } });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [attendanceRes, notificationsRes] = await Promise.all([api.get("/attendance/my"), api.get("/notifications/my")]);
      if (!cancelled) {
        setAttendance(attendanceRes.data);
        setNotifications(notificationsRes.data);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = attendance.stats;
  const unread = notifications.filter((item) => !item.read).length;
  const chartData = {
    labels: ["Present", "Absent"],
    datasets: [{ data: [stats.present, stats.absent], backgroundColor: ["#10b981", "#ef4444"], borderColor: "#161b22" }],
  };

  return (
    <section className="stack">
      <div className="profile-card card">
        <div className="avatar lg-avatar">{user.name?.[0]}</div>
        <div>
          <h1>{user.name}</h1>
          <span className="badge badge-student">student</span>
        </div>
        <div className="notif-pill">
          <Bell size={18} />
          {unread}
        </div>
      </div>

      <div className="stats-grid">
        <Stat title="Total Classes" value={stats.total} color="#3b82f6" />
        <Stat title="Present" value={stats.present} color="#10b981" />
        <Stat title="Absent" value={stats.absent} color="#ef4444" />
        <Stat title="Attendance" value={`${stats.percentage}%`} color={stats.percentage >= 75 ? "#10b981" : "#ef4444"} />
      </div>

      <div className="grid two">
        <div className="card">
          <h2>Attendance Split</h2>
          <div className="chart-box-sm">
            <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: "#8b949e" } } } }} />
          </div>
          {stats.percentage < 75 && stats.total > 0 && <div className="warning-box">Your attendance is below the 75% threshold.</div>}
        </div>

        <div className="card">
          <h2>Notifications</h2>
          <div className="notification-list">
            {notifications.map((item) => (
              <div className={`notification ${item.read ? "" : "unread"}`} key={item._id}>
                <strong>{item.message}</strong>
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
            {notifications.length === 0 && <div className="empty-state">No notifications yet.</div>}
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Recent Attendance</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Class</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.records.slice(0, 10).map((record) => (
                <tr key={record._id}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{record.classId?.className || "Class"}</td>
                  <td>
                    <span className={`badge badge-${record.status}`}>{record.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Stat({ title, value, color }) {
  return (
    <div className="stat-card" style={{ "--accent-color": color }}>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{title}</div>
      </div>
    </div>
  );
}
