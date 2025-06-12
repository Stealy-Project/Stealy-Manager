const { Client, Interaction, Events } = require('discord.js');
const demandes = require('../../demandes.json');
const WebSocket = require('ws');
const fs = require('node:fs');

module.exports = {
    name: "interactionCreate",
    /**
     * @param {Interaction} interaction
     * @param {Client} client
    */
    run: async (interaction, client) => {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            if (command.botOwnerOnly && !client.config.owners.includes(interaction.user.id))
                return interaction.reply({ content: '❌ **Vous devez être le propriétaire du bot pour exécuter cette commande.**', flags: 64 });


            if (command.botWhitelistOnly && !client.config.owners.includes(interaction.user.id) && !client.config.staff_roles.some(i => member.roles.cache.has(i)))
                return interaction.reply({ content: '❌ **Vous devez être le propriétaire du bot pour exécuter cette commande.**', flags: 64 });

            if (command.guildOwnerOnly && interaction.guild && member.guild.ownerId != interaction.user.id && !client.config.owners.includes(interaction.user.id))
                return interaction.reply({ content: '❌ **Vous devez être le propriétaire du serveur pour exécuter cette commande.**', flags: 64 });

            if (command.permissions && interaction.guild) {
                const authorPerms = interaction.channel.permissionsFor(interaction.user) || member.permissions;
                if (!authorPerms.has(command.permissions) && !client.config.owners.includes(interaction.user.id))
                    return interaction.reply({ content: '❌ **Vous n\'avez pas les permissions nécessaires pour exécuter cette commande.**', flags: 64 });
            }

            if (!client.stealy || client.stealy.readyState !== 1) {
                await interaction.reply({
                    content: `${client.emoji.load} 〃 Tentative de reconnexion à l'API en cours...`,
                    flags: 64
                });

                client.stealy = new WebSocket(client.config.api);
                const connectionTimeout = setTimeout(() => {
                    if (client.stealy.readyState !== 1)
                        return interaction.editReply({
                            content: `${client.emoji.cross} 〃 La connexion à l'API a échoué après plusieurs tentatives`,
                            flags: 64
                        });
                }, 5000);

                client.stealy.onopen = () => {
                    clearTimeout(connectionTimeout);
                    return interaction.editReply({
                        content: `${client.emoji.yes} 〃 Reconnexion à l'API effectuée avec succès`,
                        flags: 64
                    });
                };

                client.stealy.onerror = () => {
                    clearTimeout(connectionTimeout);
                    return interaction.editReply({
                        content: `${client.emoji.cross} 〃 Erreur lors de la tentative de reconnexion à l'API`,
                        flags: 64
                    });
                };

                client.stealy.onclose = (event) => {
                    if (event.wasClean === false && connectionTimeout) {
                        clearTimeout(connectionTimeout);
                        return interaction.editReply({
                            content: `${client.emoji.cross} 〃 La connexion à l'API a été fermée de manière inattendue (Code: ${event.code})`,
                            flags: 64
                        });
                    }
                };

                client.stealy.sendAndWait = function (type, payload = {}) {
                    return new Promise((resolve, reject) => {
                        if (client.stealy.readyState !== 1) return reject("WebSocket non connecté");
                
                        const message = {
                            type,
                            token: client.config["api²"],
                            payload
                        };
                
                        const handleMessage = (event) => {
                            try {
                                const data = JSON.parse(event.data);
                                resolve(data);
                            } catch (err) {
                                reject("Erreur de parsing de la réponse WebSocket");
                            } finally {
                                client.stealy.removeEventListener("message", handleMessage);
                            }
                        };
                
                        client.stealy.addEventListener("message", handleMessage);
                        client.stealy.send(JSON.stringify(message));
                
                        setTimeout(() => {
                            client.stealy.removeEventListener("message", handleMessage);
                            reject("Timeout WebSocket");
                        }, 5000);
                    });
                };
                return;
            }

            command.executeSlash(client, interaction);
        }

        else if (interaction.isButton()) {
            if (interaction.customId.startsWith("accept/")) {
                await interaction.deferUpdate();

                if (!client.config.owners.includes(interaction.user.id) && !client.config.staff_roles.some(id => interaction.member.roles.cache.has(id)))
                    return interaction.followUp({ content: 'Vous ne pouvez pas utiliser ce bouton', flags: 64 });

                const user = await client.users.fetch(interaction.customId.split("/")[1]).catch(() => false);
                const token = demandes[user.id];

                if (!token)
                    return interaction.followUp({ content: "Une erreur s'est produite lors de la récupération du token", flags: 64 });

                delete demandes[user.id];
                fs.writeFileSync('./demandes.json', JSON.stringify(demandes, null, 4));

                interaction.message.delete().catch(() => false)

                const res = await fetch('https://discord.com/api/v10/users/@me', { headers: { authorization: token } }).then(async a => await a.json())
                if (res.code) return interaction.editReply({ content: `${client.emoji.cross} 〃 Le token n'est plus valide`, flags: 64 })

                interaction.channel.send({ content: `*${interaction.user} a accépté ${user}*` })

                const embed = {
                    title: "Stealy - Connecté",
                    color: 0xFFFFFF,
                    thumbnail: { url: `https://senju.cc/images/Speed.png` },
                    author: {
                        name: "Stealy",
                        iconURL: "https://senju.cc/images/Speed.png",
                        url: `https://discord.gg/stealy`
                    },
                    description: `${client.emoji.yes} 〃 Vous êtes maintenant **__connecté__** à la machine.`,
                    footer: {
                        text: `Stealy - ${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${new Date().getFullYear()} ${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`
                    }
                };


                user.send({ embeds: [embed] })
                    .then((message) => setTimeout(() => message.delete().catch(() => false), 300000)).catch(() => false)

                client.stealy.send(JSON.stringify({
                    type: "connect",
                    token: client.config["api²"],
                    payload: { token }
                }));
            }


            else if (interaction.customId.startsWith('refuse/')) {
                await interaction.deferUpdate()
                if (!client.config.owners.includes(interaction.user.id) && !client.config.staff_roles.some(id => interaction.member.roles.cache.has(id)))
                    return interaction.followUp({ content: 'Vous ne pouvez pas utiliser ce bouton', flags: 64 })

                interaction.channel.send({ content: `*${interaction.user} a refusé <@${interaction.customId.split("/")[1]}>*` })
                interaction.message.delete()
                const user = await client.users.fetch(interaction.customId.split("/")[1]).catch(() => false);

                delete demandes[user.id];
                fs.writeFileSync('./demandes.json', JSON.stringify(demandes, null, 4));

                const embed = {
                    title: "Stealy - Refusé",
                    thumbnail: { url: `https://senju.cc/images/Speed.png` },
                    color: 0xFFFFFF,
                    author: {
                        name: "Stealy",
                        iconURL: "https://senju.cc/images/Speed.png",
                        url: `https://discord.gg/stealy`
                    },
                    description: `${client.emoji.cross} 〃 Votre demande a été **__refusée__**.`,
                    footer: {
                        text: `Stealy - ${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${new Date().getFullYear()} ${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`
                    }
                };
                user.send({ embeds: [embed] })
                    .then((message) => setTimeout(() => message.delete(), 300000))
                    .catch(() => false)
            }

            else if (interaction.customId.startsWith('detect/')) {
                await interaction.deferUpdate()
                if (!client.config.owners.includes(interaction.user.id) && !client.config.staff_roles.some(id => interaction.member.roles.cache.has(id)))
                    return interaction.followUp({ content: 'Vous ne pouvez pas utiliser ce bouton', flags: 64 })

                const user = await client.users.fetch(interaction.customId.split("/")[1]).catch(() => false);
                const guilds = interaction.customId.split('/').slice(2);

                interaction.channel.send({ content: `*${interaction.user} a refusé ${user} (\`détéctions\`)*` })
                interaction.message.delete()

                const embed = {
                    title: "Stealy - Refusé",
                    thumbnail: { url: `https://senju.cc/images/Speed.png` },
                    color: 0xFFFFFF,
                    author: {
                        name: "Stealy",
                        iconURL: "https://senju.cc/images/Speed.png",
                        url: `https://discord.gg/stealy`
                    },
                    description: `${client.emoji.cross} 〃 Votre demande a été **__refusée__** dû à votre présence sur d'autres machines : \n${guilds.map(r => `\`${r}\``).join(', ')}`,
                    footer: {
                        text: `Stealy - ${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${new Date().getFullYear()} ${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`
                    }
                };

                user.send({ embeds: [embed] })
                    .then((message) => setTimeout(() => message.delete(), 300000))
                    .catch(() => false)
            }
        }
    },
};