const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const Utils = require('./../utils');
const path = require('path');
const fs = require('fs');
const {
  createAudioResource
} = require('@discordjs/voice');



function commandData() {
  return new SlashCommandBuilder()
    .setName("skipsong")
    .setDescription("Skip the current song of the channel queue");
}


async function execute(interaction, songManager) {

  try {

    const guildId = interaction.guild.id;

    let player = songManager.getAudioPlayer(guildId);

    const song = songManager.getSongQueue(guildId);

    const channel = interaction.channel;

    if (!song) {
      player.stop();
      songManager.delAudioPlayer(guildId);
      interaction.reply({
        content: 'No more songs to play.',
        ephemeral: true
      });
      return;
    } else {
      interaction.reply({
        content: 'Skipping the song ...',
        ephemeral: true
      });
    }

    const key = song.url.replace(/\//g, '');

    const parentDirectory = path.resolve(__dirname, '../..');
    const filePath = path.join(parentDirectory, `youtube_dl/save/${guildId}/${key}.opus`);

    fs.access(filePath, fs.constants.F_OK, async (err) => {
      if (err) {
        console.error("File does not exist, retrying in 8 seconds...");
        setTimeout(() => {
          fs.access(filePath, fs.constants.F_OK, (retryErr) => {
            if (retryErr) {
              console.error("File still does not exist after retry.");
              return;
            }
            let resource = createAudioResource(filePath);
            player.play(resource);
          });
        }, 8000);
      } else {
        let resource = createAudioResource(filePath);
        player.play(resource);
      }
    });

    songManager.removeSong(guildId);

    const embedText = "Now playing : " + song.title;
    const embed = Utils.toEmbed(`Music Player`, embedText, 0xff1493);

    channel.send({
      embeds: [embed]
    });

    setTimeout(() => {
      const dataDelete = {
        guild: guildId,
        video_url: song.url
      };
      axios.post('http://127.0.0.1:5001/delete', dataDelete)
    }, 5000);

    player.removeAllListeners();
  } catch (error) {
    console.error('bot.skipsong (ERROR) : ', error);
  }
}


module.exports = {
  commandData,
  execute
};
