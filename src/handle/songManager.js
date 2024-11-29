const { createAudioPlayer, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');


/**
 * Manages the banned words for each guild
 */
class SongManager {

  constructor() {
    this.songQueue = new Map();
    this.guildAudioPlayer = new Map();
    this.isPlayingSource = new Map();
  }

  setPlaySource(guildId) {
    try {
      // update boolean to true
      this.isPlayingSource.set(guildId, true);
    } catch (error) {
      console.error('\tsongManager.playSource (ERROR) : ' + error);
    }
  }

  unsetPlaySource(guildId) {
    try {
      // update boolean to false
      this.isPlayingSource.set(guildId, false);
    } catch (error) {
      console.error('\tsongManager.playSource (ERROR) : ' + error);
    }
  }

  getPlayingSource(guildId) {
    try {
      // Default to false if not set
      if (!this.isPlayingSource.has(guildId)) {
        return false;
      }
      return this.isPlayingSource.get(guildId);
    } catch (error) {
      console.error('\tsongManager.isPlayingSource (ERROR) : ' + error);
      return false;
    }
  }

  addSong(guildId, songUrl, title) {
    if (!this.songQueue.has(guildId)) {
      this.songQueue.set(guildId, []);
    }

    const data = { title: title, url: songUrl };

    this.songQueue.get(guildId).push(data);
    console.log('songManager.addSong (SUCCESS) : Added song to queue');
  }

  removeSong(guildId) {
    try {
      if (this.songQueue.has(guildId)) {
        const queue = this.songQueue.get(guildId);
        queue.shift();
        this.songQueue.set(guildId, queue);
        console.log('songManager.removeSong (SUCCESS) : Removed song from queue');
      }
    } catch (error) {
      console.error('songManager.removeSong (ERROR) : ' + error);
    }
  }

  removeAllSongs(guildId) {
    try {
      if (this.songQueue.has(guildId)) {
        this.songQueue.set(guildId, []);
        console.log('songManager.removeAllSongs (SUCCESS) : Removed all songs from queue');
      }
    } catch (error) {
      console.error('songManager.removeAllSongs (ERROR) : ' + error);
    }
  }

  getSongQueue(guildId) {
    try {
      if (this.songQueue.has(guildId)) {
        return this.songQueue.get(guildId)[0];
      }
    } catch (error) {
      console.error('songManager.getSongQueue (ERROR) : ' + error);
    }
  }

  getFullSongQueue(guildId) {
    try {
      if (this.songQueue.has(guildId)) {
        return this.songQueue.get(guildId);
      }
    } catch (error) {
      console.error('songManager.getFullSongQueue (ERROR) : ' + error);
    }
  }

  getAudioPlayer(guildId) {
    try {
      if (!this.guildAudioPlayer.has(guildId)) {
        let player = createAudioPlayer();
        this.guildAudioPlayer.set(guildId, player);

        player.on('error', error => {
          console.error(`player.on (ERROR) : ${error.message}`);
          player.stop();
        });
      }

      return this.guildAudioPlayer.get(guildId);
    } catch (error) {
      console.error('songManager.get (ERROR) : ' + error);
    }
  }

  delAudioPlayer(guildId) {
    try {
      if (this.guildAudioPlayer.has(guildId)) {
        this.guildAudioPlayer.delete(guildId);
      }
    } catch (error) {
      console.error('songManager.del (ERROR) : ' + error);
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
      if (!connection || connection.state.status === 'destroyed') {
        console.log(`No voice connection found or already destroyed for guild ${guildId}`);
        return;
      }

      player.stop();
      connection.destroy();
      this.unsetPlaySource(guildId);
      this.delAudioPlayer(guildId);
      this.removeAllSongs(guildId);
      console.log(`Disconnected from guild ${guildId}`);

    } catch (error) {
      console.error(`Error disconnecting from guild ${guildId}:`, error);
    }
  }

}




module.exports = SongManager;
