/**
 * MetroPro AI layer: local heuristics + Open-Meteo context via MetroProDynamic.
 * All text shown with textContent in hosts — prompts only; never treat model output as HTML.
 */
(function () {
  function getGeminiKey() {
    return "";
  }

  function setGeminiKey(key) {
    // Gemini keys are no longer used in this project.
  }

  function hasGeminiKey() {
    return false;
  }

  function geminiModelId() {
    return "";
  }

  function weatherSnippet() {
    var w = window.MetroProDynamic && MetroProDynamic.getCachedWeather && MetroProDynamic.getCachedWeather();
    if (!w) return "Weather context unavailable (Open-Meteo).";
    return (
      "Current Bengaluru weather: " +
      w.label +
      ", " +
      Math.round(w.temp_c) +
      "°C, precip mm " +
      (w.precipitation_mm != null ? w.precipitation_mm : 0) +
      "."
    );
  }

  function instantLocalInsight(opts) {
    if (window.MetroProDynamic && MetroProDynamic.heuristicTripInsight) {
      return MetroProDynamic.heuristicTripInsight(opts);
    }
    return "Plan extra buffer during peak hours and keep your smart card topped up.";
  }

  function callGeminiWithText(promptText, maxOutputTokens) {
    return Promise.reject(new Error("Gemini API removed"));
  }

  function buildTripPrompt(payload) {
    var path = (payload.pathNames || []).join(" → ");
    return (
      "You are MetroPro, a concise Bengaluru Namma Metro travel assistant for a demo app.\n" +
      "Give 3-5 short bullet lines (use leading dashes). No markdown headings. Stay practical, not alarmist.\n" +
      "Trip: " +
      payload.from +
      " to " +
      payload.to +
      ".\n" +
      "Path: " +
      path +
      ".\n" +
      "Distance km: " +
      payload.distanceKm +
      ", indicative fare INR " +
      payload.fare +
      ".\n" +
      weatherSnippet() +
      "\n" +
      "Mention interchange walking if Majestic or RV Road appears in path. End with one line on digital wallet/smart card hygiene."
    );
  }

  function heuristicFareInsight(payload) {
    var path = (payload.pathNames || []).join(" → ");
    var base =
      "Smart card fare about ₹" +
      payload.fare +
      " for " +
      payload.distanceKm +
      " km (" +
      payload.from +
      " → " +
      payload.to +
      "). Based on BMRCL-style distance slabs (indicative).\n";
    if (window.MetroProDynamic && MetroProDynamic.heuristicTripInsight) {
      return base + MetroProDynamic.heuristicTripInsight(payload);
    }
    return base + "Top up your smart card before long cross-line trips.";
  }

  function buildFarePrompt(payload) {
    var path = (payload.pathNames || []).join(" → ");
    return (
      "You are MetroPro fare coach for a demo Bengaluru Namma Metro app.\n" +
      "Give 2-4 short bullet lines (leading dashes). Focus on fare transparency, value vs distance, and one practical travel tip.\n" +
      "Stations: " +
      payload.from +
      " → " +
      payload.to +
      ".\n" +
      "Path: " +
      path +
      ".\n" +
      "Distance km: " +
      payload.distanceKm +
      ", indicative smart-card fare INR " +
      payload.fare +
      " (BMRCL-style slab).\n" +
      weatherSnippet()
    );
  }

  function heuristicDashboardCoach(stats, wallet) {
    stats = stats || {};
    var n = stats.tripCount || 0;
    if (!n) {
      return (
        "No trips logged yet in this browser. Open Route Finder or Fare Calculator, pick stations, then save a journey — " +
        "your stats, wallet, and AI tips will update together.\n" +
        weatherSnippet()
      );
    }
    var last = stats.lastTrip;
    var lastLine = last ? "Last trip: " + (last.from || "") + " → " + (last.to || "") + "." : "";
    return (
      "You have logged " +
      n +
      " trip(s), about " +
      (stats.totalKm || 0) +
      " km, fares totaling ₹" +
      (stats.totalFare || 0) +
      ". Smart card balance about ₹" +
      wallet +
      ".\n" +
      lastLine +
      "\n" +
      weatherSnippet() +
      "\n" +
      "Tip: check Live Status before long CBD or interchange legs."
    );
  }

  function buildDashboardPrompt(stats, wallet) {
    stats = stats || {};
    var last = stats.lastTrip;
    return (
      "You are MetroPro coach for a single transit rider using a demo web app.\n" +
      "Give 3-5 short bullet lines (leading dashes). Encourage sensible Namma Metro habits (peaks, interchanges, card hygiene).\n" +
      "Trips logged: " +
      (stats.tripCount || 0) +
      ", total km: " +
      (stats.totalKm || 0) +
      ", fares paid (demo): INR " +
      (stats.totalFare || 0) +
      ", wallet balance INR " +
      wallet +
      ".\n" +
      "Last trip: " +
      (last ? (last.from || "") + " → " + (last.to || "") : "none") +
      ".\n" +
      weatherSnippet()
    );
  }

  function heuristicNetworkPulse(payload) {
    payload = payload || {};
    return (
      "Network snapshot (simulated headways): overall " +
      (payload.health || "Stable") +
      ". About " +
      (payload.delayPct != null ? payload.delayPct : 0) +
      "% of stations show delay-like status; high crowding at ~" +
      (payload.busyPct != null ? payload.busyPct : 0) +
      "%.\n" +
      (payload.weatherLine || weatherSnippet()) +
      "\n" +
      "Use line filters to focus Purple, Green, or Yellow corridors."
    );
  }

  function networkPulseLocalText(payload) {
    return heuristicNetworkPulse(payload || {});
  }

  function buildNetworkPrompt(payload) {
    payload = payload || {};
    return (
      "You are MetroPro summarising a demo Namma Metro live board.\n" +
      "Give 2-4 short bullet lines (leading dashes). Be clear this is a simulation nudged by real Bengaluru weather, not BMRCL official feeds.\n" +
      "Stations in view: " +
      (payload.stationCount != null ? payload.stationCount : 0) +
      ".\n" +
      "Pulse: " +
      (payload.health || "") +
      ", delays ~" +
      (payload.delayPct != null ? payload.delayPct : 0) +
      "%, high crowding ~" +
      (payload.busyPct != null ? payload.busyPct : 0) +
      "%.\n" +
      (payload.weatherLine || weatherSnippet())
    );
  }

  function heuristicJourneyDigest(lines) {
    if (!lines || !lines.length) return "No journeys to summarise.";
    return (
      "Recent activity (newest first):\n" +
      lines.slice(0, 6).join("\n") +
      "\n" +
      weatherSnippet() +
      "\nThis summary uses local heuristics and Bengaluru weather context."
    );
  }

  function buildJourneyPrompt(lines) {
    return (
      "You are MetroPro reviewing a rider's recent Bengaluru Namma Metro trips in a demo app (browser-stored only).\n" +
      "Give 3-5 short bullet lines (leading dashes). Note patterns (distance, spend), one savings habit, and respect privacy (no real PII).\n" +
      "Recent trips (most recent first):\n" +
      (lines && lines.length ? lines.join("\n") : "(none)") +
      "\n" +
      weatherSnippet()
    );
  }

  function withGeminiOrHeuristic(promptText, heuristicFn, maxTokens) {
    return Promise.resolve(heuristicFn());
  }

  function fetchTripInsight(payload) {
    payload = payload || {};
    return withGeminiOrHeuristic(
      buildTripPrompt(payload),
      function () {
        return instantLocalInsight(payload);
      },
      220
    );
  }

  function fetchFareInsight(payload) {
    payload = payload || {};
    return withGeminiOrHeuristic(
      buildFarePrompt(payload),
      function () {
        return heuristicFareInsight(payload);
      },
      200
    );
  }

  function fetchDashboardCoach(stats, wallet) {
    stats = stats || {};
    wallet = wallet == null ? 0 : wallet;
    return withGeminiOrHeuristic(
      buildDashboardPrompt(stats, wallet),
      function () {
        return heuristicDashboardCoach(stats, wallet);
      },
      220
    );
  }

  function fetchNetworkPulseInsight(payload) {
    payload = payload || {};
    return withGeminiOrHeuristic(
      buildNetworkPrompt(payload),
      function () {
        return heuristicNetworkPulse(payload);
      },
      180
    );
  }

  function fetchJourneyHistoryInsight(lines) {
    lines = lines || [];
    return withGeminiOrHeuristic(
      buildJourneyPrompt(lines),
      function () {
        return heuristicJourneyDigest(lines);
      },
      220
    );
  }

  window.MetroProAI = {
    getGeminiKey: getGeminiKey,
    setGeminiKey: setGeminiKey,
    hasGeminiKey: hasGeminiKey,
    geminiModelId: geminiModelId,
    instantLocalInsight: instantLocalInsight,
    networkPulseLocalText: networkPulseLocalText,
    fetchTripInsight: fetchTripInsight,
    fetchFareInsight: fetchFareInsight,
    fetchDashboardCoach: fetchDashboardCoach,
    fetchNetworkPulseInsight: fetchNetworkPulseInsight,
    fetchJourneyHistoryInsight: fetchJourneyHistoryInsight,
  };
})();
