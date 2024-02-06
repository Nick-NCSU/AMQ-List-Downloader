import { existsSync, mkdirSync, rmSync } from 'fs';
import { combine } from './combinelists.js';
import { findMissing } from './findmissing.js';
import { compare } from './compare.js';
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
combine();
await findMissing();
await downloadArt();
await downloadSongs();
rmSync('./tmp', { recursive: true, force: true });
await compare();