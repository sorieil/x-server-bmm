#!/bin/bash
set -e
CLEAR_LINE='\r\033[K'
DIRECTORY=server-xsync-bmm-api

cd /home/centos

if ! command -v node > /dev/null; then
  sudo npm install -g yarn
fi

if [ ! -d "$DIRECTORY" ]; then
  git clone git@bitbucket.org:xsync_development/server-xsync-bmm-api.git
  # Control will enter here if $DIRECTORY doesn't exist.
fi

cd $DIRECTORY

git pull > /dev/null
printf "Git pull done ====> \n "

yarn --ignore-engines > /dev/null
printf "Yarn Done ====> \n "

yarn start
printf "Server start ====> \n"