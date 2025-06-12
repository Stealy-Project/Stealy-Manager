const Discord = require('discord.js');

module.exports = {
    name: "sblist",
    description: "Afficher la liste des utilisateurs connectés à la machine.",
    aliases: [],
    permissions: [],
    botWhitelistOnly: false,
    guildOwnerOnly: false,
    botOwnerOnly: true,
    async execute(client, message, args) {
        const { clients } = await client.stealy.sendAndWait("getClients")

        let p0 = 0;
        let p1 = 20;
        let page = 1;
        let count = p1;
        let maxpage = Math.ceil(clients.length / count) === 0 ? 1 : Math.ceil(clients.length / count)

        const embed = {
            title      : 'Liste des membres connectés à la machine',
            color      : 0xFFFFFF,
            footer     : { text: `Page ${page}/${maxpage}`, iconURL: message.author.avatarURL({ dynamic: true }) },
            description: `${clients.length > 0 ? clients.sort((a, b) => { return a.user?.username.localeCompare(b.user?.username) }).map(r => r).map((m,i) => `\`${i+1}\` - ${m.user.username} (\`${m.user.id}\`)`).slice(p0, p1).join('\n') : "Aucun utilisateur"}`
        }

        const row = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setDisabled(maxpage === 1)
                .setCustomId("previous")
                .setLabel("◀")
                .setStyle(2),

            new Discord.ButtonBuilder()
                .setDisabled(maxpage === 1)
                .setCustomId("next")
                .setLabel("▶")
                .setStyle(2),
        )


        const msg = await message.channel.send({ embeds: [embed], components: [row] })
        const collector = msg.createMessageComponentCollector({ time: 1000 * 60 * 10 });
        collector.on('end', () => msg.edit({ components: [] }).catch(() => false))

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) return i.reply({ content: "Vous ne pouvez pas utiliser cette interaction", flags: 64 })
            i.deferUpdate().catch(() => false)

            if (i.customId === "previous"){
                if (page -1 <= 0) return;
                p0 = p0 - count <= 0 ? 0 : p0 - count;
                p1 = p1 - count <= 10 ? 10 : p1 - count;
                page = page - 1;

                embed.description = `${clients
                    .sort((a, b) => { return a.user.username.localeCompare(b.user.username) })
                    .map(r => r)
                    .map((m,ii) => `\`${ii+1}\` - ${m.user.username} (\`${m.user.id}\`)`)
                    .slice(p0, p1)
                    .join('\n')
                }`
                embed.footer = { text: `Page ${page}/${maxpage}`, iconURL: message.author.avatarURL() }
                msg.edit({embeds: [embed]})    
            }

            else if (i.customId === "next"){
                if (page >= maxpage) return;
                
                p0 = p0 + count;
                p1 = p1 + count;
                page = page + 1;
    
                embed.description = `${clients
                    .sort((a, b) => { return a.user.username.localeCompare(b.user.username) })
                    .map(r => r)
                    .map((m,ii) => `\`${ii+1}\` - ${m.user.username} (\`${m.user.id}\`)`)
                    .slice(p0, p1)
                    .join('\n')
                }`
                embed.footer = { text: `Page ${page}/${maxpage}`, iconURL: message.author.avatarURL() }
                msg.edit({embeds: [embed]})        
            }
        })
    },
    async executeSlash(client, interaction) {
        const msg = await interaction.deferReply({ flags: 64 })
        const { clients } = await client.stealy.sendAndWait("getClients")


        let p0 = 0;
        let p1 = 20;
        let page = 1;
        let count = p1;
        let maxpage = Math.ceil(clients.length / count) === 0 ? 1 : Math.ceil(clients.length / count)

        const embed = {
            title      : 'Liste des membres connectés à la machine',
            color      : 0xFFFFFF,
            footer     : { text: `Page ${page}/${maxpage}`, iconURL: interaction.user.avatarURL({ dynamic: true }) },
            description: `${clients.length > 0 ? clients.sort((a, b) => { return a.user?.username.localeCompare(b.user?.username) }).map(r => r).map((m,i) => `\`${i+1}\` - ${m.user.username} (\`${m.user.id}\`)`).slice(p0, p1).join('\n') : "Aucun utilisateur"}`
        }

        const row = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setDisabled(maxpage === 1)
                .setCustomId("previous")
                .setLabel("◀")
                .setStyle(2),

            new Discord.ButtonBuilder()
                .setDisabled(maxpage === 1)
                .setCustomId("next")
                .setLabel("▶")
                .setStyle(2),
        )


        await interaction.editReply({ embeds: [embed], components: [row], flags: 64 })
        const collector = msg.createMessageComponentCollector({ time: 1000 * 60 * 10 });
        collector.on('end', () => msg.edit({ components: [] }).catch(() => false))

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) return i.reply({ content: "Vous ne pouvez pas utiliser cette interaction", flags: 64 })
            i.deferUpdate().catch(() => false)

            if (i.customId === "previous"){
                if (page -1 <= 0) return;
                p0 = p0 - count <= 0 ? 0 : p0 - count;
                p1 = p1 - count <= 10 ? 10 : p1 - count;
                page = page - 1;
    
                embed.description = `${clients
                    .sort((a, b) => { return a.user.username.localeCompare(b.user.username) })
                    .map(r => r)
                    .map((m,ii) => `\`${ii+1}\` - ${m.user.username} (\`${m.user.id}\`)`)
                    .slice(p0, p1)
                    .join('\n')
                }`

                embed.footer = { text: `Page ${page}/${maxpage}`, iconURL: interaction.user.avatarURL({ dynamic: true }) };
                interaction.editReply({embeds: [embed]})    
            }

            else if (i.customId === "next"){
                if (page >= maxpage) return;
                
                p0 = p0 + count;
                p1 = p1 + count;
                page = page + 1;
    
                embed.description = `${clients
                    .sort((a, b) => { return a.user.username.localeCompare(b.user.username) })
                    .map(r => r)
                    .map((m,ii) => `\`${ii+1}\` - ${m.user.username} (\`${m.user.id}\`)`)
                    .slice(p0, p1)
                    .join('\n')
                }`

                embed.footer = { text: `Page ${page}/${maxpage}`, iconURL: interaction.user.avatarURL({ dynamic: true }) };
                interaction.editReply({embeds: [embed]})        
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