#!/bin/bash

# Setup
rm -rf ./tmp
mkdir -p tmp
mkdir -p songs
node ./src/combinelists.js
node ./src/findmissing.js

# Regex to match video id
urlregex="^https:\/\/(files\.catbox\.moe|openings\.moe\/video)\/(.+)\.(mp3|webm)$"

# Read JSON
cat ./tmp/remaining.json | sed 's/\r//g' | jq -r '.[] | [.name, .anime.english, .artist, .urls.catbox["0"] // (null|@json), .urls.catbox["480"] // (null|@json), .urls.catbox["720"] // (null|@json), .urls.openingsmoe["720"] // (null|@json)] | @tsv' | while IFS=$'\t\r\n' read name title artist catbox0 catbox480 catbox720 moe720; do
  # Removes invalid characters from filename
  validname="$(echo "$name" | sed 's/[<>:"\/\\\|\?\*]//g')"
  # Download song
  if [[ -n "$catbox0" ]] && wget "$catbox0" -O "./tmp/$validname.mp3" -q
  then
    if [[ "$catbox0" =~ $urlregex ]]
    then
      filepath="$validname -- ${BASH_REMATCH[2]}.mp3"
      # Add metadata
      ffmpeg -i "./tmp/$validname.mp3" -metadata Title="$name" -metadata Artist="$artist" -metadata Album="$title" -vn -ab 128k -ar 44100 -y -nostdin -hide_banner -loglevel error "./songs/$filepath"
    fi
  elif [[ -n "$catbox480" ]] && wget "$catbox480" -O "./tmp/$validname.webm" -q
  then
    if [[ "$catbox480" =~ $urlregex ]]
    then
      filepath="$validname -- ${BASH_REMATCH[2]}.mp3"
      # Add metadata
      ffmpeg -i "./tmp/$validname.webm" -metadata Title="$name" -metadata Artist="$artist" -metadata Album="$title" -vn -ab 128k -ar 44100 -y -nostdin -hide_banner -loglevel error "./songs/$filepath"
    fi
  elif [[ -n "$catbox720" ]] && wget "$catbox720" -O "./tmp/$validname.webm" -q
  then
    if [[ "$catbox720" =~ $urlregex ]]
    then
      filepath="$validname -- ${BASH_REMATCH[2]}.mp3"
      # Add metadata
      ffmpeg -i "./tmp/$validname.webm" -metadata Title="$name" -metadata Artist="$artist" -metadata Album="$title" -vn -ab 128k -ar 44100 -y -nostdin -hide_banner -loglevel error "./songs/$filepath"
    fi
  elif [[ -n "$moe720" ]] && wget "$moe720" -O "./tmp/$validname.webm" -q
  then
    if [[ "$moe720" =~ $urlregex ]]
    then
      filepath="$validname -- ${BASH_REMATCH[2]}.mp3"
      # Add metadata
      ffmpeg -i "./tmp/$validname.webm" -metadata Title="$name" -metadata Artist="$artist" -metadata Album="$title" -vn -ab 128k -ar 44100 -y -nostdin -hide_banner -loglevel error "./songs/$filepath"
    fi
  else
    echo "Failed to get song $name - $title"
  fi
done

# Cleanup
rm -r ./tmp

node ./src/compare.js