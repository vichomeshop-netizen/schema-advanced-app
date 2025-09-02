import { redirect } from "@remix-run/node";

// redirige la raíz a /app (o a /auth si prefieres iniciar OAuth)
export const loader = async () => redirect("/app");

// componente vacío porque nunca se renderiza (redirige en el loader)
export default function Index() { return null; }
