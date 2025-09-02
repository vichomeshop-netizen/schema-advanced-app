export async function action({ request }) {
  const data = await request.json();
  // Aquí podrías guardar en DB o cachear estado por shop
  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
}
