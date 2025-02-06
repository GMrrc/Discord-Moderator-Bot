const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');


const delay = 7000;


function commandData() {
    return new SlashCommandBuilder()
        .setName("banword")
        .setDescription("Add a banword to the guild")
        .addStringOption(option => option.setName('word').setDescription('The word to ban').setRequired(true))
        .addStringOption(option => option.setName('word2').setDescription('The word to ban').setRequired(false))
        .addStringOption(option => option.setName('word3').setDescription('The word to ban').setRequired(false))
        .addStringOption(option => option.setName('word4').setDescription('The word to ban').setRequired(false))
        .addStringOption(option => option.setName('word5').setDescription('The word to ban').setRequired(false));
}

async function execute(interaction, banwordManager) {

    const guildId = interaction.guild.id;
    const member = interaction.member;

    if (banwordManager === undefined || banwordManager === null) {
        return;
    }

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

    for (const option of interaction.options._hoistedOptions) {
        const userRequest = option.value.toLowerCase();
        if (userRequest.length > 18) {
            await interaction.reply({
                content: 'You cannot ban a word longer than 18 characters',
                ephemeral: true
            });
            return;
        }

        if (userRequest.length < 3) {
            await interaction.reply({
                content: 'You cannot ban a word shorter than 3 characters',
                ephemeral: true
            });
            return;
        }

        banwordManager.addBanword(guildId, userRequest)
            .then(() => console.log(`banword.execute (SUCCESS) : Added banword ${userRequest} to guild ${guildId}`))
            .catch(error => {
                console.error('banword.execute (ERROR) : '+error);
                interaction.reply('An error occured while banning the word');
            });

    }
    interaction.reply('Word(s) has been banned');

    setTimeout(() => {
        interaction.deleteReply();
    }, delay);
}


module.exports = {
    commandData,
    execute
};