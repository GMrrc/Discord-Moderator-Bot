

class UserSpamManager {
    constructor() {
        this.userSpamIteration = new Map();
        this.guildMaxSpam = new Map();
    }



    addSpamIteration(userId, guildId) {
        if (!this.userSpamIteration.has(userId)) {
            this.userSpamIteration.set(userId, [0, false]);
        }

        if (!this.guildMaxSpam.has(guildId)) {
            this.guildMaxSpam.set(guildId, 8);
        }

        const userSpamData = this.userSpamIteration.get(userId);
        userSpamData[0] += 1;
        this.userSpamIteration.set(userId, userSpamData);

        const maxSpam = this.guildMaxSpam.get(guildId);

        if (userSpamData[0] > maxSpam+1) {
            userSpamData[1] = true;
        }

        if (userSpamData[0] > maxSpam) {
            this.userSpamIteration.set(userId, userSpamData);
            return true;
        } else {
            return false;
        }
    }

    checkSpamIteration(userId) {
        
        if (!this.userSpamIteration.has(userId)) {
            this.userSpamIteration.set(userId, [0, false]);
        }
        const userSpamData = this.userSpamIteration.get(userId);

        return userSpamData[1];
    }

    resetSpamIteration() {
        this.userSpamIteration.clear();
    }

    setMaxSpam(guildId, maxSpam) {
        this.guildMaxSpam.set(guildId, maxSpam);
    }
}

module.exports = UserSpamManager;
