import { Clock, LogIn, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getErrorMessage } from "../api/client";
import PasswordField from "../components/PasswordField";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import ThemeToggle from "../components/ThemeToggle";

export default function Login() {
  const [tab, setTab] = useState("staff");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({});
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitLogin(accountType) {
    setLoading(true);
    try {
      const data = await login({
        account_type: accountType,
        username: accountType === "student" ? form.roll_no : form.username,
        password: form.password
      });
      toast.success("Login successful");
      if (data.role === "admin") navigate("/admin");
      else if (data.role === "viewer") navigate("/viewer");
      else navigate("/student");
    } catch (error) {
      toast.error(getErrorMessage(error, "Login failed"));
    } finally {
      setLoading(false);
    }
  }

  async function requestAccess(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post("/access-requests/", form);
      toast.info("Pending approval");
      setForm({});
    } catch (error) {
      toast.error(getErrorMessage(error, "Request failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="student-shell app-shell" style={{ alignItems: "center", display: "flex", justifyContent: "center" }}>
      <ThemeToggle />
      <div className="card" style={{ maxWidth: 560, width: "100%" }}>
        <div className="login-header">
          <span className="brand-mark"><ShieldCheck size={28} /></span>
          <h1 className="page-title" style={{ margin: 0 }}>Campus Surveillance System</h1>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <div className="tabs">
            <button className={`btn ${tab === "staff" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("staff")} type="button">Staff Login</button>
            <button className={`btn ${tab === "student" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("student")} type="button">Student Portal</button>
            <button className={`btn ${tab === "request" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("request")} type="button">Request Access</button>
          </div>
        </div>

        {tab === "staff" && (
          <form className="page" onSubmit={(event) => { event.preventDefault(); submitLogin("user"); }}>
            <div className="form-group"><label>Username</label><input required value={form.username || ""} onChange={(e) => update("username", e.target.value)} /></div>
            <PasswordField label="Password" onChange={(e) => update("password", e.target.value)} value={form.password || ""} />
            <button className="btn btn-primary" disabled={loading} type="submit"><LogIn size={16} /> {loading ? "Processing..." : "Login"}</button>
          </form>
        )}

        {tab === "student" && (
          <form className="page" onSubmit={(event) => { event.preventDefault(); submitLogin("student"); }}>
            <div className="form-group"><label>Roll Number</label><input required value={form.roll_no || ""} onChange={(e) => update("roll_no", e.target.value)} /></div>
            <PasswordField label="Password" onChange={(e) => update("password", e.target.value)} value={form.password || ""} />
            <button className="btn btn-primary" disabled={loading} type="submit"><UserRound size={16} /> {loading ? "Processing..." : "Open Portal"}</button>
          </form>
        )}

        {tab === "request" && (
          <form className="page" onSubmit={requestAccess}>
            <div className="grid-2">
              <div className="form-group"><label>Username</label><input required value={form.username || ""} onChange={(e) => update("username", e.target.value)} /></div>
              <div className="form-group"><label>Email</label><input required type="email" value={form.email || ""} onChange={(e) => update("email", e.target.value)} /></div>
              <div className="form-group"><label>Full Name</label><input required value={form.full_name || ""} onChange={(e) => update("full_name", e.target.value)} /></div>
              <PasswordField label="Password" onChange={(e) => update("password", e.target.value)} value={form.password || ""} />
              <div className="form-group"><label>Requested Role</label><select value={form.requested_role || "viewer"} onChange={(e) => update("requested_role", e.target.value)}><option value="viewer">Viewer</option><option value="admin">Admin</option></select></div>
            </div>
            <div className="form-group"><label>Reason</label><textarea required value={form.reason || ""} onChange={(e) => update("reason", e.target.value)} /></div>
            <button className="btn btn-primary" disabled={loading} type="submit"><Clock size={16} /> {loading ? "Processing..." : "Submit Request"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
