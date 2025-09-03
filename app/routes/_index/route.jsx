import { Link } from "@remix-run/react";

export const meta = () => [{ title: "Schema Advanced" }];

export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 20 }}>
      <h1>Schema Advanced</h1>
      <p>Baseline OK.</p>
      <ul>
        <li><a href="/__status" target="_blank" rel="noreferrer">/__status</a></li>
        <li><a href="/api/embed-ping" target="_blank" rel="noreferrer">/api/embed-ping</a></li>
        <li><Link to="/app">Ir al panel</Link></li>
      </ul>
    </main>
  );
}
