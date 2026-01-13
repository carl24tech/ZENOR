import config from "../../config.cjs";

const groupInfo = async (message, sock) => {
    const prefix = config.PREFIX;
    const command = message.body.startsWith(prefix)
        ? message.body.slice(prefix.length).split(" ")[0].toLowerCase()
        : "";

    if (command !== "groupinfo") return;

    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith("@g.us");
    if (!isGroup) return message.reply("❌ *This command only works in group chats!*");

    try {
        const metadata = await sock.groupMetadata(chatId);
        const admins = metadata.participants.filter(p => p.admin);
        const creator = metadata.owner ? `@${metadata.owner.split("@")[0]}` : "Unknown";
        const description = metadata.desc ? metadata.desc : "No description set.";

        let infoText = `╭───❍「 *Group Information* 」\n`;
        infoText += `│ 📛 *Name:* ${metadata.subject}\n`;
        infoText += `│ 🆔 *Group ID:* ${metadata.id}\n`;
        infoText += `│ 👤 *Members:* ${metadata.participants.length}\n`;
        infoText += `│ 🛡️ *Admins:* ${admins.length}\n`;
        infoText += `│ 👑 *Created by:* ${creator}\n`;
        infoText += `│ 📆 *Created on:* ${new Date(metadata.creation * 1000).toLocaleString()}\n`;
        infoText += `╰───────────❍\n\n`;
        infoText += `📜 *Description:* \n_${description}_`;

        await sock.sendMessage(chatId, { text: infoText }, { quoted: message });

    } catch (error) {
        console.error("Group Info Error:", error);
        return message.reply("❌ *Failed to fetch group info. Try again!*");
    }
};

export default groupInfo;
