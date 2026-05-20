(function () {
  const STORAGE_KEY = "metropro_theme";
  const LANG_KEY = "metropro_locale";
  const DEFAULT_LANG = "en";

  var TRANSLATIONS = {
    en: {
      profileAccountHeading: "Account",
      labelName: "Name",
      labelEmail: "Email",
      labelSmartCard: "Smart card",
      logoutButton: "Log out",
      clearDemo: "Clear demo data",
      demoDataHeading: "Demo data",
      demoDataDescription: "Export or restore your local session data for this browser.",
      exportSettingsButton: "Export settings",
      importSettingsButton: "Import settings",
      demoDataFooter: "Exports journeys, smart-card balance, theme, and saved route favorites.",
      popularRoutes: "Popular routes",
      popularRoutesHint: "One-tap presets — edit anytime below.",
      profileHeading: "Profile settings",
      customTrip: "Custom trip",
      fromLabel: "From",
      toLabel: "To",
      swapStations: "Swap stations",
      saveFavorite: "Save favorite",
      clearFavorites: "Clear favorites",
      suggestedRouteHeading: "Suggested route",
      profileHeading: "Profile settings",
    },
    kn: {
      profileAccountHeading: "ಖಾತೆ",
      labelName: "ಹೆಸರು",
      labelEmail: "ಇಮೇಲ್",
      labelSmartCard: "ಸ್ಮಾರ್ಟ್ ಕಾರ್ಡ್",
      logoutButton: "ಲಾಗ್ ಔಟ್",
      clearDemo: "ಡೇಟಾ ತೆರವುಗೊಳಿಸಿ",
      demoDataHeading: "ಡೀಮೊ ಡೇಟಾ",
      demoDataDescription: "ಈ ಬ್ರೌಸರ್‌ಗಾಗಿ ನಿಮ್ಮ ಸ್ಥಳೀಯ ಸೆಷನ್ ಡೇಟಾವನ್ನು ರಫ್ತು ಅಥವಾ ಪುನಃಸ್ಥಾಪಿಸಿ.",
      exportSettingsButton: "ಸೆಟ್ಟಿಂಗ್ಗಳು ರಫ್ತು ಮಾಡಿ",
      importSettingsButton: "ಸೆಟ್ಟಿಂಗ್ಗಳು ಆಮದು ಮಾಡಿ",
      demoDataFooter: "ಪ್ರಯಾಣಗಳು, ಸ್ಮಾರ್ಟ್-ಕಾರ್ಡ್ ಬ್ಯಾಲೆನ್ಸ್, ಥೀಮ್, ಮತ್ತು ಉಳಿಸಿದ ಮಾರ್ಗ ಪ್ರಿಯಗಳನ್ನು ರಫ್ತು ಮಾಡುತ್ತದೆ.",
      popularRoutes: "ಜನಪ್ರಿಯ ಮಾರ್ಗಗಳು",
      popularRoutesHint: "ಒಂದು ಕ್ಲಿಕ್‌ನಲ್ಲಿ ಪ್ರಿಸೆಟ್‌ಗಳು — ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ಸಂಪಾದಿಸಿ.",
      customTrip: "ಸ್ವಯಂಾರಂಭಿತ ಪ್ರಯಾಣ",
      fromLabel: "ಇಂದಿನಿಂದ",
      toLabel: "ಗೆ",
      swapStations: "ಸ್ಟೇಷನ್‌ಗಳನ್ನು ಬದಲಿಸಿ",
      saveFavorite: "ಅನುಕೂಲದಲ್ಲಿ ಸೇರಿಸಿ",
      clearFavorites: "ಪ್ರಿಯಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ",
      suggestedRouteHeading: "ಸುಪಾರಿಶ್‌ ಮಾಡಲಾದ ಮಾರ್ಗ",
      profileHeading: "ಪ್ರೊಫೈಲ್ ಸೆಟ್ಟಿಂಗ್ಗಳು",
    },
  };

  function getPreferred() {
    return localStorage.getItem(STORAGE_KEY) || "light";
  }

  function apply(theme) {
    const t = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem(STORAGE_KEY, t);
    document.dispatchEvent(new CustomEvent("metropro:theme", { detail: { theme: t } }));
  }

  function toggle() {
    const next = getPreferred() === "dark" ? "light" : "dark";
    apply(next);
    return next;
  }

  function getPreferredLanguage() {
    return localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
  }

  function setPreferredLanguage(lang) {
    if (!TRANSLATIONS[lang]) {
      lang = DEFAULT_LANG;
    }
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.setAttribute("lang", lang);
    translatePage(lang);
    updateLanguageToggles();
  }

  function translatePage(lang) {
    var dict = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANG];
    document.querySelectorAll("[data-i18n]").forEach(function (element) {
      var key = element.getAttribute("data-i18n");
      if (dict[key]) {
        element.textContent = dict[key];
      }
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (element) {
      var key = element.getAttribute("data-i18n-placeholder");
      if (dict[key]) {
        element.setAttribute("placeholder", dict[key]);
      }
    });
    document.querySelectorAll("[data-i18n-title]").forEach(function (element) {
      var key = element.getAttribute("data-i18n-title");
      if (dict[key]) {
        element.setAttribute("title", dict[key]);
      }
    });
    document.querySelectorAll("[data-i18n-value]").forEach(function (element) {
      var key = element.getAttribute("data-i18n-value");
      if (dict[key]) {
        element.value = dict[key];
      }
    });
  }

  function updateLanguageToggles() {
    var lang = getPreferredLanguage();
    document.querySelectorAll("[data-language-toggle]").forEach(function (btn) {
      btn.textContent = lang === "kn" ? "English" : "ಕನ್ನಡ";
    });
  }

  function initToggleButtons() {
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        toggle();
        updateIcons();
      });
    });
    document.querySelectorAll("[data-language-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var next = getPreferredLanguage() === "kn" ? "en" : "kn";
        setPreferredLanguage(next);
      });
    });
    updateLanguageToggles();
    translatePage(getPreferredLanguage());
    updateIcons();
  }

  function updateIcons() {
    var isDark = getPreferred() === "dark";
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      var sun = btn.querySelector("[data-icon-sun]");
      var moon = btn.querySelector("[data-icon-moon]");
      if (sun) sun.style.display = isDark ? "block" : "none";
      if (moon) moon.style.display = isDark ? "none" : "block";
    });
  }

  window.MetroProTheme = {
    getPreferred: getPreferred,
    apply: apply,
    toggle: toggle,
    getPreferredLanguage: getPreferredLanguage,
    setPreferredLanguage: setPreferredLanguage,
    init: function () {
      apply(getPreferred());
      translatePage(getPreferredLanguage());
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initToggleButtons);
      } else {
        initToggleButtons();
      }
    },
  };

  apply(getPreferred());
  translatePage(getPreferredLanguage());
  document.documentElement.setAttribute("lang", getPreferredLanguage());
})();
