import moment from 'moment-timezone';
import config from '../../config.cjs';

const alive = async (m, sock) => {
  try {
    // Basic safety guards
    if (!m || !m.message) return;
    if (m.key?.fromMe) return;

    const prefix = config.PREFIX;
    const mode = config.MODE || 'public';

    // Safely extract text
    const body =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      '';

    if (!body.startsWith(prefix)) return;

    const args = body.slice(prefix.length).trim().split(/\s+/);
    const cmd = args.shift()?.toLowerCase();

    if (cmd !== 'menu') return;

    const pushName =
      m.pushName ||
      m.sender?.verifiedName ||
      'User';

    /* ───── UPTIME ───── */
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    /* ───── TIME ───── */
    const time = moment().tz('Asia/Karachi');
    const hour = time.hour();

    let pushwish =
      hour < 5 ? 'Good Night 🌌' :
      hour < 12 ? 'Good Morning 🌄' :
      hour < 15 ? 'Good Afternoon 🌅' :
      hour < 18 ? 'Good Evening 🌃' :
      'Good Night 🌌';

    const aliveMessage = `
${pushwish} ${pushName}
╭┈───────────────•
│ ◦ Prefix: ${prefix}
│ ◦ Mode: ${mode}
│ ◦ Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s
╰┈───────────────•

> Powered by carl
`;

    const menuImage = {
      url: 'https://files.catbox.moe/ptr27z.jpg'
    };

    await sock.sendMessage(
      m.key.remoteJid,
      {
        image: menuImage,
        caption: aliveMessage,
        contextInfo: {
          externalAdReply: {
            title: 'carl william',
            body: `Prefix: ${prefix} | Mode: ${mode}`,
            thumbnailUrl: menuImage.url,
            sourceUrl: 'https://whatsapp.com/channel/0029VbC0ab9DjiOZMtRROs0p',
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      },
      { quoted: m }
    );

    // ✅ Safe reaction
    await sock.sendMessage(m.key.remoteJid, {
      react: { text: '🔮', key: m.key }
    });

  } catch (err) {
    console.error('Menu command error:', err);

    try {
      await sock.sendMessage(
        m.key.remoteJid,
        { text: '❌ Error displaying menu.' },
        { quoted: m }
      );
    } catch {}
  }
};

export default alive;
