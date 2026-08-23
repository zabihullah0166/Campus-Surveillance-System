import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Check, FileImage, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import SnapshotModal from "../components/SnapshotModal";
import { useToast } from "../components/Toast";
import { badgeForStatus, badgeForViolation, dateTime, normalizeList, sampleCameras } from "../utils/format";

const violationBuckets = [
  { type: "Fighting", color: "#ff3b3b", aliases: ["fighting", "fight"] },
  { type: "Weapon", color: "#ff3b3b", aliases: ["weapon"] },
  { type: "Cigarette", color: "#ffaa00", aliases: ["cigarette", "smoking"] },
  { type: "Dustbin", color: "#00d4ff", aliases: ["dustbin"] },
  { type: "Trash", color: "#7a8fa6", aliases: ["trash", "litter"] }
];

function formatChartDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function AdminDashboard() {
  const [detections, setDetections] = useState([]);
  const [challans, setChallans] = useState([]);
  const [cameras, setCameras] = useState(sampleCameras);
  const [snapshotId, setSnapshotId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    api.get("/detections/").then((res) => setDetections(normalizeList(res.data))).catch(() => setDetections([]));
    api.get("/challans/").then((res) => setChallans(normalizeList(res.data))).catch(() => setChallans([]));
    api.get("/cameras/").then((res) => setCameras(normalizeList(res.data))).catch(() => {});
  }, []);

  async function accept(id) {
    try {
      await api.post(`/detections/${id}/accept`, {});
      setDetections((items) => items.map((item) => (item.id === id ? { ...item, status: "accepted" } : item)));
      const { data } = await api.get("/challans/");
      setChallans(normalizeList(data));
      toast.success("Detection accepted");
    } catch {
      toast.error("Accept failed");
    }
  }

  async function decline(id) {
    if (!window.confirm("Decline this detection and delete snapshot?")) return;
    try {
      await api.post(`/detections/${id}/decline`);
      setDetections((items) => items.filter((item) => item.id !== id));
      toast.info("Detection declined");
    } catch {
      toast.error("Decline failed");
    }
  }

  const pending = detections.filter((d) => (d.status || "pending") === "pending").length;
  const active = cameras.filter((c) => c.is_running).length;
  const issuedChallans = challans.filter((c) => c.detection_id);
  const pendingChallanPayments = issuedChallans.filter((c) => (c.status || "pending") === "pending").length;

  const chartData = useMemo(() => {
    return violationBuckets.map((bucket) => {
      const count = detections.filter((item) => {
        const value = String(item.violation_type || "").toLowerCase();
        const objects = String(item.detected_objects || "").toLowerCase();
        return bucket.aliases.some((alias) => value.includes(alias) || objects.includes(alias));
      }).length;

      return { type: bucket.type, count, color: bucket.color };
    });
  }, [detections]);

  const timelineData = useMemo(() => {
    const counts = {};
    detections.forEach((item) => {
      if (!item.detected_at) return;
      const day = item.detected_at.slice(0, 10);
      counts[day] = (counts[day] || 0) + 1;
    });

    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date,
        label: formatChartDate(date),
        count
      }));
  }, [detections]);

  return (
    <div className="page">
      <div className="page-header">
        <div><span className="section-label">Command Center</span><h1 className="page-title">Admin Dashboard</h1></div>
      </div>

      <div className="grid-4">
        <div className="card stat-card"><span className="section-label">Total Detections</span><div className="stat-value">{detections.length}</div><div className="stat-label">{pending} pending review</div></div>
        <div className="card stat-card" style={{ borderLeftColor: "var(--amber)" }}>
          <span className="section-label">Challans Issued</span>
          <div className="stat-value">{issuedChallans.length}</div>
          <div className="stat-label">{pendingChallanPayments} pending payment</div>
        </div>
        <div className="card stat-card" style={{ borderLeftColor: "var(--green)" }}><span className="section-label">Cameras</span><div className="stat-value">{cameras.length}</div><div className="stat-label">{active} active</div></div>
        <div className="card stat-card" style={{ borderLeftColor: "var(--red)" }}><span className="section-label">Pending Review</span><div className="stat-value">{pending}</div><div className="stat-label">awaiting admin action</div></div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 className="modal-title">Violation Mix</h2>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid stroke="#1e2d3d" vertical={false} />
                <XAxis dataKey="type" stroke="#7a8fa6" />
                <YAxis allowDecimals={false} stroke="#7a8fa6" />
                <Tooltip contentStyle={{ background: "#0d1117", border: "1px solid #2a3f55", color: "#e8edf2" }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell fill={entry.color} key={entry.type} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="modal-title">Detections Over Time</h2>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={timelineData}>
                <CartesianGrid stroke="#1e2d3d" vertical={false} />
                <XAxis dataKey="label" stroke="#7a8fa6" />
                <YAxis allowDecimals={false} stroke="#7a8fa6" />
                <Tooltip
                  contentStyle={{ background: "#0d1117", border: "1px solid #2a3f55", color: "#e8edf2" }}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.date || ""}
                />
                <Line dataKey="count" dot={{ fill: "#00d4ff", r: 4 }} stroke="#00d4ff" strokeWidth={2} type="monotone" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="modal-title">Recent Detections</h2>
        <div className="page">
          {detections.slice(0, 10).map((item) => (
            <div key={item.id} style={{ alignItems: "center", display: "grid", gap: 10, gridTemplateColumns: "44px 1fr auto" }}>
              <button className="btn btn-ghost icon-btn" onClick={() => setSnapshotId(item.id)} type="button"><FileImage size={16} /></button>
              <div>
                <span className={`badge ${badgeForViolation(item.violation_type)}`}>{item.violation_type}</span>
                <div className="mono muted" style={{ marginTop: 5 }}>{item.student_roll_no || "Unknown"} · {dateTime(item.detected_at)}</div>
              </div>
              {(item.status || "pending") === "pending" ? (
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-sm" onClick={() => accept(item.id)} type="button"><Check size={14} /></button>
                  <button className="btn btn-danger btn-sm" onClick={() => decline(item.id)} type="button"><X size={14} /></button>
                </div>
              ) : <span className={`badge ${badgeForStatus(item.status)}`}>{item.status}</span>}
            </div>
          ))}
          {!detections.length && <div className="empty-state">No detections recorded yet</div>}
        </div>
      </div>

      {snapshotId && <SnapshotModal detectionId={snapshotId} onClose={() => setSnapshotId(null)} />}
    </div>
  );
}
