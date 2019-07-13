#!/bin/bash
set -e
yarn
npx pm2 install typescript
yarn start