const fs = require('fs').promises;
const path = require('path');
const schedule = require('node-schedule');

/**
 * Manages the banned words for each guild
 */
class GuildLevelManager {

    constructor() {

        const parentDirectory = path.resolve(__dirname, '../..');
        const storageFilePath = path.join(parentDirectory, 'storage', 'levels.json');
        this.filePath = storageFilePath;
        this.cronSave = null;

        this.guildLevels = new Map();

        this.loadLevels();
        this.autoSave();
    }

    autoSave() {
        if (this.cronSave !== null) {
            return;
        }

        this.cronSave = schedule.scheduleJob('*/20 * * * *', () => {
            this.saveLevels();
            console.log('\tlevel.autoSave (SUCCESS) : Levels saved');
        });
    }


    /**
     * Loads the levels from the storage file
     */
    async loadLevels() { 
        try {
            const data = await fs.readFile(this.filePath, 'utf-8');
            const parsedData = JSON.parse(data);


            if (typeof parsedData === 'object' && parsedData !== null) {
                for (const [guildId, guildLevels] of Object.entries(parsedData)) {
                    this.guildLevels.set(guildId, new Map(Object.entries(guildLevels)));
                }
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                await this.saveLevels();
            } else {
                console.error('level.load (ERROR) : ', error);
            }
        }
    }

    /**
     * Saves the levels to the storage file
      */
    async saveLevels() { // Added async keyword
        try {
            const dataToSave = {};

            for (const [guildId, guildLevels] of this.guildLevels.entries()) {
                dataToSave[guildId] = Object.fromEntries(guildLevels);
            }

            const jsonData = JSON.stringify(dataToSave, null, 2);
            await fs.writeFile(this.filePath, jsonData, 'utf-8');
        } catch (error) {
            console.error('level.save (ERROR) : ', error);
        }
    }



    addUserLevel(guildId, userId, xp) {
        return new Promise((resolve, reject) => {
            try {

                if (!this.guildLevels.has(guildId)) {
                    this.guildLevels.set(guildId, new Map());
                }

                const userLevels = this.guildLevels.get(guildId);
                const totalXp = userLevels.get(userId) || 1;
                userLevels.set(userId, totalXp + xp);
                resolve();

            } catch (error) {
                reject(error);
            }
        });
    }


    getUserLevel(guildId, userId) {
        return new Promise((resolve, reject) => {
            try {
                if (this.guildLevels.has(guildId)) {

                    const userLevels = this.guildLevels.get(guildId);
                    if (userLevels.has(userId)) {
                        resolve(userLevels.get(userId));
                    }
                }
                resolve(0);

            } catch (error) {
                reject(error);
            }
        });
    }


    //return the top players of the server, the amount is the number of players to return
    getTopLevels(guildId, amount) {
        return new Promise((resolve, reject) => {
            try {
                const guildUser = this.guildLevels.get(guildId);
                
                if (!guildUser) {
                    reject('No user found');
                    return;
                }

                if (amount < 1) {
                    reject('The amount must be at least 1');
                    return;
                }

                const topLevels = [...guildUser.entries()].sort((a, b) => b[1] - a[1]).slice(0, amount);
                resolve(topLevels);

            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = GuildLevelManager;
