import { readFileSync, existsSync } from 'fs'
import PQueue from 'p-queue';
import Ffmpeg from 'fluent-ffmpeg';
import { selectSeason } from './util.js';

export async function downloadSongs() {
  const queue = new PQueue({
    concurrency: 5
  });
  const remainingSongs = Object.values(JSON.parse(readFileSync('./tmp/remaining.json')));
  for(const song of remainingSongs) {
    const id = song.fileName;
    if(!id) continue;
    const url = `https://naedist.animemusicquiz.com/${id}`;
    queue.add(() => downloadSong(song, url, song.amqSongId));
  }
  await queue.onIdle();
}

function downloadSong(song, url, id, attempt = 0) {
  return new Promise((resolve) => {
    const anime = selectSeason(song);
    let download = Ffmpeg(url);
    if(existsSync(`./art/${anime.annId}.jpg`)) {
      download = download.addOutputOptions('-i', `./art/${anime.annId}.jpg`, '-map', '0:a:0', '-map', '1:0', '-c:a', 'libmp3lame', '-c:v', 'mjpeg', '-id3v2_version', '3')
    }
    download
      .addOutputOption('-metadata', `Title=${song.name}`)
      .addOutputOption('-metadata', `Artist=${song.artist.replace(/\//g, '\\')}`)
      .addOutputOption('-metadata', `Album=${anime.names.EN ?? anime.names.JA}`)
      .addOutputOption('-map_chapters', '-1')
      .addOutputOption('-ab', '128k')
      .addOutputOption('-ar', '44100')
      .outputFormat('mp3')
      .save(`./songs/${id}.mp3`)
      .on('end', function() {
        resolve();
      })
      .on('error', function() {
        if(attempt >= 5) {
          console.log(`Failed to download ${url}`);
          resolve();
          return;
        }
        console.log(`Retrying ${url}`)
        downloadSong(song, url, id, attempt + 1).then(() => resolve());
      })
  })
}