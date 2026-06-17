const assert = require('node:assert/strict')
const { test } = require('node:test')

const {
  expandWindowsEnvRefs,
  parseRegQueryValue,
  readWindowsUserEnvVar
} = require('./windows-user-env.cjs')

// ── parseRegQueryValue ─────────────────────────────────────────────────────

test('parseRegQueryValue extracts a REG_SZ value', () => {
  const out = [
    '',
    'HKEY_CURRENT_USER\\Environment',
    '    NOZICH_HOME    REG_SZ    F:\\Nozich\\data',
    ''
  ].join('\r\n')
  assert.equal(parseRegQueryValue(out, 'NOZICH_HOME'), 'F:\\Nozich\\data')
})

test('parseRegQueryValue matches the name case-insensitively', () => {
  const out = 'HKEY_CURRENT_USER\\Environment\r\n    Nozich_Home    REG_EXPAND_SZ    %USERPROFILE%\\h\r\n'
  assert.equal(parseRegQueryValue(out, 'NOZICH_HOME'), '%USERPROFILE%\\h')
})

test('parseRegQueryValue preserves spaces inside the value', () => {
  const out = '    NOZICH_HOME    REG_SZ    C:\\Program Files\\Nozich\r\n'
  assert.equal(parseRegQueryValue(out, 'NOZICH_HOME'), 'C:\\Program Files\\Nozich')
})

test('parseRegQueryValue returns null when the value line is absent', () => {
  const out = 'HKEY_CURRENT_USER\\Environment\r\n    Path    REG_SZ    C:\\x\r\n'
  assert.equal(parseRegQueryValue(out, 'NOZICH_HOME'), null)
  assert.equal(parseRegQueryValue('', 'NOZICH_HOME'), null)
  assert.equal(parseRegQueryValue('garbage', 'NOZICH_HOME'), null)
})

// ── expandWindowsEnvRefs ───────────────────────────────────────────────────

test('expandWindowsEnvRefs expands %VAR% case-insensitively', () => {
  assert.equal(
    expandWindowsEnvRefs('%UserProfile%\\h', { USERPROFILE: 'C:\\Users\\jeff' }),
    'C:\\Users\\jeff\\h'
  )
})

test('expandWindowsEnvRefs leaves literal paths and unknown refs intact', () => {
  assert.equal(expandWindowsEnvRefs('F:\\Nozich\\data', {}), 'F:\\Nozich\\data')
  assert.equal(expandWindowsEnvRefs('%NOPE%\\x', {}), '%NOPE%\\x')
})

// ── readWindowsUserEnvVar ──────────────────────────────────────────────────

test('readWindowsUserEnvVar returns null off Windows without spawning', () => {
  let spawned = false
  const exec = () => {
    spawned = true
    return ''
  }
  assert.equal(readWindowsUserEnvVar('NOZICH_HOME', { platform: 'linux', exec }), null)
  assert.equal(spawned, false)
})

test('readWindowsUserEnvVar queries HKCU\\Environment and expands the value', () => {
  const calls = []
  const exec = (cmd, args) => {
    calls.push([cmd, args])
    return 'HKEY_CURRENT_USER\\Environment\r\n    NOZICH_HOME    REG_EXPAND_SZ    %DRIVE%\\Nozich\r\n'
  }
  const value = readWindowsUserEnvVar('NOZICH_HOME', {
    platform: 'win32',
    env: { DRIVE: 'F:' },
    exec
  })
  assert.equal(value, 'F:\\Nozich')
  assert.deepEqual(calls, [['reg', ['query', 'HKCU\\Environment', '/v', 'NOZICH_HOME']]])
})

test('readWindowsUserEnvVar returns null when reg exits non-zero (value missing)', () => {
  const exec = () => {
    throw new Error('reg exited 1')
  }
  assert.equal(readWindowsUserEnvVar('NOZICH_HOME', { platform: 'win32', exec }), null)
})

test('readWindowsUserEnvVar returns null for an empty value', () => {
  const exec = () => '    NOZICH_HOME    REG_SZ    \r\n'
  assert.equal(readWindowsUserEnvVar('NOZICH_HOME', { platform: 'win32', exec }), null)
})
