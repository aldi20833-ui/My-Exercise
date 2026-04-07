(() => {
  // Fungsi Utama & Utility

  function I(t, n = "320px") {
    let e = document.getElementById(t);
    return e instanceof HTMLDivElement ? (Object.assign(e.style, a), e) : null;
  }

  var a = {},       
    h = [],         
    w, E, D, O, y, q, 
    b, v, H, S,     
    U, N, R, P,     
    K = ["#006600", "#007100", "#007600", "#008100", "#008800", "#00aa00", "#00cc00", "#00ff00", "#33ff33", "#66ff66", "#88ff88", "#aaffaa", "#ccffcc", "#eeffee", "#f0fff0", "#ffffff"],
    k = [],         
    W;              

  function z(t, n = {}) {
    let e = document.createElement("div");
    e.className = "panel", Object.assign(e.style, n);
    let l = document.createElement("canvas");
    return l.id = t,
      l.style.width = "100%",
      l.style.height = "100%",
      l.style.border = "1px solid var(--muted-border)",
      l.style.display = "block",
      e.append(l),
      e;
  }

  function V(t) {
    let n = t.getBoundingClientRect(),
      e = window.devicePixelRatio || 1;
    t.width = n.width * e,
      t.height = n.height * e,
      t.getContext("2d").scale(e, e);
  }

  function M(t) {
    let n = document.getElementById(t);
    if (!(n instanceof HTMLCanvasElement)) return null;
    let e = n.getBoundingClientRect(),
      l = e.width,
      i = e.height;
    n.getContext("2d").clearRect(0, 0, l, i);
  }

  function B(t, n, e = {}, l = _) {
    let i = document.createElement("div");
    i.className = "panel", Object.assign(i.style, e);
    let o = 0;
    for (let c of t) {
      let s = document.createElement("button");
      s.id = c,
        s.disabled = !n[o],
        s.innerHTML = c,
        e.flexDirection == "row" && (s.style.flex = "1"),
        i.append(s),
        o += 1;
    }
    return i.addEventListener("click", (c) => {
      l(c);
    }), i;
  }

  function r(t, n) {
    let e = document.getElementById(t);
    if(e) e.disabled = !n;
  }

  // Logika tombol
  function _(t) {
    let n = t.target.closest("button");
    if (!n) return;

    // Logika Panel 1
    if (n.innerHTML == "wipe-1") {
      document.getElementById("params-1").value = "",
        document.getElementById("grid").value = "",
        r("read-1", !1), r("exec-1", !1), r("data-2", !1),
        r("read-2", !1), r("exec-2", !1), M("map-2"),
        r("data-3", !1), r("read-3", !1), r("exec-3", !1), M("map-3"),
        r("data-4", !1), r("read-4", !1), r("exec-4", !1), M("map-4");
    }

    if (n.innerHTML == "data-1") {
      let e = `COLS 9\nROWS 11\nUMIN 0.20\nUMAX 0.70\nUNUM 11\nSEPC ;`;
      document.getElementById("params-1").value = e,
        r("read-1", !0);
    }

    if (n.innerHTML == "read-1") {
      let e = document.getElementById("params-1").value;
      q = f(e, "SEPC"),
        w = f(e, "ROWS", "int"),
        E = f(e, "COLS", "int"),
        D = f(e, "UMIN", "float"),
        O = f(e, "UMAX", "float"),
        y = f(e, "UNUM", "int"),
        r("exec-1", !0), r("data-2", !0), r("data-3", !0), r("data-4", !0);
    }

    if (n.innerHTML == "exec-1") {
      let e = (O - D) / (y - 1);
      h = [], text = "";
      for (let l = 0; l < w; l++) {
        let i = [];
        for (let o = 0; o < E; o++) {
          let c = Math.floor(Math.random() * y);
          i.push(c);
          let s = D + e * c;
          text += s.toFixed(2).slice(1), o < E - 1 && (text += ";");
        }
        l < w - 1 && (text += `\n`), h.push(i);
      }
      document.getElementById("grid").value = text;
    }

    // Logika Panel 2
    if (n.innerHTML == "wipe-2") {
      document.getElementById("params-2").value = "", M("map-2"),
        r("data-2", !1), r("read-2", !1), r("exec-2", !1);
    }

    if (n.innerHTML == "data-2") {
      let e = "CNUM " + y + `\n`;
      for (let l = 0; l < y; l++)
        e += "CL" + A(l, 2) + " " + K[l], l < y - 1 && (e += `\n`);
      document.getElementById("params-2").value = e,
        r("read-2", !0);
    }

    if (n.innerHTML == "read-2") {
      let e = document.getElementById("params-2").value;
      W = f(e, "CNUM"), k = [];
      for (let l = 0; l < W; l++) {
        let i = "CL" + A(l, 2), o = f(e, i);
        o != null && k.push(o);
      }
      r("exec-2", !0);
    }

    if (n.innerHTML == "exec-2") X("map-2", h);

    // Logika Panel 3
    if (n.innerHTML == "wipe-3") {
      document.getElementById("params-3").value = "", M("map-3"),
        r("data-3", !1), r("read-3", !1), r("exec-3", !1);
    }

    if (n.innerHTML == "data-3") {
      let e = `XMIN 0\nYMIN 0\nXMAX ${E}\nYMAX ${w}`;
      document.getElementById("params-3").value = e,
        r("read-3", !0);
    }

    if (n.innerHTML == "read-3") {
      let e = document.getElementById("params-3").value;
      b = f(e, "XMIN"), v = f(e, "YMIN"), H = f(e, "XMAX"), S = f(e, "YMAX"),
        r("exec-3", !0);
    }

    if (n.innerHTML == "exec-3") {
      U = Math.floor(Math.random() * (H - b) + b);
      N = Math.floor(Math.random() * (S - v) + v);
      R = Math.floor(Math.random() * (H - b) + b);
      P = Math.floor(Math.random() * (S - v) + v);
      M("map-3");
      X("map-3", h);
      F("map-3", h, [U, N], "rgb(255, 0, 0)"); 
      F("map-3", h, [R, P], "rgb(0, 0, 255)"); 
    }

    // Logika panel 4
    if (n.innerHTML == "wipe-4") {
      document.getElementById("params-4").value = "", M("map-4"),
        r("data-4", !1), r("read-4", !1), r("exec-4", !1);
    }

    if (n.innerHTML == "data-4") {
      document.getElementById("params-4").value = "COLOR #eeff00\nWIDTH 2",
        r("read-4", !0);
    }

    if (n.innerHTML == "read-4") {
      r("exec-4", !0);
    }

    if (n.innerHTML == "exec-4") {
      let e = document.getElementById("params-4").value;
      let lineColor = f(e, "COLOR") || "#eeff00";
      let lineWidth = f(e, "WIDTH", "int") || 2;
      
      M("map-4");
      X("map-4", h); // Background grid
      F("map-4", h, [U, N], "rgb(255, 0, 0)"); // Titik Hijau
      F("map-4", h, [R, P], "rgb(0, 0, 255)"); // Titik Biru
      
      // Panggil fungsi gambar garis
      DL("map-4", h, [U, N], [R, P], lineColor, lineWidth);
    }
  }

  // FUngsi pembatu Simulasi

  function A(t, n) {
    return String(t).padStart(2, "0");
  }

  function f(t, n, e = "string") {
    let l = t.split(`\n`), i = null;
    for (let o of l)
      if (o.indexOf(n) == 0) {
        i = o.split(" ")[1];
        return e == "float" ? parseFloat(i) : e == "int" ? parseInt(i) : i;
      }
  }

  function X(t, n) {
    let e = document.getElementById(t);
    if (!(e instanceof HTMLCanvasElement)) return null;
    let l = e.getBoundingClientRect(),
      i = l.width, o = l.height,
      c = n.length, s = n[0].length,
      x = i / s, g = o / c,
      d = e.getContext("2d");
    for (let p = 0; p < c; p++)
      for (let u = 0; u < s; u++) {
        let T = n[p][u];
        d.beginPath();
        d.fillStyle = k[T] || "#ccc";
        d.rect(u * x, p * g, x, g);
        d.fill();
        d.beginPath();
        d.lineWidth = "0.2";
        d.strokeStyle = "#888";
        d.rect(u * x, p * g, x, g);
        d.stroke();
      }
  }

  function F(t, n, e, l) {
    let i = document.getElementById(t);
    if (!(i instanceof HTMLCanvasElement)) return null;
    let o = i.getBoundingClientRect(),
      c = o.width, s = o.height,
      x = n.length, g = n[0].length,
      d = c / g, p = s / x,
      u = i.getContext("2d"),
      T = e[0], Y = e[1];
    u.beginPath();
    u.fillStyle = l;
    u.rect(T * d, Y * p, d, p);
    u.fill();
  }

    // Fungsi DL (Draw Line): Menghubungkan dua koordinat dengan belok siku-siku (Manhattan)
  function DL(t, n, e, l, color, width) {
    let i = document.getElementById(t);
    let ctx = i.getContext("2d");
    let o = i.getBoundingClientRect(),
      c = o.width, s = o.height,
      rows = n.length, cols = n[0].length,
      dx = c / cols, dy = s / rows;

    let x0 = e[0], y0 = e[1]; // Titik Hijau
    let x1 = l[0], y1 = l[1]; // Titik Biru

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = "round";

    // 1. Mulai dari tengah kotak Hijau
    ctx.moveTo((x0 + 0.5) * dx, (y0 + 0.5) * dy);

    // 2. Jalur Horizontal dulu: Gerak dari x0 ke x1 (y tetap y0)
    ctx.lineTo((x1 + 0.5) * dx, (y0 + 0.5) * dy);

    // 3. Jalur Vertikal: Gerak dari y0 ke y1 (x tetap x1)
    ctx.lineTo((x1 + 0.5) * dx, (y1 + 0.5) * dy);

    ctx.stroke();
  }

  function C(t, n = {}) {
    let e = document.createElement("div");
    e.className = "panel", Object.assign(e.style, n);
    for (let l of t) {
      let i = document.createElement("textarea");
      i.id = l, i.placeholder = l,
        i.style.flex = "1", i.style.fontFamily = "monospace",
        i.style.fontSize = "9px", i.style.border = "1px solid var(--muted-border)",
        i.style.minWidth = "0", i.style.boxSizing = "border-box",
        i.style.resize = "none", i.style.overflow = "auto",
        i.style.whiteSpace = "nowrap", e.append(i);
    }
    return e;
  }

  function L(t) {
    let n = t.querySelectorAll("canvas");
    for (let e of n) V(e);
  }

  function m(t, n, e) {
    let l = t.querySelectorAll(n),
      i = Math.min(l.length, e.length);
    for (let o = 0; o < i; o++) l[o].style.flex = e[o];
  }

  // fungsi pembuat UI

  function G() {
    let t = document.createElement("div");
    a = { border: "0px solid #f44", height: "100%", display: "flex", flexDirection: "row" };
    Object.assign(t.style, a);
    let e = C(["params-1"], { display: "flex", flexDirection: "row", minWidth: "0" });
    m(e, "textarea", [1]);
    let o = B(["wipe-1", "data-1", "read-1", "exec-1"], [!0, !0, !1, !1], { display: "flex", flexDirection: "column", height: "40%", minHeight: "0" });
    let s = C(["grid"], { display: "flex", flexDirection: "row", minWidth: "0" });
    m(s, "textarea", [1]);
    t.append(e), t.append(o), t.append(s);
    m(t, "div.panel", [1.5, 1.3, 4]);
    return t;
  }

  function J() {
    let t = document.createElement("div");
    a = { border: "0px solid #f44", height: "100%", display: "flex", flexDirection: "row" };
    Object.assign(t.style, a);
    let e = C(["params-2"], { display: "flex", flexDirection: "row", minWidth: "0" });
    m(e, "textarea", [1]);
    let o = B(["wipe-2", "data-2", "read-2", "exec-2"], [!0, !1, !1, !1], { display: "flex", flexDirection: "column", height: "40%", minHeight: "0" });
    let s = z("map-2", { display: "flex", flexDirection: "row", minWidth: "0" });
    m(s, "canvas", [1]);
    t.append(e), t.append(o), t.append(s);
    m(t, "div.panel", [1.5, 1.3, 4]);
    return t;
  }

  function Q() {
    let t = document.createElement("div");
    a = { border: "0px solid #f44", height: "100%", display: "flex", flexDirection: "row" };
    Object.assign(t.style, a);
    let e = C(["params-3"], { display: "flex", flexDirection: "row", minWidth: "0" });
    m(e, "textarea", [1]);
    let o = B(["wipe-3", "data-3", "read-3", "exec-3"], [!0, !1, !1, !1], { display: "flex", flexDirection: "column", height: "40%", minHeight: "0" });
    let s = z("map-3", { display: "flex", flexDirection: "row", minWidth: "0" });
    m(s, "canvas", [1]);
    t.append(e), t.append(o), t.append(s);
    m(t, "div.panel", [1.5, 1.3, 4]);
    return t;
  }

  function Z() {
    let t = document.createElement("div");
    a = { border: "0px solid #f44", height: "100%", display: "flex", flexDirection: "row" };
    Object.assign(t.style, a);
    let e = C(["params-4"], { display: "flex", flexDirection: "row", minWidth: "0" });
    m(e, "textarea", [1]);
    let o = B(["wipe-4", "data-4", "read-4", "exec-4"], [!0, !1, !1, !1], { display: "flex", flexDirection: "column", height: "40%", minHeight: "0" });
    let s = z("map-4", { display: "flex", flexDirection: "row", minWidth: "0" });
    m(s, "canvas", [1]);
    t.append(e), t.append(o), t.append(s);
    m(t, "div.panel", [1.5, 1.3, 4]);
    return t;
  }

  // Fungsi Mount

  function $(t) {
    a = { marginTop: "0.5em", width: "340px", height: "125px", display: "inline-block", background: "var(--box-bg)", marginRight: "0.3em" };
    let n = I(t, a), e = G();
    n.append(e), L(e);
  }

  function ee(t) {
    a = { marginTop: "0.5em", width: "320px", height: "200px", display: "inline-block", background: "var(--box-bg)", marginRight: "0.3em" };
    let n = I(t, a), e = J();
    n.append(e), L(e);
  }

  function te(t) {
    a = { marginTop: "0.5em", width: "320px", height: "200px", display: "inline-block", background: "var(--box-bg)", marginRight: "0.3em" };
    let n = I(t, a), e = Q();
    n.append(e), L(e);
  }

  function ne(t) {
    a = { marginTop: "0.5em", width: "340px", height: "200px", display: "inline-block", background: "var(--box-bg)", marginRight: "0.3em" };
    let n = I(t, a), e = Z();
    n.append(e), L(e);
  }

  window._26cb0 = {
    mount1: t => { $(t) },
    mount2: t => { ee(t) },
    mount3: t => { te(t) },
    mount4: t => { ne(t) }
  };

  console.log("[marker] 26cb0.js loaded");
})();