let i = 0;
const { REST } = require('@discordjs/rest');
const { Routes, Client, Events } = require('discord.js');


module.exports = {
    name: Events.ClientReady,
    once: true,
    /**
     * @param {Client} client
    */
    run : async client => {
        console.log(`> ${client.user.username} [1] [${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)}]`)

        const rest = new REST({ version: '10' }).setToken(client.token);
        rest.put(Routes.applicationCommands(client.user.id), { body: client.commands.map(c => c.data) })

        setInterval(() => {
            for (const channelId of Object.keys(client.config.counters)){
                const channel = client.channels.cache.get(channelId)
                if (channel) channel.setName(client.config.counters[channelId]
                    .replaceAll('<wl>', channel.guild.members.cache.filter(m => m.roles.cache.has(client.config.whitelist)).size)
                    .replaceAll('<members>', channel.guild.memberCount)
                )
            }
            

            client.user.setActivity({ 
                type: 1, url: "https://twitch.tv/senju_cc" , name: client.config.status[i]
                    .replaceAll('<wl>', client.guilds.cache.get(client.config.guildid)?.members?.cache?.filter(m => m.roles.cache.has(client.config.whitelist))?.size)
                    .replaceAll('<members>', client.guilds.cache.get(client.config.guildid)?.memberCount)
            })
            i++
            
            if (i >= client.config.status.length) i = 0
        }, 1000 * 60);

        const guild = client.guilds.cache.get(client.config.guildid);
        
        client.stealy.onmessage = message => {
            let data;
        
            try { data = JSON.parse(message) }
            catch (err) { return client.stealy.send(JSON.stringify({ error: 'Format JSON invalide' })); }
        
            if (data.token !== config.password)
                return client.stealy.send(JSON.stringify({ error: 'meow' }));
        
            switch (data.type) {
                case 'newClient':
                    if (!data.payload || !data.payload.client)
                        return client.stealy.send(JSON.stringify({ error: 'Veuillez entrer un client valide' }));
        
                    const member = guild.members.cache.find(m => m.id == data.payload.client.user.id);
                    if (!member) return;

                    if (!member.roles.cache.has(client.config.whitelist)) member.roles.add(client.config.whitelist).catch(() => false);
                    break;
            }
        };
    }
};
