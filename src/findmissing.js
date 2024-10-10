import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { selectSeason } from './util';

export function findMissing() {
  const songData = JSON.parse(readFileSync('./data/songs.json', 'utf-8'));

  const existingSongs = readdirSync('./songs').map(f => +f.replace('.mp3', ''));

  const unfoundSongs = songData.filter(song => existingSongs.indexOf(song.amqSongId) === -1);
  if (unfoundSongs.length) {
    console.log(`Downloading ${unfoundSongs.length} songs.`);
    console.log(unfoundSongs.map(
      s => `${selectSeason(s).names.EN ?? selectSeason(s).names.JA} - ${s.name} - ${s.artist}`
    ).join('\n'));
  }
  writeFileSync('./tmp/remaining.json', JSON.stringify(unfoundSongs, null, 2));
}