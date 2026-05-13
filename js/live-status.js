(function () {
  function render() {
    var host = document.getElementById("mp-live-status-grid");
    if (!host) return;
    var rows = MetroProData.liveStatusSnapshot();
    host.innerHTML = rows
      .map(function (r) {
        var statusClass = "text-success";
        if (r.status.indexOf("delay") >= 0) statusClass = "text-warning";
        return (
          '<div class="col-md-6 col-lg-4">' +
          '<div class="mp-card h-100 mp-card--lift">' +
          "<h3 class=\"h6 mb-2\">" +
          r.station.name +
          "</h3>" +
          '<p class="mb-1 small text-muted">Next train: <strong>' +
          r.nextTrainMin +
          " min</strong></p>" +
          '<p class="mb-1 small">Crowd: <span class="fw-medium">' +
          r.crowd +
          "</span></p>" +
          '<p class="mb-0 small ' +
          statusClass +
          '">' +
          r.status +
          "</p></div></div>"
        );
      })
      .join("");
    var stamp = document.getElementById("mp-status-updated");
    if (stamp) {
      stamp.textContent = "Snapshot updated " + new Date().toLocaleTimeString();
    }
  }

  function init() {
    render();
    setInterval(render, 8000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
