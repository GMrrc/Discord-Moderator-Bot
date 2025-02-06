const { SlashCommandBuilder } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');
const Utils = require('./../utils');

function commandData() {
  return new SlashCommandBuilder()
    .setName("skipsong")
    .setDescription("Skip the current song of the channel queue");
}

async function execute(interaction, songManager) {
  try {
    const guildId = interaction.guild.id;
    let player = songManager.getAudioPlayer(guildId);

    const isPlaying = songManager.getWaiting(guildId);
    if (isPlaying) {
      await interaction.reply({
        content: 'Please wait for the current stream to finish playing.',
        ephemeral: true
      });
      return;
    }

    const song = songManager.getSongQueue(guildId);

    if (!song) {
      player.stop();
      songManager.delAudioPlayer(guildId);
      await interaction.reply({
        content: 'No more songs to play.',
        ephemeral: true
      });
      return;
    }

    await interaction.reply({
      content: 'Skipping the song ...',
      ephemeral: true
    });

    // Stop the current song and trigger the idle event to play next song
    player.stop();
  } catch (error) {
    console.error('bot.skipsong (ERROR) : ', error);
    await interaction.reply({
      content: 'An error occurred while skipping the song.',
      ephemeral: true
    });
  }
}

module.exports = {
  commandData,
  execute
};