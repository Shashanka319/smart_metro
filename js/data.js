/**
 * Namma Metro (Bengaluru) — operational network model for MetroPro.
 * Station names & order follow BMRCL / Wikipedia "List of Namma Metro stations" (83 operational).
 * Segment distances are approximate (km) for demo fare/path — not official BMRCL measurements.
 */
(function () {
  /** [id, displayName, BMRCL-style code] — west→east, north→south, or RV→Bommasandra per line */
  var PURPLE_LINE = [
    ["challaghatta", "Challaghatta", "CLGA"],
    ["attiguppe", "Attiguppe", "AGPP"],
    ["deepanjali_nagar", "Deepanjali Nagar", "DJNR"],
    ["mysuru_road", "Mysuru Road", "MYRD"],
    ["nayandahalli", "Pantharapalya–Nayandahalli", "NYHM"],
    ["rajarajeshwari_nagar", "Rajarajeshwari Nagar", "RRRN"],
    ["jnanabharathi", "Jnanabharathi", "BGUC"],
    ["pattanagere", "Pattanagere", "PATG"],
    ["kengeri_bus_terminal", "Kengeri Bus Terminal", "MLSD"],
    ["kengeri", "Kengeri", "KGIT"],
    ["magadi_road", "Magadi Road", "MIRD"],
    ["hosahalli", "Sri Balagangadharanatha Swamiji Stn., Hosahalli", "HSLI"],
    ["vijayanagar", "Vijayanagar", "VJN"],
    ["sir_m_visvesvaraya_central_college", "Sir M. Visvesvaraya Stn., Central College", "VSWA"],
    ["krantivira_sangolli_rayanna", "Krantivira Sangolli Rayanna Railway Stn.", "SRCS"],
    ["nadaprabhu_kempegowda_majestic", "Nadaprabhu Kempegowda Stn., Majestic", "KGWA"],
    ["dr_br_ambedkar_vidhana_soudha", "Dr. B. R. Ambedkar Stn., Vidhana Soudha", "VDSA"],
    ["cubbon_park", "Cubbon Park", "CBPK"],
    ["mahatma_gandhi_road", "Mahatma Gandhi Road", "MAGR"],
    ["trinity", "Trinity", "TTY"],
    ["halasuru", "Halasuru (Ulsoor)", "HLRU"],
    ["indiranagar", "Indiranagar", "IDN"],
    ["swami_vivekananda_road", "Swami Vivekananda Road", "SVRD"],
    ["baiyappanahalli", "Baiyappanahalli", "BYPL"],
    ["benniganahalli", "Benniganahalli (Tin Factory)", "JTPM"],
    ["krishnarajapura", "Krishnarajapura (K.R. Puram)", "KRAM"],
    ["singayyanapalya", "Singayyanapalya (Mahadevapura)", "MDVP"],
    ["garudacharpalya", "Garudacharpalya", "GDCP"],
    ["hoodi", "Hoodi", "DKIA"],
    ["seetharamapalya", "Seetharamapalya", "VWIA"],
    ["kadugodi_tree_park", "Kadugodi Tree Park", "KDGD"],
    ["hopefarm_channasandra", "Hopefarm Channasandra", "UWVL"],
    ["pattandur_agrahara_itpl", "Pattandur Agrahara (ITPL)", "ITPL"],
    ["kundalahalli", "Kundalahalli", "KDNH"],
    ["nallurhalli", "Nallurhalli (Vydehi Hospital)", "VDHP"],
    ["sri_sathya_sai_hospital", "Sri Sathya Sai Hospital", "SSHP"],
    ["whitefield_kadugodi", "Whitefield (Kadugodi)", "WHTM"],
  ];

  var GREEN_LINE = [
    ["madavara", "Madavara", "BIET"],
    ["chikkabidarakallu", "Chikkabidarakallu", "CKBD"],
    ["manjunathanagara", "Manjunathanagara", "MNJN"],
    ["nagasandra", "Nagasandra", "NGSA"],
    ["dasarahalli", "Dasarahalli", "DSH"],
    ["jalahalli", "Jalahalli", "JLHL"],
    ["peenya_industry", "Peenya Industry", "PYID"],
    ["peenya", "Peenya", "PEYA"],
    ["goraguntepalya", "Goraguntepalya", "YPI"],
    ["yeshwanthpur", "Yeshwanthpur", "YPM"],
    ["sandal_soap_factory", "Sandal Soap Factory", "SSFY"],
    ["mahalakshmi", "Mahalakshmi", "MHLI"],
    ["rajajinagar", "Rajajinagar", "RJNR"],
    ["mahakavi_kuvempu_road", "Mahakavi Kuvempu Road", "KVPR"],
    ["srirampura", "Srirampura", "SPRU"],
    ["mantri_square_sampige_road", "Mantri Square Sampige Road", "SPGD"],
    ["nadaprabhu_kempegowda_majestic", "Nadaprabhu Kempegowda Stn., Majestic", "KGWA"],
    ["chickpete", "Chickpete", "CKPE"],
    ["krishna_rajaendra_market", "Krishna Rajendra Market", "KRMT"],
    ["national_college", "National College", "NLC"],
    ["lalbagh", "Lalbagh", "LBGH"],
    ["south_end_circle", "South End Circle", "SECE"],
    ["jayanagar", "Jayanagar", "JYN"],
    ["rashtreeya_vidyalaya_road", "Rashtreeya Vidyalaya Road", "RVR"],
    ["banashankari", "Banashankari", "BSNK"],
    ["jaya_prakash_nagar", "Jaya Prakash Nagar", "JPN"],
    ["yelachenahalli", "Yelachenahalli", "PUTH"],
    ["konanakunte_cross", "Konanakunte Cross", "APRC"],
    ["doddakallasandra", "Doddakallasandra", "KLPK"],
    ["thalaghattapura", "Thalaghattapura", "TGTP"],
    ["vajarahalli", "Vajarahalli", "VJRH"],
    ["silk_institute", "Silk Institute", "APTS"],
  ];

  var YELLOW_LINE = [
    ["rashtreeya_vidyalaya_road", "Rashtreeya Vidyalaya Road", "RVR"],
    ["jayadeva_hospital", "Jayadeva Hospital", "JDHP"],
    ["central_silk_board", "Central Silk Board", "SBJT"],
    ["ragigudda", "Ragigudda", "RGDT"],
    ["btm_layout", "BTM Layout", "BTML"],
    ["bommanahalli", "Bommanahalli", "HSRL"],
    ["hongasandra", "Hongasandra", "OFDC"],
    ["kudlu_gate", "Kudlu Gate", "MSRN"],
    ["hosa_road", "Hosa Road", "BSRD"],
    ["singasandra", "Singasandra", "CKBR"],
    ["biocon_hebbagodi", "Biocon Hebbagodi", "HBGI"],
    ["electronic_city", "Electronic City", "ETCT"],
    ["infosys_konappana_agrahara", "Infosys Foundation Konappana Agrahara", "ECTN"],
    ["beratena_agrahara", "Beratena Agrahara", "HOSR"],
    ["huskur_road", "Huskur Road", "HSKR"],
    ["delta_electronics_bommasandra", "Delta Electronics Bommasandra", "BMSD"],
  ];

  /**
   * BMRCL-style distance slabs (indicative token fare, ₹).
   * Source: published Namma Metro distance charts — verify on bmrc.co.in before production use.
   */
  var FARE_SLABS_KM = [
    { maxKm: 2, token: 11 },
    { maxKm: 4, token: 21 },
    { maxKm: 6, token: 32 },
    { maxKm: 8, token: 42 },
    { maxKm: 10, token: 53 },
    { maxKm: 15, token: 63 },
    { maxKm: 20, token: 74 },
    { maxKm: 25, token: 84 },
    { maxKm: 30, token: 95 },
    { maxKm: Infinity, token: 95 },
  ];
  var SMART_CARD_DISCOUNT = 0.05;

  var STATIONS = [];
  var stationIndex = {};

  function registerLine(lineKey, rows) {
    for (var i = 0; i < rows.length; i++) {
      var id = rows[i][0];
      if (stationIndex[id]) {
        var ex = stationIndex[id];
        if (ex.line.indexOf(lineKey) < 0) ex.line = ex.line + " · " + lineKey;
        continue;
      }
      var st = {
        id: id,
        name: rows[i][1],
        code: rows[i][2],
        line: lineKey,
      };
      stationIndex[id] = st;
    }
  }

  registerLine("Purple", PURPLE_LINE);
  registerLine("Green", GREEN_LINE);
  registerLine("Yellow", YELLOW_LINE);

  function orderedStations() {
    var seen = {};
    var out = [];
    function pushRows(rows) {
      for (var i = 0; i < rows.length; i++) {
        var id = rows[i][0];
        if (seen[id]) continue;
        seen[id] = true;
        out.push(stationIndex[id]);
      }
    }
    pushRows(PURPLE_LINE);
    pushRows(GREEN_LINE);
    pushRows(YELLOW_LINE);
    return out;
  }

  STATIONS = orderedStations();

  /** UI order for Live Status grouping and filters (BMRCL lines in this demo). */
  var LINE_ORDER = ["Purple", "Green", "Yellow"];

  /** Line colours aligned with BMRCL-style branding (demo only). */
  var LINE_STYLE = {
    Purple: { hex: "#6F2DA8", label: "Purple Line" },
    Green: { hex: "#00A650", label: "Green Line" },
    Yellow: { hex: "#D4A017", label: "Yellow Line" },
  };

  function stationLineTokens(st) {
    if (!st || !st.line) return [];
    return st.line
      .split(/\s*·\s*/)
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
  }

  /** Section heading for Live Status: interchange hubs vs single-line stations. */
  function stationPrimarySection(st) {
    var tok = stationLineTokens(st);
    if (tok.length > 1) return "Interchange";
    return tok[0] || "Other";
  }

  var EDGES = {};

  function addEdge(a, b, km) {
    km = Math.round(km * 100) / 100;
    if (!EDGES[a]) EDGES[a] = [];
    if (!EDGES[b]) EDGES[b] = [];
    EDGES[a].push([b, km]);
    EDGES[b].push([a, km]);
  }

  /** Slightly varied segment lengths (~0.9–1.8 km) for a believable network total */
  function chainLine(rows, seed) {
    seed = seed || 0.97;
    for (var i = 0; i < rows.length - 1; i++) {
      var a = rows[i][0];
      var b = rows[i + 1][0];
      var wave = 0.85 + ((i * 7 + seed * 13) % 10) * 0.09;
      addEdge(a, b, wave);
    }
  }

  chainLine(PURPLE_LINE, 1.02);
  chainLine(GREEN_LINE, 1.11);
  chainLine(YELLOW_LINE, 1.07);

  function getStationById(id) {
    return stationIndex[id] || null;
  }

  function findPath(fromId, toId) {
    if (fromId === toId) {
      return { path: [fromId], distanceKm: 0, stations: [getStationById(fromId)] };
    }
    var queue = [{ id: fromId, path: [fromId], dist: 0 }];
    var visited = {};
    visited[fromId] = true;

    while (queue.length) {
      var cur = queue.shift();
      var neighbors = EDGES[cur.id] || [];
      for (var i = 0; i < neighbors.length; i++) {
        var nextId = neighbors[i][0];
        var km = neighbors[i][1];
        if (visited[nextId]) continue;
        var newPath = cur.path.concat([nextId]);
        var newDist = cur.dist + km;
        if (nextId === toId) {
          var stationObjs = newPath.map(getStationById);
          return { path: newPath, distanceKm: Math.round(newDist * 10) / 10, stations: stationObjs };
        }
        visited[nextId] = true;
        queue.push({ id: nextId, path: newPath, dist: newDist });
      }
    }
    return null;
  }

  function fareDetailsFromDistance(distanceKm) {
    var d = Math.max(0, distanceKm);
    if (d <= 0) {
      return { token: 0, smart: 0, slabLabel: "Same station", distanceKm: 0 };
    }
    for (var i = 0; i < FARE_SLABS_KM.length; i++) {
      var slab = FARE_SLABS_KM[i];
      if (d <= slab.maxKm) {
        var token = slab.token;
        var smart = Math.round(token * (1 - SMART_CARD_DISCOUNT));
        var prevMax = i > 0 ? FARE_SLABS_KM[i - 1].maxKm : 0;
        return {
          token: token,
          smart: smart,
          slabLabel: prevMax + "–" + (slab.maxKm === Infinity ? "30+" : slab.maxKm) + " km",
          distanceKm: Math.round(d * 10) / 10,
        };
      }
    }
    return { token: 95, smart: 90, slabLabel: "30+ km", distanceKm: Math.round(d * 10) / 10 };
  }

  /** Default fare shown in app: Namma Metro smart card (5% off token slab). */
  function computeFare(distanceKm) {
    return fareDetailsFromDistance(distanceKm).smart;
  }

  function computeFareToken(distanceKm) {
    return fareDetailsFromDistance(distanceKm).token;
  }

  function liveStatusSnapshot() {
    var statuses = ["On time", "Minor delay", "Busy", "Normal"];
    return STATIONS.map(function (s) {
      var idx = Math.floor(Math.random() * statuses.length);
      return {
        station: s,
        nextTrainMin: Math.floor(Math.random() * 8) + 1,
        crowd: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
        status: statuses[idx],
      };
    });
  }

  function estimateTripMinutes(distanceKm) {
    var kmh = 35;
    var min = Math.round((Math.max(0, distanceKm) / kmh) * 60);
    return distanceKm <= 0 ? 0 : Math.max(3, min + 2);
  }

  window.MetroProData = {
    STATIONS: STATIONS,
    LINES: { purple: PURPLE_LINE, green: GREEN_LINE, yellow: YELLOW_LINE },
    LINE_ORDER: LINE_ORDER,
    LINE_STYLE: LINE_STYLE,
    stationLineTokens: stationLineTokens,
    stationPrimarySection: stationPrimarySection,
    findPath: findPath,
    computeFare: computeFare,
    computeFareToken: computeFareToken,
    fareDetailsFromDistance: fareDetailsFromDistance,
    FARE_SLABS_KM: FARE_SLABS_KM,
    SMART_CARD_DISCOUNT: SMART_CARD_DISCOUNT,
    liveStatusSnapshot: liveStatusSnapshot,
    estimateTripMinutes: estimateTripMinutes,
  };
})();
