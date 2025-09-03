// schema-advanced-client.js — ultra simple
(function () {
  // ¿Existe algún <script type="application/ld+json" data-sae="1"> en el DOM?
  var ok = !!document.querySelector('script[type="application/ld+json"][data-sae="1"]');

  // Marca global por si abres DevTools en el storefront
  window.SAE1_ACTIVE = ok;

  // Si nos han pasado el shop desde el Liquid, lo usamos en el ping
  var cfg = window.SCHEMA_ADVANCED_SETTINGS || {};
  var shop = cfg.shop || (window.Shopify && Shopify.shop) || "";

  // Ping MUY simple (GET) a tu backend para que el panel pueda leer el estado
  // No usamos fetch para evitar CORS: una imagen invisible basta.
  if (shop) {
    var img = new Image(1, 1);
    img.src = "/api/sae1?shop=" + encodeURIComponent(shop) + "&ok=" + (ok ? "1" : "0") + "&t=" + Date.now();
  }
})();
