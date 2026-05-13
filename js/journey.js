(function () {
  var JOURNEY_KEY = "metropro_journeys";
  var TX_KEY = "metropro_card_tx";

  function getJourneys() {
    try {
      return JSON.parse(localStorage.getItem(JOURNEY_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveJourneys(arr) {
    localStorage.setItem(JOURNEY_KEY, JSON.stringify(arr.slice(0, 100)));
  }

  function logJourney(entry) {
    var list = getJourneys();
    list.unshift(
      Object.assign(
        {
          id: "j-" + Date.now(),
          at: new Date().toISOString(),
        },
        entry
      )
    );
    saveJourneys(list);
    addCardTransaction({
      type: "fare",
      amount: -entry.fare,
      label: entry.from + " → " + entry.to,
    });
  }

  function getTransactions() {
    try {
      return JSON.parse(localStorage.getItem(TX_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveTransactions(arr) {
    localStorage.setItem(TX_KEY, JSON.stringify(arr.slice(0, 80)));
  }

  function addCardTransaction(tx) {
    var list = getTransactions();
    list.unshift(
      Object.assign(
        {
          id: "tx-" + Date.now(),
          at: new Date().toISOString(),
        },
        tx
      )
    );
    saveTransactions(list);
  }

  function seedIfEmpty() {
    /* Intentionally empty: journeys and transactions populate from user actions. */
  }

  function getWalletBalance() {
    return getTransactions().reduce(function (sum, tx) {
      return sum + (tx.amount || 0);
    }, 0);
  }

  function getJourneyStats() {
    var list = getJourneys();
    var totalKm = 0;
    var totalFare = 0;
    for (var i = 0; i < list.length; i++) {
      totalKm += Number(list[i].distanceKm) || 0;
      totalFare += Number(list[i].fare) || 0;
    }
    return {
      tripCount: list.length,
      totalKm: Math.round(totalKm * 10) / 10,
      totalFare: totalFare,
      lastTrip: list.length ? list[0] : null,
    };
  }

  window.MetroProJourney = {
    getJourneys: getJourneys,
    logJourney: logJourney,
    getTransactions: getTransactions,
    addCardTransaction: addCardTransaction,
    seedIfEmpty: seedIfEmpty,
    getWalletBalance: getWalletBalance,
    getJourneyStats: getJourneyStats,
  };
})();
