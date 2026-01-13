import config from '../../config.cjs';

const PREFIX = config.PREFIX;

const jidCommand = async (message, client) => {
  const command = message.body.startsWith(PREFIX)
    ? message.body.slice(PREFIX.length).split(" ")[0].toLowerCase()
    : '';

  // Define the supported command
  const supportedCommands = ["jid"];

  if (supportedCommands.includes(command)) {
    // Check if we're in a group chat or a personal chat
    if (message.chatId && message.chatId.includes('@g.us')) {
      // If it's a group, return the group JID
      const groupJid = message.chatId;  // Group JID format (e.g., groupid@g.us)
      return client.sendMessage(message.from, {
        text: `${groupJid}`
      });
    } else {
      // If it's a personal chat, return the personal JID
      const personalJid = `${message.from}@s.whatsapp.net`;  // Personal JID format (e.g., +923253617422@s.whatsapp.net)
      return client.sendMessage(message.from, {
        text: `${personalJid}`
      });
    }
  }
};

export default jidCommand;
