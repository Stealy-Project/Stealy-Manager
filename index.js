const fs = require('node:fs');
const WebSocket = require('ws');
const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const client = new Client({ intents: Object.keys(GatewayIntentBits), partials: [Partials.Channel, Partials.Message] });

client.emoji = require('./emojis.json');
client.config = require('./config.json');
client.login(client.config.manager);
client.commands = new Collection();

client.stealy = new WebSocket(client.config.api);
client.stealy.onopen = () => console.log('> websocket de Stealy connecté');
client.stealy.onerror = () => console.error('> erreur webSocket');
client.stealy.onclose = () => console.log('> websocket de Stealy fermé');

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

fs.readdirSync('./commands').forEach(dirs => {
    const commands = fs.readdirSync(`./commands/${dirs}/`).filter(files => files.endsWith(".js"));

    for (const file of commands) {
        const getFileName = require(`./commands/${dirs}/${file}`);
        client.commands.set(getFileName.name, getFileName);
        console.log(`> commande charger ${getFileName.name} [${dirs}]`)
    }
})


fs.readdirSync('./events').forEach(dirs => {
    const events = fs.readdirSync(`./events/${dirs}`).filter(files => files.endsWith(".js"));

    for (const event of events) {
        const evt = require(`./events/${dirs}/${event}`);
        client[evt.ws ? "ws.on" : evt.once ? "once" : "on"](evt.name, (...args) => evt.run(...args, client))
        console.log(`> event charger ${evt.name}`)
    }
})


async function errorHandler(error) {
    const errors = [ 0, 400, 10062, 10008, 50035, 40032, 50013,4002]
    if (errors.includes(error.code)) return;

    console.error(error)
};

process.on("unhandledRejection", errorHandler);
process.on("uncaughtException", errorHandler);
process.on('warning', () => false);