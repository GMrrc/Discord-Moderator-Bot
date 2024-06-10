const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

const delay = 7000;

function commandData() {
    return new SlashCommandBuilder()
        .setName("unbanword")
        .setDescription("Unban a word from being said in the server")
        .addStringOption(option => option.setName('word').setDescription('The word to ban').setAutocomplete(true))
        .addStringOption(option => option.setName('word2').setDescription('The word to ban').setAutocomplete(true))
        .addStringOption(option => option.setName('word3').setDescription('The word to ban').setAutocomplete(true))
        .addStringOption(option => option.setName('word4').setDescription('The word to ban').setAutocomplete(true))
        .addStringOption(option => option.setName('word5').setDescription('The word to ban').setAutocomplete(true));
}

async function execute(interaction, banwordManager) {

    const guildId = interaction.guild.id;
    const member = interaction.member;

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

    interaction.options._hoistedOptions.forEach(option => {
        const userRequest = option.value.toLowerCase();
    
        banwordManager.removeBanword(guildId, userRequest)
            .then(() => console.log(`unbanword.execute (SUCCESS) : Removed banword ${userRequest} on guild ${guildId}`))
            .catch(error => {
                console.error('unbanword.execute (ERROR) : '+error);
                interaction.reply('An error occured while unbanning the word');
            });
    });
    
    interaction.reply('Word(s) has been unbanned');
    
    setTimeout(() => {
        interaction.deleteReply();
    }, delay);
}


async function autocomplete(interaction, banwordManager) {

    const focusedValue = interaction.options.getFocused();
    let choices = banwordManager.getBanwords(interaction.guildId);
    const filtered = choices.filter(choice => choice.startsWith(focusedValue.toLowerCase()));
  
    await interaction.respond(
        filtered.map(choice => ({ name: choice, value: choice }))
    );
}


module.exports = {
    commandData,
    execute,
    autocomplete
};