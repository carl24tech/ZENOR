import config from '../../config.cjs';

const setDescription = async (m, gss) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    const validCommands = ['setdescription', 'setdesc', 'setgroupbio'];

    // Ensure command is valid
    if (!validCommands.includes(cmd)) return;

    // Check if the message is from a group
    if (!m.isGroup) {
      m.reply("*📛 THIS COMMAND CAN ONLY BE USED IN GROUPS*");
      return;
    }

    // Get group metadata and participants
    const groupMetadata = await gss.groupMetadata(m.from);
    const participants = groupMetadata.participants;
    const botNumber = await gss.decodeJid(gss.user.id);

    // Check if bot is an admin
    const botAdmin = participants.find(p => p.id === botNumber)?.admin;
    if (!botAdmin) {
      m.reply("*📛 BOT MUST BE AN ADMIN TO USE THIS COMMAND*");
      return;
    }

    // Check if sender is an admin
    const senderAdmin = participants.find(p => p.id === m.sender)?.admin;
    if (!senderAdmin) {
      m.reply("*📛 YOU MUST BE AN ADMIN TO USE THIS COMMAND*");
      return;
    }

    // Ensure a new description was provided
    if (!text) {
      m.reply("*📛 PLEASE PROVIDE A DESCRIPTION TO SET*");
      return;
    }

    // Set new group description
    await gss.groupUpdateDescription(m.from, text);
    m.reply(`Group Description Has Been Set To: ${text}`);
  } catch (error) {
    console.error('Error setting group description:', error);
    m.reply('An error occurred while processing the command.');
  }
};

export default setDescription;
