export const loader = () =>
  new Response("ok", { headers: { "content-type": "text/plain" } });
export default function Health() { return null; }