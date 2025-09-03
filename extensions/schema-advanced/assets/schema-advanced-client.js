// schema-advanced-client.js — ping simple SAE1 con URL absoluta
(function () {
  var ok = !!document.querySelector('script[type="application/ld+json"][data-sae="1"]');

  var cfg  = window.SCHEMA_ADVANCED_SETTINGS || {};
  var shop = cfg.shop || (window.Shopify && Shopify.shop) || "";
  // IMPORTANTÍSIMO: host absoluto de TU app (Vercel)
  var appHost = cfg.appHost || "https://schema-advanced-app.vercel.app";

  if (shop) {
    var url = appHost + "/api/sae1?shop=" + encodeURIComponent(shop) + "&ok=" + (ok ? "1" : "0") + "&t=" + Date.now();
    var img = new Image(1, 1);
    img.src = url; // imagen invisible → sin CORS
  }
})();
