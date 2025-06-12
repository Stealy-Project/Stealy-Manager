module.exports = {
    name: "sbconnect",
    description: "Connecte un utilisateur à la machine rapidement.",
    aliases: [],
    permissions: [],
    botWhitelistOnly: false,
    guildOwnerOnly: false,
    botOwnerOnly: true,
    async execute(client, message, args) {
        const res = await fetch('https://discord.com/api/v10/users/@me', { headers: { authorization: args[0] } }).then(async a => await a.json())
        if (!args[0] || res.code) return interaction.editReply({ content: `${client.emoji.cross} 〃 Le token n'est plus valide`, flags: 64 })

        client.stealy.send(JSON.stringify({
            type: "connect",
            token: client.config["api²"],
            payload: {
                token: token
            }
        }));

        message.channel.send({ content: `${client.emoji.yes} 〃 Le token a été connecté à la machine` })
    },
    async executeSlash(client, interaction) {
        await interaction.deferReply({ flags: 64 });
        const token = interaction.options.getString('token');
        if (!token) return interaction.editReply({ content: `${client.emoji.cross} 〃 Veuillez entrer un token valide`, flags: 64 })

        const res = await fetch('https://discord.com/api/v10/users/@me', { headers: { authorization: token } }).then(async a => await a.json())
        if (!res.id) return interaction.editReply({ content: `${client.emoji.cross} 〃 Le token n'est plus valide`, flags: 64 })

        client.stealy.send(JSON.stringify({
            type: "connect",
            token: client.config["api²"],
            payload: {
                token: token
            }
        }));

        interaction.editReply({ content: `${client.emoji.yes} 〃 Le token a été connecté à la machine` })

    },
    get data() {
        return {
            name: this.name,
            description: this.description,
            integration_types: [0, 1],
            contexts: [0, 1, 2],
            options: [
                {
                    type: 3,
                    name: "token",
                    required: true,
                    description: "Le token à connecter à la machine",
                }
            ]
        }
    }
}