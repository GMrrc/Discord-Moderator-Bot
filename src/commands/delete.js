const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

function commandData() {
    return new SlashCommandBuilder()
        .setName("delete")
        .setDescription("Delete a number of messages")
        .addIntegerOption(option => option.setName('length').setDescription('The number of messages to delete').setRequired(true));
}


async function execute(interaction) {

    const guildId = interaction.guildId;
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

    // Get the number of messages to delete from the user
    const userRequest = interaction.options.get('length').value + 1;

    if (userRequest > 100) {
        await interaction.reply({
            content: 'You cannot delete more than 99 messages at once',
            ephemeral: true
        });
        return;

    } else if (userRequest < 1) {
        await interaction.reply({
            content: 'You cannot delete less than 1 message at once',
            ephemeral: true
        });
        return;

    } else {

        await interaction.reply({
            content: `Deleting ${userRequest - 1} messages...`,
            ephemeral: true
        });

        const messages = await interaction.channel.messages.fetch({ limit: userRequest });
        interaction.channel.bulkDelete(messages)
            .then(messages => console.log(`delete.execute (SUCCESS) : Bulk deleted ${messages.size} messages on guild ${guildId}`))
            .catch(error => {
                console.error('delete.execute (ERROR) : '+error);
                interaction.editReply({
                    content: 'An error occured while deleting the messages',
                    ephemeral: true
                });
            });
    }
}

module.exports = {
    commandData,
    execute
};