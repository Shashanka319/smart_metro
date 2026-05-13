(function () {
  function esc(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  var allRows = [];

  function renderTable(rows) {
    var tbody = document.querySelector("#mp-journey-table tbody");
    if (!tbody) return;
    if (!rows.length) {
      tbody.innerHTML =
        '<tr><td colspan="5" class="text-muted py-4 text-center">No journeys match your search. Try another keyword or clear the filter.</td></tr>';
      return;
    }
    tbody.innerHTML = rows
      .map(function (j) {
        return (
          "<tr><td>" +
          esc(new Date(j.at).toLocaleString()) +
          "</td><td>" +
          esc(j.from) +
          "</td><td>" +
          esc(j.to) +
          "</td><td>" +
          esc(j.distanceKm != null ? j.distanceKm + " km" : "—") +
          "</td><td>" +
          esc(j.fare != null ? "₹" + j.fare : "—") +
          "</td></tr>"
        );
      })
      .join("");
  }

  function applyFilter(q) {
    q = (q || "").trim().toLowerCase();
    if (!q) {
      renderTable(allRows);
      return;
    }
    var filtered = allRows.filter(function (j) {
      var blob = [j.from, j.to, String(j.fare), String(j.distanceKm), new Date(j.at).toLocaleString()]
        .join(" ")
        .toLowerCase();
      return blob.indexOf(q) >= 0;
    });
    renderTable(filtered);
  }

  function init() {
    allRows = MetroProJourney.getJourneys();
    var search = document.getElementById("mp-journey-search");
    var tbody = document.querySelector("#mp-journey-table tbody");
    if (!allRows.length) {
      if (tbody) {
        tbody.innerHTML =
          '<tr><td colspan="5" class="text-muted py-4 text-center">No journeys logged yet. Use Route Finder or Fare Calculator, then return here.</td></tr>';
      }
      if (search) search.disabled = true;
      return;
    }
    renderTable(allRows);
    if (search) {
      search.addEventListener("input", function () {
        applyFilter(search.value);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
