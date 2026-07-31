const { REST, Routes } = require('discord.js');
const { loadConfig } = require('./config');
const { commands } = require('./commands');

async function main() {
  const config = loadConfig();
  const rest = new REST({ version: '10' }).setToken(config.token);
  if (config.guildId) {
    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands });
    console.log(`サーバー ${config.guildId} にコマンドを登録しました。`);
  } else {
    await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
    console.log('グローバルコマンドを登録しました（反映に時間がかかる場合があります）。');
  }
}

main().catch((error) => { console.error('セットアップに失敗しました:', error); process.exitCode = 1; });
