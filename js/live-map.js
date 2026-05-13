(function () {
  /** Stylised Namma Metro schematic (not to scale). */
  var MAP_PATH = [
    [72, 88],
    [210, 195],
    [355, 115],
    [385, 260],
    [228, 348],
    [95, 228],
  ];

  var STOPS = [
    { x: 72, y: 88, label: "MDV", title: "Madavara" },
    { x: 210, y: 195, label: "Maj", title: "Majestic" },
    { x: 355, y: 115, label: "WF", title: "Whitefield" },
    { x: 385, y: 260, label: "BOM", title: "Bommasandra" },
    { x: 228, y: 348, label: "SIL", title: "Silk Institute" },
    { x: 95, y: 228, label: "CLG", title: "Challaghatta" },
  ];

  function buildSvg() {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 480 440");
    svg.setAttribute("class", "mp-map-svg");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Namma Metro schematic map with animated train");

    var defs = document.createElementNS(ns, "defs");
    var grad = document.createElementNS(ns, "linearGradient");
    grad.setAttribute("id", "mp-line-grad");
    grad.setAttribute("x1", "0%");
    grad.setAttribute("y1", "0%");
    grad.setAttribute("x2", "100%");
    grad.setAttribute("y2", "0%");
    var s1 = document.createElementNS(ns, "stop");
    s1.setAttribute("offset", "0%");
    s1.setAttribute("stop-color", "#6F2DA8");
    var s2 = document.createElementNS(ns, "stop");
    s2.setAttribute("offset", "100%");
    s2.setAttribute("stop-color", "#00A550");
    grad.appendChild(s1);
    grad.appendChild(s2);
    defs.appendChild(grad);
    svg.appendChild(defs);

    for (var i = 0; i < MAP_PATH.length; i++) {
      var j = (i + 1) % MAP_PATH.length;
      var line = document.createElementNS(ns, "line");
      line.setAttribute("x1", MAP_PATH[i][0]);
      line.setAttribute("y1", MAP_PATH[i][1]);
      line.setAttribute("x2", MAP_PATH[j][0]);
      line.setAttribute("y2", MAP_PATH[j][1]);
      line.setAttribute("stroke", "url(#mp-line-grad)");
      line.setAttribute("stroke-width", "8");
      line.setAttribute("stroke-linecap", "round");
      line.setAttribute("opacity", "0.35");
      svg.appendChild(line);
    }

    STOPS.forEach(function (s) {
      var g = document.createElementNS(ns, "g");
      var c = document.createElementNS(ns, "circle");
      c.setAttribute("cx", s.x);
      c.setAttribute("cy", s.y);
      c.setAttribute("r", "14");
      c.setAttribute("fill", "var(--color-surface)");
      c.setAttribute("stroke", "#6F2DA8");
      c.setAttribute("stroke-width", "3");
      var t = document.createElementNS(ns, "text");
      t.setAttribute("x", s.x);
      t.setAttribute("y", s.y + 5);
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("font-size", "11");
      t.setAttribute("font-weight", "700");
      t.setAttribute("fill", "#6F2DA8");
      t.textContent = s.label;
      var title = document.createElementNS(ns, "title");
      title.textContent = s.title;
      g.appendChild(c);
      g.appendChild(title);
      g.appendChild(t);
      svg.appendChild(g);
    });

    var train = document.createElementNS(ns, "circle");
    train.setAttribute("r", "10");
    train.setAttribute("fill", "#FBBF24");
    train.setAttribute("stroke", "#0f172a");
    train.setAttribute("stroke-width", "2");
    train.setAttribute("class", "mp-train-dot");
    svg.appendChild(train);

    return { svg: svg, train: train };
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function animateTrain(trainEl, startTime) {
    var path = MAP_PATH.concat([MAP_PATH[0]]);
    var totalMs = 28000;
    function frame(now) {
      var t = ((now - startTime) % totalMs) / totalMs;
      var segFloat = t * (path.length - 1);
      var i = Math.floor(segFloat);
      var local = segFloat - i;
      var p0 = path[i];
      var p1 = path[i + 1];
      var x = lerp(p0[0], p1[0], local);
      var y = lerp(p0[1], p1[1], local);
      trainEl.setAttribute("cx", x);
      trainEl.setAttribute("cy", y);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function init() {
    var host = document.getElementById("mp-live-map-host");
    if (!host) return;
    var built = buildSvg();
    host.appendChild(built.svg);
    animateTrain(built.train, performance.now());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
