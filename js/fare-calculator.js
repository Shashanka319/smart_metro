(function () {
  var fareInsightSeq = 0;

  function scheduleFareInsight(container, path, fare) {
    if (!container || !window.MetroProAI || !path || !path.stations || !path.stations.length) return;
    var seq = ++fareInsightSeq;
    var names = path.stations
      .filter(Boolean)
      .map(function (s) {
        return s.name;
      });
    var body = container.querySelector("#mp-fare-ai-body");
    var hint = container.querySelector("#mp-fare-ai-hint");
    if (!body) return;
    body.style.whiteSpace = "pre-wrap";
    body.textContent = "Updating fare insights…";
    if (hint) {
      var base = "Local fare notes + Bengaluru weather when available.";
      var hr = new Date().getHours();
      var peak = (hr >= 7 && hr < 10) || (hr >= 17 && hr < 20);
      var peakNote = peak ? " Peak hours expected — expect higher crowding." : "";
      hint.textContent = base + peakNote;
    }

    var payload = {
      from: names[0],
      to: names[names.length - 1],
      pathNames: names,
      distanceKm: path.distanceKm,
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
        return MetroProAI.fetchFareInsight(payload);
      })
      .then(function (text) {
        if (seq !== fareInsightSeq) return;
        body.textContent = text || "—";
      })
      .catch(function () {
        if (seq !== fareInsightSeq) return;
        body.textContent = MetroProAI.instantLocalInsight(payload);
      });
  }

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
      fareInsightSeq++;
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
      var fd = MetroProData.fareDetailsFromDistance(path.distanceKm);
      var eta = MetroProData.estimateTripMinutes(path.distanceKm);
      var stops = path.stations.filter(Boolean).length;
      out.innerHTML =
        '<div class="display-6 fw-bold text-primary mb-1">₹' +
        fd.smart +
        "</div>" +
        '<p class="small text-muted mb-2">Smart card fare · Token ₹' +
        fd.token +
        " · Slab " +
        fd.slabLabel +
        "</p>" +
        "<p class=\"mb-1\">Distance: <strong>" +
        path.distanceKm +
        " km</strong> · Stations: <strong>" +
        stops +
        "</strong></p>" +
        '<p class="mb-1 small text-muted">Typical in-vehicle time: ~<strong>' +
        eta +
        "</strong> min <span class=\"text-muted\">(simulated)</span></p>" +
        '<p class="text-muted small mb-3">BMRCL-style distance slabs (indicative). Verify latest fares on <a href="https://english.bmrc.co.in/tickets/" target="_blank" rel="noopener">bmrc.co.in</a>.</p>' +
        '<button type="button" class="btn mp-btn-primary mb-3" id="mp-log-fare-journey">Add to journey history</button>' +
        '<div class="pt-3 border-top" style="border-color: var(--color-border) !important">' +
        '<h3 class="h6 mb-2 d-flex align-items-center gap-2"><i data-lucide="sparkles" class="icon-sm text-primary"></i> Fare & travel notes</h3>' +
        '<p class="small text-muted mb-2" id="mp-fare-ai-hint"></p>' +
        '<div id="mp-fare-ai-body" class="small text-body"></div></div>';
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
      if (window.lucide && lucide.createIcons) lucide.createIcons();
      scheduleFareInsight(out, path, fare);
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
