const fs = require('fs').promises;
const path = require('path');
const schedule = require('node-schedule');

/**
 * Manages the banned words for each guild
 */
class GuildBanwordManager {

  /**
   * Constructor
   *  - Loads the banwords from the storage file
   *  - Creates the storage file if it doesn't exist
   *  - Initializes the guildBanword Map
   */
  constructor() {

    const parentDirectory = path.resolve(__dirname, '../..');
    const storageFilePath = path.join(parentDirectory, 'storage', 'banwords.json');
    this.filePath = storageFilePath;
    this.cronSave = null;

    this.guildBanword = new Map();
    this.loadBanwords();
    this.autoSave();
  }

  autoSave() {
    if (this.cronSave !== null) {
      return;
    }

    this.cronSave = schedule.scheduleJob('*/20 * * * *', () => {
      this.saveBanwords(); // Call saveBanwords using 'this'
      console.log('\tbanword.autoSave (SUCCESS) : Banwords saved');
    });
  }


  /**
   * Loads the banwords from the storage file
   */
  async loadBanwords() {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      const parsedData = JSON.parse(data);

      if (typeof parsedData === 'object' && parsedData !== null) {
        for (const [guildId, banwords] of Object.entries(parsedData)) {
          this.guildBanword.set(guildId, banwords);
        }
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        await this.saveBanwords();
      } else {
        console.error('banword.load (ERROR) : ', error);
      }
    }
  }

  /**
   * Saves the banwords to the storage file
    */
  async saveBanwords() {
    try {
      const dataToSave = {};

      for (const [guildId, banwords] of this.guildBanword.entries()) {
        dataToSave[guildId] = banwords;
      }

      const jsonData = JSON.stringify(dataToSave, null, 2);
      await fs.writeFile(this.filePath, jsonData, 'utf-8');
    } catch (error) {
      console.error('banword.save (ERROR) : ', error);
    }
  }

  /**
   * Adds a banword to the guild
   * @param {string} guildId - The guild ID
   * @param {string} banword - The banword to add
   * @returns {Promise<boolean>} - True if the banword was added, false if the banword already exists or the limit was reached
   */
  addBanword(guildId, banword) {
    return new Promise((resolve, reject) => {
      try {
        if (!this.guildBanword.has(guildId)) {
          this.guildBanword.set(guildId, []);
        }

        const banwords = this.guildBanword.get(guildId);

        if (banwords.length >= 100) {
          resolve(false);
          return;
        }

        if (banwords.includes(banword)) {
          resolve();
          return;
        }

        banwords.push(banword);

        console.log('\tbanword.add (SUCCESS) : Banword added to guild ' + guildId + ' : ' + banword);

        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }


  /**
   * Removes a banword from the guild
   * @param {string} guildId - The guild ID
   * @param {string} banword - The banword to remove
   * @returns {Promise<void>}
   */
  removeBanword(guildId, banword) {
    return new Promise((resolve, reject) => {
      try {
        if (!this.guildBanword.has(guildId)) {
          resolve();
          return;
        }

        const banwords = this.guildBanword.get(guildId);
        const index = banwords.indexOf(banword);
        if (index > -1) {
          banwords.splice(index, 1);
        }

        console.log('\tbanword.remove (SUCCESS) : Banword removed from guild ' + guildId + ' : ' + banword);

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Gets the banwords for the guild
   * @param {string} guildId - The guild ID
   * @returns {string[]} - The banwords for the guild
   */
  getBanwords(guildId) {
    try {
      if (!this.guildBanword.has(guildId)) {
        return [];
      }

      return this.guildBanword.get(guildId);
    } catch (error) {
      console.error('\tbanword.get (ERROR) : '+error);
    }
  }

}

module.exports = GuildBanwordManager;