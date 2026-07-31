const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

function loadConfig() {
  const configPath = path.join(process.cwd(), 'config.json');
  let file = {};
  if (fs.existsSync(configPath)) {
    file = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  const config = {
    token: process.env.DISCORD_TOKEN || file.token,
    clientId: process.env.DISCORD_CLIENT_ID || file.clientId,
    guildId: process.env.DISCORD_GUILD_ID || file.guildId || undefined,
  };
  const missing = ['token', 'clientId'].filter((key) => !config[key]);
  if (missing.length) {
    throw new Error(`設定が不足しています: ${missing.join(', ')}。.env.example または config.example.json を参照してください。`);
  }
  return config;
}

module.exports = { loadConfig };
