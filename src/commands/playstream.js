const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioResource, StreamType, AudioPlayerStatus } = require('@discordjs/voice');
const { get: httpsGet, request: httpsRequest } = require('https');
const { get: httpGet, request: httpRequest } = require('http');
const { parse: parseUrl } = require('url');
const fs = require('fs');
const Utils = require('./../utils');


function commandData() {
    return new SlashCommandBuilder()
        .setName("playstream")
        .setDescription("Play a stream in your current voice channel")
        .addStringOption(option =>
            option.setName('source')
                .setDescription('The URL of the source (Radio, etc.)')
                .setRequired(true)
                .setAutocomplete(true)
        )
}


async function autocomplete(interaction) {
    try {
        const webradios = await fetchRadioData();
        const focusedValue = interaction.options.getFocused();

        // Filtrer les résultats pour correspondre à l'entrée de l'utilisateur
        const filtered = Object.keys(webradios).filter(title =>
            title.toLowerCase().includes(focusedValue.toLowerCase())
        );

        // Préparer les réponses avec le nom et la première URL comme value
        await interaction.respond(
            filtered.slice(0, 25).map(title => ({
                name: title,
                value: webradios[title].urls[0] // Utilise la première URL de la radio
            }))
        );
    } catch (error) {
        console.error('Autocomplete error:', error);
        return [];
    }
}

function fetchRadioData() {
    return new Promise((resolve, reject) => {
        fs.readFile('./storage/webradio.json', 'utf8', (err, data) => {
            if (err) {
                return reject(new Error('Failed to read webradio.json'));
            }

            try {
                const webradios = JSON.parse(data);
                resolve(webradios);
            } catch (error) {
                reject(new Error('Failed to parse webradio.json'));
            }
        });
    });
}


function fetchStream(url, maxRedirects = 5) {
    return new Promise((resolve, reject) => {
        const parsedUrl = parseUrl(url);
        const { protocol, hostname, port, path } = parsedUrl;
        const get = protocol === 'https:' ? httpsGet : httpGet;
        const request = protocol === 'https:' ? httpsRequest : httpRequest;

        // Construire la requête
        const options = {
            hostname,
            port: port || (protocol === 'https:' ? 443 : 80),
            path, // Inclut le `;` correctement
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
                'Accept': 'audio/mpeg, audio/*;q=0.9',
                'Connection': 'keep-alive',
            },
            rejectUnauthorized: false, // SSL non vérifié si nécessaire
        };

        const req = request(options, (response) => {
            
            if ([301, 302, 303, 307].includes(response.statusCode) && response.headers.location) {
                if (maxRedirects > 0) {
                    const newUrl = response.headers.location.startsWith('http')
                        ? response.headers.location
                        : `${protocol}//${hostname}${response.headers.location}`;
                    fetchStream(newUrl, maxRedirects - 1).then(resolve).catch(reject);
                } else {
                    reject(new Error('Too many redirects'));
                }
            } else if (response.statusCode === 200) {
                resolve(response); // Flux trouvé
            } else {
                reject(new Error(`Failed to fetch stream. Status Code: ${response.statusCode}`));
            }
        });

        req.on('error', (err) => reject(err));
        req.end();
    });
}


async function execute(interaction, songManager) {
    try {
        const guildId = interaction.guild.id;
        const source = interaction.options.getString('source');
        const streamUrl = source.startsWith('http') ? source : `http://${source}`;

        songManager.setPlaySource(guildId);

        // Vérifier si l'utilisateur est dans un canal vocal
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            await interaction.reply({
                content: 'You need to be in a voice channel to play a song.',
                ephemeral: true
            });
            return;
        }

        // Rejoindre le canal vocal
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        let stream;
        try {
            stream = await fetchStream(streamUrl); // Gestion des redirections incluses
        } catch (err) {
            console.error('Error fetching stream:', err);
            await interaction.reply({
                content: 'Failed to fetch the stream. Please try another source.',
                ephemeral: true
            });
            return;
        }

        // Création du player audio
        let player = songManager.getAudioPlayer(guildId);
        player.on(AudioPlayerStatus.Idle, () => {
            songManager.unsetPlaySource(guildId);
        });

        // Création de la ressource audio
        const resource = createAudioResource(stream, {
            inputType: StreamType.Arbitrary,
            metadata: { title: source },
        });

        player.play(resource);
        connection.subscribe(player);

        const embed = Utils.toEmbed(
            'Audio Streaming',
            `Source: ${streamUrl}`,
            0xff1493
        );

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error(`execute (ERROR):`, error);
        await interaction.reply({
            content: 'An error occurred while playing the source.',
            ephemeral: true
        });
    }
}


module.exports = {
    commandData,
    execute,
    autocomplete
};
