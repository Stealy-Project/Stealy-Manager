const fs = require('node:fs');

module.exports = {
    name: "clean",
    description: "Trie les utilisateurs connectés des utilisateurs non connectés.",
    aliases: [],
    permissions: [],
    botWhitelistOnly: false,
    guildOwnerOnly: false,
    botOwnerOnly: true,
    async execute(client, message, args) 
    {
        const { clients } = await client.stealy.sendAndWait("getClients")
        const whitelistUsers = message.guild.members.cache.filter(m => m.roles.cache.has(client.config.whitelist));
        const m = await message.channel.send({ content: `${client.emoji.load} 〃 Vérification de **\`${whitelistUsers.size}\`** utilisateurs en cours...` });

        let notconnnected = 0;
        const interval_ = setInterval(() => m.edit(`${client.emoji.load} 〃 **\`${notconnnected}\`**/**\`${whitelistUsers.size}\`** Utilisateurs ont été derank`), 5000);
        
        for (const member of whitelistUsers.values())
        {
            if (clients.find(c => c.user.id == member.id)) member.roles.add(client.config.whitelist);
            else {
                await member.roles.remove(client.config.whitelist);
                notconnnected++;
            }
       }

        clearInterval(interval_);
        m.edit(`${client.emoji.yes} 〃 **\`${notconnnected}\`**/**\`${whitelistUsers.size}\`** Utilisateurs ont été derank`);
    },
    async executeSlash(client, interaction) 
    {
        await interaction.deferReply();

        const { clients } = await client.stealy.sendAndWait("getClients")
        const whitelistUsers = interaction.guild.members.cache.filter(m => m.roles.cache.has(client.config.whitelist));
        await interaction.editReply({ content: `${client.emoji.load} 〃 Vérification de **\`${whitelistUsers.size}\`** utilisateurs en cours...` });

        let notconnnected = 0;
        const interval_ = setInterval(() => interaction.editReply(`${client.emoji.load} 〃 **\`${notconnnected}\`**/**\`${whitelistUsers.size}\`** Utilisateurs ont été derank`), 5000);

        for (const member of whitelistUsers.values())
        {
            if (clients.find(c => c.user.id == member.id)) member.roles.add(client.config.whitelist);
            
            else {
                await member.roles.remove(client.config.whitelist);
                notconnnected++;
            }
        }

        clearInterval(interval_);
        interaction.editReply(`${client.emoji.yes} 〃 **\`${notconnnected}\`**/**\`${whitelistUsers.size}\`** Utilisateurs ont été derank`);
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