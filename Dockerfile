FROM node:22.19.0-alpine AS base
WORKDIR /usr/src/wpp-server
ENV NODE_ENV=production PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY package.json ./

RUN apk update && \
    apk add --no-cache \
    vips-dev \
    fftw-dev \
    gcc \
    g++ \
    make \
    libc6-compat \
    build-base \
    python3 \
    pkgconfig \
    && rm -rf /var/cache/apk/*

RUN yarn install --production --pure-lockfile && \
    yarn add sharp --ignore-engines && \
    yarn cache clean

FROM base as build
WORKDIR /usr/src/wpp-server
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY package.json ./
RUN yarn install --production=false --pure-lockfile && \
    yarn cache clean

COPY . .
RUN yarn build

FROM node:22.19.0-alpine
WORKDIR /usr/src/wpp-server/

# CORREÇÃO: Instalar vips e suas dependências no stage final
RUN apk add --no-cache \
    chromium \
    vips \
    vips-cpp \
    && rm -rf /var/cache/apk/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN yarn cache clean

COPY --from=build /usr/src/wpp-server/ /usr/src/wpp-server/

EXPOSE 21465

ENTRYPOINT ["node", "bin/wppserver.js"]