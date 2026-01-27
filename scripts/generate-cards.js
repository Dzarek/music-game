import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

const FONT_REGULAR = path.resolve("fonts/Inter-Regular.ttf");
const FONT_BOLD = path.resolve("fonts/Inter-Bold.ttf");
const FONT_ITALIC = path.resolve("fonts/Inter-Italic.ttf");

const songs = JSON.parse(
  fs.readFileSync(path.resolve("data/songs.json"), "utf8"),
);

const SIZE = 300;
const QR_RATIO = 0.7;
const FRONT_BG = "#000000";
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

const qrSize = SIZE * QR_RATIO;
const qrOffset = (SIZE - qrSize) / 2;

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

async function drawCard(doc, song) {
  const url = `https://beat-track.netlify.app/card/${song.cardId}`;
  const qr = await QRCode.toDataURL(url, { margin: 0 });

  // ======================
  // ⬛ STRONA 1 – QR
  // ======================
  doc.addPage({
    size: [SIZE, SIZE],
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  // 🖤 tło karty
  doc.rect(0, 0, SIZE, SIZE).fill("#000000");

  // ⬜ białe pole pod QR (quiet zone)
  const whiteSize = qrSize + 40;
  const whiteOffset = (SIZE - whiteSize) / 2;
  const RADIUS = 16;

  doc
    .roundedRect(whiteOffset, whiteOffset, whiteSize, whiteSize, RADIUS)
    .fill("#ffffff");

  // 📱 QR
  doc.image(qr, qrOffset, qrOffset, {
    width: qrSize,
    height: qrSize,
  });

  // ======================
  // 🟥 STRONA 2 – INFO
  // ======================
  doc.addPage({
    size: [SIZE, SIZE],
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  doc.rect(0, 0, SIZE, SIZE).fill(randomColor());

  // 🎤 WYKONAWCA (góra)
  doc.fillColor("white");
  doc.font(FONT_BOLD).fontSize(20);
  doc.text(song.artist, 0, 32, { width: SIZE, align: "center" });

  // 📅 ROK (środek)
  doc.font(FONT_BOLD).fontSize(56);
  doc.text(song.year, 0, SIZE / 2 - 36, { width: SIZE, align: "center" });

  // 🎵 TYTUŁ (dół – kursywa)
  doc.font(FONT_ITALIC).fontSize(16);
  doc.text(song.title, 0, SIZE - 56, { width: SIZE, align: "center" });

  // 🔢 NUMER KARTY (prawy dół)
  doc.font(FONT_REGULAR).fontSize(9);
  doc.text(`#${song.cardId}`, SIZE - 28, SIZE - 18);

  // 🌍 PL / MIX
  const label = song.cardId <= 337 ? "PL" : "MIX";
  doc.font(FONT_BOLD).fontSize(10);
  doc.text(label, x + 6, y + SIZE - 16);
}

async function generate() {
  const doc = new PDFDocument({ autoFirstPage: false });
  doc.pipe(fs.createWriteStream("cards.pdf"));

  for (const song of songs) {
    await drawCard(doc, song);
  }

  doc.end();
  console.log("✅ cards.pdf wygenerowany");
}

generate();
