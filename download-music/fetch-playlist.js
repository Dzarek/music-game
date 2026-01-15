import fs from "fs";
import SpotifyWebApi from "spotify-web-api-node";

const spotify = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// ---- AUTH (Client Credentials Flow)
async function authenticate() {
  const data = await spotify.clientCredentialsGrant();
  spotify.setAccessToken(data.body.access_token);
}

// ---- FETCH PLAYLIST
async function fetchPlaylistTracks(playlistId) {
  let tracks = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const res = await spotify.getPlaylistTracks(playlistId, {
      offset,
      limit,
    });

    tracks.push(...res.body.items);

    if (res.body.items.length < limit) break;
    offset += limit;
  }

  return tracks;
}

// ---- MAIN
async function run() {
  await authenticate();

  const items = await fetchPlaylistTracks(process.env.SPOTIFY_PLAYLIST_ID);

  const songs = items
    .filter((item) => item.track && item.track.preview_url)
    .map((item, index) => {
      const track = item.track;

      return {
        cardId: index + 1,
        spotifyTrackId: track.id,
        title: track.name,
        artist: track.artists.map((a) => a.name).join(", "),
        year: track.album.release_date.slice(0, 4),
        previewUrl: track.preview_url,
      };
    });

  fs.writeFileSync("songs.json", JSON.stringify(songs, null, 2), "utf-8");

  console.log(`✅ Zapisano ${songs.length} kart do songs.json`);
}

run().catch(console.error);
