const { SlashCommandBuilder } = require('discord.js');

function commandData() {
    return new SlashCommandBuilder()
        .setName("help")
        .setDescription("Display the help message")
        .addStringOption(option => 
            option.setName('command')
                .setDescription('The command to get help for')
                .setRequired(true)
                .addChoices(
                    { name: 'Moderation', value: 'moderation' },
                    { name: 'Event', value: 'event' },
                    { name: 'Level', value: 'level' },
                    { name: 'Music', value: 'music' },
                    { name: 'Miscellaneous', value: 'misc' }
                )
        );
}

async function execute(interaction) {
    const selectedCategory = interaction.options.getString('command');
    const helpEmbedObject = createHelpEmbed(selectedCategory);
    
    await interaction.reply({
        content: `Check your DMs for help with ${selectedCategory} commands`,
        ephemeral: true
    });
    
    await interaction.member.send({ embeds: [helpEmbedObject] });

    console.log(`help.execute (SUCCESS) : Sent ${selectedCategory} help message to ${interaction.member.user.id} in DMs from guild ${interaction.guildId}`);
}

/**
 * Create a help embed based on the selected category
 * @param {string} category - The category of commands to display
 * @returns {Object}
 */
function createHelpEmbed(category) {
    const helpCategories = {
        'moderation': {
            color: 0xff0000, // Red
            title: 'Moderation Commands',
            description: 'Commands for server management and moderation',
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
                    name: 'spam',
                    value: 'Send a message multiple times\nRequires the "Manage Messages" permission\n```\nspam <text> {1 - 200char} <count> {2 - 10}```',
                }
            ]
        },
        'event': {
            color: 0x0000FF, // Blue
            title: 'Event Commands',
            description: 'Commands for managing server events',
            fields: [
                {
                    name: 'addevent',
                    value: 'Create an event\nRequires the "Manage Messages" permission\n```\naddevent <name> <text> {0 - 1800char} <date> {mm/dd/hh/mm} <role> <introduce> {0 - 60m}```',
                },
                {
                    name: 'removeevent',
                    value: 'Remove an event\nRequires the "Manage Messages" permission\n```\nremoveevent <name>```',
                }
            ]
        },
        'level': {
            color: 0x62ff00,
            title: 'Level Commands',
            description: 'Commands related to user levels and rankings',
            fields: [
                {
                    name: 'getlevel',
                    value: 'Get your current level\n```\ngetlevel```',
                },
                {
                    name: 'leaderboard',
                    value: 'Get the leaderboard of the server\n```\nleaderboard <amount> {1 - 10}```',
                }
            ]
        },
        'music': {
            color: 0xff1493, // Pink
            title: 'Music Commands',
            description: 'Commands for playing music in voice channels',
            fields: [
                {
                    name: 'playsong',
                    value: 'Play a song in your current voice channel\n```\nplaysong <songURL> or <songName>```',
                },
                {
                    name: 'skip',
                    value: 'Skip the current song\n```\nskipsong```',
                },
                {
                    name: 'stop',
                    value: 'Stop the music and disconnect the bot\n```\nstopsong```',
                },
                {
                    name: 'songlist',
                    value: 'List the songs in the queue\n```\nsonglist```',
                },
                {
                    name: 'playstream',
                    value: 'Play a stream in your current voice channel\n```\nplaystream <streamURL>```',
                },
                {
                    name: '!playfile',
                    value: 'Play a local file in your current voice channel\n```\n!playfile <file> {mp3, wav, ogg, opus}```',
                }
            ]
        },
        'misc': {
            color: 0xFFFF00, // Yellow
            title: 'Miscellaneous Commands',
            description: 'Miscellaneous utility commands',
            fields: [
                {
                    name: 'profile',
                    value: 'Display the profile of a user by giving their mention or their ID\n```\nprofile <user> {mention or ID}```',
                },
                {
                    name: 'help',
                    value: 'Display help message for different command categories\n```\nhelp <category>```',
                }
            ]
        }
    };

    return helpCategories[category] || {
        color: 0x808080, // Gray
        title: 'Help',
        description: 'Invalid category selected. Please choose from: moderation, event, level, music, misc',
        fields: []
    };
}

module.exports = {
    commandData,
    execute
};