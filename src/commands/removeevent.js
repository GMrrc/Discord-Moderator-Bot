const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');


function commandData() {
    return new SlashCommandBuilder()
        .setName("removeevent")
        .setDescription("Remove an event in the channel")
        .addStringOption(option => option.setName('name').setDescription('The name of the event').setRequired(true));

}

async function execute(interaction, eventManager) {

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
    
    const nameRequest = interaction.options.get('name').value;

    if (nameRequest === undefined || nameRequest === null) {
        return;
    }

    const channel = interaction.channel;
    if (!channel) {
      await interaction.reply({
        content: 'Channel not found!',
        ephemeral: true
      });
      return;
    }

    eventManager.removeEvent(channel, nameRequest)
        .then(() => {

            const beforeName = nameRequest + '_before';
            eventManager.removeEvent(channel, beforeName)
                .then(() => {
                    console.log(`removeevent.execute (SUCCESS) : Removed event ${beforeName} on guild ${guildId} in channel ${channel.id}`)
                })
                .catch(error => {
                    console.error('removeevent.execute (ERROR) : '+error);
                });
            interaction.reply({
                content: 'Event removed successfully',
                ephemeral: true
            });
            console.log(`removeevent.execute (SUCCESS) : Removed event ${nameRequest} on guild ${guildId} in channel ${channel.id}`)
        })
        .catch(error => {
            console.error('removeevent.execute (ERROR) : '+error);
            interaction.reply({
                content: 'An error occurred while trying to remove the event',
                ephemeral: true
            });
        });
}

module.exports = {
    commandData,
    execute
};