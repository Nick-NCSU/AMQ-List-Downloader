import { existsSync, readFileSync, writeFileSync } from 'fs'

Array.prototype.diff = function(arr2) { return this.filter(x => !arr2.includes(x)); }

if(!existsSync('./data/songs.json')) {
  writeFileSync('./data/songs.json', '[]');
}
if(!existsSync('./data/newsongs.json')) {
  writeFileSync('./data/newsongs.json', '[]');
}

const songData = JSON.parse(readFileSync('./data/songs.json', 'utf-8'));
const newSongData = JSON.parse(readFileSync('./data/newsongs.json', 'utf-8'));

for(const newSong of newSongData) {
  if(!songData.some(song => song.name === newSong.name && checkUrls(song.urls, newSong.urls))) {
    songData.push(newSong);
  }
}

writeFileSync('./data/songs.json', JSON.stringify(songData, null, 2));

function checkUrls(urls, newUrls) {
  if(!urls.catbox)
    urls.catbox = {};
  if(!urls.openingsmoe)
    urls.openingsmoe = {};
  if(!newUrls.catbox)
    newUrls.catbox = {};
  if(!newUrls.openingsmoe)
    newUrls.openingsmoe = {};
  return (urls.catbox[0] && urls.catbox[0] === newUrls.catbox[0])
    || (urls.catbox[480] && urls.catbox[480] === newUrls.catbox[480])
    || (urls.catbox[720] && urls.catbox[720] === newUrls.catbox[720])
    || (urls.openingsmoe[720] && urls.openingsmoe[720] === newUrls.openingsmoe[720]);
}