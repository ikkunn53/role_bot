const assert = require('node:assert/strict');
const test = require('node:test');
const { grantRoleForMessage, scanChannel } = require('../src/role-service');

test('本文がない添付ファイルだけのメッセージでもロールを付与する', async () => {
  let added;
  const member = { roles: { cache: new Map(), add: async (roleId) => { added = roleId; } } };
  const message = { content: '', attachments: new Map([['image', {}]]), guild: {}, author: { id: 'user', bot: false }, member };
  assert.deepEqual(await grantRoleForMessage(message, 'role'), { granted: true });
  assert.equal(added, 'role');
});

test('Bot、Webhook、付与済みユーザーはスキップする', async () => {
  assert.deepEqual(await grantRoleForMessage({ guild: {}, author: { bot: true } }, 'role'), { skipped: true });
  assert.deepEqual(await grantRoleForMessage({ guild: {}, author: { bot: false }, webhookId: 'webhook' }, 'role'), { skipped: true });
  const member = { roles: { cache: new Map([['role', {}]]) } };
  assert.deepEqual(await grantRoleForMessage({ guild: {}, author: { bot: false }, member }, 'role'), { alreadyHad: true });
});

test('過去走査では同じユーザーを一度だけ処理し、ページを最後まで取得する', async () => {
  let fetches = 0;
  let additions = 0;
  const member = () => ({ roles: { cache: new Map(), add: async () => { additions += 1; } } });
  const firstPage = new Map();
  for (let index = 0; index < 100; index += 1) {
    const id = String(200 - index);
    firstPage.set(id, { id, guild: {}, author: { id: index ? 'same-user' : 'first-user', bot: false }, member: member() });
  }
  const secondPage = new Map([['100', { id: '100', guild: {}, author: { id: 'last-user', bot: false }, member: member() }]]);
  firstPage.last = () => [...firstPage.values()].at(-1);
  secondPage.last = () => [...secondPage.values()].at(-1);
  const channel = { messages: { fetch: async (options) => { fetches += 1; return options.before ? secondPage : firstPage; } } };
  const result = await scanChannel(channel, 'role');
  assert.deepEqual(result, { scanned: 101, users: 3, granted: 3 });
  assert.equal(fetches, 2);
  assert.equal(additions, 3);
});
