const fs = require('node:fs');
const path = require('node:path');

class SettingsStore {
  constructor(file = path.join(process.cwd(), 'data', 'settings.json')) {
    this.file = file;
    this.data = { guilds: {} };
    this.load();
  }

  load() {
    if (fs.existsSync(this.file)) {
      const parsed = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      if (parsed && parsed.guilds) this.data = parsed;
    }
  }

  save() {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const temporary = `${this.file}.tmp`;
    fs.writeFileSync(temporary, `${JSON.stringify(this.data, null, 2)}\n`, { mode: 0o600 });
    fs.renameSync(temporary, this.file);
  }

  get(guildId, channelId) {
    return this.data.guilds[guildId]?.[channelId];
  }

  list(guildId) {
    return Object.entries(this.data.guilds[guildId] || {}).map(([channelId, value]) => ({ channelId, ...value }));
  }

  set(guildId, channelId, roleId) {
    this.data.guilds[guildId] ||= {};
    this.data.guilds[guildId][channelId] = { roleId };
    this.save();
  }

  remove(guildId, channelId) {
    if (!this.get(guildId, channelId)) return false;
    delete this.data.guilds[guildId][channelId];
    if (!Object.keys(this.data.guilds[guildId]).length) delete this.data.guilds[guildId];
    this.save();
    return true;
  }
}

module.exports = { SettingsStore };
