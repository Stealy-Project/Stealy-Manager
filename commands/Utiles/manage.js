const { ActionRowBuilder, ButtonBuilder, ButtonStyle, TextInputStyle, TextInputBuilder, ModalBuilder } = require('discord.js');

module.exports = {
    name: "manage",
    description: "Gère votre machine.",
    aliases: [],
    permissions: [],
    botWhitelistOnly: false,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) { },
    async executeSlash(client, interaction) {
        await interaction.deferReply({ flags: 64 });
        const { clients } = await client.stealy.sendAndWait("getClients")
        const guild = interaction.guild || client.guilds.cache.get(client.config.guildid);

        console.log(clients)
        const c = clients.find(c => c.user.id === interaction.user.id)
        if (!c) return interaction.editReply({ content: `${client.emoji.cross}〃 Aucun utilisateur de connecté à la machine avec cet ID`, flags: 64 })

        const embed = {
            title: `**__Machine Information de ${c.user.username}__**`,
            color: 0xFF0000,
            description: `› ***Préfix*** : \`${c.db.prefix}\`\n› ***Twitch*** : [${c.db.twitch.split("twitch.tv/")[1]}](<${c.db.twitch}>)\n› ***Nitro Sniper*** : ${c.db.nitrosniper ? `${client.emoji.yes}` : `${client.emoji.cross}`}\n› ***Anti Groupe*** : ${c.db.antigroup.status ? `${client.emoji.yes}` : `${client.emoji.cross}`}`
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('token')
                .setStyle(ButtonStyle.Secondary)
                .setLabel('Modifier votre token'),

            new ButtonBuilder()
                .setCustomId('restart')
                .setStyle(ButtonStyle.Secondary)
                .setLabel('Redémarrer'),

            new ButtonBuilder()
                .setCustomId('stop')
                .setStyle(ButtonStyle.Danger)
                .setLabel('Arrêter votre machine')
        );

        const msg = await interaction.editReply({ embeds: [embed], components: [row] })
        const collector = msg.createMessageComponentCollector({ time: 1000 * 60 * 10 });
        collector.on('end', () => msg.edit({ components: [] }).catch(() => false))

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) return i.reply({ content: "Vous ne pouvez pas utiliser cette interaction", flags: 64 })
            switch (i.customId) {

                case 'restart':
                    await i.deferReply({ flags: 64 });

                    client.stealy.send(JSON.stringify({
                        type: "restart",
                        token: client.config["api²"],
                        payload: { userId: interaction.user.id }
                    }));

                    i.editReply({ content: `${client.emoji.yes} 〃 La machine de ${interaction.user} a été relancée` });
                    break;

                case 'stop':
                    await i.deferReply({ flags: 64 });

                    client.stealy.send(JSON.stringify({
                        type: "close",
                        token: client.config["api²"],
                        payload: { userId: interaction.user.id }
                    }));

                    interaction.member.roles.remove(guild.roles.cache.get(client.config.whitelist), `Rôle whitelist retiré par ${interaction.user.username}`).catch(() => false)
                    i.editReply({ content: `${client.emoji.yes} 〃 ${interaction.user} a été retiré de la machine` });
                    collector.stop()
                    break;

                case 'token':
                    const tokenModal = new ModalBuilder()
                        .setCustomId('token')
                        .setTitle('Veuillez entrer le token')
                        .addComponents(
                            new ActionRowBuilder().addComponents(
                                new TextInputBuilder()
                                    .setCustomId('token')
                                    .setLabel("Veuillez entrer votre token ici?")
                                    .setStyle(TextInputStyle.Short)
                            )
                        )

                    i.showModal(tokenModal);
                    const tokenCollector = await i.awaitModalSubmit({ time: 1000 * 60 * 10 }).catch(() => null);
                    if (!tokenCollector || tokenCollector.size == 0) return;

                    const token = tokenCollector.fields.getTextInputValue('token').replaceAll('"', '');
                    await tokenCollector.deferReply({ flags: 64 });

                    const res = await fetch('https://discord.com/api/users/@me', { headers: { Authorization: token } });
                    if (!res.ok) return tokenCollector.editReply({ content: 'Le token est invalide' });
                    if (res.id !== interaction.user.id) return tokenCollector.editReply({ contenet: `Veuillez entrer le token du compte ${interaction.user}` });

                    client.stealy.send(JSON.stringify({
                        type: "close",
                        token: client.config["api²"],
                        payload: { userId: interaction.user.id }
                    }));

                    client.stealy.send(JSON.stringify({
                        type: "connect",
                        token: client.config["api²"],
                        payload: { token: token }
                    }));

                    tokenCollector.editReply({ content: `${client.emoji.yes} 〃 Le token a été connecté à la machine` })
                    break;
                
            }
        })
    },
    get data() {
        return {
            name: this.name,
            description: this.description,
            integration_types: [0, 1],
            contexts: [0, 1, 2],
        }
    }
}