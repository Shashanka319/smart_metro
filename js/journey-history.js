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
    var exportBtn = document.getElementById("mp-export-journeys");
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
    if (window.MetroProAI) {
      var wrap = document.getElementById("mp-journey-ai-wrap");
      var body = document.getElementById("mp-journey-ai-body");
      var hint = document.getElementById("mp-journey-ai-hint");
      if (wrap && body) {
        wrap.classList.remove("d-none");
        body.textContent = "Summarising your recent trips…";
        if (hint) {
          hint.textContent = "Local digest + Bengaluru weather when available.";
        }
        var lines = allRows.slice(0, 14).map(function (j) {
          return (
            new Date(j.at).toLocaleString() +
            " | " +
            (j.from || "") +
            " → " +
            (j.to || "") +
            " | ₹" +
            (j.fare != null ? j.fare : "—")
          );
        });
        var wChain =
          window.MetroProDynamic && MetroProDynamic.ensureWeather
            ? MetroProDynamic.ensureWeather().catch(function () {
                return null;
              })
            : Promise.resolve(null);
        wChain
          .then(function () {
            return MetroProAI.fetchJourneyHistoryInsight(lines);
          })
          .then(function (text) {
            body.textContent = text || "—";
          });
      }
    }
    if (search) {
      search.addEventListener("input", function () {
        applyFilter(search.value);
      });
    }
    // Row click -> QR preview
    if (tbody) {
      tbody.addEventListener('click', function (ev) {
        var tr = ev.target && ev.target.closest('tr');
        if (!tr) return;
        var idx = Array.prototype.indexOf.call(tbody.querySelectorAll('tr'), tr);
        if (idx < 0 || !allRows[idx]) return;
        var j = allRows[idx];
        var payload = { id: j.id, at: j.at, from: j.from, to: j.to, fare: j.fare };
        var text = 'Journey: ' + (j.from || '') + ' → ' + (j.to || '') + '\nFare: ₹' + (j.fare != null ? j.fare : '-') + '\nWhen: ' + new Date(j.at).toLocaleString();
        var src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(JSON.stringify(payload));
        var img = document.getElementById('mp-qr-img');
        var cap = document.getElementById('mp-qr-caption');
        if (img) img.src = src;
        if (cap) cap.textContent = text;
        var modalEl = document.getElementById('mp-qr-modal');
        try {
          var modal = new bootstrap.Modal(modalEl);
          modal.show();
        } catch (e) {}
      });
    }
    if (exportBtn) {
      exportBtn.addEventListener("click", function () {
        if (!allRows || !allRows.length) {
          if (window.MetroProToast) MetroProToast.show("No journeys to export.", "neutral");
          return;
        }
        var headers = ["When", "From", "To", "Distance_km", "Fare"];
        var csv = headers.join(",") + "\n" +
          allRows.map(function (j) {
            var when = new Date(j.at).toLocaleString();
            return [when, j.from || "", j.to || "", j.distanceKm != null ? j.distanceKm : "", j.fare != null ? j.fare : ""].map(function (v) {
              var s = String(v).replace(/"/g, '""');
              return '"' + s + '"';
            }).join(",");
          }).join("\n");
        var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "metropro_journeys.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
