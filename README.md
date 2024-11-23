# AMQ-List-Downloader

## Setup

### Installation

Install npm packages
```sh
npm i
```

### Add songs 

1. Generate/Export Song List using [the userscript](https://github.com/Nick-NCSU/AMQ-List-Downloader/raw/main/src/generator.user.js)

2. Copy list from the `downloadSongList` entry in local storage

3. Paste list into a new file `./data/songs.json`

## Run

Run the following command:
```sh
npm start
```

The downloaded songs will be in the `songs` folder.
