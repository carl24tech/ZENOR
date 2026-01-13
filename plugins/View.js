import pkg from '@whiskeysockets/baileys';
const { downloadMediaMessage } = pkg;
import config from '../config.cjs';

const OwnerCmd = async (m, Matrix) => {
  const botNumber = Matrix.user.id.split(':')[0] + '@s.whatsapp.net';
  const ownerNumber = config.OWNER_NUMBER + '@s.whatsapp.net';

  // Command triggers when user sends the exact word "view"
  if (m.body.trim().toLowerCase() !== 'view') return;
  
  if (!m.quoted) return m.reply('*Reply to a View Once message!*');

  let msg = m.quoted.message;
  if (msg.viewOnceMessageV2) msg = msg.viewOnceMessageV2.message;
  else if (msg.viewOnceMessage) msg = msg.viewOnceMessage.message;

  if (!msg) return m.reply('*This is not a View Once message!*');

  // Restrict command to Owner/Bot only
  const isOwner = m.sender === ownerNumber;
  const isBot = m.sender === botNumber;
  if (!isOwner && !isBot) {
    return m.reply('*Only the owner can use this command!*');
  }

  try {
    const messageType = Object.keys(msg)[0];
    let buffer;
    
    if (messageType === 'audioMessage') {
      buffer = await downloadMediaMessage(m.quoted, 'buffer', {}, { type: 'audio' });
    } else {
      buffer = await downloadMediaMessage(m.quoted, 'buffer');
    }

    if (!buffer) return m.reply('*Failed to retrieve media!*');

    let mimetype = msg.audioMessage?.mimetype || 'audio/ogg';
    let caption = `> *Bot by Carl*`;

    if (messageType === 'imageMessage') {
      await Matrix.sendMessage(m.from, { image: buffer, caption });
    } else if (messageType === 'videoMessage') {
      await Matrix.sendMessage(m.from, { video: buffer, caption, mimetype: 'video/mp4' });
    } else if (messageType === 'audioMessage') {  
      await Matrix.sendMessage(m.from, { audio: buffer, mimetype, ptt: true });
    } else {
      return m.reply('*Unsupported media type!*');
    }

  } catch (error) {
    console.error(error);
    await m.reply('*Failed to process View Once message!*');
  }
};

// Coded by JawadTechX 
export default OwnerCmd;
