// app/routes/app._index.tsx
export default function AppHome() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Panel Schema Advanced</h1>
      <ul>
        <li><a href="/app/products">Productos</a></li>
        <li><a href="/app/collections">Colecciones</a></li>
        <li><a href="/app/schema">SEO / Schema</a></li>
        <li><a href="/app/settings">Ajustes</a></li>
      </ul>
    </div>
  );
}

