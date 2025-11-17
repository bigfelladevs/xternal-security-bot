const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Verify a user and assign them to a department.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to be verified')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('department')
                .setDescription('Select the department for the user')
                .setRequired(true)
                .addChoices(
                    { name: 'SASP', value: 'VerifyStatePolice' },
                    { name: 'BCSO', value: 'VerifySheriff' },
                    { name: 'LSPD', value: 'VerifyPoliceDept' },
                    { name: 'CIV', value: 'VerifyCivDept' },
                    { name: 'FIRE', value: 'VerifyFireDept' },
                    { name: 'DEV', value: 'VerifyDevelopment' },
                    { name: 'MEDIA', value: 'VerifyMediaTeam' },
                    { name: 'COMMS', value: 'VerifyCommsDept' }
                )),

    async execute(interaction) {
        try {
            const target = interaction.options.getUser('member');
            const departmentKey = interaction.options.getString('department');
            const roleId = config.DiscordInformation[departmentKey];
            const memberRoleId = config.DiscordInformation.MemberRole;

            const member = interaction.guild.members.cache.get(target.id);
            if (!member) {
                await interaction.reply({ content: 'Member not found in this guild.', ephemeral: true });
                return;
            }

            // Prevent verifying if the user already has the Member role
            if (member.roles.cache.has(memberRoleId)) {
                await interaction.reply({ content: '❌ This user already has the Member role and cannot be verified again.', ephemeral: true });
                return;
            }

            // Assign role
            await member.roles.add(roleId);

            // Create verification channel
            const category = interaction.guild.channels.cache.get(config.DiscordInformation.VerifyCategory);
            if (!category) {
                await interaction.reply({ content: 'Verification category not found in the server.', ephemeral: true });
                return;
            }

            const channelName = `verify-${target.id}`;
            const verifyChannel = await interaction.guild.channels.create({
                name: channelName,
                type: 0,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: target.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    },
                    {
                        id: interaction.guild.roles.everyone,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: roleId,
                        allow: [PermissionsBitField.Flags.ViewChannel],
                    }
                ],
            });

            const embed = new EmbedBuilder()
                .setTitle('User Verified')
                .setColor('#00FF88')
                .addFields(
                    { name: 'User Info', value: `<@${target.id}>  |  (${target.id})` },
                    { name: 'Channel Created', value: `#${verifyChannel.name}` },
                    {
                        name: 'Department',
                        value: departmentKey
                            .replace('Verify', '')
                            .replace('PoliceDept', 'Police Department')
                            .replace('Sheriff', "Sheriff's Office")
                            .replace('StatePolice', 'State Police')
                            .replace('CivDept', 'Civilian Operations')
                            .replace('FireDept', 'Fire Department')
                            .replace('MediaTeam', 'Media & Marketing')
                            .replace('CommsDept', 'Communications'),
                        inline: false
                    },
                    { name: 'Executed By:', value: `${interaction.user}` }
                )
                .setTimestamp();

            await interaction.reply({ content: `✅ <@${target.id}> has been verified and assigned to **${departmentKey.replace('Verify', '')}**.`, ephemeral: true });

            const logChannel = interaction.client.channels.cache.get(config.DiscordInformation.VerifyLogs);
            if (logChannel) await logChannel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Error running verify command:', error);
            await interaction.reply({ content: 'An error occurred during verification.', ephemeral: true });
        }
    },
};