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
import * as path from 'path';
import * as express from 'express';
import { program } from './program';

program.parse();

const commandOptions = program.opts();

const { app } = initServer(commandOptions);

const frontendPath = path.join(
  path.dirname(require.resolve('@wppconnect/frontend/package.json')),
  'build'
);

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
