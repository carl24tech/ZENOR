import { writeFile, unlink } from 'fs/promises';
import config from '../../config.cjs';

const setProfilePictureGroup = async (m, gss) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  
  const validCommands = ['setppfullgroup', 'setfullprofilepicgc', 'fullppgc'];

  if (validCommands.includes(cmd)) {
    if (!m.isGroup) return m.reply("*📛 THIS COMMAND CAN ONLY BE USED IN GROUPS*");

    const groupMetadata = await gss.groupMetadata(m.from);
    const participants = groupMetadata.participants;
    const botNumber = await gss.decodeJid(gss.user.id);
    const botAdmin = participants.find(p => p.id === botNumber)?.admin;
    const senderAdmin = participants.find(p => p.id === m.sender)?.admin;

    // Check if both bot and user are admins
    if (!botAdmin) return m.reply("*📛 BOT MUST BE AN ADMIN TO USE THIS COMMAND*");
    if (!senderAdmin) return m.reply("*📛 YOU MUST BE AN ADMIN TO USE THIS COMMAND*");

    // Check if the message has a quoted image
    if (!m.quoted || m.quoted.mtype !== 'imageMessage') {
      return m.reply(`Please reply to an image to set the group profile picture using: ${prefix + cmd}`);
    }

    try {
      // Download the quoted image
      const media = await m.quoted.download();
      if (!media) return m.reply('Failed to download the media. Please try again.');

      const filePath = `./${Date.now()}.png`;
      
      // Save the image temporarily
      await writeFile(filePath, media);

      // Update group profile picture using the original image
      await gss.query({
        tag: 'iq',
        attrs: {
          to: m.from,
          type: 'set',
          xmlns: 'w:profile:picture'
        },
        content: [{
          tag: 'picture',
          attrs: { type: 'image' },
          content: media
        }]
      });

      m.reply('✅ Group profile picture updated successfully.');
    } catch (error) {
      console.error('Error setting profile picture:', error);
      m.reply('❌ Error setting profile picture. Please try again later.');
    } finally {
      // Clean up the temporary image file
      try {
        await unlink(filePath);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
  }
};

export default setProfilePictureGroup;
