import moment from 'moment-timezone'
import config from '../../config.cjs'

const menu = async (m, sock) => {
  try {
    // ===== HARD GUARDS =====
    if (!m) return
    if (!m.message) return
    if (m.key?.fromMe) return

    const prefix = config.PREFIX || '.'
    const mode = config.MODE || 'public'

    // ===== SAFE MESSAGE TEXT EXTRACTOR =====
    let text = ''

    if (m.message.conversation) {
      text = m.message.conversation
    } else if (m.message.extendedTextMessage?.text) {
      text = m.message.extendedTextMessage.text
    } else if (m.message.imageMessage?.caption) {
      text = m.message.imageMessage.caption
    } else if (m.message.videoMessage?.caption) {
      text = m.message.videoMessage.caption
    }

    if (!text) return
    if (!text.startsWith(prefix)) return

    const command = text.slice(prefix.length).trim().split(/\s+/)[0]?.toLowerCase()
    if (command !== 'menu') return

    const name = m.pushName || 'User'

    // ===== TIME & UPTIME =====
    const uptime = process.uptime()
    const d = Math.floor(uptime / 86400)
    const h = Math.floor((uptime % 86400) / 3600)
    const min = Math.floor((uptime % 3600) / 60)
    const s = Math.floor(uptime % 60)

    const hour = moment().tz('Africa/Nairobi').hour()

    let greeting = 'Hello 👋'
    if (hour < 12) greeting = 'Good Morning 🌄'
    else if (hour < 17) greeting = 'Good Afternoon 🌅'
    else greeting = 'Good Evening 🌃'

    // ===== MENU TEXT =====
    const menuText = `
${greeting} ${name}

╭──────────────
│ Prefix : ${prefix}
│ Mode   : ${mode}
│ Uptime : ${d}d ${h}h ${min}m ${s}s
╰──────────────

Powered by carl24tech
`

    // ===== SEND MENU (TEXT ONLY = ZERO FAILURE) =====
    await sock.sendMessage(
      m.key.remoteJid,
      { text: menuText },
      { quoted: m }
    )

  } catch (error) {
    console.error('[MENU ERROR]', error)
  }
}

export default menu
