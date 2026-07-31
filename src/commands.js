const { ChannelType, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

const roleConfigCommand = new SlashCommandBuilder()
  .setName('role-config')
  .setDescription('投稿者に付与するロールの設定を管理します')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false)
  .addSubcommand((command) => command
    .setName('set')
    .setDescription('チャンネルと付与ロールを設定し、過去の投稿者にも付与します')
    .addChannelOption((option) => option.setName('channel').setDescription('対象チャンネル').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement).setRequired(true))
    .addRoleOption((option) => option.setName('role').setDescription('付与するロール').setRequired(true)))
  .addSubcommand((command) => command
    .setName('remove')
    .setDescription('チャンネルの設定を解除します（付与済みロールは維持）')
    .addChannelOption((option) => option.setName('channel').setDescription('解除するチャンネル').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement).setRequired(true)))
  .addSubcommand((command) => command.setName('list').setDescription('このサーバーの設定一覧を表示します'));

module.exports = { commands: [roleConfigCommand.toJSON()] };
