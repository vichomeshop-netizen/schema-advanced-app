import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => ([
  { title: "Schema Advanced App" },
  { name: "description", content: "OK" },
]);

export default function Index() {
  return (
    <div style={{padding: 24}}>
      <h1>It works ✅</h1>
      <p>Remix SSR on Vercel is running.</p>
    </div>
  );
}