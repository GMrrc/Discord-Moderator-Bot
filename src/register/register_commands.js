const { REST, Routes } = require('discord.js');
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const foldersPath = path.join(__dirname, './../commands');
const commandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(foldersPath, file);
    const command = require(filePath);
    if ('commandData' in command && 'execute' in command) {
        commands.push(command.commandData().toJSON());
    } else {
        console.log(`Command file ${file} does not export the required properties`);
    }
}

// Create a REST client to interact with the Discord API
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// Asynchronous function to register/update application commands
(async () => {
    try {
    console.log('Started refreshing application (/) commands.');

    // Use the REST client to update application commands
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
    console.error(error);
    }
})();