const { Client, Events, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
const { loadConfig } = require('./config');
const { SettingsStore } = require('./store');
const { grantRoleForMessage, scanChannel } = require('./role-service');

const config = loadConfig();
const store = new SettingsStore();
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages] });

async function validateRole(interaction, role) {
  const me = interaction.guild.members.me || await interaction.guild.members.fetchMe();
  if (role.id === interaction.guild.id || role.managed) return 'そのロールはBotから付与できません。';
  if (!me.permissions.has(PermissionFlagsBits.ManageRoles)) return 'Botに「ロールの管理」権限がありません。';
  if (role.position >= me.roles.highest.position) return '対象ロールをBotの最上位ロールより下に配置してください。';
  return null;
}

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`${readyClient.user.tag} として起動しました。過去メッセージを確認します。`);
  for (const [guildId] of readyClient.guilds.cache) {
    for (const setting of store.list(guildId)) {
      try {
        const channel = await readyClient.channels.fetch(setting.channelId);
        if (channel?.isTextBased()) {
          const result = await scanChannel(channel, setting.roleId);
          console.log(`[${guildId}/${setting.channelId}] ${result.scanned}件確認、${result.granted}人に付与`);
        }
      } catch (error) { console.error(`[${guildId}/${setting.channelId}] 過去投稿の確認に失敗:`, error); }
    }
  }
});

client.on(Events.MessageCreate, async (message) => {
  const role = message.guild && store.get(message.guild.id, message.channel.id);
  if (!role) return;
  try { await grantRoleForMessage(message, role.roleId); }
  catch (error) { console.error(`メッセージ ${message.id} のロール付与に失敗:`, error); }
});

async function handleInteraction(interaction) {
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'role-config' || !interaction.inGuild()) return;
  if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({ content: 'このコマンドは管理者専用です。', ephemeral: true }); return;
  }
  const subcommand = interaction.options.getSubcommand();
  if (subcommand === 'list') {
    const settings = store.list(interaction.guildId);
    const content = settings.length ? settings.map((item) => `・<#${item.channelId}> → <@&${item.roleId}>`).join('\n') : '設定はありません。';
    await interaction.reply({ content, ephemeral: true }); return;
  }
  const channel = interaction.options.getChannel('channel', true);
  if (subcommand === 'remove') {
    const removed = store.remove(interaction.guildId, channel.id);
    await interaction.reply({ content: removed ? `<#${channel.id}> の設定を解除しました。付与済みロールは維持されます。` : 'そのチャンネルは設定されていません。', ephemeral: true }); return;
  }
  const role = interaction.options.getRole('role', true);
  const validationError = await validateRole(interaction, role);
  if (validationError) { await interaction.reply({ content: validationError, ephemeral: true }); return; }
  store.set(interaction.guildId, channel.id, role.id);
  await interaction.reply({
    content: `<#${channel.id}> → <@&${role.id}> を設定しました。過去投稿はバックグラウンドで確認します。`,
    ephemeral: true,
  });
  try {
    const result = await scanChannel(channel, role.id);
    console.log(`[${interaction.guildId}/${channel.id}] 設定後: ${result.scanned}件・${result.users}人を確認、${result.granted}人に付与`);
    await interaction.editReply(`<#${channel.id}> → <@&${role.id}> を設定しました。過去${result.scanned}件（${result.users}人）を確認し、${result.granted}人に付与しました。`)
      .catch(() => {}); // 長時間の走査でインタラクションの有効期限が切れても設定処理は完了させる
  } catch (error) {
    console.error('設定後の過去投稿確認に失敗:', error);
    await interaction.editReply('設定は保存しましたが、過去投稿の確認に失敗しました。Botの権限を確認してください。').catch(() => {});
  }
}

client.on(Events.InteractionCreate, (interaction) => {
  handleInteraction(interaction).catch(async (error) => {
    console.error('コマンド処理に失敗:', error);
    const response = { content: 'コマンド処理中にエラーが発生しました。Botの権限とログを確認してください。', ephemeral: true };
    if (interaction.isRepliable()) {
      if (interaction.replied || interaction.deferred) await interaction.followUp(response).catch(() => {});
      else await interaction.reply(response).catch(() => {});
    }
  });
});

client.on(Events.Error, (error) => console.error('Discordクライアントエラー:', error));

client.login(config.token).catch((error) => { console.error('ログインに失敗しました:', error); process.exitCode = 1; });
