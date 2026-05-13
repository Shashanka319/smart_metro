(function () {
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

  function renderResult(container, result, fare) {
    if (!container) return;
    if (!result) {
      container.innerHTML =
        '<p class="text-muted mb-0">Select origin and destination to see route and fare estimate.</p>';
      return;
    }
    var names = result.stations
      .filter(Boolean)
      .map(function (s) {
        return s.name;
      });
    var pathHtml = names
      .map(function (n) {
        return '<span class="mp-station-tag">' + n + "</span>";
      })
      .join(' <span class="text-muted">→</span> ');
    var eta = MetroProData.estimateTripMinutes(result.distanceKm);
    container.innerHTML =
      '<div class="mb-3">' +
      pathHtml +
      "</div>" +
      '<p class="mb-1"><strong>Distance:</strong> ' +
      result.distanceKm +
      " km</p>" +
      '<p class="mb-1 small text-muted">Typical in-vehicle time: ~<strong>' +
      eta +
      "</strong> min <span class=\"text-muted\">(simulated)</span></p>" +
      '<p class="mb-3"><strong>Estimated fare:</strong> <span class="text-success fw-bold">₹' +
      fare +
      "</span></p>" +
      '<button type="button" class="btn btn-sm mp-btn-primary" id="mp-log-route-journey">Log journey</button>';
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
  }

  function init() {
    var from = document.getElementById("mp-route-from");
    var to = document.getElementById("mp-route-to");
    var swap = document.getElementById("mp-route-swap");
    var out = document.getElementById("mp-route-result");
    var popularHost = document.getElementById("mp-popular-routes");
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
    }

    renderPopular(popularHost, from, to, update);

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
