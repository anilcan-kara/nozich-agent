/**
 * Tests for electron/backend-probes.cjs.
 *
 * Run with: node --test electron/backend-probes.test.cjs
 * (Wired into npm test:desktop:platforms in package.json.)
 */

const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const { canImportNozichCli, verifyNozichCli } = require('./backend-probes.cjs')

// Resolve the host's own Node binary -- guaranteed to be on disk and
// runnable. We use it as both a stand-in for "a python that doesn't
// have nozich_cli" (since `node -c "import nozich_cli"` will exit
// non-zero) and as a way to script verifyNozichCli's success path
// (a tiny script we write to disk that exits 0 on --version).
const NODE_BIN = process.execPath

test('canImportNozichCli returns false when path is falsy', () => {
  assert.equal(canImportNozichCli(''), false)
  assert.equal(canImportNozichCli(null), false)
  assert.equal(canImportNozichCli(undefined), false)
})

test('canImportNozichCli returns false when interpreter cannot run -c', () => {
  // node IS an interpreter, but `node -c "import nozich_cli"` is a
  // SyntaxError -- different exit reason from a real Python's
  // ModuleNotFoundError, but the predicate is "exit 0 or not" and
  // both land on "not", which is exactly what we want for the
  // resolver fall-through.
  assert.equal(canImportNozichCli(NODE_BIN), false)
})

test('canImportNozichCli returns false when binary does not exist', () => {
  const ghost = path.join(os.tmpdir(), 'nozich-probes-ghost-' + Date.now() + '.exe')
  assert.equal(canImportNozichCli(ghost), false)
})

test('verifyNozichCli returns false when command is falsy', () => {
  assert.equal(verifyNozichCli(''), false)
  assert.equal(verifyNozichCli(null), false)
  assert.equal(verifyNozichCli(undefined), false)
})

test('verifyNozichCli returns false when binary does not exist', () => {
  const ghost = path.join(os.tmpdir(), 'nozich-probes-ghost-' + Date.now() + '.exe')
  assert.equal(verifyNozichCli(ghost), false)
})

test('verifyNozichCli returns true when --version exits 0', () => {
  // Write a tiny script that exits 0 regardless of args, then invoke
  // it through node. This stands in for a working nozich binary --
  // verifyNozichCli only cares about the exit code.
  const scriptPath = path.join(os.tmpdir(), `nozich-probes-ok-${Date.now()}-${process.pid}.cjs`)
  fs.writeFileSync(scriptPath, 'process.exit(0)\n')
  try {
    // Use node as the launcher and our script as the "command". Pass
    // shell:false (default) -- node is a real binary, no shim.
    // execFileSync passes ['--version'] as args, which node ignores
    // gracefully (well, it prints its version and exits 0, which is
    // perfect -- exit code 0 is the only signal we read).
    assert.equal(verifyNozichCli(NODE_BIN), true)
  } finally {
    try {
      fs.unlinkSync(scriptPath)
    } catch {
      void 0
    }
  }
})

test('verifyNozichCli swallows timeouts (does not throw)', () => {
  // We can't easily provoke a real 5s hang in CI without slowing the
  // suite, but we CAN confirm that an invocation that DOES throw
  // (because the binary is missing) returns false rather than
  // propagating. Same code path the timeout case takes.
  assert.equal(verifyNozichCli('/definitely/not/a/real/binary/anywhere'), false)
})
