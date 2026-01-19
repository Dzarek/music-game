import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

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
const REDS = ["#5a0000", "#7a0000", "#9a0000", "#b00000"];

function randomRed() {
  return REDS[Math.floor(Math.random() * REDS.length)];
}

// ===== RYSOWANIE KARTY =====
async function drawCardAt(doc, song, x, y, size) {
  const qrSize = size * 0.7;
  const qrOffset = (size - qrSize) / 2;
  const whiteSize = qrSize + size * 0.12;
  const whiteOffset = (size - whiteSize) / 2;

  const url = `https://music-game-dzarek.netlify.app/card/${song.cardId}`;
  const qr = await QRCode.toDataURL(url, { margin: 0 });

  // ⬛ tło karty
  doc.rect(x, y, size, size).fill("#000");

  // ⬜ białe pole (zaokrąglone)
  doc
    .roundedRect(x + whiteOffset, y + whiteOffset, whiteSize, whiteSize, 12)
    .fill("#fff");

  // 📱 QR
  doc.image(qr, x + qrOffset, y + qrOffset, {
    width: qrSize,
    height: qrSize,
  });
}

// ===== STRONA A4 (9 KART) =====
async function drawPage(doc, cards) {
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

      await drawCardAt(doc, cards[i], x, y, CARD_SIZE);

      // ✂️ linie cięcia
      doc.strokeColor("#777").lineWidth(0.5);

      doc
        .moveTo(x, y - 6)
        .lineTo(x, y)
        .stroke();
      doc
        .moveTo(x + CARD_SIZE, y - 6)
        .lineTo(x + CARD_SIZE, y)
        .stroke();

      doc
        .moveTo(x - 6, y)
        .lineTo(x, y)
        .stroke();

      i++;
    }
  }
}

// ===== GENEROWANIE =====
async function generate() {
  const doc = new PDFDocument({ autoFirstPage: false });
  doc.pipe(fs.createWriteStream("cards-a4.pdf"));

  for (let i = 0; i < songs.length; i += 9) {
    await drawPage(doc, songs.slice(i, i + 9));
  }

  doc.end();
  console.log("✅ cards-a4.pdf wygenerowany (9 kart / strona)");
}

generate();
