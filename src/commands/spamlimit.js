const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

function commandData() {
  return new SlashCommandBuilder()
    .setName("spamlimit")
    .setDescription("Set the spam limit for the server")
    .addIntegerOption(option => option.setName('limit').setDescription('The number of messages to limit').setRequired(true));
  }

async function execute(interaction, userSpamManager) {

  const guildId = interaction.guildId;
  const member = interaction.member;

  if (guildId === undefined || guildId === null || guildId === '') {
    return;
  }

  if (member === undefined || member === null || member === '') {
    return;
  }

  let messageRole = false;
  messageRole = member.permissions.has(PermissionsBitField.Flags.ManageMessages);


  if (!messageRole) {
    await interaction.reply({
      content: 'You do not have the permission to use this command',
      ephemeral: true
    });
    return;
  }


  const userRequest = interaction.options.get('limit').value;

  if (userRequest < 2) {
    await interaction.reply({
      content: 'You cannot set the spam limit to less than 2 messages',
      ephemeral: true
    });
    return;
  }

  if (userRequest > 100) {
    await interaction.reply({
      content: 'You cannot set the spam limit to more than 100 messages',
      ephemeral: true
    });
    return;
  }

  await userSpamManager.setMaxSpam(guildId, userRequest);
  await interaction.reply(`Spam limit set to ${userRequest} messages`);

  console.log(`spamlimit.execute (SUCCESS) : Set spam limit to ${userRequest} on guild ${guildId}`);

}

module.exports = {
  commandData,
  execute
};
