/*
 * Copyright 2026 WPPConnect Team
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
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');

delete process.env.RUN_SERVER;
const root = path.resolve(process.argv[2]);
const project = createRequire(path.join(root, 'package.json'));
project(root);
const server = createRequire(project.resolve('@wppconnect/server'));
const core = createRequire(server.resolve('@wppconnect-team/wppconnect'));
const extra = createRequire(core.resolve('puppeteer-extra'));
const merge = extra('deepmerge');
const cliRuntime = path.join(root, 'vendor', 'deepmerge', 'index.cjs');
let privateRuntime = cliRuntime;
if (merge !== project(cliRuntime)) {
  // The server also protects registry installs. Its later hook can supply its
  // own copy, but accept it only when both reviewed runtime files are identical.
  const serverRoot = path.dirname(project.resolve('@wppconnect/server/package.json'));
  privateRuntime = path.join(serverRoot, 'vendor', 'deepmerge', 'index.cjs');
  for (const file of ['index.cjs', 'is-mergeable-object.cjs']) {
    const source = (runtime) => fs.readFileSync(path.join(path.dirname(runtime), file), 'utf8').replace(/\r\n/g, '\n');
    assert.equal(source(privateRuntime), source(cliRuntime), `Unreviewed server merger runtime: ${file}`);
  }
  assert.equal(merge, server(privateRuntime));
}
const payload = JSON.parse('{"__proto__":{"isAdmin":true}}');
for (const result of [
  merge(Object.create(null), payload),
  merge({ session: null }, { session: payload }).session,
  merge(payload, {}),
]) {
  assert.equal(Object.getPrototypeOf(result), Object.prototype);
  assert.equal(result.isAdmin, undefined);
}
assert.deepEqual(merge.all([{ args: ['a'] }, { args: ['b'] }]), { args: ['a', 'b'] });
assert.equal({}.isAdmin, undefined);
// The imported server owns background timers; finish after these synchronous
// assertions and flush the result before terminating this fixture process.
process.stdout.write(
  JSON.stringify({
    publicEntryLoaded: true,
    privateRuntime,
    dependencyMetadataVersion: extra('deepmerge/package.json').version,
    prototypeCasesPassed: 3,
  }) + '\n',
  () => process.exit(0)
);
