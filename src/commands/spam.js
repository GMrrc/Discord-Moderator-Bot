const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

function commandData() {
    return new SlashCommandBuilder()
        .setName("spam")
        .setDescription("Send a message a number of times")
        .addStringOption(option => option.setName('message').setDescription('The message to spam').setRequired(true))
        .addIntegerOption(option => option.setName('length').setDescription('The number of times to send the message').setRequired(true));
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

    const message = interaction.options.get('message').value;
    const length = interaction.options.get('length').value;

    if (length <= 1) {
        await interaction.reply({
            content: 'You cannot spam a message less than 2 time',
            ephemeral: true
        });
        return;
    }

    if (length > 10) {
        await interaction.reply({
            content: 'You cannot spam a message more than 10 times',
            ephemeral: true
        });
        return;
    }

    if (message.length > 200) {
        await interaction.reply({
            content: 'The message is too long to be sent. It must be less than 200 characters.',
            ephemeral: true
        });
        return;
    }

    interaction.reply({
        content: `The message will be sent ${length} times`,
        ephemeral: true
    });

    for (let i = 0; i < length; i++) {
        setTimeout(() => {
            interaction.channel.send(message);
        }, 5000 * i);
    }

    console.log(`spam.execute (SUCCESS) : Sent message ${message} ${length} times on guild ${guildId} in channel ${interaction.channel.id}`);
}

module.exports = {
    commandData,
    execute
};