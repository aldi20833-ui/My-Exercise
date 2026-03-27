/*
 * bldc.js — Simulasi BLDC Motor (Gabungan)
 * =========================================================
 * ALGORITMA:
 *
 * 1. Medan Magnet Solenoida (Ujung Kumparan)
 *       B = (μ₀ × N × I) / (2 × L)
 *
 * 2. Gaya Lorentz pada Konduktor
 *       F = B × I × L
 *
 * 3. Torsi Motor
 *       τ = N × F × r        r = jari-jari kumparan (asumsi r = L/2π)
 *
 * 4. Kecepatan Sudut dari Torsi
 *       ω = τ / b            b = koefisien redaman (asumsi b = 0.01)
 *
 * 5. RPM dari ω
 *       RPM = (ω × 60) / (2π)
 *
 * 6. Daya Mekanik
 *       W = τ × ω
 *
 * 7. Komutasi 3-Fase 6-Langkah (untuk animasi rotor)
 *       Setiap 60° listrik, pasangan fase berganti
 * =========================================================
 */

// ─── KONSTANTA ────────────────────────────────────────────
var MU0      = 4 * Math.PI * 1e-7;  // permeabilitas vakum (T·m/A)
var REDAMAN  = 0.01;                 // koefisien redaman b (N·m·s)

// Tabel komutasi 3-fase, 6 langkah
// [faseA, faseB, faseC] : +1=positif, -1=negatif, 0=off
var KOMUTASI = [
  [ 1, -1,  0],
  [ 1,  0, -1],
  [ 0,  1, -1],
  [-1,  1,  0],
  [-1,  0,  1],
  [ 0, -1,  1]
];

// Posisi sudut 3 stator (radian): atas, kiri-bawah, kanan-bawah
var POS_STATOR = [
  -Math.PI / 2,
   Math.PI / 2 + Math.PI / 3,
   Math.PI / 2 - Math.PI / 3
];

// ─── STATE ────────────────────────────────────────────────
var motor = {
  // input
  V: 24, I: 5, N: 200, L: 0.10, f: 50, P: 4,
  // hasil hitung
  B: 0, torsi: 0, rpm: 0, omega: 0, daya: 0,
  // animasi
  berjalan : false,
  sudut    : 0,
  langkah  : 0,
  animId   : null,
  waktuLalu: 0,
  fase     : [0, 0, 0]
};

// ─── BACA INPUT dari textarea ────────────────────────────
function bacaInput() {
  var teks = document.getElementById('txtInput').value;
  var baris = teks.split('\n');
  baris.forEach(function(b) {
    b = b.replace(/\s/g, '');          // hapus spasi
    var bagian = b.split('=');
    if (bagian.length < 2) return;
    var kunci = bagian[0].toUpperCase();
    var nilai = parseFloat(bagian[1]);
    if (isNaN(nilai)) return;
    if (kunci === 'V') motor.V = nilai;
    if (kunci === 'I') motor.I = nilai;
    if (kunci === 'N') motor.N = Math.max(1, nilai);
    if (kunci === 'L') motor.L = Math.max(0.001, nilai);
    if (kunci === 'F') motor.f = Math.max(0.1, nilai);
    if (kunci === 'P') motor.P = Math.max(2, nilai);
  });
}

// ─── ALGORITMA HITUNG ────────────────────────────────────

function hitungFisika() {
  var N = motor.N;
  var I = motor.I;
  var L = motor.L;
  var f = motor.f;
  var P = motor.P;
  var V = motor.V;

  // 1. Medan Magnet (ujung solenoida)
  motor.B = (MU0 * N * Math.abs(I)) / (2 * L);

  // 2. RPM (sinkron dari frekuensi & pole)
  motor.rpm = (120 * f) / P;

  // 3. Kecepatan sudut
  motor.omega = (2 * Math.PI * motor.rpm) / 60;

  // 4. Daya listrik sederhana
  motor.daya = V * I;

  // 5. Torsi dari daya
  if (motor.omega > 0) {
    motor.torsi = motor.daya / motor.omega;
  } else {
    motor.torsi = 0;
  }
}
// function hitungFisika() {
//   var N = motor.N;
//   var I = motor.I;
//   var L = motor.L;

//   // 1. Medan Magnet — rumus ujung solenoida
//   motor.B = (MU0 * N * Math.abs(I)) / (2 * L);

//   // 2. Gaya Lorentz: F = B × I × L
//   var F = motor.B * Math.abs(I) * L;

//   // 3. Jari-jari kumparan (estimasi dari panjang L)
//   var r = L / (2 * Math.PI);

//   // 4. Torsi: τ = N × F × r
//   motor.torsi = N * F * r;

//   // 5. Kecepatan sudut: ω = τ / b  (b = koefisien redaman)
//   motor.omega = motor.torsi / REDAMAN;

//   // 6. RPM dari ω
//   motor.rpm = (motor.omega * 60) / (2 * Math.PI);

//   // 7. Daya mekanik: W = τ × ω
//   motor.daya = motor.torsi * motor.omega;
// }

// ─── TAMPILKAN OUTPUT ke textarea ────────────────────────
function tampilOutput() {
  var H   = motor.B / MU0;
  var Phi = motor.B * Math.PI * Math.pow(motor.L / (2 * Math.PI), 2) * 1e6; // µWb

  var teks =
    '\n' +
    '-- Input yang Dibaca --\n' +
    'V  = ' + motor.V.toFixed(2)  + ' Volt\n' +
    'I  = ' + motor.I.toFixed(2)  + ' Ampere\n' +
    'N  = ' + motor.N             + ' lilitan\n' +
    'L  = ' + motor.L.toFixed(3)  + ' meter\n' +
    'f  = ' + motor.f.toFixed(1)  + ' Hz\n' +
    'P  = ' + motor.P             + ' pole\n' +
    '\n' +
    '-- Output Utama --\n' +
    'B   = ' + motor.B.toFixed(6)     + ' T\n' +
    'B   = ' + (motor.B*1000).toFixed(4) + ' mT\n' +
    '\n' +
    'Torsi = ' + motor.torsi.toFixed(5) + ' N·m\n' +
    'Omega = ' + motor.omega.toFixed(2) + ' rad/s\n' +
    'RPM   = ' + motor.rpm.toFixed(1)   + ' RPM\n' +
    'Daya  = ' + motor.daya.toFixed(3)  + ' Watt\n' ;

  document.getElementById('txtOutput').value = teks;
}

// ─── TOMBOL HITUNG ───────────────────────────────────────
function hitung() {
  bacaInput();
  hitungFisika();
  tampilOutput();
  gambarKanvas1();
  gambarKanvas2();
}

// ─── TOMBOL JALANKAN ─────────────────────────────────────
function jalankan() {
  bacaInput();
  hitungFisika();
  tampilOutput();
  motor.berjalan  = true;
  motor.waktuLalu = performance.now();
  if (motor.animId) cancelAnimationFrame(motor.animId);
  loopAnimasi(performance.now());
}

// ─── TOMBOL STOP ─────────────────────────────────────────
function hentikan() {
  motor.berjalan = false;
  if (motor.animId) cancelAnimationFrame(motor.animId);
  motor.animId = null;
}

// ─── LOOP ANIMASI ────────────────────────────────────────
function loopAnimasi(waktu) {
  var dt = Math.min((waktu - motor.waktuLalu) / 1000, 0.05); // maks 50ms
  motor.waktuLalu = waktu;

  if (motor.berjalan) {
    // Update sudut rotor: θ += ω × dt
    motor.sudut += motor.omega * dt;

    // Sudut listrik = sudut mekanik × (P/2)
    var sudutListrik = motor.sudut * (motor.P / 2);
    // Langkah komutasi: 0-5 tiap 60°
    var langkah = Math.floor(((sudutListrik % (2 * Math.PI)) / (2 * Math.PI)) * 6);
    motor.langkah = Math.max(0, Math.min(5, langkah));
    motor.fase    = KOMUTASI[motor.langkah];

    gambarKanvas1();
    gambarKanvas2();
    motor.animId = requestAnimationFrame(loopAnimasi);
  }
}

// ═══════════════════════════════════════════════════════════
//  CANVAS 1 — SOLENOIDA & ARAH MEDAN B
// ═══════════════════════════════════════════════════════════
function gambarKanvas1() {
  var c   = document.getElementById('kanvas1');
  c.width = c.offsetWidth;
  var W = c.width, H = c.height;
  var ctx = c.getContext('2d');

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);

  var N  = motor.N;
  var I  = motor.I;
  var cx = W / 2, cy = H / 2;
  var panjangKoil = W * 0.65;
  var tinggiKoil  = H * 0.38;
  var x0 = cx - panjangKoil / 2;
  var x1 = cx + panjangKoil / 2;

  // Jumlah lingkaran lilitan yang digambar (batas tampilan)
  var jLingkaran = Math.min(Math.floor(N / 8) + 5, 30);
  var lebar1     = panjangKoil / jLingkaran;

  // ── Inti besi ──
  ctx.fillStyle = '#bbb';
  ctx.fillRect(x0, cy - tinggiKoil * 0.12, panjangKoil, tinggiKoil * 0.24);

  // ── Garis sumbu (putus-putus) ──
  ctx.setLineDash([5, 6]);
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(x0 - 30, cy);
  ctx.lineTo(x1 + 30, cy);
  ctx.stroke();
  ctx.setLineDash([]);

  // ── Lilitan (ellips) ──
  var warnaDepan  = I >= 0 ? '#1565c0' : '#b71c1c';
  var warnaBlkg   = I >= 0 ? '#90caf9' : '#ef9a9a';

  for (var i = 0; i < jLingkaran; i++) {
    var tx = x0 + (i + 0.5) * lebar1;

    // Bagian belakang
    ctx.beginPath();
    ctx.ellipse(tx, cy, lebar1 * 0.44, tinggiKoil / 2, 0, Math.PI, 2 * Math.PI);
    ctx.strokeStyle = warnaBlkg;
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    // Bagian depan
    ctx.beginPath();
    ctx.ellipse(tx, cy, lebar1 * 0.44, tinggiKoil / 2, 0, 0, Math.PI);
    ctx.strokeStyle = warnaDepan;
    ctx.lineWidth   = 2;
    ctx.stroke();
  }

  // ── Panah arus pada lilitan ──
  if (Math.abs(I) > 0.001) {
    var jPanah = Math.min(jLingkaran, 7);
    var step   = jLingkaran / jPanah;
    for (var k = 0; k < jPanah; k++) {
      var idx  = Math.floor(k * step + step / 2);
      var tx2  = x0 + (idx + 0.5) * lebar1;
      var yAtas = cy - tinggiKoil / 2 - 5;
      var yBwh  = cy + tinggiKoil / 2 + 5;
      if (I > 0) {
        // atas ke kanan, bawah ke kiri
        panah(ctx, tx2-5, yAtas, tx2+5, yAtas, '#388e3c', 1.5);
        panah(ctx, tx2+5, yBwh,  tx2-5, yBwh,  '#c62828', 1.5);
      } else {
        panah(ctx, tx2+5, yAtas, tx2-5, yAtas, '#c62828', 1.5);
        panah(ctx, tx2-5, yBwh,  tx2+5, yBwh,  '#388e3c', 1.5);
      }
    }
  }

  // ── Panah medan B di dalam (kuning-oranye) ──
  if (Math.abs(I) > 0.001) {
    var arahB = I > 0 ? 1 : -1;
    for (var baris = 0; baris < 2; baris++) {
      var fy = cy + (baris - 0.5) * tinggiKoil * 0.28;
      for (var kol = 0; kol < 4; kol++) {
        var fx = x0 + 18 + kol * (panjangKoil - 36) / 3;
        panah(ctx, fx, fy, fx + arahB * 22, fy, '#e65100', 2);
      }
    }
  }

  // ── Label N / S ──
  if (Math.abs(I) > 0.001) {
    ctx.font      = 'bold 15px Arial';
    ctx.textAlign = 'center';
    if (I > 0) {
      ctx.fillStyle = '#1565c0'; ctx.fillText('N', x1 + 14, cy + 5);
      ctx.fillStyle = '#b71c1c'; ctx.fillText('S', x0 - 14, cy + 5);
    } else {
      ctx.fillStyle = '#1565c0'; ctx.fillText('N', x0 - 14, cy + 5);
      ctx.fillStyle = '#b71c1c'; ctx.fillText('S', x1 + 14, cy + 5);
    }
    ctx.textAlign = 'left';
  }

  // ── Info teks ──
  ctx.font      = '11px Arial';
  ctx.fillStyle = '#555';
  ctx.textAlign = 'left';
  ctx.fillText('N=' + N, x0, H - 6);
  ctx.textAlign = 'center';
  ctx.fillText('L=' + motor.L.toFixed(2) + 'm', cx, H - 6);
  ctx.textAlign = 'right';
  ctx.fillStyle = I >= 0 ? '#388e3c' : '#c62828';
  ctx.fillText('I=' + (I >= 0 ? '+' : '') + I.toFixed(1) + 'A', x1, H - 6);
  ctx.textAlign = 'left';

  // ── B value ──
  ctx.fillStyle = '#333';
  ctx.font      = '11px Arial';
  ctx.fillText('B = ' + motor.B.toFixed(5) + ' T', 8, 16);
  if (motor.berjalan) {
    ctx.fillStyle = '#1565c0';
    ctx.fillText('RPM = ' + motor.rpm.toFixed(0), 8, 30);
  }
}

// ═══════════════════════════════════════════════════════════
//  CANVAS 2 — ROTOR & STATOR (Gaya Tarik-Tolak)
// ═══════════════════════════════════════════════════════════
function gambarKanvas2() {
  var c   = document.getElementById('kanvas2');
  c.width = c.offsetWidth;
  var W = c.width, H = c.height;
  var ctx = c.getContext('2d');

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);

  var cx = W / 2, cy = H / 2;
  var R  = Math.min(W, H) * 0.40;  // jari-jari stator
  var rRotor = R * 0.48;           // jari-jari rotor

  var sudut  = motor.sudut;
  var poles  = motor.P;
  var fase   = motor.berjalan ? motor.fase : [0, 0, 0];

  // ── Cincin stator luar ──
  ctx.beginPath();
  ctx.arc(cx, cy, R + R * 0.12, 0, 2 * Math.PI);
  ctx.strokeStyle = '#888';
  ctx.lineWidth   = R * 0.10;
  ctx.stroke();

  // ── 3 Stator ──
  for (var s = 0; s < 3; s++) {
    gambarStator(ctx, cx, cy, R, POS_STATOR[s], fase[s], ['A','B','C'][s]);
  }

  // ── Rotor ──
  gambarRotor(ctx, cx, cy, rRotor, sudut, poles);

  // ── Gaya tarik-tolak (hanya saat running) ──
  if (motor.berjalan) {
    gambarGaya(ctx, cx, cy, R, rRotor, sudut, poles, fase);
  }

  // ── Poros tengah ──
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.07, 0, 2 * Math.PI);
  ctx.fillStyle   = '#888';
  ctx.fill();
  ctx.strokeStyle = '#555';
  ctx.lineWidth   = 1;
  ctx.stroke();

  // ── Info di tengah ──
  if (motor.berjalan) {
    ctx.font      = 'bold ' + Math.round(R * 0.09) + 'px Arial';
    ctx.fillStyle = '#1565c0';
    ctx.textAlign = 'center';
    ctx.fillText(motor.rpm.toFixed(0) + ' RPM', cx, cy + R * 0.03);
    ctx.font      = Math.round(R * 0.055) + 'px Arial';
    ctx.fillStyle = '#555';
    ctx.fillText('τ=' + motor.torsi.toFixed(4) + ' N·m', cx, cy + R * 0.11);
    ctx.textAlign = 'left';
  }

  // ── Besaran Vektor ──
  var lx = 8, ly = H - 46;
  ctx.font      = '10px Arial';
  ctx.fillStyle = '#333';
  ctx.fillText('Besaran Vektor:', lx, ly);
  ly += 13;
  ctx.fillStyle = '#388e3c';
  ctx.fillText('── TARIK (kutub berbeda)', lx, ly);
  ly += 13;
  ctx.fillStyle = '#c62828';
  ctx.fillText('- - TOLAK (kutub sama)', lx, ly);
  ly += 13;
  ctx.fillStyle = '#030303';
  ctx.fillText('→  Arah Medan B', lx, ly);
}

// ─── GAMBAR STATOR ────────────────────────────────────────
function gambarStator(ctx, cx, cy, R, sudutPos, nilaiF, label) {
  var jarak  = R * 0.78;
  var sx     = cx + jarak * Math.cos(sudutPos);
  var sy     = cy + jarak * Math.sin(sudutPos);
  var lebar  = R * 0.17;
  var tinggi = R * 0.26;

  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(sudutPos + Math.PI / 2);

  // Warna badan stator
  if (nilaiF === 1)       ctx.fillStyle = '#ffe0b2';  // oranye muda = positif
  else if (nilaiF === -1) ctx.fillStyle = '#e1bee7';  // ungu muda = negatif
  else                    ctx.fillStyle = '#e0e0e0';  // abu = off

  ctx.strokeStyle = '#555';
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.rect(-lebar/2, -tinggi/2, lebar, tinggi);
  ctx.fill();
  ctx.stroke();

  // Garis lilitan kawat
  ctx.strokeStyle = '#888';
  ctx.lineWidth   = 0.8;
  var jL = 5;
  for (var i = 0; i < jL; i++) {
    var y = -tinggi/2 + (tinggi / (jL + 1)) * (i + 1);
    ctx.beginPath();
    ctx.moveTo(-lebar/2 + 3, y);
    ctx.lineTo( lebar/2 - 3, y);
    ctx.stroke();
  }

  // Panah arus di stator
  if (nilaiF !== 0) {
    var dir = nilaiF === 1 ? 1 : -1;
    panah(ctx, 0, tinggi*0.18*dir, 0, -tinggi*0.18*dir, '#333', 1.5);
  }

  // Label A/B/C
  ctx.font      = 'bold 11px Arial';
  ctx.fillStyle = '#222';
  ctx.textAlign = 'center';
  ctx.fillText(label, 0, -tinggi/2 - 4);

  ctx.restore();
}

// ─── GAMBAR ROTOR ────────────────────────────────────────
function gambarRotor(ctx, cx, cy, rRotor, sudut, poles) {
  for (var p = 0; p < poles; p++) {
    var sudutMulai  = sudut + (p / poles) * 2 * Math.PI;
    var sudutAkhir  = sudut + ((p + 1) / poles) * 2 * Math.PI;
    var sudutTengah = (sudutMulai + sudutAkhir) / 2;
    var isNorth     = (p % 2 === 0);

    // Warna: N = merah muda, S = biru muda (basic, tidak terlalu gelap)
    ctx.fillStyle = isNorth ? '#ffcdd2' : '#bbdefb';
    ctx.strokeStyle = '#555';
    ctx.lineWidth   = 1;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, rRotor, sudutMulai, sudutAkhir);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Label N / S
    var lx = cx + rRotor * 0.62 * Math.cos(sudutTengah);
    var ly = cy + rRotor * 0.62 * Math.sin(sudutTengah);
    ctx.font         = 'bold ' + Math.round(rRotor * 0.22) + 'px Arial';
    ctx.fillStyle    = isNorth ? '#c62828' : '#1565c0';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isNorth ? 'N' : 'S', lx, ly);
    ctx.textBaseline = 'alphabetic';
  }

  // Cincin dalam rotor
  ctx.beginPath();
  ctx.arc(cx, cy, rRotor * 0.25, 0, 2 * Math.PI);
  ctx.fillStyle = '#bdbdbd';
  ctx.fill();
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textAlign = 'left';
}

// ─── GAMBAR GAYA TARIK-TOLAK ──────────────────────────────
function gambarGaya(ctx, cx, cy, R, rRotor, sudutRotor, poles, fase) {
  for (var s = 0; s < 3; s++) {
    if (fase[s] === 0) continue;

    var posS = POS_STATOR[s];
    // Permukaan dalam stator
    var sx = cx + R * 0.60 * Math.cos(posS);
    var sy = cy + R * 0.60 * Math.sin(posS);

    // Cari kutub rotor terdekat ke stator ini
    var kutub = kutubTerdekat(sudutRotor, poles, posS);
    var sudutK = sudutRotor + (kutub.idx / poles) * 2 * Math.PI + (1 / poles) * Math.PI;
    var rx = cx + rRotor * 0.75 * Math.cos(sudutK);
    var ry = cy + rRotor * 0.75 * Math.sin(sudutK);

    // Logika tarik/tolak:
    // Stator + → medan masuk → tarik S rotor, tolak N rotor
    // Stator - → medan keluar → tarik N rotor, tolak S rotor
    var adaTarik = (fase[s] === 1 && !kutub.isNorth) ||
                   (fase[s] === -1 &&  kutub.isNorth);

    var warna = adaTarik ? '#388e3c' : '#c62828';

    // Garis gaya
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(rx, ry);
    ctx.strokeStyle = warna;
    ctx.lineWidth   = 1.5;
    ctx.setLineDash(adaTarik ? [] : [5, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Panah di tengah garis
    var mx = (sx + rx) / 2;
    var my = (sy + ry) / 2;
    if (adaTarik) {
      panah(ctx, mx, my, rx, ry, warna, 2);
    } else {
      panah(ctx, mx, my, sx + (sx - rx) * 0.12, sy + (sy - ry) * 0.12, warna, 2);
    }

    // Teks TARIK / TOLAK
    ctx.font      = '9px Arial';
    ctx.fillStyle = warna;
    ctx.textAlign = 'center';
    ctx.fillText(adaTarik ? 'TARIK' : 'TOLAK',
      (sx * 0.45 + rx * 0.55), (sy * 0.45 + ry * 0.55) - 6);
    ctx.textAlign = 'left';

    // Panah arah B (oranye) dari stator
    var aX = Math.cos(posS);
    var aY = Math.sin(posS);
    var pjgB = R * 0.12;
    if (fase[s] === 1) {
      panah(ctx, sx - aX*pjgB*0.4, sy - aY*pjgB*0.4,
                 sx + aX*pjgB,     sy + aY*pjgB, '#e65100', 1.5);
    } else {
      panah(ctx, sx + aX*pjgB*0.4, sy + aY*pjgB*0.4,
                 sx - aX*pjgB,     sy - aY*pjgB, '#e65100', 1.5);
    }
  }
}

// ─── CARI KUTUB ROTOR TERDEKAT ────────────────────────────
function kutubTerdekat(sudutRotor, poles, posStator) {
  var minDist = Infinity;
  var hasil   = { idx: 0, isNorth: true };
  for (var p = 0; p < poles; p++) {
    var sudutTengah = sudutRotor + (p / poles) * 2 * Math.PI + (1 / poles) * Math.PI;
    var diff = sudutTengah - posStator;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff)); // normalisasi -π..π
    if (Math.abs(diff) < minDist) {
      minDist       = Math.abs(diff);
      hasil.idx     = p;
      hasil.isNorth = (p % 2 === 0);
    }
  }
  return hasil;
}

// ─── HELPER: Gambar Panah ────────────────────────────────
function panah(ctx, x1, y1, x2, y2, warna, lw) {
  var pjg = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
  if (pjg < 2) return;
  var a = Math.atan2(y2-y1, x2-x1);
  var h = Math.min(pjg * 0.5, 7);

  ctx.strokeStyle = warna;
  ctx.lineWidth   = lw;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.fillStyle = warna;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - h*Math.cos(a-0.45), y2 - h*Math.sin(a-0.45));
  ctx.lineTo(x2 - h*Math.cos(a+0.45), y2 - h*Math.sin(a+0.45));
  ctx.closePath();
  ctx.fill();
}

// ─── INIT ─────────────────────────────────────────────────
window.onload  = function() { hitung(); };
window.onresize = function() { gambarKanvas1(); gambarKanvas2(); };
