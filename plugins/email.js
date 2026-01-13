

import axios from "axios";

import config from "../../config.cjs";

const checkTempMail = async (m, gss) => {

  const prefix = config.PREFIX;

  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";

  const args = m.body.split(" ").slice(1);

  const validCommands = ["checkmail", "tempmailcheck", "checkinbox"];

  if (validCommands.includes(cmd)) {

    if (!args[0]) {

      await gss.sendMessage(

        m.from,

        {

          text: "❌ Please provide a tempmail ID to check the inbox.\n\nExample: *!checkmail <tempmail_id>*",

          contextInfo: {

            externalAdReply: {

              title: "✨ ʙᴇʀᴀ ᴛᴇᴄʜ ʙᴏᴛ ✨",

              body: "Temporary Email Inbox Service",

              sourceUrl: "",

              mediaType: 1,

            },

          },

        },

        { quoted: m }

      );

      return;

    }

    const tempmailId = args[0];

    const apiUrl = `https://bk9.fun/tools/get_inbox_tempmail?q=${tempmailId}`;

    try {

      await m.React("⏳"); // React with a loading icon

      const response = await axios.get(apiUrl);

      const data = response.data;

      if (data.status && data.BK9 && data.BK9[0]) {

        // If inbox retrieval is successful

        const inboxMessages = data.BK9[0] || [];

        let message = `📬 *Temporary Email Inbox*\n\n`;

        if (inboxMessages.length === 0) {

          message += "No messages found in the inbox.\n\nʀᴇɢᴀʀᴅs ʙʀᴜᴄᴇ ʙᴇʀᴀ";

        } else {

          inboxMessages.forEach((msg, index) => {

            message += `💌 *Message ${index + 1}*\n📨 From: ${msg.fromAddr}\n📜 Subject: ${msg.headerSubject}\n📅 Date: ${msg.date}\n\n`;

            message += `📝 *Message Body*: \n${msg.text}\n\n`;  // Include the full email body

            message += `🔗 *Download Link*: ${msg.downloadUrl}\n\n`; // Provide a link to download the email if needed

          });

        }

        await gss.sendMessage(

          m.from,

          {

            text: message,

            contextInfo: {

              isForwarded: false,

              forwardedNewsletterMessageInfo: {

                newsletterJid: "",

                newsletterName: "ʀᴇɢᴀʀᴅs ʙʀᴜᴄᴇ ʙᴇʀᴀ",

                serverMessageId: -1,

              },

              forwardingScore: 999, // Score to indicate it has been forwarded

              externalAdReply: {

                title: "✨ ʙᴇʀᴀ ᴛᴇᴄʜ ʙᴏᴛ ✨",

                body: "Temporary Email Inbox Service",

                sourceUrl: "",

                mediaType: 1,

              },

            },

          },

          { quoted: m }

        );

      } else {

        // If API returns an error

        await gss.sendMessage(

          m.from,

          {

            text: `❌ Error: ${data.err || "Failed to fetch inbox details."}`,

            contextInfo: {

              externalAdReply: {

                title: "✨ ʙᴇʀᴀ ᴛᴇᴄʜ ʙᴏᴛ ✨",

                body: "Temporary Email Inbox Service",

                sourceUrl: "",

                mediaType: 1,

              },

            },

          },

          { quoted: m }

        );

      }

    } catch (error) {

      await gss.sendMessage(

        m.from,

        {

          text: `❌ Error: ${error.message}`,

          contextInfo: {

            externalAdReply: {

                title: "✨ ʙᴇʀᴀ ᴛᴇᴄʜ ʙᴏᴛ ✨",

                body: "Temporary Email Inbox Service",

                sourceUrl: "",

                mediaType: 1,

              },

            },

          },

          { quoted: m }

      );

    }

  }

};

export default checkTempMail;

// ʀᴇɢᴀʀᴅs ʙᴇʀᴀ ᴛᴇᴄʜ