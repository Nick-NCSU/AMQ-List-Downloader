import { readFileSync, rmSync } from 'fs';

export function deleteExtra() {
  const extraSongs = JSON.parse(readFileSync('./tmp/extra.json'));
  if(!extraSongs.length) return;
  console.log(`Deleting ${extraSongs.length} extra songs`)
  for(const song of extraSongs) {
    rmSync(`./data/songs/${song}.mp3`);
  }
}