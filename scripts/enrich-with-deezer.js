import fs from "fs";

const inputPath = "data/songs.seed.json";
const outputPath = "data/songs.json";

const songs = JSON.parse(fs.readFileSync(inputPath, "utf8"));

async function enrich() {
  for (const song of songs) {
    const q = encodeURIComponent(`${song.artist} ${song.title}`);
    console.log(`🔍 ${song.artist} – ${song.title}`);

    const res = await fetch(`https://api.deezer.com/search?q=${q}`);
    const data = await res.json();

    if (data.data?.length) {
      song.deezerTrackId = data.data[0].id;
      song.previewUrl = data.data[0].preview;
      console.log("   ✅ OK");
    } else {
      console.log("   ❌ NIE ZNALEZIONO");
    }

    // mały delay żeby nie triggerować limitów
    await new Promise((r) => setTimeout(r, 300));
  }

  fs.writeFileSync(outputPath, JSON.stringify(songs, null, 2));
  console.log("\n🎉 data/songs.json GOTOWE");
}

enrich();
