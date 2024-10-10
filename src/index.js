import { existsSync, mkdirSync, rmSync } from 'fs';
import { findMissing } from './findMissing.js';
import { downloadSongs } from './downloadSongs.js';
import { downloadArt } from './downloadArt.js';

rmSync('./tmp', { recursive: true, force: true });
if(!existsSync('./tmp')) {
  mkdirSync('./tmp');
}
if(!existsSync('./songs')) {
  mkdirSync('./songs');
}
if(!existsSync('./art')) {
  mkdirSync('./art');
}
findMissing();
await downloadArt();
await downloadSongs();
rmSync('./tmp', { recursive: true, force: true });