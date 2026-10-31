# Retained README reference / Referência preservada do README

This document preserves the previous `README.md` for technical details, acknowledgments and history. Start with [README.md](../README.md) or [README.pt-BR.md](../README.pt-BR.md) for the current verified entry path. Older commands, release claims, third-party examples and API signatures here may need migration; consult the current source and linked guides.

Este documento preserva o `README.md` anterior com detalhes técnicos, agradecimentos e histórico. Comece pelo [README em português](../README.pt-BR.md) para as instruções iniciais conferidas. Comandos antigos, afirmações sobre releases, exemplos de terceiros e assinaturas de API podem exigir migração; consulte os fontes e guias atuais.

---

<!-- wppconnect-official-brand -->
<p align="center">
  <a href="https://wppconnect-team.github.io/">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://wppconnect-team.github.io/brand/wppconnect-dark.png" />
      <img src="https://wppconnect-team.github.io/brand/wppconnect-light.png" alt="WPPConnect" width="220" height="121" />
    </picture>
  </a>
</p>
<!-- /wppconnect-official-brand -->

# WPPConnect Team

## _WPPConnect Server Cli_

[![Build](https://github.com/wppconnect-team/server-cli/actions/workflows/build.yml/badge.svg)](https://github.com/wppconnect-team/server-cli/actions/workflows/build.yml)

Esse pacote facilita a utilização do servidor WPPConnect-server através de uma linha de comando

## Nossos canais online

[![Discord](https://img.shields.io/discord/844351092758413353?color=blueviolet&label=Discord&logo=discord&style=flat)](https://discord.gg/JU5JGGKGNG)
[![Telegram Group](https://img.shields.io/badge/Telegram-Group-32AFED?logo=telegram)](https://t.me/wppconnect)
[![WhatsApp Group](https://img.shields.io/badge/WhatsApp-Group-25D366?logo=whatsapp)](https://chat.whatsapp.com/LJaQu6ZyNvnBPNAVRbX00K)
[![YouTube](https://img.shields.io/youtube/channel/subscribers/UCD7J9LG08PmGQrF5IS7Yv9A?label=YouTube)](https://www.youtube.com/c/wppconnect)

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
