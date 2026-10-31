[English](./README.md) | **Português (Brasil)**

<p align="center">
  <a href="https://wppconnect.io/">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://wppconnect-team.github.io/brand/wppconnect-dark.png" />
      <img src="https://wppconnect-team.github.io/brand/wppconnect-light.png" alt="WPPConnect" width="220" height="121" />
    </picture>
  </a>
</p>

# WPPConnect Server CLI

Inicie o WPPConnect Server pelo comando `wppserver`.

Um projeto do ecossistema WPPConnect, mantido pela WPPConnect Team.

[Primeiros passos](#primeiros-passos) | [Documentação](#documentação) | [Como contribuir](#como-contribuir) | [Apoie a WPPConnect](#apoie-o-projeto)

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue)](./LICENSE) [![npm version](https://img.shields.io/npm/v/@wppconnect/server-cli)](https://www.npmjs.com/package/@wppconnect/server-cli) [![CI](https://github.com/wppconnect-team/server-cli/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/wppconnect-team/server-cli/actions/workflows/build.yml) [![Open Collective](https://img.shields.io/badge/Open%20Collective-WPPConnect-blue)](https://opencollective.com/wppconnect)

## Visão geral

Para desenvolvedores que querem configurar o Server Node.js pela linha de comando. A CLI encapsula o Server; a API do Server e a aplicação web Manager são componentes separados.

## Funcionalidades

- Inicie o servidor e defina opções como a porta HTTP.
- Consulte as opções disponíveis com `wppserver --help`.
- Disponibilize um frontend estático fornecido com `--frontend-path`.

## Primeiros passos

Exige Node.js `^22.18.0 || >=24.11.0`, npm e as dependências de navegador/nativas do WPPConnect Server.

```sh
npm install -g @wppconnect/server-cli
wppserver --help
wppserver --port 8000
```

Abra `http://localhost:8000/api-docs` para consultar a API em execução. Configure o segredo do Server e as credenciais de sessão antes de expor o serviço.

## Configuração

Consulte [src](src/) e `wppserver --help` para as opções. `--frontend` usa o pacote legado `@wppconnect/frontend`; para a interface mantida siga as instruções do WPPConnect Manager ou use `--frontend-path` com um build estático compatível. O desenvolvimento pelos fontes usa Yarn 1.22.22, declarado em `packageManager`.

## Documentação

- [Guia do Server](https://github.com/wppconnect-team/wppconnect-server)
- [Vídeo tutorial da CLI](https://www.youtube.com/watch?v=zBmCnPS3JOQ)
- [Detalhes técnicos e agradecimentos preservados](documentation/readme-reference.md)

## Ecossistema WPPConnect

| Projeto | Finalidade | Quando usar |
| --- | --- | --- |
| [WPPConnect Server](https://github.com/wppconnect-team/wppconnect-server) | Execute uma API REST para sessões, mensagens e webhooks do WhatsApp. | Expor operações de sessão e mensagens por HTTP. |
| [WPPConnect Manager](https://github.com/wppconnect-team/wppconnect-manager) | Gerencie sessões e conversas do WPPConnect Server em uma aplicação web auto-hospedada. | Operar sessões e conversas de um Server compatível pela interface. |

## Apoie o projeto

A WPPConnect é mantida por uma comunidade de código aberto. Seu apoio ajuda a financiar a manutenção, a infraestrutura, a documentação e o trabalho das pessoas que desenvolvem o ecossistema.

Se a WPPConnect ajuda seu projeto ou sua empresa, considere fazer uma contribuição pontual ou apoiar de forma recorrente.

**[Apoie a WPPConnect no Open Collective](https://opencollective.com/wppconnect)**

As contribuições são voluntárias. Consulte a página oficial para acompanhar as informações financeiras atuais. Você também pode ajudar com código, testes, documentação, traduções e relatos de problemas bem descritos.

Beneficiários oficiais adicionais em [.github/FUNDING.yml](.github/FUNDING.yml): [joaosouz4dev](https://github.com/sponsors/joaosouz4dev), [manfe](https://github.com/sponsors/manfe).

## Como contribuir

Contribuições de código, testes, exemplos, documentação e traduções são bem-vindas. Para mudanças maiores, discuta a proposta em uma issue primeiro. Ao relatar um problema, informe as versões do projeto/runtime, uma reprodução mínima e logs sem dados sensíveis. Atualize `README.md` e `README.pt-BR.md` na mesma alteração quando mudar instalação, configuração, funcionalidades, exemplos, licença ou arrecadação.

Após instalar as dependências de desenvolvimento, use as verificações pertinentes à sua alteração:

```sh
yarn build
yarn lint
yarn test
```

Exemplos e testes que dependem de conta exigem validação separada com uma conta de teste autorizada. Nunca anexe credenciais ou arquivos de sessão a uma issue.

## Comunidade e suporte

Use as [issues do repositório](https://github.com/wppconnect-team/server-cli/issues) para bugs reproduzíveis e propostas de funcionalidades. Para dúvidas de uso, participe pelos canais oficiais:

- [Discord](https://discord.gg/JU5JGGKGNG)
- [Telegram](https://t.me/wppconnect)
- [YouTube](https://www.youtube.com/c/wppconnect)

Este projeto é independente e não é afiliado nem endossado pelo WhatsApp ou pela Meta. Siga os termos aplicáveis e obtenha autorização para operações de conta e mensagens.

## Licença

[Apache License 2.0 (Apache-2.0)](./LICENSE).

Copyright 2021 WPPConnect Team.

O documento jurídico original e os avisos de autoria existentes são preservados. Componentes de terceiros mantêm seus próprios termos.
