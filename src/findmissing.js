import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { selectSeason } from './util.js';

export function findMissing() {
  const songData = JSON.parse(readFileSync('./data/songs.json', 'utf-8'));

  const existingSongs = readdirSync('./songs').map(f => +f.replace('.mp3', ''));

  const unfoundSongs = Object.entries(songData).filter(([_id, song]) =>
    song.fileName && existingSongs.indexOf(song.amqSongId) === -1
  );
  if (unfoundSongs.length) {
    console.log(`Downloading ${unfoundSongs.length} songs.`);
    console.log(unfoundSongs.map(
      s => `${selectSeason(s[1]).names.EN ?? selectSeason(s[1]).names.JA} - ${s[1].name} - ${s[1].artist}`
    ).join('\n'));
  }
  writeFileSync('./tmp/remaining.json', JSON.stringify(Object.fromEntries(unfoundSongs), null, 2));
}