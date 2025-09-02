// app/routes/app.jsx
import { Outlet, Link, useLocation } from "@remix-run/react";

export default function AppLayout() {
  const location = useLocation();

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      prefetch="intent"
      style={{
        display: "block",
        padding: "10px 12px",
        borderRadius: 8,
        textDecoration: "none",
        background: location.pathname === to ? "#eef2ff" : "transparent",
        color: "#111",
        marginBottom: 6,
        border: "1px solid #e5e7eb",
      }}
    >
      {children}
    </Link>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <aside style={{ padding: 16, borderRight: "1px solid #e5e7eb", background: "#fafafa" }}>
        <h2 style={{ margin: "6px 0 12px 0", fontSize: 16 }}>Schema Advanced</h2>
        <nav>
          <NavLink to="/app">Panel</NavLink>
          <NavLink to="/app/products">Productos</NavLink>
          <NavLink to="/app/settings">Ajustes</NavLink>
        </nav>
      </aside>
      <main style={{ padding: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}
