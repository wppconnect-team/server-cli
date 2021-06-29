# WPPConnect Team

## _WPPConnect Server Cli_

[![Build](https://github.com/wppconnect-team/server-cli/actions/workflows/build.yml/badge.svg)](https://github.com/wppconnect-team/server-cli/actions/workflows/build.yml)

Esse pacote facilita a utilização do servidor WPPConnect-server através de uma linha de comando

## Instalação

Para instalar, basta executar.

```sh
yarn global add @wppconnect/server-cli
//ou
npm install -g @wppconnect/server-cli
```

## E para executar

```sh
wppserver
//ou
wppserver --port 8000
```

## Para mais opções

```sh
wppserver --help
```

## Frontend

Para adicionar o frontend automaticamente, basta instalar

```sh
yarn global add @wppconnect/frontend
//ou
npm install -g @wppconnect/frontend
```

E executar

```sh
wppserver --frontend
//ou
wppserver --frontend-path <caminho do frontend (pasta dist)>
```

## Tutorial - Youtube
- Veja o tutorial de uso no [Canal WPPConnect](https://www.youtube.com/watch?v=zBmCnPS3JOQ).

