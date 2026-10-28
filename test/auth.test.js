import { after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

// bcrypt is a dependency of @wppconnect/server; resolve it from there instead of
// declaring a dependency of our own. It is what verifyToken uses to check tokens.
const bcrypt = require(require.resolve('bcrypt', {
  paths: [require.resolve('@wppconnect/server')],
}));

// @wppconnect/server falls back to this public secret when none is configured,
// which lets anyone mint valid tokens through POST /api/:session/:secretkey/generate-token.
const DEFAULT_SECRET = 'THISISMYSECURETOKEN';
const SESSION = 'regression';
const ROOT = path.resolve(__dirname, '..');
const COMPILED = process.env.WPP_CLI_TEST_COMPILED === '1';
const babelManifest = require.resolve('@babel/node/package.json');
const CLI_ENTRY = COMPILED
  ? path.join(ROOT, 'bin', 'wppserver.js')
  : path.resolve(path.dirname(babelManifest), require(babelManifest).bin['babel-node']);

const children = new Set();
const tmpDirs = new Set();

after(() => {
  for (const child of children) child.kill('SIGKILL');
  for (const dir of tmpDirs) fs.rmSync(dir, { recursive: true, force: true });
});

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', reject);
    srv.listen(0, () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

// Runs the real CLI entrypoint, so the effective configuration (flags, config
// file, SECRET_KEY env) is what the HTTP assertions below are made against.
// `config`, when given, is written to a temp file and passed as --config.
async function startCli(args = [], env = {}, config) {
  const port = await freePort();
  if (config) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wpp-cli-test-'));
    tmpDirs.add(dir);
    const file = path.join(dir, 'config.json');
    fs.writeFileSync(file, JSON.stringify(config));
    args = [...args, '--config', file];
  }
  const childEnv = { ...process.env, RUN_SERVER: COMPILED ? '' : '1', PORT: String(port), ...env };
  for (const key of Object.keys(childEnv)) {
    if (childEnv[key] === undefined) delete childEnv[key];
  }

  const child = spawn(
    process.execPath,
    [CLI_ENTRY, ...(COMPILED ? [] : ['src']), '--port', String(port), '--no-startAllSession', ...args],
    {
      cwd: ROOT,
      env: childEnv,
    }
  );
  children.add(child);

  let output = '';
  child.stdout.on('data', (d) => (output += d));
  child.stderr.on('data', (d) => (output += d));

  const exited = new Promise((resolve) => child.once('exit', (code) => resolve(code)));

  const outcome = await new Promise((resolve) => {
    const timer = setTimeout(() => resolve({ listening: false }), 60000);
    const poll = setInterval(() => {
      if (output.includes('Server is running on port')) {
        clearTimeout(timer);
        clearInterval(poll);
        resolve({ listening: true });
      }
    }, 100);
    exited.then((code) => {
      clearTimeout(timer);
      clearInterval(poll);
      resolve({ listening: false, code });
    });
  });

  return {
    ...outcome,
    port,
    output: () => output,
    stop: () => child.kill('SIGKILL'),
    url: (p) => `http://127.0.0.1:${port}${p}`,
  };
}

async function generateToken(server, secret) {
  const res = await fetch(server.url(`/api/${SESSION}/${secret}/generate-token`), { method: 'POST' });
  return { status: res.status, body: await res.json() };
}

// verifyToken accepts bcrypt(session + secretKey), so a server that ends up with
// an empty/null secret accepts hashes anyone can compute without knowing a secret.
function forgedToken(secretSuffix) {
  return bcrypt
    .hashSync(SESSION + secretSuffix, 4)
    .replace(/\//g, '_')
    .replace(/\+/g, '-');
}

async function connectionStatus(server, token) {
  const res = await fetch(server.url(`/api/${SESSION}/check-connection-session`), {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.status;
}

// Only `secret` may work: it mints a token that is accepted; the public default
// cannot mint one; tokens forged for an empty/null/undefined secret are rejected.
async function assertOnlySecretWorks(server, secret) {
  for (const suffix of ['', 'null', 'undefined']) {
    assert.equal(
      await connectionStatus(server, forgedToken(suffix)),
      401,
      `token forged for secret "${suffix}" must be rejected`
    );
  }

  assert.equal((await generateToken(server, DEFAULT_SECRET)).status, 400);

  const minted = await generateToken(server, secret);
  assert.equal(minted.status, 201);
  assert.equal(await connectionStatus(server, minted.body.token), 200);
}

describe('API authentication (real CLI, real HTTP)', () => {
  describe('with a configured secretKey', () => {
    const SECRET = 'a-unique-test-secret-0123456789';
    let server;

    it('starts', async () => {
      server = await startCli(['--secretKey', SECRET]);
      assert.equal(server.listening, true, server.output());
    });

    for (const route of ['check-connection-session', 'status-session']) {
      it(`rejects ${route} without credentials`, async () => {
        const res = await fetch(server.url(`/api/${SESSION}/${route}`));
        assert.ok([401, 403].includes(res.status), `got ${res.status}`);
      });

      it(`rejects ${route} with an invalid token`, async () => {
        const res = await fetch(server.url(`/api/${SESSION}/${route}`), {
          headers: { Authorization: 'Bearer not-a-valid-token' },
        });
        assert.ok([401, 403].includes(res.status), `got ${res.status}`);
      });
    }

    it('rejects a token minted from the well-known default secret', async () => {
      const res = await fetch(server.url(`/api/${SESSION}/${DEFAULT_SECRET}/generate-token`), { method: 'POST' });
      assert.equal(res.status, 400);
    });

    it('accepts a token minted with the configured secret', async () => {
      const { status, body } = await generateToken(server, SECRET);
      assert.equal(status, 201);

      const res = await fetch(server.url(`/api/${SESSION}/check-connection-session`), {
        headers: { Authorization: `Bearer ${body.token}` },
      });
      assert.equal(res.status, 200);
    });

    it('stops', () => server.stop());
  });

  describe('without a secretKey (falls back to the public default)', () => {
    it('refuses to start, so no token can be minted with the default', async () => {
      const server = await startCli([], { SECRET_KEY: undefined });
      try {
        assert.equal(server.listening, false, 'server must not listen');
        assert.notEqual(server.code, 0);
        assert.match(server.output(), /secretKey/);
      } finally {
        server.stop();
      }
    });

    it('refuses an explicit --secretKey equal to the public default', async () => {
      const server = await startCli(['--secretKey', DEFAULT_SECRET], {
        SECRET_KEY: undefined,
      });
      try {
        assert.equal(server.listening, false, 'server must not listen');
        assert.notEqual(server.code, 0);
      } finally {
        server.stop();
      }
    });
  });

  describe('secret supplied through the SECRET_KEY environment variable', () => {
    it('starts and enforces that secret', async () => {
      const SECRET = 'env-provided-secret-0123456789';
      const server = await startCli([], { SECRET_KEY: SECRET });
      try {
        assert.equal(server.listening, true, server.output());
        await assertOnlySecretWorks(server, SECRET);
      } finally {
        server.stop();
      }
    });
  });

  // merge-deep lets an explicit empty/null value override the server default, so
  // the secret the CLI validates must be the one handed to initServer.
  describe('explicitly empty secretKey combined with SECRET_KEY', () => {
    const SECRET = 'env-provided-secret-0123456789';
    const cases = [
      { name: 'config file ""', args: [], config: { secretKey: '' } },
      { name: 'config file null', args: [], config: { secretKey: null } },
      { name: 'config file whitespace', args: [], config: { secretKey: '  ' } },
      { name: 'flag ""', args: ['--secretKey', ''], config: undefined },
    ];

    for (const { name, args, config } of cases) {
      it(`uses the environment secret (${name})`, async () => {
        const server = await startCli(args, { SECRET_KEY: SECRET }, config);
        try {
          assert.equal(server.listening, true, server.output());
          await assertOnlySecretWorks(server, SECRET);
        } finally {
          server.stop();
        }
      });

      it(`refuses to start without an environment secret (${name})`, async () => {
        const server = await startCli(args, { SECRET_KEY: undefined }, config);
        try {
          assert.equal(server.listening, false, 'server must not listen');
          assert.notEqual(server.code, 0);
        } finally {
          server.stop();
        }
      });
    }
  });
});
