const { SlashCommandBuilder } = require('discord.js');
const Utils = require('./../utils');


function commandData() {
  return new SlashCommandBuilder()
    .setName("banlist")
    .setDescription("List all banwords in the guild, in your DMs");
}

async function execute(interaction, banwordManager) {

  const guildId = interaction.guildId;
  const member = interaction.member;

  await interaction.reply({
    content: 'Check your DMs for a list of banned words',
    ephemeral: true
  });

  const banlistEmbed = Utils.toEmbed('Banned Words', 'Banned words : ' + (banwordManager.getBanwords(guildId) || []).join(', '));

  await member.send({ embeds: [banlistEmbed] });

  console.log(`banlist.execute (SUCCESS) : Sent banlist to ${member.user.id} in DMs from guild ${guildId} `);

}
module.exports = {
  commandData,
  execute
};