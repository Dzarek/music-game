import fs from "fs";

// ścieżki plików
const SONGS_FILE = "./download-music/songs-pl.json";
const PLAYLIST_FILE = "./download-music/spotify.json";
const OUTPUT_FILE = "./songs_merged.json";

// wczytanie danych
const songs = JSON.parse(fs.readFileSync(SONGS_FILE, "utf-8"));
const playlist = JSON.parse(fs.readFileSync(PLAYLIST_FILE, "utf-8"));

// walidacja
if (!Array.isArray(songs)) {
  throw new Error("songs.json musi być tablicą");
}
if (!playlist.items || !Array.isArray(playlist.items)) {
  throw new Error("playlist.json musi mieć strukturę { items: [] }");
}

const minLength = Math.min(songs.length, playlist.items.length);

console.log(`🔗 Łączenie ${minLength} rekordów...`);

for (let i = 0; i < minLength; i++) {
  const trackId = playlist.items[i]?.track?.id || "";
  songs[i].spotifyTrackId = trackId;
}

// zapis wyniku
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(songs, null, 2), "utf-8");

console.log(`✅ Gotowe! Zapisano do: ${OUTPUT_FILE}`);
console.log(
  `📊 songs: ${songs.length}, playlist items: ${playlist.items.length}`,
);
