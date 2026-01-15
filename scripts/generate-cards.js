import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

// Wczytaj JSON dynamicznie
const dataPath = path.resolve("./data/songs.json");
const songs = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

const CARD_WIDTH = 250;
const CARD_HEIGHT = 350;
const MARGIN = 40;

async function generateCard(doc, song) {
  // 1️⃣ QR Code (strona 1)
  const qrData = `http://localhost:3000/card/${song.cardId}`;
  const qrImage = await QRCode.toDataURL(qrData);

  doc.addPage({ size: [CARD_WIDTH, CARD_HEIGHT] });
  doc.image(qrImage, 20, 20, {
    width: CARD_WIDTH - 40,
    height: CARD_WIDTH - 40,
  });

  // 2️⃣ Rewers (strona 2)
  doc.addPage({ size: [CARD_WIDTH, CARD_HEIGHT] });
  doc.fontSize(18).text(`Tytuł: ${song.title}`, MARGIN, 50);
  doc.fontSize(16).text(`Wykonawca: ${song.artist}`, MARGIN, 100);
  doc.fontSize(16).text(`Rok: ${song.year}`, MARGIN, 150);
}

async function generatePDF() {
  const doc = new PDFDocument({ autoFirstPage: false });
  doc.pipe(fs.createWriteStream("cards.pdf"));

  for (const song of songs) {
    await generateCard(doc, song);
  }

  doc.end();
  console.log("✅ Wygenerowano cards.pdf");
}

generatePDF();
