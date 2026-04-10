let express =require('express')
const dotenv = require('dotenv')
const pm2 = require('pm2')
dotenv.config()
let app = express()


app.get('/',(req,res)=>{
    res.send('Hello World')
})

app.get('/panel',(req,res)=>{
    res.sendFile(__dirname+'/panel.html')
})

app.get('/api/status',(req,res)=>{
    pm2.connect((err) => {
        if (err) return res.status(500).send(err.message)
        pm2.describe('bot', (err, processDescriptionList) => {
            pm2.disconnect()
            if (err) return res.status(500).send(err.message)
            if (!processDescriptionList.length) return res.status(404).send('Process not found')
            const p = processDescriptionList[0]
            res.send({
                status: p.pm2_env.status,
                uptime: p.pm2_env.pm_uptime,
                memory: p.monit.memory,
                cpu: p.monit.cpu,
            })
        })
    })
})

app.post('/api/start',(req,res)=>{
    pm2.connect((err) => {
        if (err) return res.status(500).send(err.message)
        pm2.start('bot', (err) => {
            pm2.disconnect()
            if (err) return res.status(500).send(err.message)
            res.send('Bot Started')
        })
    })
})

app.post('/api/stop',(req,res)=>{
    pm2.connect((err) => {
        if (err) return res.status(500).send(err.message)
        pm2.stop('bot', (err) => {
            pm2.disconnect()
            if (err) return res.status(500).send(err.message)
            res.send('Bot Stopped')
        })
    })
})

app.get('/api/logs',(_req,res)=>{
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

app.listen(process.env.Port,()=>{
    console.log(`Server is running on port ${process.env.Port}`)
})

