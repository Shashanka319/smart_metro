(function () {
  const STORAGE_KEY = "metropro_theme";

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

  function initToggleButtons() {
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        toggle();
        updateIcons();
      });
    });
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
    init: function () {
      apply(getPreferred());
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initToggleButtons);
      } else {
        initToggleButtons();
      }
    },
  };

  apply(getPreferred());
})();
