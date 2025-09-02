(function () {
  // Marca el <html> para verificar que el embed cargó
  try { document.documentElement.setAttribute('data-schema-advanced', 'on'); } catch (_) {}

  // ¿Está tu JSON-LD propio?
  function hasSAE() {
    return !!document.querySelector('script[type="application/ld+json"][data-sae="1"]');
  }

  if (hasSAE()) {
    return; // detectado ya
  }

  // Observa por si tu tema/app lo inyecta después
  var found = false;
  var obs = new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      var list = muts[i].addedNodes || [];
      for (var j = 0; j < list.length; j++) {
        var n = list[j];
        if (n.nodeType === 1 && n.matches && n.matches('script[type="application/ld+json"][data-sae="1"]')) {
          found = true;
          obs.disconnect();
          return;
        }
      }
    }
  });
  try { obs.observe(document.documentElement, { childList: true, subtree: true }); } catch (_) {}

  // Corta la observación a los 4s si no aparece nada
  setTimeout(function () { if (!found) try { obs.disconnect(); } catch (_) {} }, 4000);
})();

