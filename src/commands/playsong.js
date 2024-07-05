const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const Utils = require('./../utils');
const path = require('path');
const {
  joinVoiceChannel,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource
} = require('@discordjs/voice');

function commandData() {
  return new SlashCommandBuilder()
    .setName("playsong")
    .setDescription("Play a song in your current voice channel")
    .addStringOption(option => option.setName('song').setDescription('The URL or name of the song').setRequired(true));
}


async function execute(interaction, songManager) {
  try {
    const guildId = interaction.guild.id;
    const url = interaction.options.getString('url');

    let player = songManager.getAudioPlayer(guildId);
    let isIdle = player.state.status !== AudioPlayerStatus.Playing && player.state.status !== AudioPlayerStatus.Buffering

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

    const response = await axios.post('http://127.0.0.1:5001/download_audio', downloadData);

    if (!response.data || response.data.title === null) {
      return await interaction.followUp('There was an error playing your song.');
    }

    await songManager.addSong(guildId, url, response.data.title);

    if (isIdle) {
      playNextSong(player, interaction, songManager);
    }

  } catch (error) {
    console.error(`playsong.execute (ERROR) : ` + error);
    await interaction.followUp('There was an error playing your song.');
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

    if (!song) {
      console.log('playsong.playNextSong : Queue finished.');
      if (connection) {
        setTimeout(() => {
          if (player.state.status !== AudioPlayerStatus.Playing && player.state.status !== AudioPlayerStatus.Buffering) {
            player.stop();
            songManager.delAudioPlayer(guildId);
            connection.destroy();
          }
        }, 600000);
      }
      return;
    }

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
    let resource = createAudioResource(filePath);

    if (!resource) {
      console.error("Resource creation failed, retrying in 5 seconds...");
      setTimeout(() => {
        resource = createAudioResource(filePath);
        if (!resource) {
          console.error("Resource creation failed after retry.");
          return;
        }
        player.play(resource);
      }, 5000);
    } else {
      player.play(resource);
    }

    songManager.removeSong(guildId);
    
    setTimeout(() => {
      const dataDelete = {
        guild: guildId,
        video_url: song.url,
      };
      axios.post('http://127.0.0.1:5001/delete', dataDelete);
    }, 180000);

    player.removeAllListeners();
    player.on(AudioPlayerStatus.Idle, () => {
      playNextSong(player, interaction, songManager, connection);
    });

    player.on('stateChange', (oldState, newState) => {
      console.log("oldest : " + oldState.status + " - newest : " + newState.status);
    });

  } catch (error) {
    console.error(`playsong.playNextSong (ERROR) : ` + error);
    if (connection) connection.destroy();
    await interaction.followUp('There was an error playing your song.');
  }
}

module.exports = {
  commandData,
  execute
};
