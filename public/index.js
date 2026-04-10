let express = require('express')
const dotenv = require('dotenv')
const pm2 = require('pm2')
const cookieParser = require('cookie-parser')
const crypto = require('crypto')
dotenv.config()
let app = express()
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
let port = process.env.Port || 3000
const OTP = Math.random().toString(36).slice(2, 8).toUpperCase()
const SESSION_TOKEN = crypto.randomBytes(32).toString('hex')
console.log(`\n🔑  Panel password: ${OTP}\n`)

function requireAuth(req, res, next) {
    if (req.cookies?.session === SESSION_TOKEN) return next()
    res.redirect('/')
}

app.get('/', (req, res) => {
    if (req.cookies?.session === SESSION_TOKEN) return res.redirect('/panel')
        res.sendFile(__dirname + '/public/index.html')
})

app.post('/auth', (req, res) => {
    if (req.body.otp === OTP) {
        res.cookie('session', SESSION_TOKEN, { httpOnly: true, sameSite: 'strict' })
        return res.redirect('/panel')
    }
    res.redirect('/?error=1')
})

app.get('/panel', requireAuth, (req, res) => {
    res.sendFile(__dirname + '/public/panel.html')
})

app.get('/api/status',(req,res)=>{
    pm2.connect((err) => {
        if (err) return res.status(500).send(err.message)
        const describe = (attempt) => {
            pm2.describe('bot', (err, list) => {
                if (err) { pm2.disconnect(); return res.status(500).send(err.message) }
                if (!list.length) { pm2.disconnect(); return res.status(404).send('Process not found') }
                const p = list[0]
                if (attempt < 3 && p.pm2_env.status === 'online' && p.monit.memory === 0) {
                    return setTimeout(() => describe(attempt + 1), 500)
                }
                pm2.disconnect()
                res.send({
                    status: p.pm2_env.status,
                    uptime: p.pm2_env.pm_uptime,
                    memory: p.monit.memory,
                    cpu: p.monit.cpu,
                })
            })
        }
        describe(0)
    })
})

app.post('/api/start',(req,res)=>{
    pm2.connect((err) => {
        if (err) return res.status(500).send(err.message)
        pm2.start('./bot/bot.js', (err) => {
            pm2.disconnect()
            if (err) return res.status(500).send(err.message)
            res.send('Bot Started')
        })
    })
})

app.post('/api/restart',(req,res)=>{
    pm2.connect((err) => {
        if (err) return res.status(500).send(err.message)
        pm2.reload('bot', (err) => {
            pm2.disconnect()
            if (err) return res.status(500).send(err.message)
            res.send('Bot Restarted')
        })
    })
})
app.post('/api/stop',(req,res)=>{
    pm2.connect((err) => {
        if (err) return res.status(500).send(err.message)
        pm2.stop('./bot/bot.js', (err) => {
            pm2.disconnect()
            if (err) return res.status(500).send(err.message)
            res.send('Bot Stopped')
        })
    })
})

app.get('/api/logs',(_, res)=>{
    pm2.connect((err) => {
        if (err) return res.status(500).send(err.message)
        pm2.describe('bot', (err, list) => {
            pm2.disconnect()
            if (err) return res.status(500).send(err.message)
            if (!list.length) return res.status(404).send('Process not found')
            const logPath = list[0].pm2_env.pm_out_log_path
            require('fs').readFile(logPath, 'utf8', (err, data) => {
                if (err) return res.status(500).send(err.message)
                const lines = data.trim().split('\n').slice(-50)
                res.json({ logs: lines })
            })
        })
    })
})

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})

