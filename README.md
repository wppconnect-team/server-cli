**English** | [Português (Brasil)](./README.pt-BR.md)

<p align="center">
  <a href="https://wppconnect.io/">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://wppconnect-team.github.io/brand/wppconnect-dark.png" />
      <img src="https://wppconnect-team.github.io/brand/wppconnect-light.png" alt="WPPConnect" width="220" height="121" />
    </picture>
  </a>
</p>

# WPPConnect Server CLI

Start WPPConnect Server from the `wppserver` command.

A project in the WPPConnect ecosystem, maintained by WPPConnect Team.

[Getting started](#getting-started) | [Documentation](#documentation) | [Contributing](#contributing) | [Support WPPConnect](#support-the-project)

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue)](./LICENSE) [![npm version](https://img.shields.io/npm/v/@wppconnect/server-cli)](https://www.npmjs.com/package/@wppconnect/server-cli) [![CI](https://github.com/wppconnect-team/server-cli/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/wppconnect-team/server-cli/actions/workflows/build.yml) [![Open Collective](https://img.shields.io/badge/Open%20Collective-WPPConnect-blue)](https://opencollective.com/wppconnect)

## Overview

For developers who want command-line configuration of the Node.js Server. The CLI wraps the Server; it does not replace the Server API or the Manager web application.

## Features

- Start the server and set options such as the HTTP port.
- Inspect supported flags with `wppserver --help`.
- Serve a supplied static frontend with `--frontend-path`.

## Getting started

Requires Node.js `^22.18.0 || >=24.11.0`, npm and the browser/native dependencies required by WPPConnect Server.

```sh
npm install -g @wppconnect/server-cli
wppserver --help
wppserver --port 8000
```

Open `http://localhost:8000/api-docs` to inspect the running API. Configure the Server secret and session credentials before exposing the service.

## Configuration

See [src](src/) and `wppserver --help` for flags. `--frontend` uses the legacy `@wppconnect/frontend` package; for the maintained UI follow WPPConnect Manager instructions, or use `--frontend-path` with a compatible static build. Source development uses Yarn 1.22.22 as declared in `packageManager`.

## Documentation

- [Server guide](https://github.com/wppconnect-team/wppconnect-server)
- [CLI tutorial video](https://www.youtube.com/watch?v=zBmCnPS3JOQ)
- [Retained technical details and acknowledgments](documentation/readme-reference.md)

## WPPConnect ecosystem

| Project | Purpose | When to use it |
| --- | --- | --- |
| [WPPConnect Server](https://github.com/wppconnect-team/wppconnect-server) | Run a REST API for WhatsApp sessions, messages and webhooks. | Expose session and messaging operations over HTTP. |
| [WPPConnect Manager](https://github.com/wppconnect-team/wppconnect-manager) | Manage WPPConnect Server sessions and conversations in a self-hosted web workspace. | Operate compatible Server sessions and chats through a UI. |

## Support the project

WPPConnect is maintained by an open-source community. Your support helps fund maintenance, infrastructure, documentation, and the people working on the ecosystem.

If WPPConnect helps your project or business, consider making a one-time contribution or becoming a recurring supporter.

**[Support WPPConnect on Open Collective](https://opencollective.com/wppconnect)**

Contributions are voluntary. See the official page for current financial information. You can also help with code, tests, documentation, translations and well-described issue reports.

Additional official beneficiaries in [.github/FUNDING.yml](.github/FUNDING.yml): [joaosouz4dev](https://github.com/sponsors/joaosouz4dev), [manfe](https://github.com/sponsors/manfe).

## Contributing

Contributions of code, tests, examples, documentation and translations are welcome. For larger changes, discuss the approach in an issue first. Include the project/runtime versions, a minimal reproduction and sanitized logs when reporting a problem. Update both `README.md` and `README.pt-BR.md` in the same change when installation, configuration, features, examples, licensing or funding changes.

After installing the development dependencies, use the repository checks relevant to your change:

```sh
yarn build
yarn lint
yarn test
```

Account-dependent examples and tests require separate validation with an authorized test account. Never attach credentials or session files to an issue.

## Community and support

Use [repository issues](https://github.com/wppconnect-team/server-cli/issues) for reproducible bugs and feature proposals. For usage questions, join the community through the official channels:

- [Discord](https://discord.gg/JU5JGGKGNG)
- [Telegram](https://t.me/wppconnect)
- [YouTube](https://www.youtube.com/c/wppconnect)

This project is independent and is not affiliated with or endorsed by WhatsApp or Meta. Follow applicable terms and obtain authorization for account and messaging operations.

## License

[Apache License 2.0 (Apache-2.0)](./LICENSE).

Copyright 2021 WPPConnect Team.

The original legal document and existing copyright notices are preserved. Third-party components retain their own terms.
