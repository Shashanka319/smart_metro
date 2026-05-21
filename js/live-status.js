(function () {
  var lineFilter = "all";
  var lastLiveRows = null;

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function linePillsHtml(station) {
    var tok = MetroProData.stationLineTokens(station);
    if (!tok.length) return '<span class="text-muted small">Line —</span>';
    return tok
      .map(function (name) {
        var meta = MetroProData.LINE_STYLE[name];
        var hex = (meta && meta.hex) || "#64748b";
        var lineClass = "mp-line-pill--" + name.toLowerCase();
        return (
          '<span class="mp-line-pill mp-line-pill--image ' +
          lineClass +
          '" style="--mp-line:' +
          hex +
          '"><span>' +
          esc(name) +
          "</span></span>"
        );
      })
      .join(" ");
  }

  function sectionHeadingHtml(key) {
    if (key === "Interchange") {
      return (
        '<span class="d-inline-flex align-items-center gap-2">' +
        '<span class="rounded-circle" style="width:10px;height:10px;background:linear-gradient(90deg,#6F2DA8,#00A650,#D4A017)"></span>' +
        "Interchange hubs</span>"
      );
    }
    var meta = MetroProData.LINE_STYLE[key];
    var hex = (meta && meta.hex) || "#64748b";
    var label = (meta && meta.label) || key;
    return (
      '<span class="d-inline-flex align-items-center gap-2">' +
      '<span class="rounded-circle" style="width:10px;height:10px;background:' +
      hex +
      '"></span>' +
      esc(label) +
      "</span>"
    );
  }

  function sectionOrder() {
    return ["Interchange"].concat(MetroProData.LINE_ORDER);
  }

  function rowMatchesLineFilter(r, filter) {
    if (filter === "all") return true;
    if (filter === "Interchange") return MetroProData.stationLineTokens(r.station).length > 1;
    var tok = MetroProData.stationLineTokens(r.station);
    return tok.indexOf(filter) >= 0;
  }

  function cardHtml(r) {
    var statusClass = "text-success";
    if (r.status.indexOf("delay") >= 0) statusClass = "text-warning";
    return (
      '<div class="col-md-6 col-lg-4">' +
      '<div class="mp-card h-100 mp-card--lift">' +
      '<div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">' +
      '<h3 class="h6 mb-0">' +
      esc(r.station.name) +
      "</h3>" +
      '<div class="d-flex flex-wrap gap-1 justify-content-end">' +
      linePillsHtml(r.station) +
      "</div></div>" +
      '<p class="mb-1 small text-muted">BMRCL code: <strong class="text-body">' +
      esc(r.station.code || "—") +
      "</strong></p>" +
      '<p class="mb-1 small text-muted">Next train: <strong>' +
      r.nextTrainMin +
      " min</strong></p>" +
      '<p class="mb-1 small">Crowd: <span class="fw-medium">' +
      esc(r.crowd) +
      "</span></p>" +
      '<p class="mb-0 small ' +
      statusClass +
      '">' +
      esc(r.status) +
      "</p></div></div>"
    );
  }

  function paintGrid(host, rows) {
    var sections = sectionOrder();
    if (lineFilter === "all") {
      var parts = [];
      for (var s = 0; s < sections.length; s++) {
        var sec = sections[s];
        var secRows = rows.filter(function (r) {
          return MetroProData.stationPrimarySection(r.station) === sec;
        });
        if (!secRows.length) continue;
        parts.push(
          '<div class="mb-4 mp-live-status-section" data-section="' +
            esc(sec) +
            '">' +
            '<h2 class="h5 mb-3">' +
            sectionHeadingHtml(sec) +
            '<span class="text-muted fw-normal small ms-2">(' +
            secRows.length +
            ")</span></h2>" +
            '<div class="row g-3">' +
            secRows.map(cardHtml).join("") +
            "</div></div>"
        );
      }
      host.innerHTML = parts.join("");
      return;
    }

    var filtered = rows.filter(function (r) {
      return rowMatchesLineFilter(r, lineFilter);
    });
    host.innerHTML =
      '<div class="row g-3">' +
      (filtered.length ? filtered.map(cardHtml).join("") : '<p class="text-muted col-12">No stations for this filter.</p>') +
      "</div>";
  }

  function syncFilterButtons() {
    document.querySelectorAll("[data-mp-line-filter]").forEach(function (btn) {
      var v = btn.getAttribute("data-mp-line-filter");
      var active = v === lineFilter;
      btn.classList.toggle("btn-primary", active);
      btn.classList.toggle("btn-outline-secondary", !active);
    });
  }

  function initLineFilters() {
    var wrap = document.getElementById("mp-live-line-filters");
    if (!wrap || wrap.getAttribute("data-mp-filters-init") === "1") return;
    wrap.setAttribute("data-mp-filters-init", "1");
    wrap.querySelectorAll("[data-mp-line-filter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        lineFilter = btn.getAttribute("data-mp-line-filter") || "all";
        syncFilterButtons();
        render();
      });
    });
    syncFilterButtons();
  }

  function scheduleNetworkPulse(rows, opts) {
    opts = opts || {};
    var host = document.getElementById("mp-live-ai-pulse");
    if (!host || !window.MetroProAI || !window.MetroProDynamic || !rows) return;
    host.classList.remove("d-none");
    lastLiveRows = rows;
    var net = MetroProDynamic.summarizeNetwork(rows);
    var w = MetroProDynamic.getCachedWeather();
    var weatherLine = w ? MetroProDynamic.formatWeatherLine(w) : "";
    var payload = {
      health: net.health,
      delayPct: net.delayPct,
      busyPct: net.busyPct,
      stationCount: rows.length,
      weatherLine: weatherLine,
    };
    var prose = document.getElementById("mp-live-ai-prose");
    var hint = document.getElementById("mp-live-ai-hint");
    if (hint) {
      hint.textContent = "Local summary from the latest grid + Open-Meteo.";
    }
    if (prose) prose.textContent = MetroProAI.networkPulseLocalText(payload);
    return;
  }

  function initLiveAiRegen() {
    var btn = document.getElementById("mp-live-ai-regen");
    if (!btn || btn.getAttribute("data-mp-init") === "1") return;
    btn.setAttribute("data-mp-init", "1");
    btn.addEventListener("click", function () {
      if (lastLiveRows) scheduleNetworkPulse(lastLiveRows, { forceRemote: true });
    });
  }

  function render() {
    var host = document.getElementById("mp-live-status-grid");
    if (!host) return;
    initLineFilters();

    var banner = document.getElementById("mp-live-context-banner");
    if (banner && window.MetroProDynamic) {
      banner.classList.remove("d-none");
      var w = MetroProDynamic.getCachedWeather();
      var err = MetroProDynamic.getWeatherError();
      banner.innerHTML =
        '<div class="d-flex flex-wrap align-items-center justify-content-between gap-2">' +
        '<span class="small fw-medium" id="mp-live-banner-line">' +
        (w
          ? MetroProDynamic.formatWeatherLine(w)
          : err
            ? "Weather offline — " + err
            : "Fetching Bengaluru weather…") +
        "</span>" +
        '<span class="badge rounded-pill text-bg-secondary small">Open-Meteo</span></div>';
    }

    var p = window.MetroProDynamic && MetroProDynamic.ensureWeather ? MetroProDynamic.ensureWeather() : Promise.resolve(null);
    p.then(function (w) {
      var rows = window.MetroProDynamic && MetroProDynamic.buildLiveRows
        ? MetroProDynamic.buildLiveRows(MetroProData.STATIONS, w || MetroProDynamic.getCachedWeather())
        : MetroProData.liveStatusSnapshot();
      paintGrid(host, rows);
      scheduleNetworkPulse(rows);
      if (banner && window.MetroProDynamic) {
        var lineEl = document.getElementById("mp-live-banner-line");
        var cw = MetroProDynamic.getCachedWeather();
        if (lineEl) {
          lineEl.textContent = cw
            ? MetroProDynamic.formatWeatherLine(cw)
            : MetroProDynamic.getWeatherError()
              ? "Weather offline — " + MetroProDynamic.getWeatherError()
              : "Weather unavailable";
        }
      }
      var stamp = document.getElementById("mp-status-updated");
      if (stamp) {
        stamp.textContent = "Snapshot updated " + new Date().toLocaleTimeString();
      }
      if (window.lucide && lucide.createIcons) lucide.createIcons();
    }).catch(function () {
      var rows = MetroProData.liveStatusSnapshot();
      paintGrid(host, rows);
      scheduleNetworkPulse(rows);
      var stamp = document.getElementById("mp-status-updated");
      if (stamp) stamp.textContent = "Snapshot updated " + new Date().toLocaleTimeString();
      if (window.lucide && lucide.createIcons) lucide.createIcons();
    });
  }

  function init() {
    initLiveAiRegen();
    render();
    setInterval(render, 8000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
