import { readFileSync, existsSync } from 'fs'
import PQueue from 'p-queue';
import { getFirstAnime, getFirstAnimeId } from './util.js'
import { exec } from 'child_process';

export async function downloadSongs() {
  const queue = new PQueue({
    concurrency: 5
  });
  const remainingSongs = Object.entries(JSON.parse(readFileSync('./tmp/remaining.json')));
  for(const [id, song] of remainingSongs) {
    const fileName = song.fileName;
    if(!fileName) continue;
    const url = `https://naedist.animemusicquiz.com/${fileName}`;
    queue.add(() => downloadSong(song, url, id));
  }
  await queue.onIdle();
}

function downloadSong(song, url, id, attempt = 0) {
  return new Promise((resolve) => {
    const anime = getFirstAnime(song);
    const annId = getFirstAnimeId(song);
    
    let command = [
      'ffmpeg', 
      '-i', `${url}`,
      '-y'
    ];

    if(existsSync(`./data/art/${annId}.jpg`)) {
      command.push('-i', `./data/art/${annId}.jpg`, '-map', '0:a:0', '-map', '1:0', '-c:a', 'libmp3lame', '-c:v', 'mjpeg', '-id3v2_version', '3')
    }

    command.push(
      '-metadata', `Title="${escapeQuotes(song.name)}"`,
      '-metadata', `Artist="${escapeQuotes(song.artist.replace(/\//g, '\\'))}"`,
      '-metadata', `Album="${escapeQuotes(anime.names.EN ?? anime.names.JA)}"`,
      '-metadata', `Album_Artist=Various`,
      '-map_chapters', '-1',
      '-ab', '128k',
      '-ar', '44100',
      '-f', 'mp3',
      `./data/songs/${id}.mp3`
    );

    exec(command.join(' '), (err) => {
      if(err) {
        if(attempt >= 5) {
          console.log(`Failed to download ${url}`);
          resolve();
          return;
        }
        console.log(`Retrying ${url}`)
        downloadSong(song, url, id, attempt + 1).then(() => resolve());
      } else {
        resolve();
      }
    });
  });
}

function escapeQuotes(str) {
  return str.replaceAll('"', '\\"')
}