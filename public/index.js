const logBox = $('.logs-display')[0]
const startBtn = $('#start-btn')
const stopBtn = $('#stop-btn')
const restartBtn = $('#restart-btn')
const memoryDisplay = $('#memoryDisplay')
const cpuDisplay = $('#cpuDisplay')
const uptimeDisplay = $('#uptimeDisplay')
const statusDisplay = $('#statusDisplay')
startBtn.click(() => { callApi('/api/start') })
stopBtn.click(() => callApi('/api/stop'))
restartBtn.click(() => callApi('/api/restart'))

$(document).ready(async () => {
    await fetchLogs()
    await fetchStatus()
    setInterval(fetchStatus, 30000)
    setInterval(fetchLogs, 30000)
})

async function fetchLogs() {
    try {
        const res = await fetch('/api/logs')
        if (!res.ok) { logBox.textContent = 'Error: ' + await res.text(); return }
        const { logs } = await res.json()
        const atBottom = logBox.scrollHeight - logBox.scrollTop <= logBox.clientHeight + 20
        logBox.innerHTML = logs.map(l => `<div>${l.replace(/</g, '&lt;')}</div>`).join('')
        if (atBottom) logBox.scrollTop = logBox.scrollHeight
    } catch (e) {
        logBox.textContent = 'Failed: ' + e.message
    }
}


async function callApi(url, method = 'POST') {
    try {
        const res = await fetch(url, { method })
        const text = await res.text()
        toast(text, res.ok ? 'success' : 'error')
        if (res.ok) {
            fetchLogs()
            setTimeout(fetchStatus, 1000)
        }
    } catch (e) {
        toast('Request failed: ' + e.message, 'error')
    }
}

async function fetchStatus() {
    try {
        const res = await fetch('/api/status')
        if (!res.ok) { applyStatus(null); return }
        const data = await res.json()
        applyStatus(data)
    } catch { applyStatus(null) }
}

async function applyStatus(data) {
    statusDisplay.text(data ? data.status : '—')
    uptimeDisplay.text(formatUptime(data?.uptime))
    memoryDisplay.text(formatMemory(data?.memory))
    cpuDisplay.text(data ? data.cpu.toFixed(1) + ' %' : '—')
}


function formatUptime(ms) {
    if (!ms) return '—'
    const s = Math.floor((Date.now() - ms) / 1000)
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
    return h ? `${h}h ${m}m` : m ? `${m}m ${sec}s` : `${sec}s`
}

function toast(message, type = 'success') {
    const t = document.createElement('div')
    t.className = `toast toast-${type}`
    t.innerHTML = `<iconify-icon icon="${type === 'success' ? 'mdi:check-circle' : 'mdi:alert-circle'}"></iconify-icon><span>${message}</span>`
    document.getElementById('toast-container').appendChild(t)
    requestAnimationFrame(() => t.classList.add('toast-show'))
    setTimeout(() => {
        t.classList.remove('toast-show')
        t.addEventListener('transitionend', () => t.remove())
    }, 3000)
}

function formatMemory(bytes) {
    if (bytes == null) return '—'
    if (bytes === 0) return '0 MB'
    return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}