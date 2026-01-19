import config from '../config.cjs';

const reportedMessages = new Set(); // Persist across calls

const report = async (m, gss) => {
  try {
    if (!m.body) return;

    const prefix = config.PREFIX;
    if (!m.body.startsWith(prefix)) return;

    const args = m.body.slice(prefix.length).trim().split(/\s+/);
    const cmd = args.shift()?.toLowerCase();
    const text = args.join(' ');

    const validCommands = ['bug', 'report', 'request'];
    if (!validCommands.includes(cmd)) return;

    // Decode bot JID safely
    const botJid = gss.user?.id
      ? gss.decodeJid(gss.user.id)
      : null;

    const ownerJid = config.OWNER_NUMBER?.includes('@')
      ? config.OWNER_NUMBER
      : config.OWNER_NUMBER + '@s.whatsapp.net';

    const isCreator = m.sender === ownerJid || m.sender === botJid;
    if (!isCreator) {
      return await gss.sendMessage(m.from, {
        text: '❌ *THIS IS AN OWNER COMMAND*'
      }, { quoted: m });
    }

    if (!text) {
      return await gss.sendMessage(m.from, {
        text: `Example:\n${prefix + cmd} play command is not working`
      }, { quoted: m });
    }

    const messageId = m.key?.id;
    if (!messageId) return;

    if (reportedMessages.has(messageId)) {
      return await gss.sendMessage(m.from, {
        text: '⚠️ This report has already been forwarded.'
      }, { quoted: m });
    }

    reportedMessages.add(messageId);

    const reportText =
      `🚨 *BUG / REQUEST REPORT*\n\n` +
      `👤 *User:* @${m.sender.split('@')[0]}\n` +
      `📝 *Message:* ${text}\n` +
      `📍 *Chat:* ${m.from}`;

    const devNumber = '254740271632@s.whatsapp.net';

    await gss.sendMessage(devNumber, {
      text: reportText,
      mentions: [m.sender]
    });

    await gss.sendMessage(m.from, {
      text: '✅ *Report sent successfully to Carl 🕵️*\nPlease wait for feedback.'
    }, { quoted: m });

  } catch (err) {
    console.error('REPORT CMD ERROR:', err);
    await gss.sendMessage(m.from, {
      text: '❌ An internal error occurred while sending the report.'
    }, { quoted: m });
  }
};

export default report;
