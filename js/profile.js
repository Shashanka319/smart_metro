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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
