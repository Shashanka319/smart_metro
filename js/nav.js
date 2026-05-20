(function () {
  var LINKS = [
    { href: "home.html", label: "Dashboard", icon: "layout-dashboard" },
    { href: "route-finder.html", label: "Route Finder", icon: "git-branch" },
    { href: "live-status.html", label: "Live Status", icon: "activity" },
    { href: "fare-calculator.html", label: "Fare Calculator", icon: "calculator" },
    { href: "live-map.html", label: "Live Map", icon: "map" },
    { href: "smartcard.html", label: "Smart Card", icon: "credit-card" },
    { href: "journey-history.html", label: "Journey History", icon: "history" },
    { href: "profile.html", label: "Profile", icon: "user" },
  ];

  function currentPage() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    return path;
  }

  function iconSvg(name) {
    return '<i data-lucide="' + name + '" class="flex-shrink-0"></i>';
  }

  function renderSidebar(activeFile) {
    var nav = document.getElementById("mp-sidebar-nav");
    if (!nav) return;
    var html = "";
    for (var i = 0; i < LINKS.length; i++) {
      var L = LINKS[i];
      var cls = L.href === activeFile ? "active" : "";
      html +=
        '<li><a class="' +
        cls +
        '" href="' +
        L.href +
        '">' +
        iconSvg(L.icon) +
        "<span>" +
        L.label +
        "</span></a></li>";
    }
    nav.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  }

  function initMobileSidebar() {
    var toggle = document.querySelector("[data-sidebar-toggle]");
    var sidebar = document.querySelector(".mp-sidebar");
    var backdrop = document.querySelector(".mp-backdrop");
    function close() {
      if (sidebar) sidebar.classList.remove("is-open");
      if (backdrop) backdrop.classList.remove("is-visible");
    }
    function open() {
      if (sidebar) sidebar.classList.add("is-open");
      if (backdrop) backdrop.classList.add("is-visible");
    }
    if (toggle && sidebar) {
      toggle.addEventListener("click", function () {
        if (sidebar.classList.contains("is-open")) close();
        else open();
      });
    }
    if (backdrop) {
      backdrop.addEventListener("click", close);
    }
    document.querySelectorAll(".mp-sidebar-nav a").forEach(function (a) {
      a.addEventListener("click", close);
    });
  }

  function initUserChip() {
    var el = document.getElementById("mp-user-name");
    if (!el || !window.MetroProAuth) return;
    var u = MetroProAuth.getCurrentUser();
    if (u) el.textContent = u.name || u.email;
  }

  window.MetroProNav = {
    init: function () {
      renderSidebar(currentPage());
      initMobileSidebar();
      initUserChip();
      initOnlineBadge();
      if (window.SmartMetroBrand) SmartMetroBrand.apply();
    },
  };

  function initOnlineBadge() {
    var wrap = document.querySelector(".mp-topbar .d-flex.align-items-center.gap-3");
    if (!wrap || document.getElementById("mp-online-badge")) return;
    var badge = document.createElement("span");
    badge.id = "mp-online-badge";
    badge.className = "mp-online-badge mp-online-badge--online";
    function sync() {
      var on = navigator.onLine;
      badge.className = "mp-online-badge " + (on ? "mp-online-badge--online" : "mp-online-badge--offline");
      badge.textContent = on ? "Live" : "Off";
      badge.title = on ? "You are online" : "You appear offline";
      badge.setAttribute("aria-label", on ? "Connection online" : "Connection offline");
    }
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    wrap.insertBefore(badge, wrap.firstChild);
  }
})();
