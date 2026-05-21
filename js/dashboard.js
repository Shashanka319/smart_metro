(function () {
  var WELCOME_KEY = "metropro_welcome_dismissed";

  function el(id) {
    return document.getElementById(id);
  }

  function initWelcome() {
    var banner = el("mp-welcome-banner");
    if (!banner) return;
    if (localStorage.getItem(WELCOME_KEY) === "1") {
      banner.classList.add("d-none");
      return;
    }
    banner.classList.remove("d-none");
    var btn = el("mp-welcome-dismiss");
    if (btn) btn.addEventListener("click", function () {
      localStorage.setItem(WELCOME_KEY, "1");
      banner.classList.add("d-none");
    });
  }

  var SELECTED_LINE_STORAGE = "metropro_selected_line";

  function getSavedLine() {
    var saved = localStorage.getItem(SELECTED_LINE_STORAGE);
    return saved || "Purple";
  }

  function saveSelectedLine(key) {
    localStorage.setItem(SELECTED_LINE_STORAGE, key);
  }

  var selectedLineKey = getSavedLine();
  var LINE_EXPERIENCE = [
    {
      key: "Purple",
      label: "Purple Line",
      hex: "#6F2DA8",
      accent: "#A78BFA",
      description: "The heart of Bengaluru connecting Majestic, Cubbon Park, and Baiyappanahalli.",
      stations: ["mahatma_gandhi_road", "cubbon_park", "nayandahalli"],
    },
    {
      key: "Green",
      label: "Green Line",
      hex: "#00A650",
      accent: "#6EE7B7",
      description: "West-north corridor that serves Yeshwanthpur and the city’s industrial belt.",
      stations: ["jalahalli", "yeshwanthpur", "nagasandra"],
    },
    {
      key: "Yellow",
      label: "Yellow Line",
      hex: "#D4A017",
      accent: "#FBBF24",
      description: "Smart link toward Whitefield, BTM Layout, and Bengaluru’s tech campuses.",
      stations: ["central_silk_board", "baiyappanahalli", "whitefield_kadugodi"],
    },
    {
      key: "Pink",
      label: "Pink Corridor",
      hex: "#E11D74",
      accent: "#F472B6",
      description: "A next-gen concept line for premium travel experiences across the city.",
      stations: ["mahatma_gandhi_road", "indiranagar", "whitefield_kadugodi"],
    },
  ];

  var TOP_STATIONS = [
    { id: "cubbon_park", title: "Cubbon Park", subtitle: "Garden gateway to central Bengaluru" },
    { id: "baiyappanahalli", title: "Baiyappanahalli", subtitle: "Tech corridor access point" },
    { id: "nadaprabhu_kempegowda_majestic", title: "Majestic", subtitle: "City’s busiest interchange hub" },
    { id: "lalbagh", title: "Lalbagh", subtitle: "Green escape near the market" },
  ];

  var LIVE_STATUS = [
    { line: "Purple", status: "Smooth", detail: "Central stations running on time" },
    { line: "Green", status: "Busy", detail: "Yeshwanthpur corridor peak flow" },
    { line: "Yellow", status: "Steady", detail: "IT stretch moving well" },
  ];

  function getLineByKey(key) {
    return LINE_EXPERIENCE.find(function (line) {
      return line.key === key;
    }) || LINE_EXPERIENCE[0];
  }

  function getStationById(id) {
    return (window.MetroProData && MetroProData.STATIONS || []).find(function (station) {
      return station.id === id;
    }) || { id: id, name: id.replace(/_/g, " "), line: "Unknown" };
  }

  function getLineRoute(line) {
    switch (line.key) {
      case "Purple":
        return { from: "mahatma_gandhi_road", to: "cubbon_park" };
      case "Green":
        return { from: "jalahalli", to: "yeshwanthpur" };
      case "Yellow":
        return { from: "central_silk_board", to: "baiyappanahalli" };
      case "Pink":
        return { from: "mahatma_gandhi_road", to: "whitefield_kadugodi" };
      default:
        return { from: "mahatma_gandhi_road", to: "baiyappanahalli" };
    }
  }

  function formatCurrency(amount) {
    return amount === 0 ? "₹0" : "₹" + amount.toFixed(0);
  }

  function buildButtonLinePicker(line) {
    var active = selectedLineKey === line.key;
    return (
      '<button type="button" class="line-pill ' + (active ? "active" : "") + '" data-line-select="' + line.key + '" style="border-color:' + line.hex + '; color:' + (active ? "#fff" : line.hex) + '; background:' + (active ? line.hex : "rgba(255,255,255,0.06)") + ';">' +
      '<span>' + line.label + '</span>' +
      '</button>'
    );
  }

  function heroHtml(line, userName) {
    var route = getLineRoute(line);
    return (
      '<div class="mp-card line-hero p-4 mb-3">' +
      '<div class="row g-3 align-items-center">' +
      '<div class="col-lg-8">' +
      '<div class="small text-uppercase fw-semibold text-muted mb-2">Namma Metro command center</div>' +
      '<h2 class="mb-3" style="color:' + line.hex + '">Discover Bengaluru on the ' + line.label + '</h2>' +
      '<p class="text-muted mb-3">' + line.description + ' Explore curated routes, station stories, and a live pulse of the network.</p>' +
      '<div class="d-flex flex-wrap gap-2 mb-3">' +
      '<a href="route-finder.html#route=' + encodeURIComponent(route.from) + ',' + encodeURIComponent(route.to) + '" class="btn btn-lg" style="background:' + line.hex + '; color:#fff;">Start journey</a>' +
      '<a href="live-status.html#' + line.key.toLowerCase() + '" class="btn btn-lg btn-outline-secondary">Line status</a>' +
      '</div>' +
      '<div class="small text-muted">Welcome back, ' + (userName || "Rider") + '. Your dashboard is now tuned to Bangalore’s metro vibe.</div>' +
      '</div>' +
      '<div class="col-lg-4 d-none d-lg-block">' +
      '<div class="line-hero-image" style="background:radial-gradient(circle at top left, rgba(255,255,255,0.45), transparent 40%), linear-gradient(135deg, ' + line.accent + ' 0%, ' + line.hex + ' 100%); height:260px; border-radius:1rem; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.12);"></div>' +
      '</div>' +
      '</div>' +
      '</div>'
    );
  }

  function renderHero() {
    var host = el("mp-dash-ai-coach");
    if (!host) return;
    var user = window.MetroProAuth && MetroProAuth.getCurrentUser ? MetroProAuth.getCurrentUser() : null;
    host.classList.remove("d-none");
    host.innerHTML = heroHtml(getLineByKey(selectedLineKey), user && user.name ? user.name : "Guest");
    if (window.lucide && lucide.createIcons) lucide.createIcons();
  }

  function renderLiveStrip() {
    var host = el("mp-dash-live-strip");
    if (!host) return;
    host.innerHTML =
      '<div class="mp-card p-3 mb-4 dash-live-strip">' +
      '<div class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">' +
      '<div>' +
      '<div class="small text-uppercase fw-semibold text-muted">Live pulse</div>' +
      '<div class="h5 mb-1">Bengaluru metro at a glance</div>' +
      '<p class="small text-muted mb-0">Fresh line status, latest destinations, and your day’s ride summary in one view.</p>' +
      '</div>' +
      '<div class="d-flex flex-wrap gap-2">' +
      LIVE_STATUS.map(function (item) {
        var line = getLineByKey(item.line);
        return (
          '<span class="dash-status-pill" style="border-color:' + line.hex + '; color:' + line.hex + '; background:' + line.hex + '15;">' +
          '<strong>' + item.line + '</strong> · ' + item.status +
          '</span>'
        );
      }).join("") +
      '</div>' +
      '</div>' +
      '</div>';
  }

  function renderTopDestinations() {
    var host = el("mp-top-destinations");
    if (!host) return;
    host.innerHTML =
      '<div class="mp-card p-4 mb-4">' +
      '<div class="d-flex align-items-center justify-content-between mb-3">' +
      '<div><h3 class="h6 mb-1">Trending Bengaluru stops</h3><p class="small text-muted mb-0">Popular destinations for your next metro ride.</p></div>' +
      '<a href="route-finder.html" class="small text-decoration-none">See more routes →</a>' +
      '</div>' +
      '<div class="row g-3">' +
      TOP_STATIONS.map(function (item) {
        var station = getStationById(item.id);
        var lineTokens = window.MetroProData && MetroProData.stationLineTokens ? MetroProData.stationLineTokens(station).join(' · ') : station.line;
        return (
          '<div class="col-md-6 col-xl-3">' +
          '<a href="route-finder.html#route=' + encodeURIComponent(item.id) + ',baiyappanahalli" class="text-decoration-none">' +
          '<div class="mp-card destination-card h-100 p-3">' +
          '<div class="d-flex align-items-center justify-content-between mb-3">' +
          '<div><h4 class="h6 mb-1">' + item.title + '</h4><p class="small text-muted mb-0">' + item.subtitle + '</p></div>' +
          '<span class="destination-badge">' + lineTokens + '</span>' +
          '</div>' +
          '<div class="small text-muted">Quick plan from your dashboard and explore this stop on the live map.</div>' +
          '</div>' +
          '</a>' +
          '</div>'
        );
      }).join('') +
      '</div>' +
      '</div>';
  }

  function renderJourneyStats() {
    if (!window.MetroProJourney) return;
    var stats = MetroProJourney.getJourneyStats();
    var wallet = MetroProJourney.getWalletBalance();
    var tripCount = el("mp-stat-trips");
    var kmCount = el("mp-stat-km");
    var spentCount = el("mp-stat-spent");
    var walletCount = el("mp-stat-wallet");
    var last = el("mp-stat-last");
    if (tripCount) tripCount.textContent = stats.tripCount;
    if (kmCount) kmCount.textContent = stats.totalKm ? stats.totalKm + " km" : "—";
    if (spentCount) spentCount.textContent = stats.totalFare ? formatCurrency(stats.totalFare) : "—";
    if (walletCount) walletCount.textContent = formatCurrency(wallet);
    if (last) {
      last.textContent = stats.lastTrip
        ? "Last logged ride: " + getStationById(stats.lastTrip.from).name + " → " + getStationById(stats.lastTrip.to).name
        : "Start your first ride from Route Finder to populate the dashboard.";
    }
  }

  function renderLineActions() {
    var host = el("mp-fav-routes");
    if (!host) return;
    var line = getLineByKey(selectedLineKey);
    var route = getLineRoute(line);
    host.innerHTML =
      '<div class="mp-card p-4 mb-4 line-action-panel" style="border-left:4px solid ' + line.hex + ';">' +
      '<div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">' +
      '<div>' +
      '<div class="small text-muted">Selected line</div>' +
      '<div class="h5 mb-1" style="color:' + line.hex + '">' + line.label + '</div>' +
      '<div class="small text-muted">Actions tailored to this line and your Bangalore commute.</div>' +
      '</div>' +
      '<div class="d-flex flex-wrap gap-2">' +
      '<a href="route-finder.html#route=' + encodeURIComponent(route.from) + ',' + encodeURIComponent(route.to) + '" class="btn btn-primary">Plan route</a>' +
      '<a href="live-status.html#' + line.key.toLowerCase() + '" class="btn btn-outline-secondary">Line status</a>' +
      '<a href="fare-calculator.html" class="btn btn-outline-success">Fare estimate</a>' +
      '</div>' +
      '</div>' +
      '</div>';
  }

  function stationCardHtml(station, line) {
    var tags = window.MetroProData && MetroProData.stationLineTokens ? MetroProData.stationLineTokens(station).join(' · ') : station.line;
    return (
      '<div class="col-lg-4 col-sm-6">' +
      '<div class="mp-card mp-line-card h-100 p-3" style="border-left:4px solid ' + line.hex + ';">' +
      '<h4 class="h6 mb-1">' + station.name + '</h4>' +
      '<p class="small text-muted mb-2">' + tags + '</p>' +
      '<div class="d-flex flex-wrap gap-2">' +
      '<a href="route-finder.html#route=' + encodeURIComponent(station.id) + ',baiyappanahalli" class="btn btn-sm btn-outline-primary">Plan from here</a>' +
      '<button type="button" class="btn btn-sm btn-outline-secondary" onclick="alert(\'Nearby highlights for ' + station.name.replace(/'/g, "\\'") + '\')">Nearby</button>' +
      '</div>' +
      '</div>' +
      '</div>'
    );
  }

  function renderLineExplorer() {
    var host = el("mp-dash-station-highlights");
    if (!host) return;
    var line = getLineByKey(selectedLineKey);
    host.innerHTML =
      '<div class="mp-card p-4 mb-4">' +
      '<div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">' +
      '<div><h3 class="h6 mb-1">Line showcase</h3><p class="small text-muted mb-0">Dive into station stories crafted for each line.</p></div>' +
      '<div class="d-flex flex-wrap gap-2">' +
      LINE_EXPERIENCE.map(buildButtonLinePicker).join("") +
      '</div>' +
      '</div>' +
      '<div class="row g-3">' +
      line.stations.map(function (stationId) {
        var station = getStationById(stationId);
        return station ? stationCardHtml(station, line) : "";
      }).join("") +
      '</div>' +
      '</div>';
    if (window.lucide && lucide.createIcons) lucide.createIcons();
    host.querySelectorAll('[data-line-select]').forEach(function (button) {
      button.addEventListener('click', function () {
        selectedLineKey = this.dataset.lineSelect;
        saveSelectedLine(selectedLineKey);
        renderAll();
      });
    });
  }

  function renderPhotoGallery() {
    var host = el("mp-dash-metro-photos");
    if (!host) return;
    var line = getLineByKey(selectedLineKey);
    var stations = line.stations.map(function (stationId) {
      return getStationById(stationId);
    }).filter(Boolean);
    host.innerHTML =
      '<div class="mp-card p-4 mb-4">' +
      '<div class="d-flex align-items-center justify-content-between mb-3">' +
      '<div><h3 class="h6 mb-1">' + line.label + ' photo story</h3><p class="small text-muted mb-0">Visual highlights from Bengaluru’s busiest metro stops.</p></div>' +
      '<span class="badge rounded-pill text-white" style="background:' + line.hex + '">' + stations.length + ' stops</span>' +
      '</div>' +
      '<div class="row g-2 photo-grid">' +
      stations.concat(stations.slice(0, 3)).slice(0, 6).map(function (station) {
        var local = 'assets/metro-photos/' + station.id + '.svg';
        var unsplash = '';
        return (
          '<div class="col-6 col-md-4">' +
          '<div class="p-2 rounded-3" style="background:' + line.hex + '10; border-left:3px solid ' + line.hex + ';">' +
          '<div class="fw-semibold">' + station.name + '</div>' +
          '<div class="small text-muted">' + (window.MetroProData && MetroProData.stationLineTokens ? MetroProData.stationLineTokens(station).join(' · ') : station.line) + '</div>' +
          '</div>' +
          '</div>'
        );
      }).join("") +
      '</div>' +
      '</div>';
  }

  function renderAll() {
    initWelcome();
    renderHero();
    renderLiveStrip();
    renderLineActions();
    renderTopDestinations();
    renderLineExplorer();
    // renderPhotoGallery(); // Removed - no images displayed
    renderJourneyStats();
  }

  function init() {
    renderAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
