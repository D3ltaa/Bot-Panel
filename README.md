# BotPanel

A web-based control panel for managing a Discord bot process via [PM2](https://pm2.keymetrics.io/). Monitor status, start/stop the bot, and view logs — all from a browser dashboard.

## Features

- View bot status, uptime, memory, and CPU usage
- Start and stop the bot remotely
- View the last 50 lines of bot logs
- Simple web UI served with Express

## Tech Stack

- **Runtime:** Node.js
- **Web framework:** Express
- **Process manager:** PM2
- **Bot library:** discord.js v14
- **Config:** dotenv

## Project Structure

```
BotPanel/
├── index.js          # Express server + PM2 API routes
├── bot/
│   └── bot.js        # Discord bot (managed by PM2 as "bot")
├── public/
│   ├── panel.html    # Dashboard UI
│   ├── panel2.html
│   └── style.css
└── .env              # Environment variables (not committed)
```

## Setup

### Prerequisites

- Node.js
- PM2 installed globally: `npm install -g pm2`

### Install dependencies

```bash
npm install
```

### Configure environment

Create a `.env` file in the root:

```env
Bot_Token=your_discord_bot_token
Port=3000
```

### Start the bot with PM2

```bash
pm2 start bot/bot.js --name bot
```

### Start the panel server

```bash
node index.js
```

Then open `http://localhost:3000/panel` in your browser.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/status` | Get bot process status, uptime, memory, CPU |
| POST | `/api/start` | Start the bot |
| POST | `/api/stop` | Stop the bot |
| GET | `/api/logs` | Get last 50 lines of bot logs |

## License

ISC
