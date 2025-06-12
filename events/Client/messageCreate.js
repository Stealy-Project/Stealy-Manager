const { Message, Client, Events } = require("discord.js");
const dataD = require('../../demandes.json');
const fs = require('node:fs');
const WebSocket = require('ws');
const demandes = {};

module.exports = {
    name: Events.MessageCreate,
    once: false,
    /**
     * @param {Message} message
     * @param {Client} client
    */
    run: async (message, client) => {
        if (message.author.bot) return;

        if (message.channel.isDMBased()) {
            const member = await client.guilds.cache.get(client.config.guildid)?.members.fetch(message.author.id).catch(() => false)
            if (!member) return;

            await member.fetch()
            if (!member.roles.cache.has(client.config.whitelist)) return;

            const res = await fetch('https://discord.com/api/v10/users/@me', { headers: { authorization: message.content.replaceAll('"', '') } }).catch(() => false);
            const data = await res.json().catch(() => false);


            const embed = {
                color: 0xFFFFFF,
                title: 'Stealy - Invalide',
                thumbnail: { url: `https://senju.cc/images/Speed.png` },
                author: { name: data.username, iconURL: `https://senju.cc/images/Speed.png`, url: `https://discord.gg/stealy` },
                description: `${client.emoji.cross} 〃 Le **__token__** que vous avez envoyé n'est pas valide.`,
                footer: {
                    text: `Stealy - ${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${new Date().getFullYear()} ${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
                }
            }

            const connected = {
                color: 0xFFFFFF,
                title: 'Stealy - Erreur',
                thumbnail: { url: `https://senju.cc/images/Speed.png` },
                author: { name: data.username, iconURL: `https://senju.cc/images/Speed.png`, url: `https://discord.gg/stealy` },
                description: `${client.emoji.cross} 〃 Vous êtes **__déjà__** **__connecté__** à notre **__machine__**`,
                footer: {
                    text: `Stealy - ${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${new Date().getFullYear()} ${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
                }
            }

            if (res.status !== 200) return message.channel.send({ embeds: [embed] });
            if (data.id !== message.author.id) return;

            const { clients } = await client.stealy.sendAndWait("getClients")

            if (clients.find(c => c?.user?.id === Buffer.from(message.content.split('.')[0], 'base64').toString('utf-8')))
                return message.channel.send({ embeds: [connected] })

            const guilds = await fetch('https://discord.com/api/v10/users/@me/guilds', { headers: { authorization: message.content.replaceAll('"', '') } }).then(r => r.json())
            const { sbl } = await client.stealy.sendAndWait("sbl")
            const selfbots = sbl.servs.filter(o => guilds.some(g => g.id == o.id))

            const channel = await client.channels.fetch(client.config.verifchannel).catch(() => false)

            const infoEmbed = {
                color: 0xFFFFFF,
                title: 'Stealy - Demande',
                thumbnail: { url: `https://senju.cc/images/Speed.png` },
                author: { name: data.username, iconURL: `https://senju.cc/images/Speed.png`, url: `https://discord.gg/stealy` },
                description: `${selfbots.length == 0 ? "" : `***Détéction*** ➜ ${selfbots.map(r => `\`${r.username}\``).join(', ') || 'Aucune'}\n`}***Pseudo d'Utilisateur*** ➜ \`${data.username}\`\n***Pseudo Globale*** ➜ \`${data.global_name || "`Aucun`"}\`\n***ID*** ➜ \`${data.id}\`\n***Clan*** ➜ \`${data.clan?.tag ?? "Aucun"}\`\n***Langue*** ➜ \`${data.locale ?? "Inconnu"}\``,
                footer: {
                    text: `Stealy - ${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${new Date().getFullYear()} ${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
                }
            }

            const validEmbed = {
                title: 'Stealy - Demande',
                color: 0xFFFFFF,
                thumbnail: { url: `https://senju.cc/images/Speed.png` },
                author: {
                    name: 'Stealy',
                    iconURL: 'https://senju.cc/images/Speed.png',
                    url: `https://discord.gg/stealy`
                },
                description: `${client.emoji.yes} 〃 Nous avons bien reçu votre **token**, une personne va bientôt vous prendre en charge.`,
                footer: {
                    text: `Stealy - ${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${new Date().getFullYear()} ${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
                }
            };

            const wrongEmbed = {
                title: 'Stealy - Erreur',
                color: 0xFFFFFF,
                thumbnail: { url: `https://senju.cc/images/Speed.png` },
                author: {
                    name: 'Stealy',
                    iconURL: 'https://senju.cc/images/Speed.png',
                    url: `https://discord.gg/stealy`
                },
                description: `${client.emoji.cross} 〃 *La **__connexion__** à stealy n'a pas pu être effectuée. *`,
                footer: {
                    text: `Stealy - ${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${new Date().getFullYear()} ${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
                }
            };

            const row = [{
                type: 1,
                id: "0",
                components: [
                    {
                        type: 2,
                        customId: `accept/${message.author.id}`,
                        style: 3,
                        disabled: false,
                        label: "Connecter"
                    },
                    {
                        type: 2,
                        customId: `refuse/${message.author.id}`,
                        style: 4,
                        disabled: false,
                        label: "Refuser"
                    }
                ]
            }]

            if (selfbots.length > 0) {
                row[0].components.push({
                    type: 2,
                    customId: `detect/${message.author.id}/${selfbots.map(r => r.username).join('/')}`,
                    style: 2,
                    disabled: false,
                    label: "Détécté"
                })
            }

            const Forceur = {
                title: 'Stealy - Patientez',
                color: 0xFFFFFF,
                thumbnail: { url: `https://senju.cc/images/Speed.png` },
                author: {
                    name: 'Stealy',
                    iconURL: 'https://senju.cc/images/Speed.png',
                    url: `https://discord.gg/stealy`
                },
                description: `${client.emoji.cross} 〃 *Votre **__ancienne__** demande est en traitement ou a été **__refusée__**.*`,
                footer: {
                    text: `Stealy - ${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${new Date().getFullYear()} ${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
                }
            };

            if (demandes[message.author.id]) return message.channel.send({ embeds: [Forceur] }).then((m) => setTimeout(() => m.delete().catch(() => false), 300000)).catch(() => false)
            demandes[message.author.id] = true
            setInterval(() => delete demandes[message.author.id], 1000 * 60 * 2);

            dataD[message.author.id] = message.content.replaceAll('"', '');
            fs.writeFileSync('./demandes.json', JSON.stringify(dataD, null, 4));

            channel.send({ embeds: [infoEmbed], components: row })
                .then(() =>
                    message.channel.send({ embeds: [validEmbed] })
                        .then((m) => setTimeout(() => m.delete().catch(() => false), 300000))
                        .catch(() => false)
                )
                .catch(() => message.channel.send({ embeds: [wrongEmbed] })
                    .then((m) => setTimeout(() => m.delete().catch(() => false), 300000))
                    .catch(() => false)
                )
        }

        else if (message.inGuild()) {
            if (!message.content.startsWith(client.config.prefixbot)) return;

            const args = message.content.slice(client.config.prefixbot.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = client.commands.get(commandName) || client.commands.find(command => command.aliases && command.aliases.includes(commandName));
            if (!command) return;

            if (command.botOwnerOnly)
                if (!client.config.owners.includes(message.author.id)) return;

            if (command.botWhitelistOnly)
                if (!client.config.owners.includes(message.author.id) && !client.config.staff_roles.some((i) => message.member.roles.cache.has(i)))
                    return interaction.reply({ content: `${client.emoji.cross} 〃 **Vous devez être le propriétaire du bot pour exécuter cette commande.**`, flags: 64 });

            if (command.guildOwnerOnly && message.guild.ownerId != message.author.id && !client.config.owners.includes(message.author.id))
                return message.reply({ content: `${client.emoji.cross} 〃 Vous devez être le propriétaire du serveur pour exécuter cette commande.` }).catch(() => false);

            if (command.permissions) {
                const authorPerms = message.channel.permissionsFor(message.author) || message.member.permissions;
                if (!authorPerms.has(command.permissions) && !client.config.owners.includes(message.author.id))
                    return message.reply({ content: `${client.emoji.cross} 〃 Vous n'avez pas les permissions nécessaires pour exécuter cette commande.` }).catch(() => false);
            }

            if (!client.stealy || client.stealy.readyState !== 1) {
                const msg = await message.channel.send(`${client.emoji.load} 〃 Tentative de reconnexion à l'API en cours...`);

                client.stealy = new WebSocket(client.config.api);
                const connectionTimeout = setTimeout(() => {
                    if (client.stealy.readyState !== 1)
                        msg.edit(`${client.emoji.cross} 〃 La connexion à l'API a échoué après plusieurs tentatives`);
                }, 5000);

                client.stealy.onopen = () => {
                    clearTimeout(connectionTimeout);
                    msg.edit(`${client.emoji.yes} 〃 Reconnexion à l'API effectuée avec succès`);
                };

                client.stealy.onerror = () => {
                    clearTimeout(connectionTimeout);
                    msg.edit(`${client.emoji.cross} 〃 Erreur lors de la tentative de reconnexion à l'API`);
                };

                client.stealy.onclose = (event) => {
                    if (event.wasClean === false && connectionTimeout) {
                        clearTimeout(connectionTimeout);
                        msg.edit(`${client.emoji.cross} 〃 La connexion à l'API a été fermée de manière inattendue (Code: ${event.code})`);
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


            command.execute(client, message, args);
        }
    },
};
