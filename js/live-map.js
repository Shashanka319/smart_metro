(function () {
  var VB_W = 760;
  var VB_H = 520;
  var LINE_COLORS = { Purple: "#6F2DA8", Green: "#00A650", Yellow: "#D4A017" };
  var activeLine = "all";
  var statusById = {};
  var refreshTimer = null;

  function layAlong(rows, p0, p1) {
    var out = {};
    var n = rows.length;
    if (n < 1) return out;
    for (var i = 0; i < n; i++) {
      var id = rows[i][0];
      var t = n === 1 ? 0.5 : i / (n - 1);
      out[id] = [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t];
    }
    return out;
  }

  function buildCoords() {
    var D = window.MetroProData;
    if (!D || !D.LINES) return {};
    var coords = {};
    function merge(map) {
      Object.keys(map).forEach(function (id) {
        if (!coords[id]) coords[id] = map[id];
      });
    }
    merge(layAlong(D.LINES.purple, [48, 268], [712, 108]));
    merge(layAlong(D.LINES.green, [358, 36], [358, 488]));
    merge(layAlong(D.LINES.yellow, [368, 402], [708, 468]));
    return coords;
  }

  function polylinePoints(lineRows, coords) {
    var pts = [];
    for (var i = 0; i < lineRows.length; i++) {
      var c = coords[lineRows[i][0]];
      if (c) pts.push(c[0].toFixed(1) + "," + c[1].toFixed(1));
    }
    return pts.join(" ");
  }

  function refreshStatusCache() {
    if (!window.MetroProDynamic || !window.MetroProData) return;
    var w = MetroProDynamic.getCachedWeather();
    var rows = MetroProDynamic.buildLiveRows(MetroProData.STATIONS, w);
    statusById = {};
    rows.forEach(function (r) {
      if (r.station && r.station.id) statusById[r.station.id] = r;
    });
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;");
  }

  function showStationPanel(st) {
    var panel = document.getElementById("mp-map-station-panel");
    if (!panel || !st) return;
    var row = statusById[st.id];
    var lines = MetroProData.stationLineTokens(st).join(", ") || st.line;
    panel.classList.remove("d-none");
    panel.innerHTML =
      "<h3 class=\"h6 mb-2\">" +
      esc(st.name) +
      "</h3>" +
      '<p class="small text-muted mb-1">Code: <strong>' +
      esc(st.code || "—") +
      "</strong> · Lines: " +
      esc(lines) +
      "</p>" +
      (row
        ? '<p class="small mb-1">Next train: <strong>' +
          row.nextTrainMin +
          " min</strong> · Crowd: " +
          esc(row.crowd) +
          "</p><p class=\"small mb-0 " +
          (row.status.indexOf("delay") >= 0 ? "text-warning" : "text-success") +
          '">' +
          esc(row.status) +
          "</p>"
        : '<p class="small text-muted mb-0">Live status loading…</p>') +
      '<a class="btn btn-sm btn-outline-primary mt-3" href="route-finder.html">Plan trip from here</a>';
  }

  function buildSvg(coords) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 " + VB_W + " " + VB_H);
    svg.setAttribute("class", "mp-map-svg w-100");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Namma Metro schematic with Purple, Green, and Yellow lines");

    var D = MetroProData;
    var lineDefs = [
      { key: "Purple", rows: D.LINES.purple },
      { key: "Green", rows: D.LINES.green },
      { key: "Yellow", rows: D.LINES.yellow },
    ];

    lineDefs.forEach(function (ld) {
      var pl = document.createElementNS(ns, "polyline");
      pl.setAttribute("data-line", ld.key);
      pl.setAttribute("fill", "none");
      pl.setAttribute("stroke", LINE_COLORS[ld.key]);
      pl.setAttribute("stroke-width", "6");
      pl.setAttribute("stroke-linecap", "round");
      pl.setAttribute("stroke-linejoin", "round");
      pl.setAttribute("opacity", activeLine === "all" || activeLine === ld.key ? "0.55" : "0.12");
      pl.setAttribute("points", polylinePoints(ld.rows, coords));
      svg.appendChild(pl);
    });

    D.STATIONS.forEach(function (st) {
      var c = coords[st.id];
      if (!c) return;
      var tok = MetroProData.stationLineTokens(st);
      var primary = tok[0] || "Purple";
      if (activeLine !== "all" && tok.indexOf(activeLine) < 0) return;

      var g = document.createElementNS(ns, "g");
      g.setAttribute("class", "mp-map-stop");
      g.style.cursor = "pointer";
      g.setAttribute("data-station-id", st.id);

      var hit = document.createElementNS(ns, "circle");
      hit.setAttribute("cx", c[0]);
      hit.setAttribute("cy", c[1]);
      hit.setAttribute("r", "12");
      hit.setAttribute("fill", "transparent");

      var dot = document.createElementNS(ns, "circle");
      dot.setAttribute("cx", c[0]);
      dot.setAttribute("cy", c[1]);
      dot.setAttribute("r", tok.length > 1 ? "7" : "5");
      dot.setAttribute("fill", "var(--color-surface)");
      dot.setAttribute("stroke", LINE_COLORS[primary] || "#64748b");
      dot.setAttribute("stroke-width", tok.length > 1 ? "3" : "2");

      var title = document.createElementNS(ns, "title");
      title.textContent = st.name + " (" + (st.code || "") + ")";

      g.appendChild(hit);
      g.appendChild(dot);
      g.appendChild(title);
      g.addEventListener("click", function () {
        showStationPanel(st);
      });
      svg.appendChild(g);
    });

    lineDefs.forEach(function (ld, idx) {
      if (activeLine !== "all" && activeLine !== ld.key) return;
      var rows = ld.rows;
      if (rows.length < 2) return;
      var mid = rows[Math.floor(rows.length / 2)];
      var c = coords[mid[0]];
      if (!c) return;
      var train = document.createElementNS(ns, "circle");
      train.setAttribute("r", "8");
      train.setAttribute("fill", LINE_COLORS[ld.key]);
      train.setAttribute("stroke", "#0f172a");
      train.setAttribute("stroke-width", "2");
      train.setAttribute("class", "mp-train-dot");
      train.setAttribute("data-train-line", ld.key);
      train.setAttribute("data-train-phase", String(idx * 0.33));
      svg.appendChild(train);
    });

    return svg;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function animateTrains(svg, coords) {
    var D = MetroProData;
    var trains = svg.querySelectorAll("[data-train-line]");
    var paths = {};
    ["Purple", "Green", "Yellow"].forEach(function (name) {
      var rows = D.LINES[name.toLowerCase()];
      if (!rows) return;
      paths[name] = [];
      for (var i = 0; i < rows.length; i++) {
        var c = coords[rows[i][0]];
        if (c) paths[name].push(c);
      }
    });

    function frame(now) {
      trains.forEach(function (train) {
        var line = train.getAttribute("data-train-line");
        var path = paths[line];
        if (!path || path.length < 2) return;
        var phase = parseFloat(train.getAttribute("data-train-phase") || "0");
        var totalMs = line === "Purple" ? 36000 : line === "Green" ? 32000 : 28000;
        var t = ((now / totalMs + phase) % 1);
        var segFloat = t * (path.length - 1);
        var i = Math.floor(segFloat);
        var local = segFloat - i;
        var p0 = path[i];
        var p1 = path[i + 1] || path[i];
        train.setAttribute("cx", lerp(p0[0], p1[0], local));
        train.setAttribute("cy", lerp(p0[1], p1[1], local));
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function renderMap() {
    var host = document.getElementById("mp-live-map-host");
    if (!host || !window.MetroProData) return;
    var coords = buildCoords();
    host.innerHTML = "";
    var svg = buildSvg(coords);
    host.appendChild(svg);
    animateTrains(svg, coords);
  }

  function syncLineButtons() {
    document.querySelectorAll("[data-mp-map-line]").forEach(function (btn) {
      var v = btn.getAttribute("data-mp-map-line");
      var on = v === activeLine;
      btn.classList.toggle("btn-primary", on);
      btn.classList.toggle("btn-outline-secondary", !on);
    });
  }

  function initFilters() {
    var wrap = document.getElementById("mp-map-line-filters");
    if (!wrap || wrap.getAttribute("data-init") === "1") return;
    wrap.setAttribute("data-init", "1");
    wrap.querySelectorAll("[data-mp-map-line]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeLine = btn.getAttribute("data-mp-map-line") || "all";
        syncLineButtons();
        renderMap();
      });
    });
    syncLineButtons();
  }

  function tickLive() {
    var p =
      window.MetroProDynamic && MetroProDynamic.ensureWeather
        ? MetroProDynamic.ensureWeather().catch(function () {
            return null;
          })
        : Promise.resolve(null);
    p.finally(function () {
      refreshStatusCache();
      var stamp = document.getElementById("mp-map-updated");
      if (stamp) stamp.textContent = "Status sync " + new Date().toLocaleTimeString();
    });
  }

  function init() {
    initFilters();
    renderMap();
    tickLive();
    refreshTimer = setInterval(function () {
      tickLive();
    }, 12000);
    window.addEventListener("resize", function () {
      /* SVG scales via CSS */
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
