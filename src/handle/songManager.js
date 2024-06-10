const { createAudioPlayer, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');


/**
 * Manages the banned words for each guild
 */
class SongManager {

  constructor() {
    this.songQueue = new Map();
    this.guildAudioPlayer = new Map();
  }

  async addSong(guildId, songUrl, title) {
    if (!this.songQueue.has(guildId)) {
      this.songQueue.set(guildId, []);
    }

    const data = { title: title, url: songUrl };

    this.songQueue.get(guildId).push(data);
    console.log('\tsongManager.addSong (SUCCESS) : Added song to queue');
  }

  removeSong(guildId) {
    try {
        if (this.songQueue.has(guildId)) {
          const queue = this.songQueue.get(guildId); 
          queue.shift();
          this.songQueue.set(guildId, queue);
          console.log('\tsongManager.removeSong (SUCCESS) : Removed song from queue');
        }
      } catch (error) {
        console.error('\tsongManager.removeSong (ERROR) : '+error);
      }
  }

  removeAllSongs(guildId) {
    try {
        if (this.songQueue.has(guildId)) {
          this.songQueue.set(guildId, []);
          console.log('\tsongManager.removeAllSongs (SUCCESS) : Removed all songs from queue');
        }
      } catch (error) {
        console.error('\tsongManager.removeAllSongs (ERROR) : '+error);
      }
  }

  getSongQueue(guildId) {
    try {
        if (this.songQueue.has(guildId)) {
          return this.songQueue.get(guildId)[0];
        }
      } catch (error) {
        console.error('\tsongManager.getSongQueue (ERROR) : '+error);
      }
  }

  getAudioPlayer(guildId) {
    try {
        if (!this.guildAudioPlayer.has(guildId)) {
          const player = createAudioPlayer();
          this.guildAudioPlayer.set(guildId, player);

          player.on('error', error => {
            console.error(`player.on (ERROR) : ${error.message}`);
            player.stop();
          });
        }
  
        return this.guildAudioPlayer.get(guildId);
      } catch (error) {
        console.error('\tsongManager.get (ERROR) : '+error);
      }
  }

  delAudioPlayer(guildId) {
    try {
      if (this.guildAudioPlayer.has(guildId)) {
        this.guildAudioPlayer.delete(guildId);
      }
    } catch (error) {
      console.error('\tsongManager.del (ERROR) : '+error);
    }   
  }

  deconnect(guildId) {
    try {
      let player = this.guildAudioPlayer.get(guildId);
      if (!player) {
        console.log(`No audio player found for guild ${guildId}`);
        return;
      }
  
      let connection = getVoiceConnection(guildId);
      if (!connection) {
        console.log(`No voice connection found for guild ${guildId}`);
        return;
      }
  
      connection.destroy();
      player.stop();
      this.delAudioPlayer(guildId);
      console.log(`Disconnected from guild ${guildId}`);
      
    } catch (error) {
      console.error(`Error disconnecting from guild ${guildId}:`, error);
    }
  }

}




module.exports = SongManager;
