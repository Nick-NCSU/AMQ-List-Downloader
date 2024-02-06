import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { parseFile } from 'music-metadata';

export async function findMissing() {
  const songFiles = readdirSync('./songs');

  const songs = [];

  for (const song of songFiles) {
    const metadata = (await parseFile(`./songs/${song}`)).common;
    songs.push({
      name: metadata.title,
      title: metadata.album,
      artist: metadata.artist,
      id: song.slice(0, song.lastIndexOf('.')),
    });
  }

  const songData = JSON.parse(readFileSync('./data/songs.json', 'utf-8'));

  for (const song of songs) {
    const foundSong = songData.find((data) => {
      return data.name === song.name
        && data.anime.english === song.title
        && data.artist.replace(/\//g, '\\') === song.artist.replace(/\//g, '\\')
        && checkUrls(data.urls, song.id)
    });
    if (!foundSong) {
      continue;
    }
    foundSong.found = true;
  }

  const unfoundSongs = songData.filter(song => !song.found);
  if (unfoundSongs.length) {
    console.log(`Downloading ${unfoundSongs.length} songs.`);
    console.log(unfoundSongs.map(s => `${s.anime.english} - ${s.name} - ${s.artist}`))
  }
  writeFileSync('./tmp/remaining.json', JSON.stringify(unfoundSongs, null, 2));
}

function checkUrls(urls, id) {
  const catboxMp3Id = `${id}.mp3`;
  const catboxWebmId = `${id}.webm`;
  return urls.catbox[0] === catboxMp3Id
    || urls.catbox[480] === catboxWebmId
    || urls.catbox[720] === catboxWebmId;
}