// app/routes/api.schema.ping.jsx
import { json } from "@remix-run/node";

export async function loader(a) { return action(a); }
export async function action({ request }) {
  const u = new URL(request.url);
  const shop = u.searchParams.get("shop");
  const status = u.searchParams.get("status") === "1" ? "DETECTED" : "MISSING";
  const path = u.searchParams.get("path") || "/";
  // Guarda en DB si quieres; aquí solo devolvemos OK
  console.log("[PING]", shop, status, path, new Date().toISOString());
  return json({ ok: true });
}
