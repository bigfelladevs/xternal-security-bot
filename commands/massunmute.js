const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('massunmute')
        .setDescription('Unmute a user across all community guilds.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user that will be unmuted.')
                .setRequired(true)),

    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            if (interaction.guild.id !== config.BotInformation.MainGuild) {
                await interaction.followUp({ content: 'This command can only be used in the main guild.', ephemeral: true });
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
                await interaction.followUp({ content: 'You do not have permission to use this command.', ephemeral: true });
                return;
            }

            const target = interaction.options.getUser('target');
            const member = interaction.guild.members.cache.get(target.id);
            const channelName = `muted-${target.id}`;
            const channel = interaction.guild.channels.cache.find(ch => ch.name === channelName);

            if (channel) {
                await interaction.followUp({ content: `User <@${target.id}> has been mass-unmuted. Roles are being restored, and channel is being deleted.`, ephemeral: true });
                setTimeout(async () => {
                    try {
                        await channel.delete('Unmuting user and removing mute channel');
                    } catch (error) {
                        console.error('Error deleting channel:', error);
                    }
                }, 5000);
            } else {
                await interaction.followUp({ content: `No mute channel found for <@${target.id}>.`, ephemeral: true });
            }

            const oldRoles = interaction.client.mutedRoles.get(target.id);
            if (oldRoles) {
                await member.roles.set(oldRoles);
                interaction.client.mutedRoles.delete(target.id);

                const logChannel = interaction.client.channels.cache.get(config.DiscordInformation.ExternalLogs);
                if (logChannel) {
                    const embed = new EmbedBuilder()
                        .setTitle('User Mass Unmuted')
                        .addFields(
                            { name: 'User Info', value: `<@${target.id}>  |  (${target.id})` },
                            { name: 'Roles Restored', value: oldRoles.map(roleId => `<@&${roleId}>`).join(', ') || 'None' },
                            { name: 'Command Origin', value: `#${interaction.channel.name}  |  (${interaction.channel.id})` },
                            { name: 'Executed By', value: `${interaction.user}` }
                        )
                        .setColor('#2B9100')
                        .setFooter({ text: `${config.CommunityInfo.ServerName} | External Logs`, iconURL: config.CommunityInfo.ServerLogo })
                        .setTimestamp();

                    await logChannel.send({ embeds: [embed] });
                }
            } else {
                await interaction.followUp({ content: 'No roles found to restore. Please contact CoC.', ephemeral: true });
            }

            interaction.client.guilds.cache.forEach(async (guild) => {
                if (guild.id !== config.BotInformation.MainGuild) {
                    const guildMember = guild.members.cache.get(target.id);
                    if (guildMember && interaction.client.mutedRoles.has(`${guild.id}-${target.id}`)) {
                        const oldGuildRoles = interaction.client.mutedRoles.get(`${guild.id}-${target.id}`);
                        await guildMember.roles.set(oldGuildRoles);
                        interaction.client.mutedRoles.delete(`${guild.id}-${target.id}`);
                    }
                }
            });

        } catch (error) {
            console.error('Error during mass-unmute:', error);
            await interaction.followUp({ content: 'An error occurred while mass-unmuting the user.', ephemeral: true });
        }
    },
};
