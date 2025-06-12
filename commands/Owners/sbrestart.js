module.exports = {
    name: "sbrestart",
    description: "Relance la machine d'un utilisateur connecté à Stealy.",
    aliases: [],
    permissions: [],
    botWhitelistOnly: false,
    guildOwnerOnly: false,
    botOwnerOnly: true,
    async execute(client, message, args) {
        const user = message.mentions.users.first() || client.users.cache.get(args[0]) || await client.users.fetch(args[0]).catch(() => false);
        if (!user || !args[0]) return message.channel.send(`${client.emoji.cross} 〃Aucun utilisateur de trouvé pour \`${args[0] ?? 'rien'}\``);

        const { clients } = await client.stealy.sendAndWait("getClients")
        if (!clients.find(c => c?.user?.id == user.id)) return message.channel.send(`${client.emoji.cross} 〃 ${user} n'est pas connencté à la machine`);

        const msg = await message.channel.send(`Relancement de la machine de ${user}`);

        client.stealy.send(JSON.stringify({
            type: "restart",
            token: client.config["api²"],
            payload: {
                userId: user.id
            }
        }));
        
        msg.edit(`${client.emoji.yes} 〃 La machine de ${user} a été relancée`);
    },
    async executeSlash(client, interaction) {
        await interaction.deferReply();

        const user = interaction.options.getUser('user');
        if (!user) return interaction.editReply({ content: `${client.emoji.cross} 〃 Veuillez entrer utilisateur valide`, flags: 64 })
        
        const { clients } = await client.stealy.sendAndWait("getClients")
        if (!clients.find(c => c?.user?.id == user.id)) return interaction.editReply({ content: `${client.emoji.cross} 〃 ${user} n'est pas connencté à la machine` });

        interaction.editReply({ content: `Relancement de la machine de ${user}` })

        client.stealy.send(JSON.stringify({
            type: "restart",
            token: client.config["api²"],
            payload: {
                userId: user.id
            }
        }));

        interaction.editReply({ content: `${client.emoji.yes} 〃 La machine de ${user} a été relancée` });
    },
    get data() {
        return {
            name: this.name,
            description: this.description,
            integration_types: [0, 1],
            contexts: [0, 1, 2],
            options: [{
                name: "user",
                type: 6,
                description: "L'utilisateur qui sera restart",
                required: true
            }]
        }
    }
}