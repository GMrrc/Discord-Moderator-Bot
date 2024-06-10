const { SlashCommandBuilder } = require('discord.js');
const Utils = require('./../utils');


function commandData() {
    return new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Get the leaderboard of the server")
        .addIntegerOption(option => option.setName('amount').setDescription('The amount of player to return').setRequired(false));
}

async function execute(interaction, levelManager) {
    try {
        const guildId = interaction.guildId;
        const amount = interaction.options.get('amount')?.value || 3;

        if (!guildId) {
            return;
        }

        if (amount < 1) {
            await interaction.reply({
                content: 'The amount must be at least 1',
                ephemeral: true
            });
            return;
        }

        if (amount > 10) {
            await interaction.reply({
                content: 'The amount must be at most 10',
                ephemeral: true
            });
            return;
        }

        const leaderboard = await levelManager.getTopLevels(guildId, amount);
        
        let texte = '';

        for (const [index, userData] of leaderboard.entries()) {
            const userId = userData[0];
            const userXp = userData[1];
            try {
                const topUser = await interaction.client.users.fetch(userId);
                let username = topUser.username;
                if (username.length > 12) {
                    username = username.substring(0, 12);
                }
                texte += `${(index + 1).toString().padStart(2)} ${username.padEnd(12)} - Level ${Utils.xpToLevel(userXp).toString().padEnd(2)} - ${userXp.toString()}xp\n`;
            } catch (error) {
                console.error(`leaderboard.execute (ERROR) : Erreur lors de la récupération de l'utilisateur avec l'ID ${userId}:`, error);
                texte += `${(index + 1).toString().padStart(2)} ${userId.toString().padEnd(12)} - Level ${Utils.xpToLevel(userXp).toString().padEnd(2)} - ${userXp.toString()}xp\n`;
            }
        }

        const monospace = '```';
        const embedText = `${monospace}${texte}${monospace}`;
        
        const embed = Utils.toEmbed(`Leaderboard`, embedText, 0x62ff00);

        await interaction.reply({ embeds: [embed] });

        console.log('leaderboard.execute (SUCCESS) : Leaderboard sent in the guild '+guildId);

    } catch (error) {
        console.error('leaderboard.execute (ERROR) : '+ error);
    }
}





module.exports = {
    commandData,
    execute
};