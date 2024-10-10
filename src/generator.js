// ==UserScript==
// @name         AMQ List Generator
// @namespace    https://github.com/Nick-NCSU
// @version      1.0
// @description  Generates a list of your anime and stores in the "downloadSongList" localstorage
// @author       Nick-NCSU
// @match        https://*.animemusicquiz.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @downloadURL  https://github.com/Nick-NCSU/AMQ-List-Downloader/raw/main/src/generator.js
// @updateURL    https://github.com/Nick-NCSU/AMQ-List-Downloader/raw/main/src/generator.js
// ==/UserScript==

await setup();

async function setup() {
    let loadingScreen = document.getElementById("loadingScreen")
    if (document.getElementById("startPage") || loadingScreen == null || loadingScreen.className !== "gamePage hidden") {
        setTimeout(setup, 3000)
        return
    }

    const songList = await loadSongList();

    const listener = new Listener("get song extended info", (payload) => {
	    if(songList[payload.songId] && !songList[payload.songId].fileName) {
            songList[payload.songId].fileName = payload.fileName;
            localStorage.setItem("downloadSongList", JSON.stringify(songList));
        }
    });
    listener.bindListener();

    let loadCount = 0;
    for(const song of Object.values(songList)) {
        if(!song.fileName) {
            socket.sendCommand({
                type: "library",
                command: "get song extended info",
                data: {
                    annSongId: song.annSongId,
                    includeFileNames: false,
                }
            });
            await sleep(5_000);
            console.log(`Loaded ${loadCount + 1}/${Object.keys(songList).length}`);
        }
        loadCount++;
    }
    console.log("Finished loading all songs");
}

async function loadSongList() {
    console.log("Loading song list");

    await new Promise((res) => expandLibrary.library.setup(res));

    let filter = expandLibrary.library.filterApplier.currentFilter;
    filter.watchedStatus.unwatched = false;
    expandLibrary.library.filterApplier.applyBaseFilter(filter);
    const amqList = expandLibrary.library.filterApplier.filteredEntries.map(anime => anime.animeEntry);

    const songList = JSON.parse(localStorage.getItem("downloadSongList") ?? "{}");
    for(const anime of amqList) {
        const songs = [...anime.songs.OP, ...anime.songs.ED, ...anime.songs.INS];
        for(const song of songs) {
            const entry = song.songEntry;
            songList[entry.songId] = {
                ...songList[entry.songId],
                annSongId: song.annSongId,
                amqSongId: entry.songId,
                artist: entry.artist.name,
                name: entry.name,
                rebroadcast: entry.rebroadcast,
                dub: entry.dub,
                anime: {
                    ...songList[entry.songId]?.anime,
                    [anime.annId]: {
                        annId: anime.annId,
                        category: anime.category,
                        names: anime.mainNames,
                    }
                }
            };
        }
    }

    localStorage.setItem("downloadSongList", JSON.stringify(songList));
    return songList;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}