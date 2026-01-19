export function getType(song) {
  switch(song.type) {
    case 1:
      return `Opening ${song.number}`;
    case 2:
      return `Ending ${song.number}`;
    case 3:
      return 'Insert Song';
  }
}

export function getTags(song) {
  const tags = [];
  
  tags.push(["OP", 'ED', 'INS'][song.type - 1]);
  song.dub && tags.push('Dub');
  song.rebroadcast && tags.push('Rebroadcast');

  return tags;
}

export function getFirstAnimeId(song) {
  const animeIds = Object.keys(song.anime).sort((a, b) => a - b);

  return animeIds[0];
}

export function getFirstAnime(song) {
  return song.anime[getFirstAnimeId(song)];
}