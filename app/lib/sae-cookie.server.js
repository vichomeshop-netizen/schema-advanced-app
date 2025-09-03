import { createCookie } from "@remix-run/node";

export const saeTokenCookie = createCookie("sae_t", {
  httpOnly: true,
  sameSite: "lax",
  secure: true,
  path: "/",
  maxAge: 600, // 10 minutos (diagnóstico)
  secrets: [process.env.SESSION_SECRET || "dev-secret"],
});
