(function () {
  var WELCOME_KEY = "metropro_welcome_dismissed";

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function initWelcome() {
    var banner = document.getElementById("mp-welcome-banner");
    if (!banner) return;
    if (localStorage.getItem(WELCOME_KEY) === "1") {
      banner.classList.add("d-none");
      return;
    }
    banner.classList.remove("d-none");
    var btn = document.getElementById("mp-welcome-dismiss");
    if (btn) {
      btn.addEventListener("click", function () {
        localStorage.setItem(WELCOME_KEY, "1");
        banner.classList.add("d-none");
      });
    }
  }

  function initStats() {
    if (!document.getElementById("mp-dash-stats")) return;
    var s = MetroProJourney.getJourneyStats();
    var bal = MetroProJourney.getWalletBalance();
    setText("mp-stat-trips", String(s.tripCount));
    setText("mp-stat-km", s.totalKm > 0 ? s.totalKm + " km" : "—");
    setText("mp-stat-spent", s.totalFare > 0 ? "₹" + s.totalFare : "—");
    setText("mp-stat-wallet", "₹" + bal);
    var lastEl = document.getElementById("mp-stat-last");
    if (lastEl) {
      if (s.lastTrip) {
        lastEl.textContent = "Last: " + (s.lastTrip.from || "") + " → " + (s.lastTrip.to || "");
      } else {
        lastEl.textContent = "Log a trip from Route Finder or Fare Calculator.";
      }
    }
  }

  function refreshLiveStrip() {
    var strip = document.getElementById("mp-dash-live-strip");
    if (!strip || !window.MetroProDynamic) return;
    strip.innerHTML =
      '<div class="mp-card py-3 px-3 mb-0"><p class="small text-muted mb-0">Loading live Bengaluru context…</p></div>';
    MetroProDynamic.ensureWeather()
      .finally(function () {
        MetroProDynamic.renderDashboardStrip(strip);
      });
  }

  function refreshAiCoach() {
    var host = document.getElementById("mp-dash-ai-coach");
    if (!host || !window.MetroProAI) return;
    host.classList.remove("d-none");
    host.innerHTML =
      '<div class="mp-card py-3 px-3 mb-0"><p class="small text-muted mb-0">Preparing your dashboard tips…</p></div>';
    var stats = MetroProJourney.getJourneyStats();
    var wallet = MetroProJourney.getWalletBalance();
    var wChain =
      window.MetroProDynamic && MetroProDynamic.ensureWeather
        ? MetroProDynamic.ensureWeather().catch(function () {
            return null;
          })
        : Promise.resolve(null);
    wChain
      .then(function () {
        return MetroProAI.fetchDashboardCoach(stats, wallet);
      })
      .then(function (text) {
        host.innerHTML =
          '<div class="mp-card py-3 px-3 mb-0">' +
          '<div class="d-flex gap-3 align-items-start">' +
          '<span class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width:44px;height:44px;background:var(--color-primary-muted)">' +
          '<i data-lucide="bot" class="text-primary"></i></span>' +
          '<div class="min-w-0 flex-grow-1">' +
          '<p class="small text-uppercase fw-bold text-muted mb-1">Smart coach</p>' +
          '<p class="small text-muted mb-2">Your trips + Open-Meteo weather.</p>' +
          '<div class="small mp-dash-ai-prose" style="white-space:pre-wrap"></div>' +
          "</div></div></div>";
        var prose = host.querySelector(".mp-dash-ai-prose");
        renderFavorites();
        if (prose) prose.textContent = text || "—";
        if (window.lucide && lucide.createIcons) lucide.createIcons();
      });
  }

  function renderFavorites() {
    var host = document.getElementById("mp-fav-routes");
    if (!host) return;
    try {
      var arr = JSON.parse(localStorage.getItem("metropro_fav_routes") || "[]");
      if (!arr || !arr.length) {
        host.innerHTML = '<div class="mp-card"><h3 class="h6 mb-2">Favorites</h3><p class="small text-muted mb-0">Save frequent routes in Route Finder to see quick-access buttons here.</p></div>';
        return;
      }
      host.innerHTML = '<div class="mp-card"><h3 class="h6 mb-2">Favorite routes</h3><div class="d-flex flex-wrap gap-2" id="mp-fav-list"></div></div>';
      var list = document.getElementById("mp-fav-list");
      arr.slice(0, 8).forEach(function (f) {
        var label = f.label || (f.fromName && f.toName ? f.fromName + ' → ' + f.toName : f.from + ' → ' + f.to);
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-sm btn-outline-primary';
        btn.textContent = label;
        btn.addEventListener('click', function () {
          // navigate to route-finder with fragment
          location.href = 'route-finder.html#route=' + encodeURIComponent(f.from) + ',' + encodeURIComponent(f.to);
        });
        list.appendChild(btn);
      });
    } catch (e) {
      host.innerHTML = '';
    }
  }

  function renderTopDestinations() {
    var host = document.getElementById("mp-top-destinations");
    if (!host) return;
    var journeys = MetroProJourney.getJourneys();
    if (!journeys.length) {
      host.innerHTML = '<div class="mp-card"><h3 class="h6 mb-2">Suggested destinations</h3><p class="small text-muted mb-0">Log trips first to get destination suggestions.</p></div>';
      return;
    }
    var counts = {};
    journeys.forEach(function (journey) {
      if (!journey.to) return;
      counts[journey.to] = (counts[journey.to] || 0) + 1;
    });
    var top = Object.keys(counts)
      .sort(function (a, b) {
        return counts[b] - counts[a];
      })
      .slice(0, 3);
    if (!top.length) {
      host.innerHTML = '<div class="mp-card"><h3 class="h6 mb-2">Suggested destinations</h3><p class="small text-muted mb-0">Add journeys to unlock personalized suggestions.</p></div>';
      return;
    }
    var lastOrigin = journeys[0] && journeys[0].from ? journeys[0].from : (MetroProData.STATIONS[0] && MetroProData.STATIONS[0].id);
    host.innerHTML = '<div class="mp-card"><h3 class="h6 mb-2">Suggested destinations</h3><div class="d-flex flex-wrap gap-2" id="mp-top-dest-list"></div></div>';
    var list = document.getElementById("mp-top-dest-list");
    top.forEach(function (stationId) {
      var station = MetroProData.STATIONS.find(function (s) {
        return s.id === stationId;
      });
      var label = station ? station.name : stationId;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-sm btn-outline-success';
      btn.textContent = 'To ' + label;
      btn.title = 'Quick route from the last origin';
      btn.addEventListener('click', function () {
        location.href = 'route-finder.html#route=' + encodeURIComponent(lastOrigin) + ',' + encodeURIComponent(stationId);
      });
      list.appendChild(btn);
    });
  }

  function init() {
    initWelcome();
    initStats();
    refreshLiveStrip();
    renderFavorites();
    renderTopDestinations();
    refreshAiCoach();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
