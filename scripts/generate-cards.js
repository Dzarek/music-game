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
const REDS = ["#5a0000", "#7a0000", "#9a0000", "#b00000"];

const qrSize = SIZE * QR_RATIO;
const qrOffset = (SIZE - qrSize) / 2;

function randomRed() {
  return REDS[Math.floor(Math.random() * REDS.length)];
}

async function drawCard(doc, song) {
  const url = `https://music-game-dzarek.netlify.app/card/${song.cardId}`;
  const qr = await QRCode.toDataURL(url, { margin: 0 });

  // ======================
  // ⬛ STRONA 1 – QR
  // ======================
  doc.addPage({
    size: [SIZE, SIZE],
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  doc.rect(0, 0, SIZE, SIZE).fill(FRONT_BG);

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

  doc.rect(0, 0, SIZE, SIZE).fill(randomRed());

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
