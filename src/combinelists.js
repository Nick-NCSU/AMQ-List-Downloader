import { existsSync, readFileSync, writeFileSync } from 'fs'

export function combine() {
  if (!existsSync('./data/songs.json')) { 
    writeFileSync('./data/songs.json', '[]');
  }
  if (!existsSync('./data/newsongs.json')) {
    writeFileSync('./data/newsongs.json', '[]');
  }

  const songData = JSON.parse(readFileSync('./data/songs.json', 'utf-8'));
  const newSongData = JSON.parse(readFileSync('./data/newsongs.json', 'utf-8'));

  for (const newSong of newSongData) {
    if (!songData.some(song => song.name === newSong.name && checkUrls(song.urls, newSong.urls))) {
      songData.push(newSong);
    }
  }

  writeFileSync('./data/songs.json', JSON.stringify(songData, null, 2));

  function checkUrls(urls, newUrls) {
    return (urls?.catbox[0] && urls?.catbox[0] === newUrls?.catbox[0])
      || (urls?.catbox[480] && urls?.catbox[480] === newUrls?.catbox[480])
      || (urls?.catbox[720] && urls?.catbox[720] === newUrls?.catbox[720])
  }
}