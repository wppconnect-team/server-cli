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

const normalizePaths = (values) => values.map((value) => value.split(path.sep).join('/')).sort();

function assertPatternBudget(modulePath) {
  const code = `
    const assert = require('node:assert/strict');
    const { Minimatch } = require(${JSON.stringify(modulePath)});
    const options = { optimizationLevel: 2, braceExpandMax: 64 };
    const normal = new Minimatch('**/*.{txt,bin}', options);
    assert.equal(normal.match('nested/a.txt'), true);
    assert.equal(normal.match('nested/a.js'), false);
    assert.throws(
      () => new Minimatch(Array.from({length:12}, (_, i) => 'p'+i+'/**/../q'+i).join('/'), options),
      { name: 'RangeError', message: "optimizationLevel 2: too many patterns from '**/..'" }
    );
  `;
  execFileSync(process.execPath, ['--max-old-space-size=192', '-e', code], {
    encoding: 'utf8',
    timeout: 3000,
  });
}

test('rimraf ESM executable loads brace expansion and removes its target', () => {
  const owner = createRequire(require.resolve('rimraf'));
  const globOwner = createRequire(owner.resolve('glob'));
  assert.equal(globOwner('minimatch/package.json').version, '11.0.5');
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
  assert.equal(globOwner('minimatch/package.json').version, '11.0.5');
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
  const licenseOwner = createRequire(require.resolve('license-check-and-add/package.json'));
  const globbyOwner = createRequire(licenseOwner.resolve('globby'));
  const owner = createRequire(globbyOwner.resolve('glob'));
  const minimatch = owner('minimatch');
  assert.equal(minimatch('first.txt', '{first,second}.txt'), true);
  assert.equal(minimatch('third.txt', '{first,second}.txt'), false);
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'wppcli-legacy-glob-'));
  try {
    fs.mkdirSync(path.join(directory, 'nested'));
    fs.writeFileSync(path.join(directory, 'nested', 'fixture.txt'), 'fixture');
    const globby = licenseOwner('globby');
    assert.deepEqual(normalizePaths(globby.sync(['**/*.txt'], { cwd: directory })), ['nested/fixture.txt']);
  } finally {
    const resolved = fs.realpathSync(directory);
    assert.equal(path.dirname(resolved), fs.realpathSync(os.tmpdir()));
    assert.ok(path.basename(resolved).startsWith('wppcli-legacy-glob-'));
    fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 3 });
  }
});

test('nodemon retains its named minimatch API for watched file patterns', () => {
  const owner = createRequire(require.resolve('nodemon'));
  assert.equal(owner('minimatch/package.json').version, '11.0.8');
  const { minimatch } = owner('minimatch');
  assert.equal(minimatch('src/index.js', 'src/{index,config}.js'), true);
  assert.equal(minimatch('src/ignored.js', 'src/{index,config}.js'), false);
});

test('actual Archiver ZIP traversal keeps brace, dotfile and exclusion semantics', async () => {
  const archiver = require('archiver');
  const unzipper = require('unzipper');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'wppcli-archive-'));
  try {
    fs.mkdirSync(path.join(directory, 'nested'));
    for (const name of ['a.txt', 'b.bin', 'ignore.txt', '.hidden.txt'])
      fs.writeFileSync(path.join(directory, 'nested', name), 'fixture');
    const archiveOwner = createRequire(require.resolve('archiver'));
    const traversalOwner = createRequire(archiveOwner.resolve('readdir-glob'));
    assert.equal(traversalOwner('minimatch/package.json').version, '11.0.8');
    const zip = archiver('zip');
    const chunks = [];
    const ended = new Promise((resolve, reject) => {
      zip.on('data', (chunk) => chunks.push(chunk));
      zip.once('end', resolve);
      zip.once('error', reject);
    });
    zip.glob('**/*.{txt,bin}', { cwd: directory, dot: true, ignore: '**/ignore.txt' });
    await zip.finalize();
    await ended;
    const result = await unzipper.Open.buffer(Buffer.concat(chunks));
    assert.deepEqual(result.files.map((file) => file.path).sort(), [
      'nested/.hidden.txt',
      'nested/a.txt',
      'nested/b.bin',
    ]);
  } finally {
    const resolved = fs.realpathSync(directory);
    assert.equal(path.dirname(resolved), fs.realpathSync(os.tmpdir()));
    assert.ok(path.basename(resolved).startsWith('wppcli-archive-'));
    fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 3 });
  }
});

test('the actual Archiver traversal engine rejects excessive first-phase work', () => {
  const archiveOwner = createRequire(require.resolve('archiver'));
  const owner = createRequire(archiveOwner.resolve('readdir-glob'));
  assert.equal(owner('minimatch/package.json').version, '11.0.8');
  const modulePath = owner.resolve('minimatch');
  assertPatternBudget(modulePath);
});

test('the actual glob matching engine rejects excessive first-phase work', () => {
  const owner = createRequire(require.resolve('archiver-utils'));
  const globOwner = createRequire(owner.resolve('glob'));
  const modulePath = globOwner.resolve('minimatch');
  assertPatternBudget(modulePath);
});

test('modern glob owners traverse recursive wildcards with their installed matcher', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'wppcli-owner-globs-'));
  try {
    fs.mkdirSync(path.join(directory, 'nested'));
    for (const name of ['a.txt', 'b.bin', 'ignore.txt', '.hidden.txt']) {
      fs.writeFileSync(path.join(directory, 'nested', name), 'fixture');
    }
    for (const name of ['archiver-utils', 'rimraf']) {
      const owner = createRequire(require.resolve(name));
      const glob = owner('glob');
      assert.deepEqual(
        normalizePaths(glob.sync('**/*.txt', { cwd: directory })),
        ['nested/a.txt', 'nested/ignore.txt'],
        name
      );
      assert.deepEqual(
        normalizePaths(glob.sync('**/*.{txt,bin}', { cwd: directory, dot: true, ignore: '**/ignore.txt' })),
        ['nested/.hidden.txt', 'nested/a.txt', 'nested/b.bin'],
        name
      );
    }
    assert.deepEqual(normalizePaths(require('archiver-utils/file').expand({ cwd: directory }, ['**/*.txt'])), [
      'nested/a.txt',
      'nested/ignore.txt',
    ]);
    const manifest = require.resolve('rimraf/package.json');
    const executable = path.resolve(path.dirname(manifest), require(manifest).bin);
    execFileSync(process.execPath, [executable, '--glob', 'nested/*.bin'], { cwd: directory, encoding: 'utf8' });
    assert.equal(fs.existsSync(path.join(directory, 'nested', 'b.bin')), false);
    assert.equal(fs.existsSync(path.join(directory, 'nested', 'a.txt')), true);
  } finally {
    const resolved = fs.realpathSync(directory);
    assert.equal(path.dirname(resolved), fs.realpathSync(os.tmpdir()));
    assert.ok(path.basename(resolved).startsWith('wppcli-owner-globs-'));
    fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 3 });
  }
});

test('nested legacy rimraf preserves callback and wildcard deletion contracts', async () => {
  const plugin = createRequire(require.resolve('puppeteer-extra-plugin-user-data-dir'));
  const owner = createRequire(plugin.resolve('rimraf'));
  const rimraf = plugin('rimraf');
  assert.equal(typeof rimraf, 'function');
  assert.equal(typeof owner('glob'), 'function');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'wppcli-legacy-rimraf-'));
  try {
    fs.writeFileSync(path.join(directory, 'remove.txt'), 'fixture');
    fs.writeFileSync(path.join(directory, 'keep.bin'), 'fixture');
    const pattern = directory.split(path.sep).join('/') + '/*.txt';
    await new Promise((resolve, reject) => rimraf(pattern, (error) => (error ? reject(error) : resolve())));
    assert.equal(fs.existsSync(path.join(directory, 'remove.txt')), false);
    assert.equal(fs.existsSync(path.join(directory, 'keep.bin')), true);
  } finally {
    const resolved = fs.realpathSync(directory);
    assert.equal(path.dirname(resolved), fs.realpathSync(os.tmpdir()));
    assert.ok(path.basename(resolved).startsWith('wppcli-legacy-rimraf-'));
    fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 3 });
  }
});
