const { SlashCommandBuilder } = require('discord.js');
const Utils = require('./../utils');

function commandData() {
    return new SlashCommandBuilder()
        .setName("stopsong")
        .setDescription("Stop the current song");
}

async function execute(interaction, songManager) {
    try {
        const guildId = interaction.guild.id;

        let player = songManager.getAudioPlayer(guildId);

        player.stop();
        songManager.delAudioPlayer(guildId);
        songManager.removeAllSongs(guildId);

        console.log(`stopsong.execute (SUCCESS) : Stop song on guild ${guildId}`);
        
        const embed = Utils.toEmbed(`Music Player`, `Stop the current queue`, 0xff1493);

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error(`stopsong.execute (ERROR) : ` + error);
        await interaction.reply('There was an error stopping the song.');
    }
}

module.exports = {
    commandData,
    execute
};
