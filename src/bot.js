//imports
const { Client, Events, Collection, GatewayIntentBits } = require('discord.js');
const schedule = require('node-schedule');
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
/** 
const { exec } = require('child_process');

const scriptPath = path.join(__dirname, 'start.sh');

exec(`sh ${scriptPath}`, (err, stdout, stderr) => {
  if (err) {
    console.error(`py_server.init (ERROR) :` + err);
    return;
  }
  console.log(`py_server.init (SUCCESS) :` + stdout);
});*/

const GuildBanwordManager = require('./handle/guildBanwordManager');
const UserSpamManager = require('./handle/userSpamManager');
const EventManager = require('./handle/eventManager');
const GuildLevelManager = require('./handle/guildLevelManager');
const SongManager = require('./handle/songManager');

const Utils = require('./utils');

// declare variables
let cronResetSpam = null;

const banwordManager = new GuildBanwordManager();
const userSpamManager = new UserSpamManager();
const eventManager = new EventManager();
const guildLevelManager = new GuildLevelManager();
const songManager = new SongManager();
let guildMessages = new Map();

const spamEmbed = Utils.toEmbed('Spam', 'You are spamming. Your message has been deleted.', 0xff0000);
const banEmbed = Utils.toEmbed('Banned Word', 'Your message has been deleted because it contained a banned word.', 0xff0000);

// Create a new Discord client with specified intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));


for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if ('commandData' in command && 'execute' in command) {
    client.commands.set(command.commandData().name, command);
  } else {
    console.log(`Command file ${file} does not export the required properties`);
  }
}


// -------------------------------------------------------------------------------------------------------------------------------------------------------------

// Here custom functions are defined

/**
 * Reset the spam iteration every minute
 */
function resetSpamIteration() {
  if (cronResetSpam !== null) {
    return;
  }

  cronResetSpam = schedule.scheduleJob('*/1 * * * *', function () {
    if (userSpamManager === undefined) {
      return;
    }
    userSpamManager.resetSpamIteration();
  });
}


// -------------------------------------------------------------------------------------------------------------------------------------------------------------

// Event handler when the bot is ready
client.on('ready', () => {
  console.log(`bot.ready (SUCCESS) : Logged in as ${client.user.tag}!`);
  resetSpamIteration();

  client.user.setPresence({
    activities: [{ name: 'you', type: 'WATCHING' }],
    status: 'online',
  });

});

// -------------------------------------------------------------------------------------------------------------------------------------------------------------

// Event handler when the bot receives a message
client.on(Events.MessageCreate, async (message) => {

  if (!message.guild) {
    return;
  }

  if (message.author.bot) {
    return;
  }


  try {
    const guildId = message.guild.id;
    const userId = message.author.id;

    const isDelete = userSpamManager.addSpamIteration(userId, guildId);
    if (isDelete) {

      await message.delete();

      const sendMessage = userSpamManager.checkSpamIteration(userId);

      if (!sendMessage) {
        await message.author.send({ embeds: [spamEmbed] });
      }

      console.log(`boy.MessageCreate (SPAM_TRIGGER_SUCCESS) : deleted message from ${message.author.id} on guild ${message.guild.id}`);
    }
  } catch (error) {
    console.error('bot.MessafeCreate (SPAM_TRIGGER_ERROR) : ', error);
  }

  try {
    const guildId = message.guild.id;
    const banwords = banwordManager.getBanwords(guildId) || [];
    const messageContent = message.content.toLowerCase();
    const modifiedContent = messageContent.replace(/[\s\-_\.:;/<>&*.]/g, '');

    const banned = banwords.some(word => modifiedContent.includes(word.toLowerCase()));

    if (banned) {
      await message.delete();

      await message.author.send({ embeds: [banEmbed] });

      console.log(`bot.MessageCreate (BAN_TRIGGER_SUCCESS) - deleted message from ${message.author.id} on guild ${message.guild.id}`);
    }
  } catch (error) {
    console.error('bot.MessageCreate (BAN_TRIGGER_ERROR) : ', error);
  }

  try {

    const guildId = message.guild.id;
    const userId = message.author.id;

    const isSpam = userSpamManager.checkSpamIteration(userId, guildId);

    if (isSpam) {
      return;
    }

    const messagelentgth = message.content.length;
    const xp = messagelentgth + 10;

    guildLevelManager.addUserLevel(guildId, message.author.id, xp);

  } catch (error) {
    console.error('bot.MessageCreate (LEVEL_ADD_ERROR) : ', error);
  }

});

// -------------------------------------------------------------------------------------------------------------------------------------------------------------

// Event handler when the bot receives a message update
client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
  try {

    if (!newMessage.guild) {
      return;
    }

    if (newMessage.author.bot) {
      return;
    }

    const guildId = newMessage.guild.id;
    const banwords = banwordManager.getBanwords(guildId) || [];
    const newMessageContent = newMessage.content.toLowerCase();
    const modifiedContent = newMessageContent.replace(/[\s\-_\.:;/<>&*.]/g, '');

    const banned = banwords.some(word => modifiedContent.includes(word.toLowerCase()));

    if (banned) {

      await newMessage.delete();
      await newMessage.author.send({ embeds: [banEmbed] });

      console.log(`bot.MessageUpdate (BAN_TRIGGER_SUCCESS) : deleted message from ${newMessage.author.username} on guild ${newMessage.guild.id}`);
    }
  } catch (error) {
    console.error('bot.MessageUpdate (BAN_TRIGGER_ERROR) : ', error);
  }
});

// -------------------------------------------------------------------------------------------------------------------------------------------------------------

client.on('voiceStateUpdate', (oldState, newState) => {
  try {
    if (oldState.channelId && !newState.channelId) {
      const voiceChannel = oldState.channel;
      
      const botMember = voiceChannel.members.get(client.user.id);

      if (botMember && voiceChannel.members.size === 1 && voiceChannel.members.has(client.user.id)) {
        console.log(`No user left, disconnected from ${voiceChannel.name}`);
        const guildId = oldState.guild.id;
        songManager.deconnect(guildId);
      }
    }
  } catch (error) {
    console.error('bot.voiceStateUpdate (ERROR) : ', error);
  }
});



// -------------------------------------------------------------------------------------------------------------------------------------------------------------

client.on(Events.InteractionCreate, async (interaction) => {

  if (!interaction.guild) {
    return;
  }

  const commandName = interaction.commandName;
  const command = interaction.client.commands.get(commandName);

  if (!command) {
    return;
  }

  const commandHandlers = {
    'banlist': banwordManager,
    'banword': banwordManager,
    'unbanword': banwordManager,
    'spamlimit': userSpamManager,
    'addevent': eventManager,
    'removeevent': eventManager,
    'getlevel': guildLevelManager,
    'leaderboard': guildLevelManager,
    'playsong': songManager,
    'stopsong': songManager,
    'skipsong': songManager,
    'songlist': songManager,
    'playstream': songManager,
    'chat': guildMessages
  };

  try {

    const handler = commandHandlers[commandName];

    if (interaction.isCommand() && command.execute) {
      if (handler) {
        await command.execute(interaction, handler);
      } else {
        await command.execute(interaction);
      }

    } else if (interaction.isAutocomplete() && command.autocomplete) {

      if (handler) {
        await command.autocomplete(interaction, handler);
      } else {
        await command.autocomplete(interaction);
      }
    }

  } catch (error) {
    console.error('bot.execute (ERROR) : ', error);
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true
        });
      } else if (interaction.replied) {
        await interaction.followUp({
          content: 'An additional error occurred while processing!',
          ephemeral: true
        });
      }
    } catch (followUpError) {
      console.error('bot.follow (ERROR) : ', followUpError);
    }
  }
});


// -------------------------------------------------------------------------------------------------------------------------------------------------------------

// Log in with the bot's token
client.login(process.env.TOKEN);

