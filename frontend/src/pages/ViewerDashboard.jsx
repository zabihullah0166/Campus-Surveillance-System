import { useEffect, useState } from "react";
import { api } from "../api/client";
import LiveFeed from "../components/LiveFeed";
import { badgeForViolation, dateTime, normalizeList, sampleCameras, sampleDetections } from "../utils/format";

export default function ViewerDashboard() {
  const [cameras, setCameras] = useState(sampleCameras.filter((c) => c.is_running));
  const [alerts, setAlerts] = useState(sampleDetections);

  useEffect(() => {
    api.get("/cameras/").then((res) => setCameras(normalizeList(res.data).filter((c) => c.is_running))).catch(() => {});
    api.get("/detections/", { params: { limit: 20 } }).then((res) => setAlerts(normalizeList(res.data))).catch(() => {});
  }, []);

  return (
    <div className="page">
      <div className="page-header"><div><span className="section-label">Viewer Console</span><h1 className="page-title">Live Feeds</h1></div></div>
      {cameras.length ? <div className={cameras.length === 1 ? "grid-1" : "grid-2"}>{cameras.map((camera) => <LiveFeed camera={camera} key={camera.id} />)}</div> : <div className="card empty-state">No active cameras</div>}
      <div className="card"><h2 className="modal-title">Recent Alerts</h2><div className="table-wrap"><table><thead><tr><th>Violation</th><th>Student</th><th>Location</th><th>Time</th></tr></thead><tbody>{alerts.slice(0, 20).map((item) => <tr key={item.id}><td><span className={`badge ${badgeForViolation(item.violation_type)}`}>{item.violation_type}</span></td><td>{item.student_roll_no || "Unknown"}</td><td>{item.location || item.camera_name}</td><td className="mono">{dateTime(item.detected_at)}</td></tr>)}</tbody></table></div></div>
    </div>
  );
}
