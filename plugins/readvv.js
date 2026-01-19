import pkg from '@whiskeysockets/baileys';
const { downloadMediaMessage } = pkg;
import config from '../config.cjs';

const OwnerCmd = async (m, Matrix) => {
  try {
    if (!m.body) return;

    const prefix = config.PREFIX;

    const secretKeywords = ['😍', 'wow', 'nice'];

    const args = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).trim().split(/\s+/)
      : [];

    const cmd = m.body.startsWith(prefix)
      ? args[0]?.toLowerCase()
      : secretKeywords.includes(m.body.toLowerCase())
        ? 'vv2'
        : null;

    if (!['vv', 'vv2', 'vv3'].includes(cmd)) return;
    if (!m.quoted) return m.reply('*Reply to a View Once message!*');

    const botJid = Matrix.user?.id
      ? Matrix.decodeJid(Matrix.user.id)
      : null;

    const ownerJid = config.OWNER_NUMBER.includes('@')
      ? config.OWNER_NUMBER
      : config.OWNER_NUMBER + '@s.whatsapp.net';

    const isOwner = m.sender === ownerJid;
    const isBot = m.sender === botJid;

    if (['vv2', 'vv3', 'vv'].includes(cmd) && !isOwner && !isBot) {
      return m.reply('*Only the owner can use this command!*');
    }

    // Extract view-once message safely
    let quotedMsg =
      m.quoted.message?.viewOnceMessageV2?.message ||
      m.quoted.message?.viewOnceMessageV2Extension?.message ||
      m.quoted.message?.viewOnceMessage?.message;

    if (!quotedMsg) {
      return m.reply('*This is not a View Once message!*');
    }

    const messageType = Object.keys(quotedMsg)[0];

    const buffer = await downloadMediaMessage(
      m.quoted,
      'buffer',
      {},
      {
        logger: Matrix.logger,
        reuploadRequest: Matrix.updateMediaMessage
      }
    );

    if (!buffer) return m.reply('*Failed to download media!*');

    const caption = '> *Carl24tech*';

    const recipient =
      cmd === 'vv2'
        ? botJid
        : cmd === 'vv3'
          ? ownerJid
          : m.from;

    if (messageType === 'imageMessage') {
      await Matrix.sendMessage(recipient, { image: buffer, caption });
    } else if (messageType === 'videoMessage') {
      await Matrix.sendMessage(recipient, {
        video: buffer,
        caption,
        mimetype: 'video/mp4'
      });
    } else if (messageType === 'audioMessage') {
      await Matrix.sendMessage(recipient, {
        audio: buffer,
        mimetype: quotedMsg.audioMessage.mimetype,
        ptt: true
      });
    } else {
      return m.reply('*Unsupported media type!*');
    }

  } catch (err) {
    console.error('VV CMD ERROR:', err);
    await m.reply('*Failed to process View Once message!*');
  }
};

export default OwnerCmd;
