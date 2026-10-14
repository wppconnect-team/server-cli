import { after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';

// @wppconnect/server falls back to this public secret when none is configured,
// which lets anyone mint valid tokens through POST /api/:session/:secretkey/generate-token.
const DEFAULT_SECRET = 'THISISMYSECURETOKEN';
const SESSION = 'regression';
const ROOT = path.resolve(__dirname, '..');
const BABEL_NODE = path.join(ROOT, 'node_modules', '.bin', 'babel-node');

const children = new Set();

after(() => {
  for (const child of children) child.kill('SIGKILL');
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
async function startCli(args = [], env = {}) {
  const port = await freePort();
  const childEnv = { ...process.env, RUN_SERVER: '1', PORT: String(port), ...env };
  for (const key of Object.keys(childEnv)) {
    if (childEnv[key] === undefined) delete childEnv[key];
  }

  const child = spawn(
    BABEL_NODE,
    ['src', '--port', String(port), '--no-startAllSession', ...args],
    { cwd: ROOT, env: childEnv }
  );
  children.add(child);

  let output = '';
  child.stdout.on('data', (d) => (output += d));
  child.stderr.on('data', (d) => (output += d));

  const exited = new Promise((resolve) =>
    child.once('exit', (code) => resolve(code))
  );

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
  const res = await fetch(
    server.url(`/api/${SESSION}/${secret}/generate-token`),
    { method: 'POST' }
  );
  return { status: res.status, body: await res.json() };
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
      const res = await fetch(
        server.url(`/api/${SESSION}/${DEFAULT_SECRET}/generate-token`),
        { method: 'POST' }
      );
      assert.equal(res.status, 400);
    });

    it('accepts a token minted with the configured secret', async () => {
      const { status, body } = await generateToken(server, SECRET);
      assert.equal(status, 201);

      const res = await fetch(
        server.url(`/api/${SESSION}/check-connection-session`),
        { headers: { Authorization: `Bearer ${body.token}` } }
      );
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
        assert.equal((await generateToken(server, DEFAULT_SECRET)).status, 400);
        assert.equal((await generateToken(server, SECRET)).status, 201);
      } finally {
        server.stop();
      }
    });
  });
});
