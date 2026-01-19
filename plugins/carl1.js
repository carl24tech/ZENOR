import moment from 'moment-timezone'
import config from '../../config.cjs'

const alive = async (m, sock) => {
  try {
    if (!m?.message) return
    if (m.key?.fromMe) return

    const prefix = config.PREFIX || '.'
    const mode = config.MODE || 'public'

    // ✅ FULL message text extractor (latest WhatsApp)
    const body =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      m.message.imageMessage?.caption ||
      m.message.videoMessage?.caption ||
      ''

    if (!body.startsWith(prefix)) return

    const args = body.slice(prefix.length).trim().split(/\s+/)
    const cmd = args.shift()?.toLowerCase()

    if (cmd !== 'menu') return

    const pushName = m.pushName || 'User'

    /* ───── UPTIME ───── */
    const uptime = process.uptime()
    const days = Math.floor(uptime / 86400)
    const hours = Math.floor((uptime % 86400) / 3600)
    const minutes = Math.floor((uptime % 3600) / 60)
    const seconds = Math.floor(uptime % 60)

    /* ───── TIME ───── */
    const hour = moment().tz('Africa/Nairobi').hour()

    const pushwish =
      hour < 5 ? 'Good Night 🌌' :
      hour < 12 ? 'Good Morning 🌄' :
      hour < 15 ? 'Good Afternoon 🌅' :
      hour < 18 ? 'Good Evening 🌃' :
      'Good Night 🌌'

    const menuText = `
${pushwish} *${pushName}*

╭───────────────
│ ◦ Prefix: ${prefix}
│ ◦ Mode: ${mode}
│ ◦ Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s
╰───────────────

> Powered by carl24tech
`

    await sock.sendMessage(
      m.key.remoteJid,
      {
        image: { url: 'https://files.catbox.moe/ptr27z.jpg' },
        caption: menuText
      },
      { quoted: m }
    )

    // ✅ Safe reaction (latest format)
    await sock.sendMessage(m.key.remoteJid, {
      react: {
        text: '🔮',
        key: m.key
      }
    })

  } catch (err) {
    console.error('Menu command error:', err)
    await sock.sendMessage(
      m.key.remoteJid,
      { text: '❌ Failed to display menu.' },
      { quoted: m }
    )
  }
}

export default alive
