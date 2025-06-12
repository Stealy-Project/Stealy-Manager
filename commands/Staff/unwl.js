module.exports = {
    name: "unwl",
    description: "Retire le rôle whitelist à un utilisateur.",
    aliases: [],
    permissions: [],
    botWhitelistOnly: true,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {
        const member = message.mentions.members.first() || message.guild.members.get(args[0]) || message.member

        if (!member) return message.channel.send(`Aucun membre de trouvé pour \`${args[0] || "rien"}\``)
        if (!member.roles.cache.has(client.config.whitelist)) return message.channel.send(`${member.user.globalName || member.user.username} n'est pas whitelist`)

        member.roles.remove(message.guild.roles.cache.get(client.config.whitelist), `Rôle whitelist retiré par ${message.author.username}`)
            .then( () => message.channel.send(`${member.user.globalName || member.user.username} n'est plus **whitelist**`))
            .catch(() => message.channel.send(`Je n'ai pas pu unwhitelist ${member.user.globalName || member.user.username} `))
    },
    async executeSlash(client, interaction) {
        const user = interaction.options.getUser('user')
        if (!user) return interaction.reply({ content: `Aucun utilisateur de trouvé pour \`${user || "rien"}\``, flags: 64 })

        const guild  = interaction.guild || client.guilds.cache.get(client.config.guildid);
        const member = guild.members.cache.get(user.id) || await guild.members.fetch(user.id)
        
        if (!member) return interaction.reply({ content: `Aucun membre de trouvé pour \`${user.globalName || user.username}\``, flags: 64 })
        if (!member.roles.cache.has(client.config.whitelist)) return interaction.reply({ content: `${user.globalName || user.username} n'est pas whitelist`, flags: 64 })

        member.roles.remove(guild.roles.cache.get(client.config.whitelist), `Rôle whitelist retiré par ${interaction.user.username}`)
            .then(() => interaction.reply({content: `${member.user.globalName || member.user.username} n'est plus **whitelist**`, ephemeral : true}))
            .catch(() => interaction.reply({content: `Je n'ai pas pu unwhitelist ${member.user.globalName || member.user.username} `, flags: 64 }))
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
                    description: "L'utilisateur à unwhitelist",
                }
            ]
        }
    }
}