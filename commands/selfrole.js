const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('selfrole')
        .setDescription('Add/Remove a department or notify role.')
        .addStringOption(option =>
            option.setName('roletoupdate')
                .setDescription('Select a role.')
                .setRequired(true)
                .addChoices(
                    { name: 'Police Department', value: 'police_department' },
                    { name: 'Sheriff\'s Office', value: 'sheriffs_office' },
                    { name: 'State Police', value: 'state_police' },
                    { name: 'Civilian Operations', value: 'civilian_operations' },
                    { name: 'Communications', value: 'communications' },
                    { name: 'Fire Department', value: 'fire_department' },
                    { name: 'Patrol Notified', value: 'patrol_notified' },
                    { name: 'Media Notified', value: 'media_notified' },
                    { name: 'Dev Notified', value: 'dev_notified' }
                )),

    async execute(interaction) {
        try {
            if (interaction.channel.id !== config.DiscordInformation.BotCommands) {
                await interaction.reply({ content: `This command can only be used in the bot commands channel.`, ephemeral: true });
                return;
            }

            const roletoupdate = interaction.options.getString('roletoupdate');
            const user = interaction.user;
            const member = interaction.guild.members.cache.get(user.id);

            const roles = {
                police_department: config.DiscordInformation.PoliceDept,
                sheriffs_office: config.DiscordInformation.SheriffsOffice,
                state_police: config.DiscordInformation.StatePolice,
                communications: config.DiscordInformation.Communications,
                fire_department: config.DiscordInformation.FireDepartment,
                civilian_operations: config.DiscordInformation.CivDepartment,
                patrol_notified: config.DiscordInformation.PatrolNotified,
                media_notified: config.DiscordInformation.MediaNotified,
                dev_notified: config.DiscordInformation.DevNotified
            };

            const role = interaction.guild.roles.cache.get(roles[roletoupdate]);

            if (!role) {
                await interaction.reply({ content: 'The selected role does not exist in this server.', ephemeral: true });
                return;
            }

            let action;
            if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role);
                action = 'Removed (-)';
            } else {
                await member.roles.add(role);
                action = 'Added (+)';
            }

            await interaction.reply({ content: `${action} the **${role.name}** role.`, ephemeral: true });

            const logChannel = interaction.client.channels.cache.get(config.DiscordInformation.GeneralLogs);
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setTitle('User Updated Their Roles!')
                    .addFields(
                        { name: 'User Info', value: `<@${user.id}>  |  (${user.id})` },
                        { name: 'Action', value: `Role ${action}` },
                        { name: 'Role', value: role.name },
                        { name: 'Command Origin', value: `#${interaction.channel.name}  |  (${interaction.channel.id})` }
                    )
                    .setColor(action === 'Added (+)' ? '#2B9100' : '#FF0000')
                    .setFooter({ text: `${config.CommunityInfo.ServerName} | General Logs`, iconURL: config.CommunityInfo.ServerLogo })
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error updating role:', error);
            await interaction.reply({ content: 'An error occurred while updating your role.', ephemeral: true });
        }
    },
};
