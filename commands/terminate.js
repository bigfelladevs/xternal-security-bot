const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('terminate')
        .setDescription('Terminate a user from the community.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user that will be terminated.')
                .setRequired(true)),

    async execute(interaction) {
        try {
            if (interaction.guild.id !== config.BotInformation.MainGuild) {
                await interaction.reply({ content: 'This command can only be used in the main guild.', ephemeral: true });
                return;
            }

            const allowedRoles = [
                config.DiscordInformation.Leadership,
                config.DiscordInformation.AdminRole,
                config.DiscordInformation.JrAdminRole,
                config.DiscordInformation.SStaffRole,
                config.DiscordInformation.StaffRole,
                config.DiscordInformation.SiTRole
            ];

            const hasRole = interaction.member.roles.cache.some(role => allowedRoles.includes(role.id));
            if (!hasRole) {
                await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
                return;
            }

            const target = interaction.options.getUser('target');
            const member = interaction.guild.members.cache.get(target.id);

            const oldRoles = member.roles.cache.map(role => role.id);
            await member.roles.set([config.DiscordInformation.SeeAdminRole]);

            const category = interaction.guild.channels.cache.get(config.DiscordInformation.UICategory);
            if (!category) {
                await interaction.reply({ content: 'Specified category not found.', ephemeral: true });
                return;
            }

            const channelName = `muted-${target.id}`;
            const channel = await interaction.guild.channels.create({
                name: channelName,
                type: 0,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: target.id,
                        deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: config.DiscordInformation.SeeAdminRole,
                        allow: [PermissionsBitField.Flags.ViewChannel],
                    },
                ],
            });

            await interaction.reply({ content: `User <@${target.id}> has been mass-muted across all guilds.`, ephemeral: true });

            const logChannel = interaction.client.channels.cache.get(config.DiscordInformation.ExternalLogs);
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setTitle('User Mass Muted')
                    .addFields(
                        { name: 'User Info', value: `<@${target.id}>  |  (${target.id})` },
                        { name: 'Roles Removed', value: oldRoles.map(roleId => `<@&${roleId}>`).join(', ') || 'None' },
                        { name: 'New Role', value: `<@&${config.DiscordInformation.SeeAdminRole}>` },
                        { name: 'Channel Created', value: `#${channel.name}` },
                        { name: 'Command Origin', value: `#${interaction.channel.name}  |  (${interaction.channel.id})` },
                        { name: 'Executed By', value: `${interaction.user}` }
                    )
                    .setColor('#FF0000')
                    .setFooter({ text: `${config.CommunityInfo.ServerName} | External Logs`, iconURL: config.CommunityInfo.ServerLogo })
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            }

            interaction.client.mutedRoles = interaction.client.mutedRoles || new Map();
            interaction.client.mutedRoles.set(target.id, oldRoles);

            interaction.client.guilds.cache.forEach(async (guild) => {
                if (guild.id !== config.BotInformation.MainGuild) {
                    const guildMember = guild.members.cache.get(target.id);
                    if (guildMember) {
                        const coventryRole = guild.roles.cache.find(role => role.name === 'Coventry');
                        if (coventryRole) {
                            const guildOldRoles = guildMember.roles.cache.map(role => role.id);
                            interaction.client.mutedRoles.set(`${guild.id}-${target.id}`, guildOldRoles);

                            await guildMember.roles.set([coventryRole.id]);
                        }
                    }
                }
            });

        } catch (error) {
            console.error('Error during mass-mute:', error);
            await interaction.reply({ content: 'An error occurred while mass-muting the user.', ephemeral: true });
        }
    },
};
