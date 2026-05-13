(function () {
  function init() {
    var from = document.getElementById("mp-fare-from");
    var to = document.getElementById("mp-fare-to");
    var out = document.getElementById("mp-fare-result");

    function fill(select) {
      if (!select) return;
      select.innerHTML = '<option value="">Choose station</option>';
      MetroProData.STATIONS.forEach(function (s) {
        var o = document.createElement("option");
        o.value = s.id;
        o.textContent = s.name + (s.code ? " (" + s.code + ")" : "");
        select.appendChild(o);
      });
    }

    fill(from);
    fill(to);

    function calc() {
      if (!out) return;
      var a = from && from.value;
      var b = to && to.value;
      if (!a || !b) {
        out.innerHTML = '<p class="text-muted mb-0">Pick two stations for an instant fare quote.</p>';
        return;
      }
      var path = MetroProData.findPath(a, b);
      if (!path) {
        out.innerHTML = "<p>No path found.</p>";
        return;
      }
      var fare = MetroProData.computeFare(path.distanceKm);
      var eta = MetroProData.estimateTripMinutes(path.distanceKm);
      out.innerHTML =
        '<div class="display-6 fw-bold text-primary mb-2">₹' +
        fare +
        "</div>" +
        "<p class=\"mb-1\">Distance: <strong>" +
        path.distanceKm +
        " km</strong></p>" +
        '<p class="mb-1 small text-muted">Typical in-vehicle time: ~<strong>' +
        eta +
        "</strong> min <span class=\"text-muted\">(simulated)</span></p>" +
        "<p class=\"text-muted small mb-3\">Base ₹" +
        MetroProData.FARE_BASE +
        " + ₹" +
        MetroProData.FARE_PER_KM +
        "/km</p>" +
        '<button type="button" class="btn mp-btn-primary" id="mp-log-fare-journey">Add to journey history</button>';
      var btn = document.getElementById("mp-log-fare-journey");
      if (btn) {
        btn.addEventListener("click", function () {
          var s1 = path.stations[0];
          var s2 = path.stations[path.stations.length - 1];
          MetroProJourney.logJourney({
            from: s1 ? s1.name : "",
            to: s2 ? s2.name : "",
            distanceKm: path.distanceKm,
            fare: fare,
          });
          btn.disabled = true;
          btn.textContent = "Logged";
          if (window.MetroProToast) {
            MetroProToast.show("Fare trip saved — wallet debited in Smart Card.", "success");
          }
        });
      }
    }

    if (from) from.addEventListener("change", calc);
    if (to) to.addEventListener("change", calc);
    calc();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
