FROM node:14-alpine as base
WORKDIR /usr/src/server-cli
ENV NODE_ENV=production PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
COPY package.json yarn.lock ./
RUN yarn install --production --pure-lockfile && \
    yarn cache clean

FROM base as build
WORKDIR /usr/src/server-cli
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
COPY package.json yarn.lock ./
RUN yarn install --production=false --pure-lockfile && \
    yarn cache clean
COPY . .
RUN yarn build

FROM base
WORKDIR /usr/src/server-cli
RUN apk add --no-cache chromium
RUN yarn add @wppconnect/frontend && \
    yarn cache clean
COPY . .
COPY --from=build /usr/src/server-cli/dist /usr/src/server-cli/dist/
EXPOSE 21465
ENTRYPOINT ["node", "bin/wppserver.js"]
