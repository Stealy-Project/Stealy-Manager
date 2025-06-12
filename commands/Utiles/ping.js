module.exports = {
    name: "ping",
    description: "Afficher le ping du bot.",
    aliases: [],
    permissions: [],
    botWhitelistOnly: false,
    guildOwnerOnly: false,
    botOwnerOnly: true,
    async execute(client, message, args) {
        const date = Date.now()
        const msg = await message.reply('***Pinging...***');
        msg.edit(`***REST :*** \`${Math.ceil(Date.now() - date)}ms\` | ***WS :*** \`${Math.ceil(client.ws.ping)}ms\``)
    },
    async executeSlash(client, interaction) {
        const date = Date.now()
        await interaction.reply('***Pinging...***')
        interaction.editReply({ content : `***REST :*** \`${Math.ceil(Date.now() - date)}ms\` | ***WS :*** \`${Math.ceil(client.ws.ping)}ms\``, flags: 64 })
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