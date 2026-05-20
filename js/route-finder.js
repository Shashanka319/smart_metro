(function () {
  /** Bumps when the user changes the route so stale async tips are ignored. */
  var insightRequestSeq = 0;

  var POPULAR = [
    { from: "whitefield_kadugodi", to: "nadaprabhu_kempegowda_majestic", label: "Whitefield → Majestic" },
    { from: "challaghatta", to: "mahatma_gandhi_road", label: "Challaghatta → MG Road" },
    { from: "madavara", to: "silk_institute", label: "Madavara → Silk Institute" },
    { from: "rashtreeya_vidyalaya_road", to: "electronic_city", label: "RV Road → Electronic City" },
  ];

  function populateSelect(selectEl, stations, placeholder) {
    if (!selectEl) return;
    selectEl.innerHTML = '<option value="">' + placeholder + "</option>";
    stations.forEach(function (s) {
      var opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = s.name + (s.code ? " (" + s.code + ")" : "");
      selectEl.appendChild(opt);
    });
  }

  function renderPopular(host, from, to, update) {
    if (!host) return;
    host.innerHTML = POPULAR.map(function (p) {
      return (
        '<button type="button" class="btn btn-sm btn-outline-secondary mp-route-chip" data-from="' +
        p.from +
        '" data-to="' +
        p.to +
        '">' +
        p.label +
        "</button>"
      );
    }).join("");
    host.querySelectorAll(".mp-route-chip").forEach(function (btn) {
      btn.addEventListener("click", function () {
        from.value = btn.getAttribute("data-from");
        to.value = btn.getAttribute("data-to");
        update();
      });
    });
  }

  /* Favorites storage (frontend-only) */
  var FAV_KEY = "metropro_fav_routes";
  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function saveFavoriteObj(obj) {
    var arr = getFavorites();
    // dedupe by from/to
    arr = arr.filter(function (f) {
      return !(f.from === obj.from && f.to === obj.to);
    });
    arr.unshift(obj);
    localStorage.setItem(FAV_KEY, JSON.stringify(arr.slice(0, 20)));
  }
  function clearFavorites() {
    localStorage.removeItem(FAV_KEY);
  }
  function renderFavoritesHost(host, fromEl, toEl, update) {
    if (!host) return;
    var favs = getFavorites();
    if (!favs.length) {
      host.innerHTML = '<div class="text-muted small">No favorites yet. Save a route below.</div>';
      return;
    }
    host.innerHTML = favs
      .map(function (f) {
        var label = f.label || (f.fromName && f.toName ? f.fromName + ' → ' + f.toName : f.from + ' → ' + f.to);
        return '<button type="button" class="btn btn-sm btn-outline-primary mp-route-fav" data-from="' + f.from + '" data-to="' + f.to + '">' + label + '</button>';
      })
      .join(" ");
    host.querySelectorAll(".mp-route-fav").forEach(function (b) {
      b.addEventListener("click", function () {
        var a = b.getAttribute("data-from");
        var c = b.getAttribute("data-to");
        if (fromEl) fromEl.value = a;
        if (toEl) toEl.value = c;
        update();
      });
    });
  }

  function scheduleTripInsight(container, result, fare, names) {
    if (!container || !window.MetroProAI || !result || !names.length) return;
    var seq = ++insightRequestSeq;
    var body = container.querySelector("#mp-route-ai-body");
    var hint = container.querySelector("#mp-route-ai-hint");
    if (!body) return;
    body.classList.remove("text-danger");
    body.style.whiteSpace = "pre-wrap";
    body.textContent = "Updating trip insights for your selection…";
    if (hint) {
      hint.textContent = "Local tips from your trip + Bengaluru weather when available.";
    }

    var payload = {
      from: names[0],
      to: names[names.length - 1],
      pathNames: names,
      distanceKm: result.distanceKm,
      fare: fare,
    };

    var weatherP =
      window.MetroProDynamic && MetroProDynamic.ensureWeather
        ? MetroProDynamic.ensureWeather().catch(function () {
            return null;
          })
        : Promise.resolve(null);

    weatherP
      .then(function () {
        return MetroProAI.fetchTripInsight(payload);
      })
      .then(function (text) {
        if (seq !== insightRequestSeq) return;
        body.textContent = text || "—";
      })
      .catch(function () {
        if (seq !== insightRequestSeq) return;
        body.textContent = MetroProAI.instantLocalInsight(payload);
      });
  }

  function renderResult(container, result, fare) {
    if (!container) return;
    if (!result) {
      insightRequestSeq++;
      container.innerHTML =
        '<p class="text-muted mb-0">Select origin and destination to see route and fare estimate.</p>';
      return;
    }
    var names = result.stations
      .filter(Boolean)
      .map(function (s) {
        return s.name;
      });
    var pathHtml = result.stations
      .filter(Boolean)
      .map(function (s) {
        var label = s.name;
        var isInterchange = (MetroProData.stationLineTokens(s) || []).length > 1;
        var content = 'Line: ' + (s.line || '—') + '. ' + (isInterchange ? 'Interchange station.' : 'Single-line station.');
        content += ' Approx next-train ' + (Math.floor(Math.random() * 8) + 1) + ' min.';
        return (
          '<span class="mp-station-tag" tabindex="0" role="button" data-bs-toggle="popover" data-bs-content="' +
          content +
          '" data-bs-placement="top" data-bs-trigger="focus">' +
          label +
          '</span>'
        );
      })
      .join(' <span class="text-muted">→</span> ');
    var eta = MetroProData.estimateTripMinutes(result.distanceKm);
    var fd = MetroProData.fareDetailsFromDistance(result.distanceKm);
    var stationCount = result.stations.filter(Boolean).length;
    container.innerHTML =
      '<div class="mb-3">' +
      pathHtml +
      "</div>" +
      '<p class="mb-1"><strong>Distance:</strong> ' +
      result.distanceKm +
      " km · <strong>Stations:</strong> " +
      stationCount +
      "</p>" +
      '<p class="mb-1 small text-muted">Typical in-vehicle time: ~<strong>' +
      eta +
      "</strong> min <span class=\"text-muted\">(simulated)</span></p>" +
      '<p class="mb-1"><strong>BMRCL slab</strong> <span class="text-muted small">(' +
      fd.slabLabel +
      ")</span></p>" +
      '<p class="mb-1">Smart card: <span class="text-success fw-bold fs-5">₹' +
      fd.smart +
      '</span> <span class="text-muted small">· Token ₹' +
      fd.token +
      "</span></p>" +
      '<p class="mb-3 small text-muted">Indicative Namma Metro fares (5% smart-card discount). Confirm on bmrc.co.in.</p>' +
      '<div class="d-flex gap-2 mb-3">' +
      '<button type="button" class="btn btn-sm mp-btn-primary" id="mp-log-route-journey">Log journey</button>' +
      '<button type="button" class="btn btn-sm btn-outline-secondary" id="mp-share-route">Share</button>' +
      '</div>' +
      '<div class="mt-4 pt-3 border-top" style="border-color: var(--color-border) !important">' +
      '<h3 class="h6 mb-2 d-flex align-items-center gap-2"><i data-lucide="sparkles" class="icon-sm text-primary"></i> Trip insights</h3>' +
      '<p class="small text-muted mb-2" id="mp-route-ai-hint"></p>' +
      '<div id="mp-route-ai-body" class="small text-body mp-route-ai-body" style="white-space: pre-wrap"></div>' +
      "</div>";
    var btn = document.getElementById("mp-log-route-journey");
    if (btn) {
      btn.addEventListener("click", function () {
        var from = names[0];
        var to = names[names.length - 1];
        MetroProJourney.logJourney({
          from: from,
          to: to,
          distanceKm: result.distanceKm,
          fare: fare,
        });
        btn.disabled = true;
        btn.textContent = "Saved";
        if (window.MetroProToast) {
          MetroProToast.show("Trip logged — check Journey History & Smart Card.", "success");
        }
      });
    }
    var shareBtn = document.getElementById("mp-share-route");
    if (shareBtn) {
      shareBtn.addEventListener("click", function () {
        try {
          var a = result && result.path && result.path[0];
          var b = result && result.path && result.path[result.path.length - 1];
          if (!a || !b) {
            if (window.MetroProToast) MetroProToast.show("Pick origin and destination first.", "neutral");
            return;
          }
          var base = location.href.split("#")[0].replace(/[^/]*$/, "route-finder.html");
          var url = base + "#route=" + encodeURIComponent(a) + "," + encodeURIComponent(b);
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url);
          } else {
            prompt("Copy this link", url);
          }
          if (window.MetroProToast) MetroProToast.show("Share link copied to clipboard.", "neutral");
        } catch (e) {
          try {
            var a = result && result.path && result.path[0];
            var b = result && result.path && result.path[result.path.length - 1];
            var fallback = location.href.split("#")[0].replace(/[^/]*$/, "route-finder.html") + "#route=" + encodeURIComponent(a) + "," + encodeURIComponent(b);
            prompt('Copy this link', fallback);
          } catch (ee) {}
        }
      });
    }
    if (window.lucide && lucide.createIcons) lucide.createIcons();
    // initialize Bootstrap popovers for station tags
    try {
      var popEls = container.querySelectorAll('.mp-station-tag[data-bs-toggle="popover"]');
      popEls.forEach(function (el) {
        try {
          if (el._bsPopover) return;
          var pop = new bootstrap.Popover(el, { html: false });
          el._bsPopover = pop;
        } catch (e) {}
      });
    } catch (e) {}
    scheduleTripInsight(container, result, fare, names);
  }

  function init() {
    var from = document.getElementById("mp-route-from");
    var to = document.getElementById("mp-route-to");
    var swap = document.getElementById("mp-route-swap");
    var out = document.getElementById("mp-route-result");
    var popularHost = document.getElementById("mp-popular-routes");
    var favHost = document.getElementById("mp-popular-routes");
    var saveFav = document.getElementById("mp-save-favorite");
    var clearFavBtn = document.getElementById("mp-clear-favorites");
    var stations = MetroProData.STATIONS;

    populateSelect(from, stations, "Origin");
    populateSelect(to, stations, "Destination");

    function update() {
      var a = from && from.value;
      var b = to && to.value;
      if (!a || !b) {
        renderResult(out, null, 0);
        return;
      }
      var result = MetroProData.findPath(a, b);
      var fare = result ? MetroProData.computeFare(result.distanceKm) : 0;
      renderResult(out, result, fare);
      // refresh favorites UI (so labels with station names are current)
      try {
        renderFavoritesHost(document.getElementById("mp-popular-routes"), from, to, update);
      } catch (e) {}
    }

    renderPopular(popularHost, from, to, update);
    // initial favorites render (uses same host as popular for compactness)
    renderFavoritesHost(popularHost, from, to, update);

    if (saveFav) {
      saveFav.addEventListener("click", function () {
        if (!from.value || !to.value) {
          if (window.MetroProToast) MetroProToast.show("Pick origin and destination first.", "neutral");
          return;
        }
        var fromName = (MetroProData.findPath(from.value, from.value) || {}).stations;
        var toName = (MetroProData.findPath(to.value, to.value) || {}).stations;
        var label = prompt("Label for favorite (optional)", "" ) || "";
        saveFavoriteObj({ from: from.value, to: to.value, label: label, fromName: (from.options[from.selectedIndex] && from.options[from.selectedIndex].text) || "", toName: (to.options[to.selectedIndex] && to.options[to.selectedIndex].text) || "" });
        if (window.MetroProToast) MetroProToast.show("Route saved to favorites.", "success");
        renderFavoritesHost(popularHost, from, to, update);
      });
    }
    if (clearFavBtn) {
      clearFavBtn.addEventListener("click", function () {
        if (!confirm("Clear all favorite routes?")) return;
        clearFavorites();
        renderFavoritesHost(popularHost, from, to, update);
        if (window.MetroProToast) MetroProToast.show("Favorites cleared.", "neutral");
      });
    }

    // support route fragments like #route=fromId,toId
    if (location && location.hash) {
      try {
        var m = location.hash.match(/#route=([^,]+),(.+)$/);
        if (m) {
          var f = decodeURIComponent(m[1]);
          var t = decodeURIComponent(m[2]);
          if (from) from.value = f;
          if (to) to.value = t;
          setTimeout(update, 50);
        }
      } catch (e) {}
    }

    if (from) from.addEventListener("change", update);
    if (to) to.addEventListener("change", update);
    if (swap) {
      swap.addEventListener("click", function () {
        var x = from.value;
        from.value = to.value;
        to.value = x;
        update();
      });
    }
    update();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
