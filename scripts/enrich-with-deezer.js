import fs from "fs";

const inputPath = "data/songs.seed.json";
const outputPath = "data/songs.json";

const songs = JSON.parse(fs.readFileSync(inputPath, "utf8"));

async function enrich() {
  for (const song of songs) {
    const query = `${song.artist} ${song.title}`;
    const q = encodeURIComponent(query);

    console.log(`🔍 ${query}`);

    try {
      const res = await fetch(`https://api.deezer.com/search?q=${q}`);
      const data = await res.json();

      if (data.data && data.data.length > 0) {
        const track = data.data[0];

        song.deezerTrackId = track.id;
        console.log(`   ✅ Deezer ID: ${track.id}`);
      } else {
        console.log("   ❌ Nie znaleziono");
        song.deezerTrackId = null;
      }
    } catch (err) {
      console.log("   ❌ Błąd API");
      song.deezerTrackId = null;
    }

    // ⏱️ delay – Deezer nie lubi spamowania
    await new Promise((r) => setTimeout(r, 300));
  }

  fs.writeFileSync(outputPath, JSON.stringify(songs, null, 2), "utf8");
  console.log("\n🎉 data/songs.json wygenerowane");
}

enrich();
