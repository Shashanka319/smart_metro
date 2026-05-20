(function () {
  function init() {
    var u = MetroProAuth.getCurrentUser();
    var emailEl = document.getElementById("mp-profile-email");
    var nameEl = document.getElementById("mp-profile-name");
    var cardEl = document.getElementById("mp-profile-card");
    if (emailEl) emailEl.textContent = u ? u.email : "—";
    if (nameEl) nameEl.textContent = u ? u.name : "—";
    if (cardEl) cardEl.textContent = u && u.cardId ? u.cardId : "—";

    var logoutBtn = document.getElementById("mp-profile-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        if (window.MetroProToast) {
          MetroProToast.show("Signed out securely from this browser.", "neutral");
        }
        MetroProAuth.logout();
        window.setTimeout(function () {
          window.location.href = "index.html";
        }, 450);
      });
    }


    var clearBtn = document.getElementById("mp-clear-demo");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        var ok = confirm(
          "Clear demo data? This will remove journeys, transactions, accounts, theme, and sign you out.\n\nProceed?"
        );
        if (!ok) return;
        var keys = [
          "metropro_journeys",
          "metropro_card_tx",
          "metropro_accounts",
          "metropro_user",
          "metropro_session",
          "smartmetro_api_banner_dismissed",
          "metropro_welcome_dismissed",
          "metropro_theme",
          "metropro_locale",
          "metropro_fav_routes",
        ];
        keys.forEach(function (k) {
          try {
            localStorage.removeItem(k);
          } catch (e) {}
        });
        if (window.MetroProToast) MetroProToast.show("Demo data cleared.", "neutral");
        window.setTimeout(function () {
          window.location.href = "index.html";
        }, 700);
      });
    }

    var exportBtn = document.getElementById("mp-export-settings");
    var importBtn = document.getElementById("mp-import-settings");
    var importFile = document.getElementById("mp-import-file");

    function saveSettingsToFile(data) {
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "metropro-settings.json";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    }

    if (exportBtn) {
      exportBtn.addEventListener("click", function () {
        var keys = [
          "metropro_journeys",
          "metropro_card_tx",
          "metropro_accounts",
          "metropro_user",
          "metropro_session",
          "metropro_theme",
          "metropro_locale",
          "metropro_fav_routes",
          "smartmetro_api_banner_dismissed",
          "metropro_welcome_dismissed",
        ];
        var payload = {};
        keys.forEach(function (k) {
          try {
            var value = localStorage.getItem(k);
            if (value !== null) {
              payload[k] = value;
            }
          } catch (e) {}
        });
        saveSettingsToFile(payload);
        if (window.MetroProToast) MetroProToast.show("Settings exported successfully.", "neutral");
      });
    }

    if (importBtn && importFile) {
      importBtn.addEventListener("click", function () {
        importFile.click();
      });

      importFile.addEventListener("change", function () {
        if (!importFile.files || !importFile.files[0]) return;
        var file = importFile.files[0];
        var reader = new FileReader();
        reader.onload = function () {
          try {
            var payload = JSON.parse(reader.result);
            if (!payload || typeof payload !== "object") {
              throw new Error("Invalid settings file.");
            }
            var keys = [
              "metropro_journeys",
              "metropro_card_tx",
              "metropro_accounts",
              "metropro_user",
              "metropro_session",
              "metropro_theme",
              "metropro_locale",
              "metropro_fav_routes",
              "smartmetro_api_banner_dismissed",
              "metropro_welcome_dismissed",
            ];
            keys.forEach(function (k) {
              if (payload[k] !== undefined) {
                try {
                  var value = payload[k];
                  localStorage.setItem(k, typeof value === "string" ? value : JSON.stringify(value));
                } catch (e) {}
              }
            });
            if (window.MetroProToast) MetroProToast.show("Settings imported. Reloading page...", "neutral");
            window.setTimeout(function () {
              window.location.reload();
            }, 700);
          } catch (e) {
            if (window.MetroProToast) MetroProToast.show("Failed to import settings.", "danger");
          }
        };
        reader.readAsText(file);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
