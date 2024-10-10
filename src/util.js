const preferenceOrder = [
  "TV",
  "Season", 
  "Movie",
  "OVA",
  "ONA",
  "Special",
  "TV Special"
];

function getPreferenceIndex(category) {
  for (const [idx, preference] of preferenceOrder.entries()) {
    const pattern = new RegExp(`^${preference}(?: \\d+)?$`);
    if (pattern.test(category)) {
      return idx;
    }
  }
  return preferenceOrder.length;
}

export function selectSeason(song) {
  let bestAnime;
  let bestIndex = preferenceOrder.length;

  for (const anime of Object.values(song.anime)) {
    const category = anime.category;
    const preferenceIndex = getPreferenceIndex(category);

    if (!bestAnime || preferenceIndex < bestIndex) {
      bestIndex = preferenceIndex;
      bestAnime = anime;
    } else if (preferenceIndex === bestIndex) {
      if (!/\d+$/.test(category)) {
        bestAnime = anime;
      } else if (/\d+$/.test(bestAnime.category)) {
        const currentNumber = parseInt(category.match(/\d+/)[0], 10);
        const bestNumber = parseInt(bestAnime.category.match(/\d+/)[0], 10);
        if (currentNumber < bestNumber) {
          bestAnime = anime;
        }
      }
    }
  }

  return bestAnime;
}