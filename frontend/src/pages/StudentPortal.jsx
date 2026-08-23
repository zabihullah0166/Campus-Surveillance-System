import { ArrowRight, ClipboardList, Download, Eye, LogOut } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { badgeForStatus, badgeForViolation, dateTime, money, normalizeList } from "../utils/format";

export default function StudentPortal() {
  const [profile, setProfile] = useState({});
  const [detections, setDetections] = useState([]);
  const [challans, setChallans] = useState([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const { logout, name } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname === "/student" || location.pathname === "/student/";
  const isDetectionsPage = location.pathname.includes("/detections");
  const isChallansPage = location.pathname.includes("/challans");

  function challanPdfUrl(id, download = false) {
    const baseUrl = (api.defaults.baseURL || "").replace(/\/$/, "");
    return `${baseUrl}/challans/${id}/pdf${download ? "?download=true" : ""}`;
  }

  useEffect(() => {
    api.get("/students/me/profile").then((res) => setProfile(res.data)).catch(() => {});
    api.get("/detections/my/records").then((res) => setDetections(normalizeList(res.data))).catch(() => setDetections([]));
    api.get("/challans/my/challans").then((res) => setChallans(normalizeList(res.data))).catch(() => setChallans([]));
  }, []);

  const pendingChallans = challans.filter((item) => item.status === "pending");
  const fineDue = useMemo(
    () => pendingChallans.reduce((sum, item) => sum + Number(item.fine_amount || item.fine || 0), 0),
    [pendingChallans]
  );

  const displayName = profile.full_name || profile.name || name || "Student";
  const profilePhoto = profile.photo_url ? (
    <img alt={displayName} src={profile.photo_url} />
  ) : (
    displayName.slice(0, 1).toUpperCase()
  );

  const profileFields = [
    { label: "Roll Number", value: profile.roll_no, mono: true, accent: true },
    { label: "Department", value: profile.department },
    { label: "Program", value: profile.program || profile.subject },
    { label: "Semester", value: profile.semester },
    { label: "Mobile", value: profile.mobile_number }
  ];

  return (
    <div className="page">
      <div className="card student-profile-hero">
        <div className="student-profile-hero-inner">
          <div className="student-profile-portrait">{profilePhoto}</div>
          <div className="student-profile-details">
            <span className="badge badge-blue">Student Portal</span>
            <h1 className="page-title">{displayName}</h1>
            {profileFields.map(({ label, value, mono, accent }) => (
              <div className="student-detail-item" key={label}>
                <span className="section-label">{label}</span>
                <div className={`student-detail-value ${mono ? "mono" : ""} ${accent ? "text-accent" : ""}`}>
                  {value || "N/A"}
                </div>
              </div>
            ))}
          </div>
          <div className="student-profile-actions">
            <button className="btn btn-danger" onClick={logout} type="button">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>

      {isDashboard && (
        <>
          <div className="grid-3">
            <div className="card stat-card">
              <span className="section-label">Accepted Detections</span>
              <div className="stat-value">{detections.length}</div>
            </div>
            <div className="card stat-card" style={{ borderLeftColor: "var(--amber)" }}>
              <span className="section-label">Pending Challans</span>
              <div className="stat-value">{pendingChallans.length}</div>
            </div>
            <div className="card stat-card" style={{ borderLeftColor: "var(--red)" }}>
              <span className="section-label">Total Fine Due</span>
              <div className="stat-value">{money(fineDue)}</div>
            </div>
          </div>

          <div className="student-dashboard-links">
            <Link className="card" style={{ display: "block", textDecoration: "none" }} to="/student/detections">
              <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
                <div>
                  <span className="section-label">My Detections</span>
                  <div className="stat-value" style={{ fontSize: "1.5rem" }}>{detections.length}</div>
                  <p className="muted" style={{ margin: "8px 0 0" }}>View accepted violation records</p>
                </div>
                <ArrowRight size={20} />
              </div>
            </Link>
            <Link className="card" style={{ display: "block", textDecoration: "none" }} to="/student/challans">
              <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
                <div>
                  <span className="section-label">My Challans</span>
                  <div className="stat-value" style={{ fontSize: "1.5rem" }}>{challans.length}</div>
                  <p className="muted" style={{ margin: "8px 0 0" }}>View and download issued challans</p>
                </div>
                <ClipboardList size={20} />
              </div>
            </Link>
          </div>
        </>
      )}

      {isDetectionsPage && (
        <>
          <div className="page-header">
            <div>
              <span className="section-label">Records</span>
              <h2 className="page-title">My Detections</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Violation</th>
                  <th>Location</th>
                  <th>Confidence</th>
                  <th>Snapshot</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {detections.map((item) => (
                  <tr key={item.id}>
                    <td><span className={`badge ${badgeForViolation(item.violation_type)}`}>{item.violation_type}</span></td>
                    <td>{item.location}</td>
                    <td>{Math.round(Number(item.confidence || 0) * 100)}%</td>
                    <td>
                      {item.snapshot_path ? (
                        <button className="btn btn-ghost btn-sm" onClick={() => setSelectedSnapshot(item.snapshot_path)} type="button">
                          <Eye size={14} /> View
                        </button>
                      ) : "N/A"}
                    </td>
                    <td className="mono">{dateTime(item.detected_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!detections.length && <div className="empty-state">No accepted detections</div>}
          </div>
        </>
      )}

      {isChallansPage && (
        <>
          <div className="page-header">
            <div>
              <span className="section-label">Payments</span>
              <h2 className="page-title">My Challans</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Challan No</th>
                  <th>Violation</th>
                  <th>Fine (PKR)</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Issued</th>
                  <th>PDF</th>
                </tr>
              </thead>
              <tbody>
                {challans.map((item) => (
                  <tr key={item.id}>
                    <td className="mono text-accent">{item.challan_no}</td>
                    <td>{item.violation_type}</td>
                    <td className={item.status === "pending" ? "text-red" : "muted"}>{money(item.fine_amount || item.fine)}</td>
                    <td><span className={`badge ${badgeForStatus(item.status)}`}>{item.status}</span></td>
                    <td>{dateTime(item.due_date)}</td>
                    <td>{dateTime(item.issued_at)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-ghost btn-sm icon-btn" onClick={() => window.open(challanPdfUrl(item.id), "_blank", "noopener,noreferrer")} title="View PDF" type="button">
                          <Eye size={14} />
                        </button>
                        <a className="btn btn-ghost btn-sm icon-btn" href={challanPdfUrl(item.id, true)} title="Download PDF">
                          <Download size={14} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!challans.length && <div className="empty-state">No challans</div>}
          </div>
        </>
      )}

      {selectedSnapshot && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedSnapshot(null)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "var(--bg-secondary)", borderRadius: "8px", padding: "16px", maxWidth: "90vh", maxHeight: "90vh", overflow: "auto", position: "relative" }}>
            <button className="btn btn-ghost" onClick={() => setSelectedSnapshot(null)} style={{ position: "absolute", top: "12px", right: "12px", zIndex: 1001 }} type="button">✕</button>
            <img src={selectedSnapshot} alt="Detection Snapshot" style={{ width: "100%", height: "auto", borderRadius: "4px" }} />
          </div>
        </div>
      )}
    </div>
  );
}
