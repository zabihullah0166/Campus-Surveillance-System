import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";

export default function Layout({ children }) {
  return (
    <div className="layout">
      <ThemeToggle />
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}
