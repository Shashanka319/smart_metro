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

  function init() {
    initWelcome();
    initStats();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
