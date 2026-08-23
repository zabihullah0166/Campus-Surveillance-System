import { Check, FileImage, X } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import SnapshotModal from "../components/SnapshotModal";
import { useToast } from "../components/Toast";
import { badgeForStatus, badgeForViolation, dateTime, normalizeList, sampleDetections } from "../utils/format";

export default function Detections() {
  const [filters, setFilters] = useState({ violation_type: "", period: "", department: "", status: "pending" });
  const [items, setItems] = useState(sampleDetections);
  const [snapshotId, setSnapshotId] = useState(null);
  const [accepting, setAccepting] = useState(null);
  const [rollNo, setRollNo] = useState("");
  const toast = useToast();

  function load() {
    const params = {
      violation_type: filters.violation_type || undefined,
      period: filters.period || undefined,
      department: filters.department || undefined,
      status: filters.status || undefined
    };
    api.get("/detections/", { params }).then((res) => setItems(normalizeList(res.data))).catch(() => {});
  }

  useEffect(load, [filters]);

  async function accept() {
    const body = rollNo ? { roll_no: rollNo } : {};
    try {
      await api.post(`/detections/${accepting.id}/accept`, body);
      setItems((current) => current.map((item) => (item.id === accepting.id ? { ...item, status: "accepted" } : item)));
      setAccepting(null);
      setRollNo("");
      toast.success("Challan issued");
    } catch {
      toast.error("Accept failed");
    }
  }

  async function decline(id) {
    if (!window.confirm("Decline this detection and delete snapshot file?")) return;
    try {
      await api.post(`/detections/${id}/decline`);
      setItems((current) => current.filter((item) => item.id !== id));
      toast.info("Detection declined");
    } catch {
      toast.error("Decline failed");
    }
  }

  return (
    <div className="page page-detections">
      <div className="page-header"><div><span className="section-label">Review Queue</span><h1 className="page-title">Detections</h1></div></div>

      <div className="card filters">
        <div className="form-group"><label>Violation Type</label><select value={filters.violation_type} onChange={(e) => setFilters({ ...filters, violation_type: e.target.value })}><option value="">All</option><option>Fighting</option><option>Weapon</option><option>Cigarette</option><option>Dustbin</option><option>Trash</option></select></div>
        <div className="form-group"><label>Time Period</label><select value={filters.period} onChange={(e) => setFilters({ ...filters, period: e.target.value })}><option value="">All Time</option><option value="daily">Today</option><option value="weekly">This Week</option><option value="monthly">This Month</option><option value="yearly">This Year</option></select></div>
        <div className="form-group"><label>Department</label><input value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })} /></div>
        <div className="form-group"><label>Status</label><select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">All Status</option><option value="pending">Pending</option><option value="accepted">Accepted</option><option value="declined">Declined</option></select></div>
        <span className="badge badge-blue">{items.length} records</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Violation</th><th>Student</th><th>Location</th><th>Conf.</th><th>Status</th><th>Time</th><th>Snap</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map((item, index) => {
              const identified = item.student_id || item.student_roll_no || item.roll_no;
              const confidence = Math.round(Number(item.confidence || 0) * 100);
              return (
                <tr key={item.id}>
                  <td className="mono">{index + 1}</td>
                  <td><span style={{ alignItems: "center", display: "flex", gap: 8 }}>{item.is_alert && <span className="pulse" />}<span className={`badge ${badgeForViolation(item.violation_type)}`}>{item.violation_type}</span></span></td>
                  <td>{identified ? <><div className="mono text-accent">{item.student_roll_no || item.roll_no}</div><div className="muted">{item.student_name || item.name}</div></> : <span className="text-amber">Unknown</span>}</td>
                  <td>{item.location || item.camera_name}</td>
                  <td className={confidence > 80 ? "text-red" : "text-amber"}>{confidence}%</td>
                  <td><span className={`badge ${badgeForStatus(item.status || "pending")}`}>{item.status || "pending"}</span></td>
                  <td className="mono">{dateTime(item.detected_at)}</td>
                  <td><button className="btn btn-ghost btn-sm icon-btn" onClick={() => setSnapshotId(item.id)} type="button"><FileImage size={14} /></button></td>
                  <td>{(item.status || "pending") === "pending" && <div style={{ display: "flex", gap: 6 }}><button className="btn btn-sm" onClick={() => setAccepting(item)} type="button"><Check size={14} /></button><button className="btn btn-danger btn-sm" onClick={() => decline(item.id)} type="button"><X size={14} /></button></div>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {snapshotId && <SnapshotModal detectionId={snapshotId} onClose={() => setSnapshotId(null)} />}
      {accepting && (
        <div className="modal-overlay" onClick={() => setAccepting(null)}>
          <div className="modal page" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Accept Detection</h2>
            <p><span className={`badge ${badgeForViolation(accepting.violation_type)}`}>{accepting.violation_type}</span> at {accepting.location || accepting.camera_name}</p>
            {accepting.student_id || accepting.student_roll_no ? (
              <div className="badge badge-green">Student identified: {accepting.student_roll_no || accepting.roll_no} - challan will be sent to portal</div>
            ) : (
              <><div className="badge badge-amber">Student not identified - enter roll number to issue challan</div><div className="form-group"><label>Roll Number</label><input value={rollNo} onChange={(e) => setRollNo(e.target.value)} /></div></>
            )}
            <div className="modal-actions"><button className="btn btn-ghost" onClick={() => setAccepting(null)} type="button">Cancel</button><button className="btn btn-primary" disabled={!accepting.student_id && !accepting.student_roll_no && !rollNo} onClick={accept} type="button">Accept & Issue Challan</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
