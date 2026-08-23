import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useToast } from "../components/Toast";
import { badgeForStatus, dateTime, normalizeList } from "../utils/format";

export default function AccessRequests() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("pending");
  const toast = useToast();

  function load() {
    api.get("/access-requests/").then((res) => setItems(normalizeList(res.data))).catch(() => setItems([]));
  }

  useEffect(load, []);

  async function action(id, type) {
    try {
      await api.post(`/access-requests/${id}/${type}`);
      setItems((current) => current.map((item) => (item.id === id ? { ...item, status: type === "approve" ? "approved" : "rejected" } : item)));
      toast.success(`Request ${type}d`);
    } catch {
      toast.error("Request update failed");
    }
  }

  const shown = filter === "all" ? items : items.filter((item) => (item.status || "pending") === filter);

  return (
    <div className="page">
      <div className="page-header"><div><span className="section-label">Approvals</span><h1 className="page-title">Access Requests</h1></div></div>
      <div className="card" style={{ display: "flex", gap: 8 }}>{["pending", "approved", "rejected", "all"].map((value) => <button className={`btn ${filter === value ? "btn-primary" : "btn-ghost"}`} key={value} onClick={() => setFilter(value)} type="button">{value}</button>)}</div>
      <div className="table-wrap"><table><thead><tr><th>Username</th><th>Name</th><th>Email</th><th>Requested Role</th><th>Reason</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>{shown.map((item) => <tr key={item.id}><td className="mono">{item.username}</td><td>{item.full_name}</td><td>{item.email}</td><td><span className={`badge ${item.requested_role === "admin" ? "badge-red" : "badge-blue"}`}>{item.requested_role}</span></td><td>{item.reason}</td><td><span className={`badge ${badgeForStatus(item.status || "pending")}`}>{item.status || "pending"}</span></td><td>{dateTime(item.created_at)}</td><td>{(item.status || "pending") === "pending" && <div style={{ display: "flex", gap: 6 }}><button className="btn btn-sm" onClick={() => action(item.id, "approve")} type="button"><Check size={14} /></button><button className="btn btn-danger btn-sm" onClick={() => action(item.id, "reject")} type="button"><X size={14} /></button></div>}</td></tr>)}</tbody></table></div>
    </div>
  );
}
