import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { useAuth } from "./context/AuthContext";
import AccessRequests from "./pages/AccessRequests";
import AdminDashboard from "./pages/AdminDashboard";
import Cameras from "./pages/Cameras";
import Challans from "./pages/Challans";
import Detections from "./pages/Detections";
import Login from "./pages/Login";
import StudentPortal from "./pages/StudentPortal";
import Students from "./pages/Students";
import Users from "./pages/Users";
import ViewerDashboard from "./pages/ViewerDashboard";
import ViewerDetections from "./pages/ViewerDetections";

function RoleRedirect() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate replace to="/login" />;
  if (role === "admin") return <Navigate replace to="/admin" />;
  if (role === "viewer") return <Navigate replace to="/viewer" />;
  if (role === "student") return <Navigate replace to="/student" />;
  return <Navigate replace to="/login" />;
}

function RequireAuth({ roles }) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate replace to="/login" />;
  if (!roles.includes(role)) return <RoleRedirect />;
  return <Outlet />;
}

function WithLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RoleRedirect />} />

        <Route element={<RequireAuth roles={["admin"]} />}>
          <Route element={<WithLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/cameras" element={<Cameras />} />
            <Route path="/admin/detections" element={<Detections />} />
            <Route path="/admin/challans" element={<Challans />} />
            <Route path="/admin/students" element={<Students />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/access-requests" element={<AccessRequests />} />
          </Route>
        </Route>

        <Route element={<RequireAuth roles={["admin", "viewer"]} />}>
          <Route element={<WithLayout />}>
            <Route path="/viewer" element={<ViewerDashboard />} />
            <Route path="/viewer/detections" element={<ViewerDetections />} />
          </Route>
        </Route>

        <Route element={<RequireAuth roles={["student"]} />}>
          <Route element={<WithLayout />}>
            <Route path="/student" element={<StudentPortal />} />
            <Route path="/student/detections" element={<StudentPortal />} />
            <Route path="/student/challans" element={<StudentPortal />} />
          </Route>
        </Route>

        <Route path="*" element={<RoleRedirect />} />
      </Routes>
    </div>
  );
}
