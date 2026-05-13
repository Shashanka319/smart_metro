(function () {
  function balance() {
    return MetroProJourney.getWalletBalance();
  }

  function renderHistory(listEl) {
    if (!listEl) return;
    var txs = MetroProJourney.getTransactions();
    if (!txs.length) {
      listEl.innerHTML = '<li class="list-group-item text-muted">No transactions yet.</li>';
      return;
    }
    listEl.innerHTML = txs
      .map(function (tx) {
        var date = new Date(tx.at).toLocaleString();
        var amt = tx.amount >= 0 ? "+₹" + tx.amount : "−₹" + Math.abs(tx.amount);
        var cls = tx.amount >= 0 ? "text-success" : "text-warning";
        return (
          '<li class="list-group-item d-flex justify-content-between align-items-start">' +
          "<div><div class=\"fw-medium\">" +
          (tx.label || tx.type) +
          "</div><small class=\"text-muted\">" +
          date +
          "</small></div>" +
          '<span class="' +
          cls +
          ' fw-semibold">' +
          amt +
          "</span></li>"
        );
      })
      .join("");
  }

  function init() {
    var user = MetroProAuth.getCurrentUser();
    var nameEl = document.getElementById("mp-card-name");
    var idEl = document.getElementById("mp-card-id");
    var balEl = document.getElementById("mp-card-balance");
    var qrEl = document.getElementById("mp-card-qr");
    var histEl = document.getElementById("mp-card-tx-list");

    if (nameEl) nameEl.textContent = user ? user.name : "Guest";
    if (idEl) idEl.textContent = user && user.cardId ? user.cardId : "—";
    if (balEl) balEl.textContent = "₹" + balance();

    if (qrEl && user && user.cardId) {
      var src =
        "https://api.qrserver.com/v1/create-qr-code/?size=112x112&data=" +
        encodeURIComponent("MetroPro|" + user.cardId + "|" + user.email);
      qrEl.innerHTML = '<img src="' + src + '" width="112" height="112" alt="Ticket QR code" />';
    }

    renderHistory(histEl);

    var topup = document.getElementById("mp-card-topup");
    if (topup) {
      topup.addEventListener("click", function () {
        MetroProJourney.addCardTransaction({ type: "topup", amount: 200, label: "Quick top-up" });
        if (balEl) balEl.textContent = "₹" + balance();
        renderHistory(histEl);
        if (window.MetroProToast) {
          MetroProToast.show("₹200 added to your digital wallet.", "success");
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
