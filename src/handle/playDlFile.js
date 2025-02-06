const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Utils = require('./../utils');
const {
    joinVoiceChannel,
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource
} = require('@discordjs/voice');


async function playDlFile(message, songManager) {
    try {
        const guildId = message.guild.id;
        const isPlaying = songManager.getWaiting(guildId);
        if (isPlaying) {
        interaction.reply({
            content: 'Wait for the song to finish downloading or streaming.',
            ephemeral: true
        });
        return;
        }

        songManager.setWaiting(guildId);

        // Récupérer l'attachement
        const attachment = message.attachments.first();
        if (!attachment) {
            return await message.reply("You must attach a file to use this command.");
        }

        const fileFormat = attachment.name.split('.').pop();
        if (!['mp3', 'opus', 'wav', 'ogg'].includes(fileFormat)) {
            return await message.reply("The file format must be mp3, opus, wav, or ogg.");
        }

        // Vérifier si l'utilisateur est dans un canal vocal
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return await message.reply("You must be in a voice channel to use this command.");
        }

        // Déterminer le chemin de sauvegarde
        const parentDirectory = path.resolve(__dirname, '../..');
        const saveDirectory = path.join(parentDirectory, `youtube_dl/save/${guildId}`);
        if (!fs.existsSync(saveDirectory)) {
            fs.mkdirSync(saveDirectory, { recursive: true });
        }

        const key = Date.now() + Math.floor(Math.random() * 1000);
        const originalFilePath = path.join(saveDirectory, `${key}.${fileFormat}`);

        // Télécharger le fichier
        const response = await axios({
            url: attachment.url,
            method: 'GET',
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(originalFilePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // Ajouter la chanson à la liste de lecture
        let player = songManager.getAudioPlayer(guildId);
        const isIdle =
            player.state.status === AudioPlayerStatus.Idle ||
            player.state.status === AudioPlayerStatus.AutoPaused ||
            player.state.status === AudioPlayerStatus.Paused;


        if (isIdle) {
            await message.channel.send('Loading the song...');
        } else {
            await message.channel.send('Song added to the queue.');
        }

        songManager.addSong(guildId, originalFilePath, attachment.name, key, fileFormat);

        if (isIdle) {
            filePlayNextSong(player, message, songManager);
        }

        songManager.unsetWaiting(guildId);

        try {
            await message.delete();
        } catch (error) {
            console.error(`Error while removing attachments: ${error.message}`);
        }

    } catch (error) {
        console.error(`Error in playDlSong: ${error.message}`);
    }
}


async function filePlayNextSong(player, message, songManager, connection) {
    try {
        const guildId = message.guild.id;
        const voiceChannel = message.member.voice.channel;
        const channel = message.channel;

        const song = await songManager.getSongQueue(guildId);
        if (!song) {
            return;
        }

        const embedText = "Now playing : " + song.title;
        const embed = Utils.toEmbed(`Music Player`, embedText, 0xff1493);

        await channel.send({
            embeds: [embed]
        });

        if (!connection) {
            connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator
            });
            connection.subscribe(player);
        }

        player.removeAllListeners(AudioPlayerStatus.Idle);
        player.removeAllListeners(AudioPlayerStatus.Playing);

        // New listener for playing state
        player.once(AudioPlayerStatus.Playing, () => {
            console.log('Song started playing');
            songManager.removeSong(guildId);
        });

        // Listener for when playback is finished
        player.once(AudioPlayerStatus.Idle, async () => {
            console.log('Song finished, moving to next');
            const dataDelete = {
                guild: guildId,
                video_url: song.url,
                key: song.key,
                fileformat: song.fileformat
            };
            axios.post('http://127.0.0.1:5001/delete', dataDelete);
            await filePlayNextSong(player, message, songManager, connection);
        });

        const key = song.key;
        const fileformat = song.fileformat || 'opus';

        const parentDirectory = path.resolve(__dirname, '../..');
        const filePath = path.join(parentDirectory, `youtube_dl/save/${guildId}/${key}.${fileformat}`);

        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                console.error("File does not exist, retrying in 4 seconds...");
                setTimeout(() => {
                    fs.access(filePath, fs.constants.F_OK, (retryErr) => {
                        if (retryErr) {
                            console.error("File still does not exist after retry.");
                            return;
                        }
                        let resource = createAudioResource(filePath);
                        player.play(resource);
                    });
                }, 4000);
            } else {
                let resource = createAudioResource(filePath);
                player.play(resource);
            }
        });
    } catch (error) {
        console.error(`playsong.playNextSong (ERROR) : ` + error);
    }
}


module.exports = { playDlFile };