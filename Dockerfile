FROM node:lts-alpine as development
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --quiet
# COPY . .


FROM node:lts-alpine as production
WORKDIR /usr/src/app
RUN npm i -g pm2
RUN pm2 install typescript
RUN pm2 link k503tcw92v6rrc9 26epi1y5ctn6xd2 'BMM API(ec2)'
COPY package*.json ./
RUN npm install --only=production
COPY . .
CMD [ "npm", "run", "start" ]
