#!/bin/bash
set -e
CLEAR_LINE='\r\033[K'
DIRECTORY=server-xsync-api-2.0-bmm

cd /home/centos

if ! command -v node > /dev/null; then
  sudo npm install -g yarn
fi

if [ ! -d "$DIRECTORY" ]; then
  git clone git@bitbucket.org:xsync_development/server-xsync-api-2.0-bmm.git
fi

cd $DIRECTORY

printf "================================\n "
git pull > /dev/null
printf "  Git pull done \n "
printf "================================\n "

yarn --ignore-engines > /dev/null
printf "  Yarn Done \n "
printf "================================\n "

npx pm2 install typescript
printf "  PM2 install typescript Done \n "
printf "================================\n "

npx pm2 link k503tcw92v6rrc9 26epi1y5ctn6xd2 'BMM API(ec2)'
printf "  PM2 plus setup \n "
printf "================================\n "

yarn start > /dev/null
printf "  Server start \n"
printf "================================\n "

curl https://sentry.io/api/hooks/release/builtin/1503535/df72bba18d3e5e725c6f0f6365101807337eaf29adf117b978853eb5b24db8de/ \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"version": "1.0"}'
printf "  Deploy complete \n"
printf "================================\n "