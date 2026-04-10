let { Client,Events,GatewayIntentBits } = require('discord.js')
let client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildModeration,
      ],
})
const dotenv = require('dotenv')
dotenv.config()
client.on(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}!`)
})
client.login(process.env.Bot_Token)