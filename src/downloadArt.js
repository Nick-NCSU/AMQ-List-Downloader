import { readFileSync, createWriteStream, readdirSync } from 'fs';
import { chunk } from 'lodash-es';
import { parseStringPromise } from 'xml2js'
import axios from 'axios';
import { getFirstAnimeId } from './util.js';

const BASE_API_URL = 'https://cdn.animenewsnetwork.com/encyclopedia/api.xml';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function downloadArt() {
  const existingArt = readdirSync('./data/art').map(file => file.replace('.jpg', ''));
  const annIds = [...new Set(Object.values(JSON.parse(readFileSync('./tmp/remaining.json', 'utf-8'))).map(song => getFirstAnimeId(song)))].filter(id => !existingArt.includes(id));
  
  if(!annIds.length) return;

  console.log(`Attempting to download images for ${annIds.length} anime`);

  for(const ids of chunk(annIds, 50)) {
    const output = await (await fetch(`${BASE_API_URL}?anime=${ids.join('/')}`)).text();

    const parsed = (await parseStringPromise(output)).ann.anime;
    for(const anime of parsed) {
      const id = anime.$.id;
      const image = anime.info.find(info => info.$?.type === 'Picture')?.img?.reduce(
        (acc, img) => (+img.$?.width * +img.$?.height) > (+acc.$?.width * +acc.$?.height) ? img : acc, { $: { width: 0, height: 0 } })?.$?.src;
      if(image) {
        await downloadImage(id, image)
      } else {
        console.log(`No image found for ${id}`);
      }
    }
    await sleep(2000);
  }
}

async function downloadImage(id, image) {
  try {
    const response = await axios.get(image, { responseType: 'stream' });
    const writer = createWriteStream(`./data/art/${id}.jpg`);
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error downloading the image:', error);
  }
}