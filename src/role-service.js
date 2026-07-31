async function grantRoleForMessage(message, roleId, reason = '設定チャンネルへの投稿') {
  if (!message.guild || message.author?.bot || message.webhookId) return { skipped: true };
  const member = message.member || await message.guild.members.fetch(message.author.id);
  if (member.roles.cache.has(roleId)) return { alreadyHad: true };
  await member.roles.add(roleId, reason);
  return { granted: true };
}

async function scanChannel(channel, roleId, onError = console.error) {
  let before;
  let scanned = 0;
  let granted = 0;
  const processedUsers = new Set();
  do {
    const options = { limit: 100 };
    if (before) options.before = before;
    const messages = await channel.messages.fetch(options);
    for (const message of messages.values()) {
      scanned += 1;
      if (!message.author?.id || processedUsers.has(message.author.id)) continue;
      processedUsers.add(message.author.id);
      try {
        const result = await grantRoleForMessage(message, roleId, '設定チャンネルへの過去の投稿');
        if (result.granted) granted += 1;
      } catch (error) {
        onError(`過去メッセージ ${message.id} の処理に失敗しました`, error);
      }
    }
    before = messages.last()?.id;
    if (messages.size < 100) break;
  } while (before);
  return { scanned, users: processedUsers.size, granted };
}

module.exports = { grantRoleForMessage, scanChannel };
