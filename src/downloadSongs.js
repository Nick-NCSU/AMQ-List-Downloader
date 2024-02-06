import { readFileSync, existsSync } from 'fs'
import PQueue from 'p-queue';
import Ffmpeg from 'fluent-ffmpeg';

export async function downloadSongs() {
  const queue = new PQueue({
    concurrency: 10
  });
  const remainingSongs = JSON.parse(readFileSync('./tmp/remaining.json'));
  for(const song of remainingSongs) {
    const id = song.urls.catbox['0'] ?? song.urls.catbox['480'] ?? song.urls.catbox['720'];
    const url = `https://nl.catbox.moe/${id}`;
    queue.add(() => downloadSong(song, url, id.slice(0, id.lastIndexOf('.'))))
  }
  await queue.onIdle();
}

function downloadSong(song, url, id) {
  return new Promise((resolve) => {
    let download = Ffmpeg(url);
    if(existsSync(`./art/${song.annId}.jpg`)) {
      download = download.addOutputOptions('-i', `./art/${song.annId}.jpg`, '-map', '0:a:0', '-map', '1:0', '-c:a', 'libmp3lame', '-c:v', 'mjpeg', '-id3v2_version', '3')
    }
    download
      .addOutputOption('-metadata', `Title=${song.name}`)
      .addOutputOption('-metadata', `Artist=${song.artist.replace(/\//g, '\\')}`)
      .addOutputOption('-metadata', `Album=${song.anime.english}`)
      .addOutputOption('-ab', '128k')
      .addOutputOption('-ar', '44100')
      .outputFormat('mp3')
      .save(`./songs/${id}.mp3`)
      .on('end', function() {
        resolve();
      })
      .on('error', function(err) {
        console.log(`Retrying ${url}`)
        downloadSong(song, url, id).then(() => resolve());
      })
  })
}