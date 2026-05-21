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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
