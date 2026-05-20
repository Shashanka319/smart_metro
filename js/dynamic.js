/**
 * MetroPro dynamic layer: live weather (Open-Meteo, no key) + weather-aware network simulation.
 */
(function () {
  var BLR_LAT = 12.9716;
  var BLR_LON = 77.5946;
  var CACHE_MS = 10 * 60 * 1000;

  var weatherCache = { at: 0, data: null, error: null };

  function fnv1a(str) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function wmoLabel(code) {
    if (code == null) return "Weather data";
    if (code === 0) return "Clear";
    if (code <= 3) return "Partly cloudy";
    if (code <= 48) return "Foggy";
    if (code <= 67) return "Rain";
    if (code <= 77) return "Snow";
    if (code <= 82) return "Rain showers";
    if (code <= 86) return "Snow showers";
    if (code <= 99) return "Storm";
    return "Mixed";
  }

  function rainStressFrom(weather) {
    if (!weather) return 0;
    var stress = 0;
    if (weather.precipitation_mm != null && weather.precipitation_mm > 0.25) stress += 1;
    if (weather.precipitation_mm != null && weather.precipitation_mm > 1.2) stress += 1;
    if (weather.weather_code != null && weather.weather_code >= 51 && weather.weather_code <= 67) stress += 1;
    if (weather.weather_code != null && weather.weather_code >= 80) stress += 1;
    if (weather.wind_speed_ms != null && weather.wind_speed_ms > 10) stress += 0.5;
    return Math.min(4, Math.round(stress));
  }

  function fetchBengaluruWeather() {
    var url =
      "https://api.open-meteo.com/v1/forecast?latitude=" +
      BLR_LAT +
      "&longitude=" +
      BLR_LON +
      "&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,relative_humidity_2m,is_day&timezone=Asia%2FKolkata";
    return fetch(url, { method: "GET", cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("Weather HTTP " + r.status);
        return r.json();
      })
      .then(function (json) {
        var cur = json && json.current;
        if (!cur) throw new Error("Weather payload");
        return {
          fetchedAt: new Date().toISOString(),
          temp_c: cur.temperature_2m,
          apparent_c: cur.apparent_temperature,
          precipitation_mm: cur.precipitation,
          weather_code: cur.weather_code,
          wind_speed_ms: cur.wind_speed_10m,
          humidity: cur.relative_humidity_2m,
          is_day: cur.is_day,
          label: wmoLabel(cur.weather_code),
        };
      });
  }

  function ensureWeather() {
    var now = Date.now();
    if (weatherCache.data && now - weatherCache.at < CACHE_MS) {
      return Promise.resolve(weatherCache.data);
    }
    return fetchBengaluruWeather()
      .then(function (w) {
        weatherCache = { at: Date.now(), data: w, error: null };
        return w;
      })
      .catch(function (e) {
        weatherCache.error = e && e.message ? e.message : "Weather unavailable";
        return weatherCache.data;
      });
  }

  function getCachedWeather() {
    return weatherCache.data;
  }

  function getWeatherError() {
    return weatherCache.error;
  }

  function timeBucketMinutes(minutes) {
    minutes = minutes || 2;
    return String(Math.floor(Date.now() / (minutes * 60 * 1000)));
  }

  /**
   * Same shape as MetroProData.liveStatusSnapshot rows, driven by time bucket + optional weather stress.
   */
  function buildLiveRows(stations, weather) {
    var stationsArr = stations || (window.MetroProData && MetroProData.STATIONS) || [];
    var bucket = timeBucketMinutes(2);
    var stress = rainStressFrom(weather);
    return stationsArr.map(function (s) {
      var h = fnv1a(s.id + "|" + bucket);
      var h2 = fnv1a((s.line || "") + "|" + bucket + "|" + s.id);
      var statusRoll = (h + stress * 13) % 100;
      var status;
      if (statusRoll < 42 - stress * 5) status = "On time";
      else if (statusRoll < 68 - stress * 2) status = "Normal";
      else if (statusRoll < 88 + stress * 2) status = "Busy";
      else status = "Minor delay";
      var crowdIx = (h2 + stress * 9) % 3;
      var next = 1 + (h % 7) + (stress > 0 ? (h % 4) : 0);
      return {
        station: s,
        nextTrainMin: Math.min(12, Math.max(1, next)),
        crowd: ["Low", "Medium", "High"][crowdIx],
        status: status,
      };
    });
  }

  function summarizeNetwork(rows) {
    if (!rows || !rows.length) return { health: "Unknown", delayPct: 0, busyPct: 0 };
    var delays = 0;
    var busy = 0;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].status && rows[i].status.indexOf("delay") >= 0) delays++;
      if (rows[i].crowd === "High") busy++;
    }
    var delayPct = Math.round((delays / rows.length) * 100);
    var busyPct = Math.round((busy / rows.length) * 100);
    var health = "Stable";
    if (delayPct > 18 || busyPct > 35) health = "Elevated";
    if (delayPct > 28 || busyPct > 48) health = "Heavy";
    return { health: health, delayPct: delayPct, busyPct: busyPct };
  }

  function formatWeatherLine(w) {
    if (!w) return "Bengaluru weather: loading…";
    var t = w.temp_c != null ? Math.round(w.temp_c) + "°C" : "—";
    var feels = w.apparent_c != null ? Math.round(w.apparent_c) + "°C feels" : "";
    var precip =
      w.precipitation_mm != null && w.precipitation_mm > 0 ? " · rain " + w.precipitation_mm.toFixed(1) + " mm" : "";
    return "Bengaluru now: " + w.label + " · " + t + (feels ? " (" + feels + ")" : "") + precip;
  }

  function renderDashboardStrip(hostEl) {
    if (!hostEl) return;
    var w = getCachedWeather();
    var err = getWeatherError();
    var rows = buildLiveRows(null, w);
    var net = summarizeNetwork(rows);
    var line = formatWeatherLine(w);
    if (!w && err) line = "Weather: offline (" + err + ") — using time-based simulation only.";
    hostEl.innerHTML =
      '<div class="row g-3">' +
      '<div class="col-lg-7">' +
      '<div class="mp-card h-100 mb-0">' +
      '<div class="d-flex align-items-start gap-3">' +
      '<span class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width:44px;height:44px;background:var(--color-primary-muted)"><i data-lucide="cloud-sun" class="text-primary"></i></span>' +
      '<div class="flex-grow-1 min-w-0">' +
      '<p class="small text-uppercase fw-bold text-muted mb-1 mb-lg-0">Live context</p>' +
      '<p class="mb-0 fw-medium" id="mp-dash-weather-line">' +
      line +
      "</p>" +
      '<p class="small text-muted mb-0 mt-1">Open-Meteo feed for Bengaluru · refreshes every ~10 min</p>' +
      "</div></div></div></div>" +
      '<div class="col-lg-5">' +
      '<div class="mp-card h-100 mb-0">' +
      '<p class="small text-uppercase fw-bold text-muted mb-1">Network pulse</p>' +
      '<p class="mb-1"><span class="badge rounded-pill text-bg-primary">' +
      net.health +
      "</span>" +
      ' <span class="text-muted small">Delays ~' +
      net.delayPct +
      "% · crowding High ~" +
      net.busyPct +
      "%</span></p>" +
      '<p class="small text-muted mb-0">Headways & crowding are simulated but drift with real weather stress.</p>' +
      "</div></div></div>";
    if (window.lucide && lucide.createIcons) lucide.createIcons();
  }

  function weatherBufferNote() {
    var w = getCachedWeather();
    if (!w) return "";
    var stress = rainStressFrom(w);
    if (stress >= 2) return " Weather looks wet — allow a few extra minutes for platform transfers.";
    if (stress === 1) return " Light rain nearby — crowds may build at interchange hubs.";
    return "";
  }

  function heuristicTripInsight(opts) {
    opts = opts || {};
    var from = opts.from || "";
    var to = opts.to || "";
    var km = opts.distanceKm || 0;
    var fare = opts.fare;
    var w = getCachedWeather();
    var parts = [];
    parts.push("Trip " + from + " → " + to + " (~" + km + " km, fare about ₹" + fare + ").");
    if (w) {
      parts.push("Right now in Bengaluru: " + w.label + ", ~" + Math.round(w.temp_c) + "°C." + weatherBufferNote());
    } else {
      parts.push("Connect live weather from the dashboard once online.");
    }
    if (km > 18) parts.push("Long cross-line ride: watch interchange walking time at Majestic / RV Road.");
    else if (km > 10) parts.push("Mid-length ride: peak windows may feel busier toward CBD stops.");
    else parts.push("Shorter hop: usually quicker boarding off-peak.");
    return parts.join(" ");
  }

  window.MetroProDynamic = {
    ensureWeather: ensureWeather,
    getCachedWeather: getCachedWeather,
    getWeatherError: getWeatherError,
    buildLiveRows: buildLiveRows,
    summarizeNetwork: summarizeNetwork,
    renderDashboardStrip: renderDashboardStrip,
    formatWeatherLine: formatWeatherLine,
    weatherBufferNote: weatherBufferNote,
    heuristicTripInsight: heuristicTripInsight,
    rainStressFrom: rainStressFrom,
  };
})();
