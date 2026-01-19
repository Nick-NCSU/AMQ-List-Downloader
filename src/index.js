import { existsSync, mkdirSync, rmSync } from 'fs';
import { findMissing } from './findMissing.js';
import { downloadSongs } from './downloadSongs.js';
import { downloadArt } from './downloadArt.js';
import { deleteExtra } from './deleteExtra.js';
import { generateDeck } from './generateDeck.js';

rmSync('./tmp', { recursive: true, force: true });
if(!existsSync('./tmp')) {
  mkdirSync('./tmp');
}
if(!existsSync('./data/songs')) {
  mkdirSync('./data/songs');
}
if(!existsSync('./data/art')) {
  mkdirSync('./data/art');
}

findMissing();
await downloadArt();
await downloadSongs();
deleteExtra();
generateDeck();

rmSync('./tmp', { recursive: true, force: true });