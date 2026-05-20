/**
 * MetroPro runtime config (plain static site — there is no process.env in the browser).
 *
 * Safe defaults: this demo uses local heuristics and Open-Meteo only.
 */
(function (w) {
  w.METROPRO_CONFIG = Object.assign({}, w.METROPRO_CONFIG || {});
})(window);
