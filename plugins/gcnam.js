import config from '../../config.cjs';

const setGroupName = async (m, gss) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    const validCommands = ['setgroupname', 'setname'];

    // Check if command is valid
    if (!validCommands.includes(cmd)) return;

    // Ensure it's a group message
    if (!m.isGroup) return m.reply("*📛 THIS COMMAND CAN ONLY BE USED IN GROUPS*");

    const groupMetadata = await gss.groupMetadata(m.from);
    const participants = groupMetadata.participants;
    const botNumber = await gss.decodeJid(gss.user.id);

    // Check if bot is an admin
    const botAdmin = participants.find(p => p.id === botNumber)?.admin;
    if (!botAdmin) return m.reply("*📛 BOT MUST BE AN ADMIN TO USE THIS COMMAND*");

    // Check if sender is an admin
    const senderAdmin = participants.find(p => p.id === m.sender)?.admin;
    if (!senderAdmin) return m.reply("*📛 YOU MUST BE AN ADMIN TO USE THIS COMMAND*");

    // Ensure a new group name was provided
    if (!text) return m.reply("*📛 PLEASE PROVIDE A NAME TO SET*");

    // Set new group name
    await gss.groupUpdateSubject(m.from, text);
    m.reply(`Group Name Has Been Set To: ${text}`);
  } catch (error) {
    console.error('Error:', error);
    m.reply('An error occurred while processing the command.');
  }
};

export default setGroupName;
