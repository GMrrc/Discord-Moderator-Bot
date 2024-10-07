const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const Utils = require('./../utils');
const path = require('path');
const fs = require('fs');
const {
  joinVoiceChannel,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource
} = require('@discordjs/voice');
const { error } = require('console');

function commandData() {
  return new SlashCommandBuilder()
    .setName("playsong")
    .setDescription("Play a song in your current voice channel")
    .addStringOption(option => option.setName('song').setDescription('The URL or name of the song').setRequired(true));
}


async function execute(interaction, songManager) {
  try {
    const guildId = interaction.guild.id;
    const url = interaction.options.getString('song');

    let player = songManager.getAudioPlayer(guildId);
    const isIdle = player.state.status === AudioPlayerStatus.Idle || player.state.status === AudioPlayerStatus.AutoPaused || player.state.status === AudioPlayerStatus.Paused;

    if (isIdle) {
      interaction.reply({
        content: 'Loading the song ...',
        ephemeral: true
      });
    } else {
      interaction.reply({
        content: 'Adding song to the queue',
        ephemeral: true
      });
    }

    const downloadData = {
      video_url: url,
      guild: guildId
    };

    // Utilisation de .then() et .catch() pour gérer la requête Axios
    axios
      .post('http://127.0.0.1:5001/download_audio', downloadData)
      .then((response) => {
        if (!response.data) {
          interaction.followUp({
            content: 'An error occurred while downloading the song.',
            ephemeral: true
          });
          return;
        }

        // Ajout de la chanson après une réponse réussie
        songManager.addSong(guildId, url, response.data.title);

        if (isIdle) {
          playNextSong(player, interaction, songManager);
        }
      })
      .catch((error) => {
        // Gestion des erreurs provenant du serveur
        if (error.response) {
          const serverErrorMessage = error.response.data.error || 'An error occurred on the server.';
          interaction.followUp({
            content: serverErrorMessage,
            ephemeral: true
          });
        } else if (error.request) {
          interaction.followUp({
            content: 'No response from the server. Please try again later.',
            ephemeral: true
          });
        } else {
          interaction.followUp({
            content: `An unexpected error occurred: ${error.message}`,
            ephemeral: true
          });
        }

        console.error(`playsong.execute (ERROR) : ${error}`);
      });

  } catch (error) {
    console.error(`playsong.execute (ERROR - outside) : ${error}`);
  }
}



async function playNextSong(player, interaction, songManager, connection) {
  try {
    const guildId = interaction.guild.id;
    const voiceChannel = interaction.member.voice.channel;
    const channel = interaction.channel;

    if (!voiceChannel) {
      return await interaction.followUp('No voice channel found.');
    }

    const song = await songManager.getSongQueue(guildId);

    const embedText = "Now playing : " + song.title;
    const embed = Utils.toEmbed(`Music Player`, embedText, 0xff1493);

    await channel.send({
      embeds: [embed]
    });

    if (!connection) {
      connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator
      });
      connection.subscribe(player);
    }

    const key = song.url.replace(/\//g, '');
    const parentDirectory = path.resolve(__dirname, '../..');
    const filePath = path.join(parentDirectory, `youtube_dl/save/${guildId}/${key}.opus`);

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error("File does not exist, retrying in 4 seconds...");
        setTimeout(() => {
          fs.access(filePath, fs.constants.F_OK, (retryErr) => {
            if (retryErr) {
              console.error("File still does not exist after retry.");
              return;
            }
            let resource = createAudioResource(filePath);
            player.play(resource);
          });
        }, 4000);
      } else {
        let resource = createAudioResource(filePath);
        player.play(resource);
      }
    });

    songManager.removeSong(guildId);

    setTimeout(() => {
      const dataDelete = {
        guild: guildId,
        video_url: song.url,
      };
      axios.post('http://127.0.0.1:5001/delete', dataDelete);
    }, 5000);

    player.removeAllListeners();
    player.on(AudioPlayerStatus.Idle, () => {
      playNextSong(player, interaction, songManager, connection);
    });

  } catch (error) {
    console.error(`playsong.playNextSong (ERROR) : ` + error);
  }
}


module.exports = {
  commandData,
  execute
};
