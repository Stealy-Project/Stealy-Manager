const { Client, Message } = require('discord.js');

module.exports = {
    name: "sbdeco",
    description: "Déconnecte un utilisateur de la machine.",
    aliases: [],
    permissions: [],
    botWhitelistOnly: false,
    guildOwnerOnly: false,
    botOwnerOnly: true,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string} args
    */
    async execute(client, message, args) {
        const user = message.mentions.users.first() || client.users.get(args[0])
        if (!args[0] || !user) return message.channel.send({ content: `${client.emoji.cross} 〃 Veuillez entrer un ID d'utilisateur valide` })

        const { clients } = await client.stealy.sendAndWait("getClients")
        if (!clients.find(c => c?.user?.id == user.id)) return message.channel.send(`${client.emoji.cross} 〃 ${user} n'est pas connencté à la machine`);

        client.stealy.send(JSON.stringify({
            type: "close",
            token: client.config["api²"],
            payload: { userId: user.id }
        }));

        message.channel.send({ content: `${client.emoji.yes} 〃 ${user.username} a été retiré de la machine` })

    },
    async executeSlash(client, interaction) {
        await interaction.deferReply({ flags: 64 });

        const user = interaction.options.getUser('user');
        if (!user) return interaction.reply({ content: `${client.emoji.cross} 〃 Veuillez entrer utilisateur valide`, flags: 64 })
    
        const { clients } = await client.stealy.sendAndWait("getClients")
        if (!clients.find(c => c?.user?.id == user.id)) return interaction.editReply({ content: `${client.emoji.cross} 〃 ${user} n'est pas connencté à la machine` });

        client.stealy.send(JSON.stringify({
            type: "close",
            token: client.config["api²"],
            payload: { userId: user.id }
        }));

        interaction.editReply({ content: `${client.emoji.yes} 〃 ${user.username} a été retiré de la machine` })

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