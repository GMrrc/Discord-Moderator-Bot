## Discord Moderation Bot
### Introduction

This bot aims to moderate Discord channels, utilizing tools to filter messages, prevent spam, delete multiple messages, and other utilities such as creating events, temporary bans, and temporarily assigning roles.

#### Features

    Discord.js: Utilizes the Discord.js library for seamless integration.

### Installation

Ensure that you have Node.js and npm installed on your system. The dependencies can be installed using the following command :

```bash
npm install
```

#### Configuration

Before launching the bot, ensure to set up the Discord bot token in your environment variables within the .env file.
This file should contain the following:

```bash
TOKEN=YOUR_DISCORD_BOT_TOKEN
CLIENT_ID=YOUR_DISCORD_CLIENT_ID

#for llm api (optional)
base_url=YOUR_LLM_API
api_key=YOUR_LLM_API_KEY
```


### Usage

To register the command, execute the following:

```bash
node src/register/register_commands.js
```

Initiate the bot with:

```bash
node src/bot.js
```


### Start youtube-dl server

Install the required dependencies for the youtube-dl server:

```bash 
cd youtube_dl
python3 -m venv venv
source env/bin/activate
pip install -r requirements.txt
```

Start the youtube-dl server:
```bash
cd youtube_dl
start.sh
```


#### Adding New Slash Commands

To add new slash commands, you need to create a file named `your_command.js` within the `commands` directory. Then, create the `commandData` and `execute` functions within this file to enable its functionality.


#### Additional Notes

Verify that your Discord bot possesses the required permissions within your server.


### Author's Note

The development and maintenance of this bot have been carried out by Aorou. For inquiries or further information, please contact Aorou via [guillaume.marrec.frey@proton.me](mailto:guillaume.marrec.frey@proton.me).

Feel free to explore, contribute, and tailor the bot to your requirements! For any issues or suggestions, kindly open an issue on the GitHub repository.
