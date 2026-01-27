import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

// ===== DANE =====
const songs = JSON.parse(
  fs.readFileSync(path.resolve("data/songs.json"), "utf8"),
);

// ===== FONTY (UNICODE / PL) =====
const FONT_REGULAR = path.resolve("fonts/Inter-Regular.ttf");
const FONT_BOLD = path.resolve("fonts/Inter-Bold.ttf");
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

// ===== KOLORY =====
const COLORS = [
  "#8B0000", // dark red
  "#B22222", // firebrick
  "#C0392B", // red
  "#D35400", // orange
  "#E67E22", // carrot
  "#F39C12", // orange yellow

  "#16A085", // teal
  "#1ABC9C", // turquoise
  "#27AE60", // green
  "#2ECC71", // light green

  "#2980B9", // blue
  "#3498DB", // light blue
  "#5DADE2", // sky blue

  "#6C3483", // purple
  "#8E44AD", // amethyst
  "#AF7AC5", // light purple

  "#7F8C8D", // gray
  "#95A5A6", // light gray
];

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}
// ===== RYSOWANIE REWERSU =====
function drawBackAt(doc, song, x, y, size) {
  // 🟥 tło
  doc.rect(x, y, size, size).fill(randomColor());

  doc.fillColor("white");

  // 🎤 WYKONAWCA
  doc.font(FONT_BOLD).fontSize(14);
  doc.text(song.artist, x, y + 16, {
    width: size,
    align: "center",
  });

  // 📅 ROK
  doc.font(FONT_BOLD).fontSize(40);
  doc.text(song.year, x, y + size / 2 - 28, {
    width: size,
    align: "center",
  });

  // 🎵 TYTUŁ
  doc.font(FONT_ITALIC).fontSize(12);
  doc.text(song.title, x + 12, y + size - 44, {
    width: size - 24,
    align: "center",
  });

  // 🔢 NUMER KARTY
  doc.font(FONT_REGULAR).fontSize(8);
  doc.text(`#${song.cardId}`, x + size - 24, y + size - 16);

  // 🌍 PL / MIX
  const label = song.cardId <= 337 ? "PL" : "MIX";
  doc.font(FONT_BOLD).fontSize(10);
  doc.text(label, x + 6, y + size - 16);
}

// ===== STRONA A4 =====
function drawPage(doc, cards) {
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

      drawBackAt(doc, cards[i], x, y, CARD_SIZE);

      // ✂️ linie cięcia
      doc.strokeColor("#777").lineWidth(0.5);
      doc
        .moveTo(x, y - 6)
        .lineTo(x, y)
        .stroke();
      doc
        .moveTo(x - 6, y)
        .lineTo(x, y)
        .stroke();
      doc
        .moveTo(x + CARD_SIZE, y - 6)
        .lineTo(x + CARD_SIZE, y)
        .stroke();

      i++;
    }
  }
}

// ===== GENEROWANIE =====
function generate() {
  const doc = new PDFDocument({ autoFirstPage: false });
  doc.pipe(fs.createWriteStream("cards-a4-back.pdf"));

  for (let i = 0; i < songs.length; i += 9) {
    drawPage(doc, songs.slice(i, i + 9));
  }

  doc.end();
  console.log("✅ cards-a4-back.pdf wygenerowany (rewers)");
}

generate();
