const schedule = require('node-schedule');

class EventManager {

    constructor() {
        this.events = new Map();
    }

    /**
     * Add an event to the schedule
     * @param {Channel} channel The channel to send the event to
     * @param {name} name The role to mention
     * @param {Embed} embed The embed to send
     * @param {Date} date The date to send the event
     */
    addEvent(channel, name, embed, role, date) {

        return new Promise((resolve, reject) => {
            try {
                const key = this.createKey(channel, name);
                const roleMention = `<@&${role.id}>`;
                const roleMembers = role.members;

                console.log('\t\tAdding event to schedule');
    
                const job = schedule.scheduleJob(String(date), () => {
                    try {
                        channel.send({
                            content: `${roleMention}`,
                            embeds: [embed]
                        });
                        
                        this.removeEvent(channel, name);

                        roleMembers.forEach(member => {
                            member.send({
                                content: `You have been invited to an event in the guild ${channel.guild.name} in the channel ${channel.name}`,
                                embeds: [embed]
                            });
                        });

                        console.log('\tevent.scheduleJob (SUCCESS) - Sending event '+name+' message to channel' + channel.id +  ' at ' + date);
                    } catch (error) {
                        reject(error);
                    }
                });
    
                this.events.set(key, job);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
    

    checkDate(month, day, hours, minutes) {
        try {
            const now = new Date();
            const checkDate = new Date(now.getFullYear(), month - 1, day, hours, minutes);
            if (checkDate < now) {
                return false;
            } else {
                console.log('\tevent.checkdate (SUCCESS) : Date is valid');
                return true;
            }
        } catch (error) {
            console.error('\tevent.checkDate (ERROR) : '+error);
        }
    }
    


    /**
     * Remove an event from the schedule
     * @param {Channel} channel The channel to send the event to
     * @param {Role} role The role to mention
     */
    removeEvent(channel, name) {
        return new Promise((resolve, reject) => {
            try {
                const key = this.createKey(channel, name);
    
                const job = this.events.get(key);
                
                if (job) {
                    job.cancel();
                    this.events.delete(key);
                    console.log('\tevent.scheduleJob (SUCCESS) - Removed event ' + name + ' from channel ' + channel.id);
                } else {
                    console.log('\tevent.scheduleJob (ERROR) - No event found for ' + name + ' in channel ' + channel.id);
                }
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
    


    /**
     * Create a key for the map
     * @param {Channel} channel The channel to send the event to
     * @param {Role} role The role to mention
     */
    createKey(channel, name) {
        if (channel === undefined || channel === null) {
            return;
        }
        if (name === undefined || name === null) {
            return;
        }

        const key = String(channel.id) + String(name);
        return key;
    }

}

module.exports = EventManager;