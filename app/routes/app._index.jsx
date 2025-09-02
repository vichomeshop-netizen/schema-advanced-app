// app/routes/app._index.jsx
import { useSearchParams } from "@remix-run/react";

export default function AppHome() {
  const [sp] = useSearchParams();
  const shop = sp.get("shop") || "";

  const openThemeEditor = () => {
    // Abre el editor de temas en App embeds dentro del Admin
    window.top.location.href = `/admin/themes/current/editor?context=apps`;
  };

  return (
    <div style={{padding: 24, fontFamily: "system-ui, sans-serif"}}>
      <h1>Schema Advanced</h1>
      <p>Activa el <strong>App embed</strong> en tu tema para empezar.</p>
      <button onClick={openThemeEditor} style={{padding: '8px 12px'}}>Abrir editor de temas</button>

      <hr style={{margin: '24px 0'}} />
      <h3>Estado</h3>
      <p id="state">Comprobando si el embed se ha cargado recientemente…</p>

      <script dangerouslySetInnerHTML={{__html: `
        // Muestra "Activo" si hemos recibido un ping del storefront en las últimas 24h
        fetch('/api/embed-status?shop=${encodeURIComponent(shop)}').then(r=>r.json()).then(d=>{
          const el = document.getElementById('state');
          if (d.active) { el.textContent = '✔️ Embed activo recientemente.'; }
          else { el.textContent = '⚠️ Aún no vemos el embed activo. Actívalo y visita tu tienda.'; }
        }).catch(()=>{});
      `}} />
    </div>
  );
}
