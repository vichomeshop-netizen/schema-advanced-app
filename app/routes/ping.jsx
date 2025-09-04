// app/routes/ping.jsx
export async function loader() {
  return new Response("pong", { status: 200 });
}