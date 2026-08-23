import { NavLink } from "react-router-dom";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Gauge,
  LogOut,
  Shield,
  UserCog,
  UserPlus,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: Gauge, end: true },
  { to: "/admin/cameras", label: "Cameras", icon: Camera },
  { to: "/admin/detections", label: "Detections", icon: Shield },
  { to: "/admin/challans", label: "Challans", icon: ClipboardList },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/users", label: "Staff Users", icon: UserCog },
  { to: "/admin/access-requests", label: "Access Requests", icon: UserPlus }
];

const studentLinks = [
  { to: "/student", label: "Dashboard", icon: Gauge, end: true },
  { to: "/student/detections", label: "Detections", icon: Shield },
  { to: "/student/challans", label: "Challans", icon: ClipboardList }
];

const viewerLinks = [
  { to: "/viewer", label: "Live Feeds", icon: Camera, end: true },
  { to: "/viewer/detections", label: "Detections", icon: Shield }
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const { logout, name, role } = useAuth();
  const links = role === "admin" ? adminLinks : role === "student" ? studentLinks : viewerLinks;
  const initial = (name || role || "U").slice(0, 1).toUpperCase();

  useEffect(() => {
    if (role !== "student") {
      setPhotoUrl("");
      return;
    }

    api.get("/students/me/profile")
      .then((res) => setPhotoUrl(res.data.photo_url || ""))
      .catch(() => setPhotoUrl(""));
  }, [role]);

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-brand">
        <span className="brand-mark">
          <Shield size={18} />
        </span>
        <span className="brand-text hide-when-collapsed">
          <span>Campus</span>
          <span>Surveillance</span>
          <span className="brand-subtitle">System</span>
        </span>
        <button className="btn btn-ghost btn-sm icon-btn sidebar-toggle" onClick={() => setCollapsed((value) => !value)} type="button">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="nav-links">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} end={end} key={to} to={to}>
            <Icon size={18} />
            <span className="hide-when-collapsed">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <span className="avatar">
            {photoUrl ? <img alt={name || "Student"} src={photoUrl} /> : initial}
          </span>
          <div className="hide-when-collapsed">
            <div>{name || "Operator"}</div>
            <span className={`badge ${role === "admin" ? "badge-red" : "badge-blue"}`}>{role || "viewer"}</span>
          </div>
        </div>
        <button className="btn btn-ghost btn-danger" onClick={logout} type="button">
          <LogOut size={16} />
          <span className="hide-when-collapsed">Logout</span>
        </button>
      </div>
    </aside>
  );
}
