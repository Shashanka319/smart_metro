/** Smart Metro — user-visible branding (internal JS APIs keep MetroPro* names). */
(function (w) {
  var NAME = "Smart Metro";
  var TAGLINE = "Namma Metro · Bengaluru";

  function applyBranding() {
    document.querySelectorAll(".mp-brand").forEach(function (el) {
      var icon = el.querySelector("[data-lucide]");
      var iconHtml = icon ? icon.outerHTML : '<i data-lucide="train-front" class="icon-lg"></i>';
      el.innerHTML = iconHtml + " " + NAME;
    });
    if (w.lucide && lucide.createIcons) lucide.createIcons();
  }

  w.SmartMetroBrand = {
    NAME: NAME,
    TAGLINE: TAGLINE,
    apply: applyBranding,
  };
})(window);
