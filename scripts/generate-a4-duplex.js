import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

// ===== DANE =====
const songs = JSON.parse(
  fs.readFileSync(path.resolve("data/songs.json"), "utf8"),
);

// ===== FONTY =====
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
const randomRed = () => REDS[Math.floor(Math.random() * REDS.length)];

// ===== FRONT (QR) =====
async function drawFrontAt(doc, song, x, y, size) {
  const qrSize = size * 0.7;
  const qrOffset = (size - qrSize) / 2;
  const whiteSize = qrSize + size * 0.12;
  const whiteOffset = (size - whiteSize) / 2;

  const url = `https://music-game-dzarek.netlify.app/card/${song.cardId}`;
  const qr = await QRCode.toDataURL(url, { margin: 0 });

  doc.rect(x, y, size, size).fill("#000");

  doc
    .roundedRect(x + whiteOffset, y + whiteOffset, whiteSize, whiteSize, 12)
    .fill("#fff");

  doc.image(qr, x + qrOffset, y + qrOffset, {
    width: qrSize,
    height: qrSize,
  });
}

// ===== BACK =====
function drawBackAt(doc, song, x, y, size) {
  doc.rect(x, y, size, size).fill(randomRed());
  doc.fillColor("white");

  doc.font(FONT_BOLD).fontSize(14);
  doc.text(song.artist, x, y + 16, { width: size, align: "center" });

  doc.font(FONT_BOLD).fontSize(40);
  doc.text(song.year, x, y + size / 2 - 28, {
    width: size,
    align: "center",
  });

  doc.font(FONT_ITALIC).fontSize(12);
  doc.text(song.title, x + 12, y + size - 44, {
    width: size - 24,
    align: "center",
  });

  doc.font(FONT_REGULAR).fontSize(8);
  doc.text(`#${song.cardId}`, x + size - 24, y + size - 16);
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

// ===== STRONA FRONT =====
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

// ===== STRONA BACK =====
function drawBackPage(doc, cards) {
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
  console.log("✅ cards-a4-duplex.pdf gotowy (druk dwustronny)");
}

generate();
