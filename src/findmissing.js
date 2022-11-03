import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { parseFile } from 'music-metadata';

Array.prototype.diff = function(arr2) { return this.filter(x => !arr2.includes(x)); }


const songFiles = readdirSync('./songs');

const songs = [];

for(const song of songFiles) {
  const metadata = (await parseFile(`./songs/${song}`)).common;
  songs.push({
    name: metadata.title,
    title: metadata.album,
    artist: metadata.artist,
    id: song.slice(song.lastIndexOf('--') + 3, song.lastIndexOf('.')),
  });
}

const songData = JSON.parse(readFileSync('./data/songs.json', 'utf-8'));

for(const song of songs) {
  const foundSong = songData.find((data) => {
    return data.name === song.name
      && data.anime.english === song.title
      && data.artist === song.artist
      && checkUrls(data.urls, song.id)
  });
  if(!foundSong) {
    continue;
  }
  foundSong.found = true;
}

const unfoundSongs = songData.filter(song => !song.found);
if(unfoundSongs.length) {
  console.log(`Downloading ${unfoundSongs.length} songs.`);
}
writeFileSync('./tmp/remaining.json', JSON.stringify(unfoundSongs, null, 2));

function checkUrls(urls, id) {
  const catboxMp3Id = `https://files.catbox.moe/${id}.mp3`;
  const catboxWebmId = `https://files.catbox.moe/${id}.webm`;
  const openingsmoeId = `https://openings.moe/video/${id}.webm`;
  if(!urls.catbox)
    urls.catbox = {};
  if(!urls.openingsmoe)
    urls.openingsmoe = {};

  return urls.catbox[0] === catboxMp3Id
    || urls.catbox[480] === catboxWebmId
    || urls.catbox[720] === catboxWebmId
    || urls.openingsmoe[720] === openingsmoeId;
}