// app/routes/auth/ping.jsx
export async function loader() {
  return new Response("auth-pong", { status: 200 });
}
