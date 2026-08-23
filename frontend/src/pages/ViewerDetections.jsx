import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { badgeForViolation, dateTime, normalizeList, sampleDetections } from "../utils/format";

export default function ViewerDetections() {
  const [items, setItems] = useState(sampleDetections);
  function load() {
    api.get("/detections/").then((res) => setItems(normalizeList(res.data))).catch(() => {});
  }
  useEffect(load, []);
  return (
    <div className="page">
      <div className="page-header"><div><span className="section-label">Read Only</span><h1 className="page-title">Detections</h1></div><button className="btn btn-primary" onClick={load} type="button"><RefreshCw size={16} /> Refresh</button></div>
      <div className="table-wrap"><table><thead><tr><th>Violation</th><th>Student</th><th>Location</th><th>Camera</th><th>Confidence</th><th>Time</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><span className={`badge ${badgeForViolation(item.violation_type)}`}>{item.violation_type}</span></td><td>{item.student_roll_no || "Unknown"}</td><td>{item.location}</td><td>{item.camera_name}</td><td>{Math.round(Number(item.confidence || 0) * 100)}%</td><td className="mono">{dateTime(item.detected_at)}</td></tr>)}</tbody></table></div>
    </div>
  );
}
