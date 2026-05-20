(function () {
  function startDemo() {
    try {
      var user = { email: 'demo@metro.local', name: 'Demo Rider', cardId: 'MP-DEMO' };
      localStorage.setItem('metropro_user', JSON.stringify(user));
      localStorage.setItem('metropro_session', '1');
      if (window.MetroProJourney) {
        // seed a top-up if wallet empty
        var tx = MetroProJourney.getTransactions();
        if (!tx || !tx.length) {
          MetroProJourney.addCardTransaction({ type: 'topup', amount: 300, label: 'Demo top-up' });
        }
        // seed two sample journeys if none exist
        var journeys = MetroProJourney.getJourneys();
        if (!journeys || !journeys.length) {
          MetroProJourney.logJourney({ from: 'mahatma_gandhi_road', to: 'baiyappanahalli', distanceKm: 3.2, fare: 21 });
          MetroProJourney.logJourney({ from: 'nadaprabhu_kempegowda_majestic', to: 'cubbon_park', distanceKm: 1.5, fare: 11 });
        }
      }
    } catch (e) {
      console.warn('Demo start failed', e);
    }
    window.location.href = 'home.html';
  }

  window.MetroProDemo = { startDemo: startDemo };
})();
