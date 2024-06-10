const { SlashCommandBuilder } = require('discord.js');
const Utils = require('./../utils');


function commandData() {
    return new SlashCommandBuilder()
        .setName("profile")
        .setDescription("Display the profile picture of a user by ID or mention")
        .addStringOption(option => option.setName('user').setDescription('The user to display the profile picture of, mention or ID').setRequired(true))
}

async function execute(interaction) {

    const userId = interaction.options.getString('user');

    if (userId === undefined || userId === null || userId === '') {
        await interaction.reply({
            content: 'You need to provide a user to display the profile picture',
            ephemeral: true
        });
        return;
    }

    const userIdRegex = Utils.removeMentionTags(userId);
    user = await interaction.client.users.fetch(userIdRegex);

    const profilePicEmbed = Utils.toEmbed(undefined, `Profile picture of ${user.username}`, 0x0099ff , user.displayAvatarURL({ dynamic: true }));

    await interaction.reply({ embeds: [profilePicEmbed] });

    console.log(`profile.execute (SUCCESS) : Sent profile picture of ${user.username} to ${interaction.user.id} in guild ${interaction.guildId}`);

}


module.exports = {
    commandData,
    execute
};
