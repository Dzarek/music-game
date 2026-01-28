import fs from "fs";

const inputPath = "data/songs-pl.seed.json";
const uniquePath = "data/songs-pl.unique.json";
const duplicatesPath = "data/songs.duplicates.json";

const songs = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const seen = new Set();
const uniqueSongs = [];
const duplicateSongs = [];

for (const song of songs) {
  const key = `${song.title.toLowerCase()}|${song.artist.toLowerCase()}`;

  if (seen.has(key)) {
    duplicateSongs.push(song);
  } else {
    seen.add(key);
    uniqueSongs.push(song);
  }
}

// 2️⃣ sortowanie po wykonawcy
uniqueSongs.sort((a, b) =>
  a.artist.localeCompare(b.artist, "pl", { sensitivity: "base" }),
);

console.log(`📥 Wszystkie: ${songs.length}`);
console.log(`✅ Unikalne: ${uniqueSongs.length}`);
console.log(`🗑️ Duplikaty: ${duplicateSongs.length}`);

uniqueSongs.forEach((song, index) => {
  song.cardId = index + 1;
});

fs.writeFileSync(uniquePath, JSON.stringify(uniqueSongs, null, 2), "utf8");
fs.writeFileSync(
  duplicatesPath,
  JSON.stringify(duplicateSongs, null, 2),
  "utf8",
);

console.log(" - songs.unique.json");
console.log(" - songs.duplicates.json");
