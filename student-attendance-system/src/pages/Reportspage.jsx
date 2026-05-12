import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from "chart.js";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import api from "../api/axios.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function Reportspage() {
  const now = new Date();
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [weekly, setWeekly] = useState([]);
  const [report, setReport] = useState([]);

  useEffect(() => {
    api.get("/classes/my").then((res) => {
      setClasses(res.data);
      setClassId(res.data[0]?._id || "");
    });
  }, []);

  const generate = async () => {
    if (!classId) return;
    const [weeklyRes, reportRes] = await Promise.all([
      api.get(`/reports/weekly?classId=${classId}`),
      api.get(`/reports/class?classId=${classId}&month=${month}&year=${year}`),
    ]);
    setWeekly(weeklyRes.data);
    setReport(reportRes.data);
  };

  useEffect(() => {
    if (classId) generate();
  }, [classId]);

  const chartData = {
    labels: weekly.map((item) => item.label),
    datasets: [
      { label: "Present", data: weekly.map((item) => item.present), backgroundColor: "#10b981", borderRadius: 6 },
      { label: "Absent", data: weekly.map((item) => item.absent), backgroundColor: "#ef4444", borderRadius: 6 },
    ],
  };

  return (
    <section className="stack">
      <div className="page-heading">
        <h1>Reports</h1>
        <p>Generate monthly per-student summaries and weekly trends.</p>
      </div>

      <div className="card filter-card">
        <select className="select" value={classId} onChange={(event) => setClassId(event.target.value)}>
          {classes.map((item) => (
            <option key={item._id} value={item._id}>
              {item.className}
            </option>
          ))}
        </select>
        <select className="select" value={month} onChange={(event) => setMonth(event.target.value)}>
          {months.map((label, index) => (
            <option key={label} value={index + 1}>
              {label}
            </option>
          ))}
        </select>
        <input className="input" value={year} onChange={(event) => setYear(event.target.value)} />
        <button className="btn btn-primary" type="button" onClick={generate}>
          Generate
        </button>
      </div>

      <div className="card">
        <h2>Weekly Attendance</h2>
        <div className="chart-box">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: { stacked: true, ticks: { color: "#8b949e" }, grid: { color: "#21262d" } },
                y: { stacked: true, ticks: { color: "#8b949e" }, grid: { color: "#21262d" } },
              },
              plugins: { legend: { labels: { color: "#8b949e" } } },
            }}
          />
        </div>
      </div>

      <div className="card">
        <h2>Student Report</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Roll</th>
                <th>Name</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Late</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {report.map((item) => (
                <tr key={item.studentId}>
                  <td>{item.rollNumber}</td>
                  <td>{item.name}</td>
                  <td>
                    <span className="badge badge-present">{item.present}</span>
                  </td>
                  <td>
                    <span className="badge badge-absent">{item.absent}</span>
                  </td>
                  <td>
                    <span className="badge badge-late">{item.late}</span>
                  </td>
                  <td>
                    <div className="percent-cell">
                      <span className={item.percentage >= 75 ? "ok" : "bad"}>{item.percentage}%</span>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${item.percentage}%`, background: item.percentage >= 75 ? "#10b981" : "#ef4444" }} />
                      </div>
                    </div>
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
