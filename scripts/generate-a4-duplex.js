import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

// ===== DANE =====
const songs = JSON.parse(
  fs.readFileSync(path.resolve("data/songs-pl.json"), "utf8"),
);

// ===== FONTY =====
const FONT_REGULAR = path.resolve("fonts/Inter-Regular.ttf");
const FONT_BOLD = path.resolve("fonts/Inter-Bold.ttf");
const FONT_YEAR = path.resolve("fonts/Audiowide-Regular.ttf");
const FONT_ITALIC = path.resolve("fonts/Inter-Italic.ttf");

// ===== A4 =====
const A4_WIDTH = 595;
const A4_HEIGHT = 842;

const COLS = 3;
const ROWS = 3;
const CARD_SIZE = 180;
const GAP = 12;

const START_X = (A4_WIDTH - (COLS * CARD_SIZE + (COLS - 1) * GAP)) / 2;
const START_Y = (A4_HEIGHT - (ROWS * CARD_SIZE + (ROWS - 1) * GAP)) / 2;

// ===== KOLORY (czytelne pod biały tekst) =====
const COLORS = [
  "#8B0000",
  "#B22222",
  "#C0392B",
  "#D35400",
  "#E67E22",
  "#F39C12",
  "#16A085",
  "#1ABC9C",
  "#27AE60",
  "#2ECC71",
  "#2980B9",
  "#3498DB",
  "#5DADE2",
  "#6C3483",
  "#8E44AD",
  "#AF7AC5",
];

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

// ===== FRONT (QR + gradient + napis) =====
async function drawFrontAt(doc, song, x, y, size) {
  const qrSize = size * 0.7 * 0.75; // zmniejszony o ~15%
  const qrOffset = (size - qrSize) / 2;
  const whiteSize = qrSize + size * 0.11;
  const whiteOffset = (size - whiteSize) / 2;

  const url = `https://beat-track.netlify.app/card/${song.cardId}`;
  const qr = await QRCode.toDataURL(url, { margin: 0 });

  // 🔴 Gradient tła (czarny -> ciemnoczerwony)
  const gradient = doc
    .linearGradient(x, y, x, y + size)
    .stop(0, "#000000")
    .stop(0.7, "#0a0000")
    .stop(1, "#3a0000");
  doc.rect(x, y, size, size).fill(gradient);

  // ⬜ Pole na QR
  doc
    .roundedRect(x + whiteOffset, y + whiteOffset, whiteSize, whiteSize, 12)
    .fill("#fff");

  // 📱 QR
  doc.image(qr, x + qrOffset, y + qrOffset, {
    width: qrSize,
    height: qrSize,
  });

  // ✍️ Napis Beat Track
  doc.fillColor("white").opacity(0.5).font(FONT_YEAR).fontSize(8);
  doc.text("BEAT TRACK", x, y + size - 16, { width: size, align: "center" });
  doc.opacity(1); // reset opacity
}

// ===== BACK =====
function drawBackAt(doc, song, x, y, size) {
  // 🔴 Tło — bez szarości
  const baseColor = randomColor();
  // tło bazowe
  doc.rect(x, y, size, size).fill(baseColor);

  // gradient czarny (bez alpha!)
  const gradient = doc
    .linearGradient(x, y, x, y + size)
    .stop(0, "#000000")
    .stop(0.6, "#000000")
    .stop(1, "#000000");

  // overlay z opacity
  doc.save();
  doc.opacity(0.45);
  doc.rect(x, y, size, size).fill(gradient);
  doc.restore();
  doc.fillColor("white");

  // 🎤 Wykonawca 10px niżej
  doc.font(FONT_BOLD).fontSize(14);
  doc.text(song.artist, x, y + 20, { width: size, align: "center" });

  // 📅 Rok
  doc.font(FONT_YEAR).fontSize(36);
  doc.text(song.year, x, y + size / 2 - 28, { width: size, align: "center" });

  // 🎵 Tytuł 10px wyżej
  doc.font(FONT_ITALIC).fontSize(12);
  doc.text(song.title, x + 12, y + size - 55, {
    width: size - 24,
    align: "center",
  });

  // 🔢 Numer karty
  doc.font(FONT_REGULAR).fontSize(8);
  doc.text(`#${song.cardId}`, x + size - 24, y + size - 16);

  // 🌍 PL / MIX
  const label = song.cardId <= 337 ? "PL" : "MIX";
  doc.font(FONT_BOLD).fontSize(10);
  doc.text(label, x + 6, y + size - 16);

  // ✍️ Napis Beat Track na dole
  doc.fillColor("white").opacity(0.5).font(FONT_YEAR).fontSize(8);
  doc.text("BEAT TRACK", x, y + size - 16, { width: size, align: "center" });
  doc.opacity(1);
}

// ===== LINIE CIĘCIA =====
function drawCutLines(doc, x, y, size) {
  doc.strokeColor("#777").lineWidth(0.5);
  doc
    .moveTo(x, y - 6)
    .lineTo(x, y)
    .stroke();
  doc
    .moveTo(x + size, y - 6)
    .lineTo(x + size, y)
    .stroke();
  doc
    .moveTo(x - 6, y)
    .lineTo(x, y)
    .stroke();
}

// ===== STRONY =====
async function drawFrontPage(doc, cards) {
  doc.addPage({
    size: [A4_WIDTH, A4_HEIGHT],
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
  });
  let i = 0;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (!cards[i]) return;
      const x = START_X + col * (CARD_SIZE + GAP);
      const y = START_Y + row * (CARD_SIZE + GAP);
      await drawFrontAt(doc, cards[i], x, y, CARD_SIZE);
      drawCutLines(doc, x, y, CARD_SIZE);
      i++;
    }
  }
}

function drawBackPage(doc, cards) {
  doc.addPage({
    size: [A4_WIDTH, A4_HEIGHT],
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
  });
  let i = 0;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (!cards[i]) return;
      const reversedCol = COLS - 1 - col; // odbicie lustrzane
      const x = START_X + reversedCol * (CARD_SIZE + GAP);
      const y = START_Y + row * (CARD_SIZE + GAP);
      drawBackAt(doc, cards[i], x, y, CARD_SIZE);
      drawCutLines(doc, x, y, CARD_SIZE);
      i++;
    }
  }
}

// ===== GENEROWANIE DUPLEX =====
async function generate() {
  const doc = new PDFDocument({ autoFirstPage: false });
  doc.pipe(fs.createWriteStream("cards-a4-duplex.pdf"));

  doc.registerFont("reg", FONT_REGULAR);
  doc.registerFont("bold", FONT_BOLD);
  doc.registerFont("italic", FONT_ITALIC);

  for (let i = 0; i < songs.length; i += 9) {
    const batch = songs.slice(i, i + 9);
    await drawFrontPage(doc, batch);
    drawBackPage(doc, batch);
  }

  doc.end();
  console.log("✅ cards-a4-duplex.pdf gotowy (nowy design)");
}

generate();
