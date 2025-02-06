const { SlashCommandBuilder } = require('discord.js');
const defaultMessages = { "role": "system", "content": "You are an female discord assistant name Goto, your responses should be short and precise" };
const axios = require('axios');

function commandData() {
    return new SlashCommandBuilder()
        .setName("chat")
        .setDescription("Chat with a LLM")
        .addStringOption(option => option.setName('message').setDescription('Message to send').setRequired(true));
}

function addMessage(guildId, new_message, guildMessages) {
    try {
        if (!guildMessages.has(guildId)) {
            guildMessages.set(guildId, []);
            guildMessages.get(guildId).push(defaultMessages);
        }

        const messages = guildMessages.get(guildId);
        messages.push(new_message);

        if (messages.length > 7) {
            messages.shift();
        }
    } catch (error) {
        console.error(error);
    }
}


async function execute(interaction, guildMessages) {

    const guildId = interaction.guild.id;
    const userRequest = interaction.options.get('message').value;

    if (userRequest === undefined || userRequest === null || userRequest === "") {
        return;
    }

    const message = { "role": "user", "content": userRequest };

    addMessage(guildId, message, guildMessages);

    const requestData = {
        model: 'mistral-large-latest',
        messages: guildMessages.get(guildId),
    };

    console.log(guildMessages.get(guildId));
    interaction.deferReply();

    axios
        .post(`${process.env.base_url}`, requestData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.api_key}`,
            },
        })
        .then((response) => {
            const result = response.data.choices[0].message.content.substring(0, 2000);
            interaction.editReply(result);
            addMessage(guildId, response.data.choices[0].message, guildMessages);
            console.log("chat.execute (SUCCESS) : Chat process successfully for user : " + interaction.user.username + " in guild : " + interaction.guild.name);
        })
        .catch((error) => {
            console.error('chat.execute (ERROR) :', error);
            interaction.deleteReply();
        });

    return;
}

module.exports = {
    commandData,
    execute
};