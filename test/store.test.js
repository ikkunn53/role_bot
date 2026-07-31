const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { SettingsStore } = require('../src/store');

test('設定の保存、再読込、解除ができる', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'role-bot-'));
  const file = path.join(directory, 'settings.json');
  const store = new SettingsStore(file);
  store.set('guild-1', 'channel-1', 'role-1');
  assert.deepEqual(new SettingsStore(file).get('guild-1', 'channel-1'), { roleId: 'role-1' });
  assert.equal(store.remove('guild-1', 'channel-1'), true);
  assert.equal(store.remove('guild-1', 'channel-1'), false);
  assert.deepEqual(store.list('guild-1'), []);
});
