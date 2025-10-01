FROM node:22.19.0-alpine AS base
WORKDIR /usr/src/wpp-server
ENV NODE_ENV=production PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Instalar dependências do sistema necessárias
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

COPY package.json ./

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

# IMPORTANTE: Instalar vips e chromium no stage final
RUN apk add --no-cache \
    chromium \
    vips \
    vips-dev \
    fftw-dev \
    && rm -rf /var/cache/apk/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copiar do stage de build
COPY --from=build /usr/src/wpp-server/ /usr/src/wpp-server/

EXPOSE 21465

ENTRYPOINT ["node", "bin/wppserver.js"]
