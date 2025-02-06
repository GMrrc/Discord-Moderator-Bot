const { SlashCommandBuilder } = require('discord.js');
const Utils = require('./../utils');

function commandData() {
    return new SlashCommandBuilder()
        .setName("getlevel")
        .setDescription("Get your current level")
        .addUserOption(option => option.setName('user').setDescription('The user to get the level of').setRequired(false));
}


async function execute(interaction, levelManager) {

    const memberId = interaction.member.id;
    const guildId = interaction.guildId;

    const userRaw = interaction.options.get('user')?.value || memberId;
    const userId = Utils.removeMentionTags(userRaw);

    if (userId === undefined || userId === null || userId === '') {
        return;
    }

    const user = interaction.guild.members.cache.get(userId);
    if (!user) {
        await interaction.reply({
            content: 'User not found',
            ephemeral: true
        });
        return;
    }
    
    const username = user.user.username;

    if (guildId === undefined || guildId === null || guildId === '') {
        return;
    }

    const xp = levelManager.getUserLevel(guildId, userId); 
    xp.then(async (xp) => {
        const level = Utils.xpToLevel(xp);
        const nextLevelXp = Utils.levelToXp(level+1);
        xp = xp - Utils.getXpFromAllLevels(level);
    
        const embed = Utils.toEmbed(`Level ${level}`, `${username}, you have ${xp}/${nextLevelXp}xp before reaching the next level`, 0x62ff00);
    
        await interaction.reply({ embeds: [embed] });
        
        console.log(`getlevel.execute (SUCCESS) : Sent level to ${memberId} in guild ${guildId} `);
    })
    .catch((error) => {
        console.error('getlevel.execute (ERROR) : '+error);
    });
}


module.exports = {
    commandData,
    execute
};