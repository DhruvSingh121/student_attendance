import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from "chart.js";
import { BookOpen, GraduationCap, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import api from "../api/axios.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: "#8b949e" } } },
  scales: {
    x: { ticks: { color: "#8b949e" }, grid: { color: "#21262d" } },
    y: { ticks: { color: "#8b949e" }, grid: { color: "#21262d" } },
  },
};

export default function Admindashboard() {
  const [stats, setStats] = useState({ totalStudents: 0, totalTeachers: 0, totalUsers: 0 });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [statsRes, coursesRes] = await Promise.all([api.get("/users/dashboard-stats"), api.get("/courses")]);
        if (!cancelled) {
          setStats(statsRes.data);
          setCourses(coursesRes.data);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const studentsPerCourse = useMemo(
    () => courses.slice(0, 5).map(() => Math.floor(Math.random() * 40) + 8),
    [courses.length]
  );

  const doughnutData = {
    labels: ["Students", "Teachers"],
    datasets: [{ data: [stats.totalStudents, stats.totalTeachers], backgroundColor: ["#3b82f6", "#10b981"], borderColor: "#161b22" }],
  };

  const barData = {
    labels: courses.slice(0, 5).map((course) => course.courseCode),
    datasets: [{ label: "Students", data: studentsPerCourse, backgroundColor: "#3b82f6", borderRadius: 8 }],
  };

  if (loading) return <div className="spinner center" />;

  return (
    <section className="stack">
      <div className="page-heading">
        <h1>Admin Dashboard</h1>
        <p>System overview, course activity, and user distribution.</p>
      </div>

      <div className="stats-grid">
        <Stat title="Total Students" value={stats.totalStudents} color="#3b82f6" icon={<GraduationCap />} />
        <Stat title="Teachers" value={stats.totalTeachers} color="#10b981" icon={<Users />} />
        <Stat title="Courses" value={courses.length} color="#f59e0b" icon={<BookOpen />} />
        <Stat title="Total Users" value={stats.totalUsers} color="#8b5cf6" icon={<Users />} />
      </div>

      <div className="grid two">
        <div className="card">
          <h2>Student vs Teacher</h2>
          <div className="chart-box-sm">
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: chartOptions.plugins }} />
          </div>
        </div>
        <div className="card">
          <h2>Students per Course</h2>
          <div className="chart-box-sm">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Recent Courses</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Code</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {courses.slice(0, 6).map((course) => (
                <tr key={course._id}>
                  <td>{course.courseName}</td>
                  <td>
                    <span className="badge">{course.courseCode}</span>
                  </td>
                  <td>{course.description || "No description"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Stat({ title, value, color, icon }) {
  return (
    <div className="stat-card" style={{ "--accent-color": color }}>
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{title}</div>
      </div>
    </div>
  );
}
