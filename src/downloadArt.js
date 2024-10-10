import { readFileSync, createWriteStream, readdirSync, writeFileSync, existsSync } from 'fs';
import { chunk } from 'lodash-es';
import { parseStringPromise } from 'xml2js'
import axios from 'axios';
import { selectSeason } from './util';

const BASE_API_URL = 'https://cdn.animenewsnetwork.com/encyclopedia/api.xml';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function downloadArt() {
  const existingArt = readdirSync('./art').map(file => +file.replace('.jpg', ''));
  const annIds = [...new Set(JSON.parse(readFileSync('./data/songs.json', 'utf-8')).map(song => selectSeason(song).annId))].filter(id => !existingArt.includes(id));

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
    const writer = createWriteStream(`./art/${id}.jpg`);
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error downloading the image:', error);
  }
}