const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const Utils = require('./../utils');
const path = require('path');
const {
  createAudioResource
} = require('@discordjs/voice');



function commandData() {
    return new SlashCommandBuilder()
        .setName("skipsong")
        .setDescription("Skip the current song of the channel queue");
}


async function execute(interaction, songManager) {

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
    const resource = createAudioResource(filePath);

    if (!resource) {
      setTimeout(() => {
        resource = createAudioResource(filePath);
        if (!resource) {
          return;
        }
      }, 5000);
    }

    songManager.removeSong(guildId);

    const embedText = "Now playing : " + song.title;
    const embed = Utils.toEmbed(`Music Player`, embedText, 0xff1493);

    channel.send({
      embeds: [embed]
    });

    await player.play(resource);

    setTimeout(() => {
      dataDelete = {
        guild: guildId,
        video_url: song.url
      }
  
      axios.post('http://127.0.0.1:5001/delete', dataDelete)
    }, 180000);
}


module.exports = {
    commandData,
    execute
  };
