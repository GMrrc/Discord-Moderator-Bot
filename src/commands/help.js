const { SlashCommandBuilder } = require('discord.js');

function commandData() {
    return new SlashCommandBuilder()
        .setName("help")
        .setDescription("Display the help message");
}

async function execute(interaction) {

    const helpEmbedObject = createHelpEmbed();
    await interaction.reply({
        content: 'Check your DMs for a list of commands',
        ephemeral: true
    });
    await interaction.member.send({ embeds: [helpEmbedObject] });

    console.log(`help.execute (SUCCESS) : Sent help message to ${interaction.member.user.id} in DMs from guild ${interaction.guildId}`);
}

/**
 * Create a help embed
 * @returns {Object}
 */
function createHelpEmbed() {
    return {
        color: 0x0099ff,
        title: 'Help',
        description: 'List of commands',
        fields: [
            {
                name: 'banword',
                value: 'Add or remove a banword from the guild\nRequires the "Manage Messages" permission\n```\nbanword <word> {3 - 18char}```',
            },
            {
                name: 'unbanword',
                value: 'Unban a word from being said in the server\nRequires the "Manage Messages" permission\n```\nunbanword <word>```',
            },
            {
                name: 'banlist',
                value: 'List all banwords in the guild, in your DMs\n```\nbanlist```',
            },
            {
                name: 'spamlimit',
                value: 'Set the max number of messages a user can send in a minute\nRequires the "Manage Messages" permission\nDefaults to 12\n```\nspamlimit <number> {1 - 100/m}```',
            },
            {
                name: 'delete',
                value: 'Delete previous message from any user\nRequires the "Manage Messages" permission\nThis command will not delete messages older than 14 days\n```\ndelete <length> {1 - 99}```',
            },
            {
                name: 'temprole',
                value: 'Grant temporary access to a user to a specific role\nRequires the "Manage Roles" permission\nThe bot must have a role higher than the role you want to grant\n```\ntemprole <user> <role> <time> {1 - 720m}```',
            },
            {
                name: 'tempban',
                value: 'Temporarily ban a user from the server\nRequires the "Ban Members" permission\n```\ntempban <user> <time> {1 - 120d}```',
            },
            {
                name: 'addevent',
                value: 'Create an event\nRequires the "Manage Messages" permission\n```\naddevent <name> <text> {0 - 1800char} <date> {mm/dd/hh/mm} <role> <introduce> {0 - 60m}```',
            },
            {
                name: 'removeevent',
                value: 'Remove an event\nRequires the "Manage Messages" permission\n```\nremoveevent <name>```',
            },
            {
                name: 'profile',
                value: 'Display the profile of a user by giving their mention or their ID\n```\nprofile <user> {mention or ID} <isID> {true or false}```',
            },
            {
                name: 'spam',
                value: 'Send a message multiple times\nRequires the "Manage Messages" permission\n```\nspam <text> {1 - 200char} <count> {2 - 10}```',
            },
            {
                name: 'getlevel',
                value: 'Get your current level\n```\ngetlevel```',
            },
            {
                name: 'leaderboard',
                value: 'Get the leaderboard of the server\n```\nleaderboard <amout> {1 - 10}```',
            },
            {
                name: 'help',
                value: 'Display this message\n```\nhelp```',
            },
        ]
    };
}



module.exports = {
    commandData,
    execute
};
