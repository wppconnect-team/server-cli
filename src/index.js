/*
 * Copyright 2021 WPPConnect Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { initServer } from '@wppconnect/server';
import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import mergeDeep from 'merge-deep';
import { program } from './program';

export function run() {
  let serverOptions = {};

  program.parse();
  const commandOptions = program.opts();

  if (commandOptions.config) {
    try {
      const json = fs.readFileSync(commandOptions.config, { encoding: 'utf8' });
      const configOptions = JSON.parse(json);

      serverOptions = mergeDeep({}, serverOptions, configOptions);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }

    delete commandOptions.config;
  }

  const subOptions = ['webhook', 'archive', 'log', 'createOptions'];

  for (const key in commandOptions) {
    const opt = subOptions.find((opt) => key.startsWith(opt));

    if (opt) {
      commandOptions[opt] = commandOptions[opt] || {};

      const name = key.substr(opt.length);
      const newName = name[0].toLowerCase() + name.slice(1);

      commandOptions[opt][newName] = commandOptions[key];
      delete commandOptions[key];
    }
  }

  serverOptions = mergeDeep({}, serverOptions, commandOptions);

  const { app } = initServer(serverOptions);

  if (commandOptions.frontend) {
    let frontendPath = commandOptions.frontendPath;

    if (!frontendPath) {
      try {
        const frontendPackage = require.resolve('@wppconnect/frontend/package.json');
        frontendPath = path.join(path.dirname(frontendPackage), 'build');
      } catch (error) {
        console.error(
          'Não foi encontrado o caminho para o frontend, por favor defina com --frontend-path ou instale o pacote @wppconnect/frontend'
        );
        process.exit(1);
      }
    }

    if (frontendPath) {
      // Requisição de configuração do frontend
      app.use('/config.js', (req, res) => {
        res.set({
          'Content-Type': 'application/javascript; charset=UTF-8',
        });
        res.send(`
// Arquivo gerado automaticamente
window.IP_SERVER = location.protocol + "//" + location.host + '/api/';
window.IP_SOCKET_IO = ((location.protocol === 'https:') ? 'wss:' : 'ws:') + "//" + location.host;
`);
      });

      app.use(express.static(frontendPath));

      app.get('*', function (req, res, next) {
        // Força a renderização do react para requisições do browser
        if (req.accepts('html')) {
          return res.sendfile(path.join(frontendPath, 'index.html'));
        }
        next();
      });
    }
  }
}

if (process.env['RUN_SERVER']) {
  run();
}
