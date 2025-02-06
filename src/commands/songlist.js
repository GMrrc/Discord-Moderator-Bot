const { SlashCommandBuilder } = require('discord.js');
const Utils = require('./../utils');


function commandData() {
    return new SlashCommandBuilder()
        .setName("songlist")
        .setDescription("List all the songs in the queue");
}


async function execute(interaction, songManager) {

    try {

        const guildId = interaction.guild.id;

        const song = songManager.getFullSongQueue(guildId);

        let songList = '';

        if (!song) {
            interaction.reply({
                content: 'No songs in the queue.',
                ephemeral: true
            });
            return;
        } else {
            song.forEach((element, index) => {
                songList += `${index + 1}. ${element.title}\n`;
            });
            const embed = Utils.toEmbed(`Music Player`, `List of songs in the queue:\n${songList}`, 0xff1493);
            await interaction.reply({ embeds: [embed] });

            console.log('songlist.execute (SUCCESS) : Displayed song list');
        }
    } catch (error) {
        console.error(error);
    }
}


module.exports = {
    commandData,
    execute
};
