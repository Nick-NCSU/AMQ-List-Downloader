# AMQ-List-Downloader

This repo can be used to download `.mp3` files of your
song pool on AnimeMusicQuiz. 

Previously downloaded songs will not be redownloaded so
to utilize this tool most efficiently, do not delete the
contents of the `./data/songs` folder after running.

## Setup

## Prerequisites

[Node](https://nodejs.org/) >= 15

[FFmpeg](https://www.ffmpeg.org/)

### Installation

Install npm packages
```sh
npm i
```

### Add songs 

1. Generate/Export Song List using [the userscript](https://github.com/Nick-NCSU/AMQ-Extended-Song-List/raw/refs/heads/main/generator.user.js)

2. Download list from Installed Userscripts button on AMQ

3. Copy downloaded list into `./data/songs.json`
```sh
cp /path/to/file/extendedSongList.json ./data/songs.json
```

## Run

Run the following command:
```sh
npm start
```
## Output

1. The outputted songs can be found in `./data/songs/`

2. The art for the anime in your songs can be found in `./data/art/`

3. A text file containing Anki notes for your songs can be found at `./data/anki.txt`
    - More information about the Anki deck can be found [here](./anki.md).
