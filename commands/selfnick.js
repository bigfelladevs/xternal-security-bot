const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('selfnick')
        .setDescription('Update your nickname in all community guilds.')
        .addStringOption(option =>
            option.setName('nickname')
                .setDescription('Updated Nickname')
                .setRequired(true)),

    async execute(interaction) {
        try {
            if (interaction.channel.id !== config.DiscordInformation.BotCommands) {
                await interaction.reply({ content: `This command can only be used in the bot commands channel.`, ephemeral: true });
                return;
            }

            const newNickname = interaction.options.getString('nickname');
            const user = interaction.user;
            const client = interaction.client;

            let renamedCount = 0;
            const previousNickname = [];

            for (const guild of client.guilds.cache.values()) {
                const member = guild.members.cache.get(user.id);
                if (member) {
                    previousNickname.push(member.nickname || member.user.username);
                    await member.setNickname(newNickname, `Renamed by ${user.tag}`);
                    renamedCount++;
                }
            }

            await interaction.reply({ content: `Successfully updated your nickname to **__${newNickname}__** in ${renamedCount} guild(s).`, ephemeral: true });

            const logChannel = client.channels.cache.get(config.DiscordInformation.GeneralLogs);
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setTitle('User Updated Their Nickname!')
                    .addFields(
                        { name: 'User Info', value: `<@${user.id}>  |  (${user.id})` },
                        { name: 'Previous Nickname', value: previousNickname.join(', ') },
                        { name: 'Updated Nickname', value: newNickname },
                        { name: 'Command Origin', value: `#${interaction.channel.name}  |  (${interaction.channel.id})` }
                    )
                    .setColor('#2B9100')
                    .setFooter({ text: `${config.CommunityInfo.ServerName} | General Logs`, iconURL: config.CommunityInfo.ServerLogo })
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error renaming user:', error);
            await interaction.reply({ content: 'An error occurred while updating your nickname.', ephemeral: true });
        }
    },
};
