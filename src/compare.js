import { readdirSync, readFileSync } from 'fs'
import { parseFile } from 'music-metadata';

export async function compare() {
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
      return checkUrls(data.urls, song.id)
    });
    if (!foundSong) {
      console.log(`Unable to find song with id: ${song.id}`);
      continue;
    }
    foundSong.found = true;
  }

  const unfoundSongs = songData.filter(song => !song.found);
  if (unfoundSongs.length) {
    console.log(`Some songs were unable to be downloaded:${unfoundSongs.map(song => ` ${song.name} - ${song.type}`)}`);
    console.log(`${unfoundSongs.length}/${songData.length}`);
  }
}

function checkUrls(urls, id) {
  const catboxMp3Id = `${id}.mp3`;
  const catboxWebmId = `${id}.webm`;
  return urls.catbox[0] === catboxMp3Id
    || urls.catbox[480] === catboxWebmId
    || urls.catbox[720] === catboxWebmId;
}