import { Trash2, Upload, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { useToast } from "../components/Toast";
import { normalizeList } from "../utils/format";

const empty = { roll_no: "", full_name: "", email: "", phone: "", department: "", program: "", semester: "", password: "" };

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [photoFile, setPhotoFile] = useState(null);
  const toast = useToast();

  useEffect(() => {
    api.get("/students/").then((res) => setStudents(normalizeList(res.data))).catch(() => setStudents([]));
  }, []);

  const shown = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter((s) => `${s.roll_no} ${s.full_name || s.name} ${s.department}`.toLowerCase().includes(q));
  }, [search, students]);

  async function submit(event) {
    event.preventDefault();
    try {
      const { data } = await api.post("/students/", form);
      const body = new FormData();
      body.append("file", photoFile);
      await api.post(`/students/${data.id}/photo`, body, { headers: { "Content-Type": "multipart/form-data" } });
      setStudents((items) => [...items, data]);
      setModal(false);
      setForm(empty);
      setPhotoFile(null);
      toast.success("Student added with face photo");
    } catch {
      toast.error("Student add failed");
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this student?")) return;
    try {
      await api.delete(`/students/${id}`);
      setStudents((items) => items.filter((item) => (item.id || item.roll_no) !== id));
    } catch {
      toast.error("Delete failed");
    }
  }

  const canSubmit = form.roll_no && form.full_name && form.password && photoFile;

  return (
    <div className="page">
      <div className="page-header"><div><span className="section-label">Identity Registry</span><h1 className="page-title">Students</h1></div><button className="btn btn-primary" onClick={() => setModal(true)} type="button"><UserPlus size={16} /> Add Student</button></div>
      <div className="card"><input placeholder="Search roll number, name, department" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      <div className="table-wrap"><table><thead><tr><th>Roll No</th><th>Name</th><th>Department</th><th>Program</th><th>Sem</th><th>Status</th><th></th></tr></thead><tbody>{shown.map((s) => <tr key={s.id || s.roll_no}><td className="mono text-accent">{s.roll_no}</td><td><div className="student-cell"><span className="student-avatar">{s.photo_url ? <img src={s.photo_url} alt={s.full_name || s.name} /> : (s.full_name || s.name || "?").slice(0,1)}</span><span>{s.full_name || s.name}</span></div></td><td>{s.department}</td><td>{s.program}</td><td>{s.semester}</td><td><span className="badge badge-green">{s.status || "active"}</span></td><td><button className="btn btn-danger btn-sm icon-btn" onClick={() => remove(s.id || s.roll_no)} type="button"><Trash2 size={14} /></button></td></tr>)}</tbody></table></div>
      {modal && <div className="modal-overlay" onClick={() => setModal(false)}><form className="modal page" onClick={(e) => e.stopPropagation()} onSubmit={submit}><h2 className="modal-title">Add Student</h2><div className={`photo-upload ${photoFile ? "has-photo" : ""}`}><div className="photo-preview">{photoFile ? <img alt="Preview" src={URL.createObjectURL(photoFile)} /> : <Upload size={28} />}</div><div><strong>Face Photo *</strong><p className="muted">Photo is required so the AI can match detections.</p><label className="btn btn-sm btn-primary">Choose Photo<input accept="image/*" hidden type="file" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} /></label><div className="mono muted">{photoFile?.name}</div></div></div>{!photoFile && <div className="badge badge-amber">Photo is required - student cannot be detected without it</div>}<div className="grid-2">{Object.keys(empty).map((key) => <div className="form-group" key={key}><label>{key.replace("_", " ")}{["roll_no", "full_name", "password"].includes(key) ? "*" : ""}</label><input required={["roll_no", "full_name", "password"].includes(key)} type={key === "password" ? "password" : "text"} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></div>)}</div><div className="modal-actions"><button className="btn btn-ghost" onClick={() => setModal(false)} type="button">Cancel</button><button className="btn btn-primary" disabled={!canSubmit} type="submit">Save Student</button></div></form></div>}
    </div>
  );
}
