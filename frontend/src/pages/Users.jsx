import { Trash2, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useToast } from "../components/Toast";
import { dateTime, normalizeList } from "../utils/format";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ username: "", full_name: "", email: "", password: "", role: "viewer" });
  const toast = useToast();

  useEffect(() => {
    api.get("/users/").then((res) => setUsers(normalizeList(res.data))).catch(() => setUsers([]));
  }, []);

  async function submit(event) {
    event.preventDefault();
    try {
      const { data } = await api.post("/users/", form);
      setUsers((items) => [...items, data]);
      setModal(false);
      toast.success("User created");
    } catch {
      toast.error("Create failed");
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers((items) => items.filter((item) => item.id !== id));
    } catch {
      toast.error("Delete failed");
    }
  }

  return (
    <div className="page">
      <div className="page-header"><div><span className="section-label">Staff Access</span><h1 className="page-title">Staff Users</h1></div><button className="btn btn-primary" onClick={() => setModal(true)} type="button"><UserPlus size={16} /> Add User</button></div>
      <div className="table-wrap"><table><thead><tr><th>Username</th><th>Full Name</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th><th></th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td className="mono">{user.username}</td><td>{user.full_name}</td><td>{user.email}</td><td><span className={`badge ${user.role === "admin" ? "badge-red" : "badge-blue"}`}>{user.role}</span></td><td><span className="badge badge-green">{user.status || "active"}</span></td><td>{dateTime(user.created_at)}</td><td><button className="btn btn-danger btn-sm icon-btn" onClick={() => remove(user.id)} type="button"><Trash2 size={14} /></button></td></tr>)}</tbody></table></div>
      {modal && <div className="modal-overlay" onClick={() => setModal(false)}><form className="modal page" onClick={(e) => e.stopPropagation()} onSubmit={submit}><h2 className="modal-title">Add User</h2><div className="grid-2">{["username", "full_name", "email", "password"].map((key) => <div className="form-group" key={key}><label>{key.replace("_", " ")}{key !== "full_name" ? "*" : ""}</label><input required={key !== "full_name"} type={key === "password" ? "password" : key === "email" ? "email" : "text"} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></div>)}<div className="form-group"><label>Role</label><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="viewer">Viewer</option><option value="admin">Admin</option></select></div></div><div className="modal-actions"><button className="btn btn-ghost" onClick={() => setModal(false)} type="button">Cancel</button><button className="btn btn-primary" type="submit">Create</button></div></form></div>}
    </div>
  );
}
