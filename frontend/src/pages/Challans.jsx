import { Check, Download, Eye, X } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useToast } from "../components/Toast";
import { badgeForStatus, dateTime, money, normalizeList } from "../utils/format";

export default function Challans() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const toast = useToast();

  function challanPdfUrl(id, download = false) {
    const baseUrl = (api.defaults.baseURL || "").replace(/\/$/, "");
    return `${baseUrl}/challans/${id}/pdf${download ? "?download=true" : ""}`;
  }

  useEffect(() => {
    api.get("/challans/").then((res) => setItems(normalizeList(res.data))).catch(() => setItems([]));
  }, []);

  async function updateStatus(id, status) {
    try {
      await api.patch(`/challans/${id}/status`, { status });
      setItems((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
      toast.success("Challan updated");
    } catch {
      toast.error("Update failed");
    }
  }

  const shown = filter === "all" ? items : items.filter((item) => item.status === filter);
  const pending = items.filter((item) => item.status === "pending");
  const pendingFine = pending.reduce((sum, item) => sum + Number(item.fine_amount || item.fine || 0), 0);

  return (
    <div className="page">
      <div className="page-header"><div><span className="section-label">Financial Actions</span><h1 className="page-title">Challans</h1></div></div>
      <div className="grid-3">
        <div className="card stat-card"><span className="section-label">Total Challans</span><div className="stat-value">{items.length}</div></div>
        <div className="card stat-card" style={{ borderLeftColor: "var(--amber)" }}><span className="section-label">Pending</span><div className="stat-value">{pending.length}</div></div>
        <div className="card stat-card" style={{ borderLeftColor: "var(--red)" }}><span className="section-label">Pending Fine</span><div className="stat-value">{money(pendingFine)}</div></div>
      </div>
      <div className="card" style={{ display: "flex", gap: 8 }}>{["all", "pending", "paid", "appealed", "cancelled"].map((value) => <button className={`btn ${filter === value ? "btn-primary" : "btn-ghost"}`} key={value} onClick={() => setFilter(value)} type="button">{value}</button>)}</div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Challan No</th><th>Student</th><th>Violation</th><th>Fine (PKR)</th><th>Status</th><th>Due Date</th><th>Issued</th><th>PDF</th><th>Actions</th></tr></thead>
          <tbody>{shown.map((item) => <tr key={item.id}><td className="mono text-accent">{item.challan_no}</td><td>{item.student_roll_no || item.roll_no}<div className="muted">{item.student_name}</div></td><td>{item.violation_type}</td><td className="text-amber"><strong>{money(item.fine_amount || item.fine)}</strong></td><td><span className={`badge ${badgeForStatus(item.status)}`}>{item.status}</span></td><td>{dateTime(item.due_date)}</td><td>{dateTime(item.issued_at)}</td><td><div style={{ display: "flex", gap: 6 }}><button className="btn btn-ghost btn-sm icon-btn" onClick={() => window.open(challanPdfUrl(item.id), "_blank", "noopener,noreferrer")} title="View PDF" type="button"><Eye size={14} /></button><a className="btn btn-ghost btn-sm icon-btn" href={challanPdfUrl(item.id, true)} title="Download PDF"><Download size={14} /></a></div></td><td>{item.status === "pending" && <div style={{ display: "flex", gap: 6 }}><button className="btn btn-sm" onClick={() => updateStatus(item.id, "paid")} type="button"><Check size={14} /> Paid</button><button className="btn btn-ghost btn-sm" onClick={() => updateStatus(item.id, "cancelled")} type="button"><X size={14} /> Cancel</button></div>}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
