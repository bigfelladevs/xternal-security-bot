const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.js');
const moment = require('moment');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Displays information about a user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to display information for')
                .setRequired(true)),

    async execute(interaction) {
        try {
            if (interaction.channel.id !== config.DiscordInformation.BotCommands) {
                await interaction.reply({ content: `This command can only be used in the bot commands channel.`, ephemeral: true });
                return;
            }

            const user = interaction.options.getUser('user');

            if (!user) {
                await interaction.reply({ content: 'User not found.', ephemeral: true });
                return;
            }

            const member = interaction.guild.members.cache.get(user.id);

            const embed = new EmbedBuilder()
                .setTitle('User Information')
                .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 4096 }))
                .addFields(
                    { name: 'Username', value: user.tag, inline: true },
                    { name: 'ID', value: user.id, inline: true },
                    { name: 'Account Creation Date', value: moment(user.createdAt).format('MMMM D, YYYY | @h:mm A'), inline: false },
                    ...(member ? [{ name: 'Joined Server Date', value: moment(member.joinedAt).format('MMMM D, YYYY | @h:mm A'), inline: false }] : []),
                    { name: 'Avatar URL', value: `[Click Here](${user.displayAvatarURL({ dynamic: true, size: 4096 })})`, inline: false }
                )
                .setColor('#0099ff')
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: false });
        } catch (error) {
            console.error('Error fetching user:', error);
            await interaction.reply({ content: 'An error occurred while fetching user information.', ephemeral: true });
        }
    },
};
