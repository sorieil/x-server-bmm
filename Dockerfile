FROM node:lts-alpine as production
WORKDIR /usr/src/app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8989
RUN yarn global add pm2
RUN pm2 install typescript
RUN pm2 link k503tcw92v6rrc9 26epi1y5ctn6xd2 'BMM API(ec2)'
COPY package*.json ./
RUN yarn --production=false
COPY . .
RUN yarn run build
RUN curl https://sentry.io/api/hooks/release/builtin/1503535/df72bba18d3e5e725c6f0f6365101807337eaf29adf117b978853eb5b24db8de/ \
    -X POST \
    -H 'Content-Type: application/json' \
    -d '{"version": "1.0"}'
CMD ["pm2-docker", "start", "ecosystem.config.js", "--env=production"]


