// app/lib/state.server.js
import crypto from "node:crypto";

const NAME = "sae_state";
const MAX_AGE = 300; // 5 min

function hmac(value) {
  const h = crypto.createHmac("sha256", process.env.SESSION_SECRET);
  h.update(value);
  return h.digest("hex");
}

export function makeState() {
  const val = crypto.randomUUID();    // valor público que viaja en la URL
  const sig = hmac(val);              // firma privada
  return `${val}.${sig}`;             // se guarda en cookie
}

export function verifyState(raw, stateFromQuery) {
  if (!raw || !raw.includes(".")) return false;
  const [val, sig] = raw.split(".");
  if (val !== stateFromQuery) return false;
  return hmac(val) === sig;
}

export function setStateCookieHeader(raw) {
  return [
    `${NAME}=${raw}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${MAX_AGE}`,
  ].join("; ");
}

export function clearStateCookieHeader() {
  return `${NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

export function readStateCookie(request) {
  const cookie = request.headers.get("cookie") || "";
  for (const part of cookie.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === NAME) return decodeURIComponent(v.join("="));
  }
  return "";
}
