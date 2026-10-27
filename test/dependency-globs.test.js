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
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const { createRequire } = require('node:module');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

test('rimraf ESM executable loads brace expansion and removes its target', () => {
  const owner = createRequire(require.resolve('rimraf'));
  const globOwner = createRequire(owner.resolve('glob'));
  assert.equal(globOwner('minimatch/package.json').version, '9.0.9');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'wppcli-rimraf-'));
  try {
    const target = path.join(directory, 'output');
    fs.mkdirSync(target);
    fs.writeFileSync(path.join(target, 'fixture.txt'), 'fixture');
    const manifest = require.resolve('rimraf/package.json');
    const executable = path.resolve(path.dirname(manifest), require(manifest).bin);
    execFileSync(process.execPath, [executable, target], { encoding: 'utf8' });
    assert.equal(fs.existsSync(target), false);
    assert.equal(fs.existsSync(directory), true);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('archiver glob expands braces and exclusions through its own minimatch', () => {
  const owner = createRequire(require.resolve('archiver-utils'));
  const globOwner = createRequire(owner.resolve('glob'));
  assert.equal(globOwner('minimatch/package.json').version, '9.0.9');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'wppcli-glob-'));
  try {
    for (const name of ['first.txt', 'second.txt', 'ignored.txt']) {
      fs.writeFileSync(path.join(directory, name), 'fixture');
    }
    const glob = require('archiver-utils/file').expand;
    assert.deepEqual(glob({ cwd: directory }, ['{first,second,ignored}.txt', '!ignored.txt']).sort(), [
      'first.txt',
      'second.txt',
    ]);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('legacy glob retains its callable minimatch and brace expansion APIs', () => {
  const owner = createRequire(require.resolve('glob'));
  const minimatch = owner('minimatch');
  assert.equal(minimatch('first.txt', '{first,second}.txt'), true);
  assert.equal(minimatch('third.txt', '{first,second}.txt'), false);
});

test('nodemon retains its named minimatch API for watched file patterns', () => {
  const owner = createRequire(require.resolve('nodemon'));
  const { minimatch } = owner('minimatch');
  assert.equal(minimatch('src/index.js', 'src/{index,config}.js'), true);
  assert.equal(minimatch('src/ignored.js', 'src/{index,config}.js'), false);
});
