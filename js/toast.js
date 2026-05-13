(function () {
  function show(message, variant) {
    variant = variant || "success";
    var stack = document.getElementById("mp-toast-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.id = "mp-toast-stack";
      stack.className = "mp-toast-stack";
      stack.setAttribute("aria-live", "polite");
      document.body.appendChild(stack);
    }
    var el = document.createElement("div");
    el.className = "mp-toast mp-toast--" + variant;
    el.setAttribute("role", "status");
    el.textContent = message;
    stack.appendChild(el);
    requestAnimationFrame(function () {
      el.classList.add("mp-toast--show");
    });
    window.setTimeout(function () {
      el.classList.remove("mp-toast--show");
      window.setTimeout(function () {
        el.remove();
      }, 280);
    }, 3400);
  }

  window.MetroProToast = { show: show };
})();
