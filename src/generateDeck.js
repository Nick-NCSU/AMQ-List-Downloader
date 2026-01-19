import { readFileSync, writeFileSync } from 'fs'
import { stringify } from 'csv-stringify/sync';

export function generateDeck() {
  const columns = ['id', 'file', 'song', 'artist', 'titles', 'tags'];
  const headers = ["#separator:Comma", "#html:true", `#columns:${columns.join(',')}`, '#notetype:AMQListDownloader'];
  const songs = JSON.parse(readFileSync('./tmp/songs.json', 'utf-8'));

  const output = Object.entries(songs).filter(([_id, song]) => !!song.fileName).map(([id, song]) => ({
    id,
    file: `[sound:${id}.mp3]`,
    song: song.name.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;'),
    artist: song.artist.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;'),
    titles: Object.values(song.anime).map(formatTitle).join('<hr>'),
    tags: song.tags.join(' ')
  }))

  writeFileSync('./data/anki.txt', `${headers.join('\n')}\n${stringify(output, { columns, encoding: 'utf-8', quoted: true })}`);
}

function formatTitle(anime) {
  const ja = anime.names.JA?.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const en = anime.names.EN?.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

  const output = [];
  ja && output.push(`JA: ${ja}`);
  en && output.push(`EN: ${en}`);
  output.push(`${anime.type}`);

  return output.join('<br>');
}