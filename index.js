const { Client, GatewayIntentBits, Collection, ActivityType } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require("fs");
const path = require("path");

const config = require('./config');
global.config = config;

const activityTypeMap = {
    "Playing": ActivityType.Playing,
    "Streaming": ActivityType.Streaming,
    "Listening": ActivityType.Listening,
    "Watching": ActivityType.Watching,
    "Competing": ActivityType.Competing
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.DirectMessages
    ],
});

client.commands = new Collection();

const commandsFolder = path.join(__dirname, "commands");

function loadCommands() {
    fs.readdir(commandsFolder, (err, files) => {
        if (err) {
            console.error("\x1b[31mError reading commands folder.\x1b[0m Error:", err);
            return;
        }

        files.forEach((file) => {
            if (file.endsWith(".js")) {
                const commandPath = path.join(commandsFolder, file);
                try {
                    const command = require(commandPath);
                    if (command && command.data && command.data.name) {
                        console.log(`Slash command \x1b[33m${file}\x1b[0m has been loaded successfully.`);
                        client.commands.set(command.data.name, command);
                    } else {
                        console.error(`\x1b[31mSlash command \x1b[33m${file}\x1b[31m failed to load. Error found.\x1b[0m`);
                    }
                } catch (err) {
                    console.error(`\x1b[31mFailed to load command \x1b[0m${file}.\x1b[0m Error:`, err);
                }
            }
        });
    });
}

loadCommands();

client.once("ready", async () => {
    console.log(`Successfully logged into \x1b[94m${client.user.tag}\x1b[0m and started the bot!`);
    
    const activityTypeString = config.BotInformation.ActivityType;
    const activityType = activityTypeMap[activityTypeString] || ActivityType.Playing;
    client.user.setActivity(config.BotInformation.ActivityTask, { type: activityType });
    client.user.setStatus('dnd');

    const commands = client.commands.map((command) => command.data.toJSON());

    try {
        await client.application.commands.set(commands, config.BotInformation.MainGuild);
        console.log("\x1b[32mAll slash commands have successfully been loaded!\x1b[0m");
    } catch (err) {
        console.error("\x1b[31mError registering slash commands.\x1b[0m Error:", err);
    }
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error("\x1b[31mError executing command.\x1b[0m Error:", err);
        await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
        });
    }
});

client.login(config.BotInformation.BotToken);
