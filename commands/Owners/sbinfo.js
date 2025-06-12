const Discord = require('discord.js');
const fs = require('node:fs');

module.exports = {
    name: "sbinfo",
    description: "Affiche les informations de la base de donné d'un utilisateur.",
    aliases: [],
    permissions: [],
    botWhitelistOnly: false,
    guildOwnerOnly: false,
    botOwnerOnly: true,
    async execute(client, message, args) {
        const user = message.mentions.users.first() || client.users.get(args[0])
        if (!args[0] || !user) return message.channel.send(`${client.emoji.cross} 〃 Veuillez entrer un ID d'utilisateur valide`)

        const {clients} = await client.stealy.sendAndWait("getClients")

        const c = clients.find(c => c.user.id === user.id)
        if (!c) return message.channel.send(`${client.emoji.cross}〃 Aucun utilisateur de connecté à la machine avec cet ID`)

        const embed = new Discord.EmbedBuilder()
            .setTitle(`**__Machine Information de ${c.user.username}__**`)
            .setColor(0xFF0000)
            .setDescription(`› ***Préfix*** : \`${c.db.prefix}\`
                › ***Twitch*** : [${c.db.twitch.split("twitch.tv/")[1]}](<${c.db.twitch}>)
                › ***Nitro Sniper*** : ${c.db.nitrosniper ? `${client.emoji.yes}` : `${client.emoji.cross}`}
                › ***Anti Groupe*** : ${c.db.antigroup.status ? `${client.emoji.yes}` : `${client.emoji.cross}`}`.replaceAll("                ", ""))

        const row = new Discord.ActionRowBuilder().addComponents(
            new Discord.StringSelectMenuBuilder()
                .setCustomId(`menu`)
                .setPlaceholder("Make a selection")
                .setMaxValues(1)
                .addOptions([
                    {
                        label: "Prefix",
                        emoji: Discord.parseEmoji("❓"),
                        value: "prefix",
                        description: 'Updates the machine\'s prefix',
                    },
                    {
                        label: "Add a token",
                        emoji: Discord.parseEmoji("➕"),
                        value: "token",
                        description: 'Adds another token to the machine',
                    },
                    {
                        label: "Disconnect a token",
                        emoji: Discord.parseEmoji("➖"),
                        value: "rtoken",
                        description: 'Adds another token to the machine',
                    }
                ])
        )

        const msg = await message.channel.send({ embeds: [embed], components: [row] })
        const collector = msg.createMessageComponentCollector({ time: 1000 * 60 * 10 });
        collector.on('end', () => msg.edit({ components: [] }).catch(() => false))

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) return i.reply({ content: "Vous ne pouvez pas utiliser cette interaction", flags: 64 })

            switch (i.values[0]) {
                case "prefix":
                    const row = new Discord.ActionRowBuilder().addComponents(
                        new Discord.TextInputBuilder()
                            .setCustomId(`new-prefix`)
                            .setMinLength(1)
                            .setMaxLength(5)
                            .setLabel("Nouveau Prefix")
                            .setStyle(Discord.TextInputStyle.Short)
                            .setRequired(true)
                    )

                    const modal = new Discord.ModalBuilder()
                        .setCustomId(`nprefix`)
                        .setTitle("Modification du prefix")
                        .setComponents(row)

                    i.showModal(modal)
                    break

                case "nprefix":
                    await i.deferReply({ flags: 64 })

                    const prefix = interaction.fields.getTextInputValue("new-prefix")

                    c.db.prefix = prefix
                    c.save()

                    i.editReply({ content: `${client.emoji.yes} 〃 Le prefix est maintenant \`${prefix}\`` })
                    break

                case "rtoken":
                    client.stealy.send(JSON.stringify({
                        type: "close",
                        token: client.config["api²"],
                        payload: { userId: user.id }
                    }));

                    i.reply({ content: `${client.emoji.yes} 〃 Le token a été supprimé`, flags: 64 })
                    break

                case "token":
                    const row2 = new Discord.ActionRowBuilder().addComponents(
                        new Discord.TextInputBuilder()
                            .setCustomId(`new-token`)
                            .setMinLength(1)
                            .setLabel("Token à ajouter")
                            .setStyle(Discord.TextInputStyle.Short)
                            .setRequired(true)
                    )

                    const modal2 = new Discord.ModalBuilder()
                        .setCustomId(`ntoken`)
                        .setTitle("Le token")
                        .setComponents(row2)

                    i.showModal(modal2)
                    break

                case "ntoken":
                    await i.deferReply({ flags: 64 })

                    const token = interaction.fields.getTextInputValue("new-token")

                    const res = await fetch('https://discord.com/api/v10/users/@me', { headers: { authorization: token } }).catch(() => false);
                    if (!res.ok) return i.editReply({ content: `${client.emoji.cross} 〃 Le token fourni est invalide` });

                    client.stealy.send(JSON.stringify({
                        type: "connect",
                        token: client.config["api²"],
                        payload: { token }
                    }));

                    i.editReply({ content: `${client.emoji.yes} 〃 Le token est maintenant connecté` })
                    break
            }
        })
    },
    /**
     * @param {Discord.Client} client
     * @param {Discord.ChatInputCommandInteraction} interaction
    */
    async executeSlash(client, interaction) {
        const user = interaction.options.getUser('user');
        if (!user) return interaction.reply({ content: `${client.emoji.cross} 〃 Veuillez entrer utilisateur valide`, flags: 64 })

        await interaction.deferReply({ flags: 64 });
        const { clients } = await client.stealy.sendAndWait("getClients")

        const c = clients.find(c => c.user.id === user.id)
        if (!c) return interaction.editReply({ content: `${client.emoji.cross}〃 Aucun utilisateur de connecté à la machine avec cet ID`, flags: 64 })

        const embed = new Discord.EmbedBuilder()
            .setTitle(`**__Machine Information de ${c.user.username}__**`)
            .setColor(0xFF0000)
            .setDescription(`› ***Préfix*** : \`${c.db.prefix}\`
                › ***Twitch*** : [${c.db.twitch.split("twitch.tv/")[1]}](<${c.db.twitch}>)
                › ***Nitro Sniper*** : ${c.db.nitrosniper ? `${client.emoji.yes}` : `${client.emoji.cross}`}
                › ***Anti Groupe*** : ${c.db.antigroup.status ? `${client.emoji.yes}` : `${client.emoji.cross}`}`.replaceAll("                ", ""))

        const row = new Discord.ActionRowBuilder().addComponents(
            new Discord.StringSelectMenuBuilder()
                .setCustomId(`menu`)
                .setPlaceholder("Make a selection")
                .setMaxValues(1)
                .addOptions([
                    {
                        label: "Prefix",
                        emoji: Discord.parseEmoji("❓"),
                        value: "prefix",
                        description: 'Updates the machine\'s prefix',
                    },
                    {
                        label: "Add a token",
                        emoji: Discord.parseEmoji("➕"),
                        value: "token",
                        description: 'Adds another token to the machine',
                    },
                    {
                        label: "Disconnect a token",
                        emoji: Discord.parseEmoji("➖"),
                        value: "rtoken",
                        description: 'Adds another token to the machine',
                    }
                ])
        )

        const msg = await interaction.editReply({ embeds: [embed], components: [row], flags: 64 })
        const collector = msg.createMessageComponentCollector({ time: 1000 * 60 * 10 });
        collector.on('end', () => msg.edit({ components: [] }).catch(() => false))

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) return i.reply({ content: "Vous ne pouvez pas utiliser cette interaction", flags: 64 })
            switch (i.values[0]) {
                case "prefix":
                    const row = new Discord.ActionRowBuilder().addComponents(
                        new Discord.TextInputBuilder()
                            .setCustomId(`new-prefix`)
                            .setMinLength(1)
                            .setMaxLength(5)
                            .setLabel("Nouveau Prefix")
                            .setStyle(Discord.TextInputStyle.Short)
                            .setRequired(true)
                    )

                    const modal = new Discord.ModalBuilder()
                        .setCustomId(`nprefix`)
                        .setTitle("Modification du prefix")
                        .setComponents(row)

                    i.showModal(modal)
                    const reponse = await i.awaitModalSubmit({ time: 1000 * 60 * 5 })
                    const prefix = reponse.fields.getTextInputValue("new-prefix")

                    c.db.prefix = prefix
                    c.save()

                    reponse.reply({ content: `${client.emoji.yes} 〃 Le prefix est maintenant \`${prefix}\``, flags: 64 })
                    break

                case "rtoken":
                    client.stealy.send(JSON.stringify({
                        type: "close",
                        token: client.config["api²"],
                        payload: { userId: user.id }
                    }));

                    i.reply({ content: `${client.emoji.yes} 〃 Le token a été supprimé`, flags: 64 })
                    break

                case "token":
                    const row2 = new Discord.ActionRowBuilder().addComponents(
                        new Discord.TextInputBuilder()
                            .setCustomId(`new-token`)
                            .setMinLength(1)
                            .setLabel("Token à ajouter")
                            .setStyle(Discord.TextInputStyle.Short)
                            .setRequired(true)
                    )

                    const modal2 = new Discord.ModalBuilder()
                        .setCustomId(`ntoken`)
                        .setTitle("Le token")
                        .setComponents(row2)

                    i.showModal(modal2)

                    const reponse2 = await i.awaitModalSubmit({ time: 1000 * 60 * 5 })
                    await reponse2.deferReply({ flags: 64 })
                    const token = reponse2.fields.getTextInputValue("new-token")

                    const res = await fetch('https://discord.com/api/v10/users/@me', { headers: { authorization: token } }).catch(() => false);
                    if (!res.ok) return reponse2.editReply({ content: `${client.emoji.cross} 〃 Le token fourni est invalide` });


                    client.stealy.send(JSON.stringify({
                        type: "connect",
                        token: client.config["api²"],
                        payload: { token }
                    }));

                    reponse2.editReply({ content: `${client.emoji.yes} 〃 Le token est maintenant connecté` })
                    break
            }
        })
    },
    get data() {
        return {
            name: this.name,
            description: this.description,
            integration_types: [0, 1],
            contexts: [0, 1, 2],
            options: [
                {
                    type: 6,
                    name: "user",
                    required: true,
                    description: "L'utilisateur à déconnecter de la machine",
                }
            ]
        }
    }
}