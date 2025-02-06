const { EmbedBuilder } = require('discord.js');

class Utils {

    /**
     * Remove mention tags from a string
     * @param {string} input
     * @returns {string}
     */
    static removeMentionTags(input) {
        return input.replace(/<@!?&?(\d+)>/g, '$1');
    }

    /**
     * Compare two strings to see if they are similar 
     * @param {string} input
     * @param {string} input
     * @returns {boolean}
     */
    static isSimilar(str1, str2) {
        if (str1.length !== str2.length) {
            return false;
        }

        const minLength = Math.min(str1.length, str2.length);
        const requiredMatchCount = Math.ceil(minLength * 0.9);

        let matchCount = 0;
        const charMap = {};

        for (let char of str1) {
            charMap[char] = (charMap[char] || 0) + 1;
        }

        for (let char of str2) {
            if (charMap[char] > 0) {
                matchCount++;
                charMap[char]--;
            }
        }

        return matchCount >= requiredMatchCount;
    }


    /**
     * Create a message embed
     * @param {string} title
     * @param {string} description
     * @param {string} color
     * @param {string} [imageUrl]
     * @returns {EmbedBuilder}
     */
    static toEmbed(title, description, color, imageUrl, titleUrl, author) {
        if (color === undefined || color === null || color === '') {
            color = 0x0099ff;
        }

        if (description === undefined || description === null) {
            description = '';
        }

        const Embed = new EmbedBuilder()
            .setColor(color)
            .setDescription(description);

        if (title !== undefined && title !== null) {
            Embed.setTitle(title);
        }

        if (imageUrl !== undefined && imageUrl !== null) {
            Embed.setImage(imageUrl);
        }

        if (titleUrl !== undefined && titleUrl !== null) {
            Embed.setURL(titleUrl);
        }

        if (author !== undefined && author !== null && author.username !== undefined && author.username !== null) {
            Embed.setAuthor({ name: author.username, iconURL: author.displayAvatarURL({ dynamic: true })});
        }

        return Embed;
    }


    /**
     * Check each level with the getXpFromAllLevels function and find the level where the player's XP is greater than the total XP.
     * @param {number} xp - The player's XP.
     * @returns {number} - The level where the player's XP is greater than the total XP.
     */
    static xpToLevel(xp) {

        let level = 0;
        let shouldContinue = true;
        let totalXp = 0;

        while (shouldContinue) {
            totalXp = Utils.getXpFromAllLevels(level);
            if (xp >= totalXp) {
                level++;
            } else {
                shouldContinue = false;
            }
        }
        return level - 1;
    }


    /**
     * Retourne l'expérience nécessaire pour atteindre un certain niveau.
     * @param {number} level - Le niveau de l'utilisateur.
     * @returns {number} - L'expérience nécessaire.
     */
    static levelToXp(level) {
        return 100 * Math.pow(2, level);
    }

    /**
     * Ajoute l'expérience de chaque niveau pour obtenir l'expérience totale.
     * @param {number} level - Le niveau de l'utilisateur.
     * @returns {number} - L'expérience totale.
     */
    static getXpFromAllLevels(level) {
        let totalXp = 0;
        for (let i = 1; i <= level; i++) {
            totalXp += Utils.levelToXp(i);
        }
        return totalXp;
    }

}

module.exports = Utils;
