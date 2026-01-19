import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { getFirstAnime, getTags, getType } from './util.js';

export function findMissing() {
  const songData = Object.values(JSON.parse(readFileSync('./data/songs.json', 'utf-8'))).reduce((acc, song) => {
    acc[song.amqSongId] ??= {
      artist: song.artist,
      name: song.name,
      tags: [],
      anime: {},
      fileName: song.fileName
    }

    const entry = acc[song.amqSongId];

    entry.tags.push(...getTags(song).filter(t => !entry.tags.includes(t)));
    
    for(const [id, anime] of Object.entries(song.anime)) {
      entry.anime[id] = {
        names: anime.names,
        type: getType(song)
      }
    }

    entry.fileName ??= song.fileName;

    return acc;
  }, {});

  writeFileSync('./tmp/songs.json', JSON.stringify(songData, null, 2));

  const existingSongs = new Set(readdirSync('./data/songs').map(f => f.replace('.mp3', '')));

  const unfoundSongs = Object.entries(songData).filter(([id, song]) =>
    song.fileName && !existingSongs.has(id)
  );
  if (unfoundSongs.length) {
    console.log(`Downloading ${unfoundSongs.length} songs.`);
    console.log(unfoundSongs.map(
      ([_id, song]) => `${getFirstAnime(song).names.EN ?? getFirstAnime(song).names.JA} - ${song.name} - ${song.artist}`
    ).join('\n'));
  }
  writeFileSync('./tmp/remaining.json', JSON.stringify(Object.fromEntries(unfoundSongs), null, 2));

  const extraSongs = [...existingSongs].filter(s => !(s in songData));
  writeFileSync('./tmp/extra.json', JSON.stringify(extraSongs, null, 2));
}