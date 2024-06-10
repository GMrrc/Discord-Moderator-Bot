const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const Utils = require('./../utils');


function commandData() {
  return new SlashCommandBuilder()
    .setName("tempban")
    .setDescription("Temporarily ban a user from the server")
    .addUserOption(option => option.setName('user').setDescription('The user to ban').setRequired(true))
    .addIntegerOption(option => option.setName('time').setDescription('The time to ban the user for').setRequired(true));
}

async function execute(interaction) {

  const member = interaction.member;

  if (member === undefined || member === null || member === '') {
    return;
  }

  let banRole = false;
  banRole = member.permissions.has(PermissionsBitField.Flags.BanMembers);

  if (!banRole) {
    await interaction.reply({
      content: 'You do not have the permission to use this command',
      ephemeral: true
    });
    return;
  }


  // Give a role to a user for a certain amount of time
  const userRequestRaw = interaction.options.get('user').value;
  const timeRequest = interaction.options.get('time').value;

  const userRequest = Utils.removeMentionTags(userRequestRaw);

  if (timeRequest < 1) {
    await interaction.reply({
      content: 'You cannot ban for less than 1 day',
      ephemeral: true
    });
    return;
  }

  if (timeRequest > 120) {
    await interaction.reply({
      content: 'You cannot ban for more than 120 days',
      ephemeral: true
    });
    return;
  }

  const banMember = interaction.guild.members.cache.get(userRequest);
  if (!banMember) {
    await interaction.reply({
      content: 'User not found',
      ephemeral: true
    });
    return;
  }

  banMember.ban({ days: timeRequest, reason: 'Temporary ban' })
    .then(() => {
      interaction.reply('User has been ban for ' + timeRequest + ' days')
      console.log(`tempban.execute (SUCCESS) : Banned user ${userRequest} for ${timeRequest} days on guild ${interaction.guildId}`);
    })
    .catch(error => {
      console.error('tempban.execute (ERROR) : '+error);
      interaction.reply({
        content: 'An error occured while banning the user',
        ephemeral: true
      });
    });

}


module.exports = {
  commandData,
  execute
}