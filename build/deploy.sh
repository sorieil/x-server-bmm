#!/bin/bash
set -e
CLEAR_LINE='\r\033[K'
DIRECTORY=server-xsync-api-2.0-bmm

cd /home/centos

sudo yum remove docker \
  docker-client \
  docker-client-latest \
  docker-common \
  docker-latest \
  docker-latest-logrotate \
  docker-logrotate \
  docker-engine

sudo yum install -y yum-utils \
  device-mapper-persistent-data \
  lvm2

sudo yum-config-manager \
  --add-repo \
  https://download.docker.com/linux/centos/docker-ce.repo

sudo yum install docker-ce docker-ce-cli containerd.io

sudo systemctl start docker

sudo docker load -i bmm-frontend.tar
sudo docker run bmm-frontend v

if ! command -v node >/dev/null; then
  sudo npm cache clean -f
  sudo npm install -g npm
fi

cd $DIRECTORY

printf "================================\n "
git pull >/dev/null
printf "  Git pull done \n "
printf "================================\n "

curl https://sentry.io/api/hooks/release/builtin/1503535/df72bba18d3e5e725c6f0f6365101807337eaf29adf117b978853eb5b24db8de/ \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"version": "1.0"}'
printf "  Deploy complete \n"
printf "================================\n "
