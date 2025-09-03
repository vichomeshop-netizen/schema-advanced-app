// app/routes/__status.jsx
export async function loader() {
  return new Response(
    JSON.stringify({
      ok: true,
      time: new Date().toISOString(),
      env: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL,
    }),
    { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
  );
}

export default function Status() {
  return <pre style={{ padding: 16 }}>OK</pre>;
}
