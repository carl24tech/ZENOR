import moment from 'moment-timezone';
import pkg from '@whiskeysockets/baileys';
const { proto } = pkg;
import config from '../../config.cjs';
import os from 'os';

const aboutCommand = async (m, sock) => {
  const prefix = config.PREFIX;
  const mode = config.MODE;
  const pushName = m.sender || 'User';

  // Only trigger if the message starts with the about command
  if (!m.body.startsWith(`${prefix}about`)) return;

  // Uptime calculation
  const uptimeSeconds = process.uptime();
  const days = Math.floor(uptimeSeconds / (24 * 3600));
  const hours = Math.floor((uptimeSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);

  // Get current time in the specified timezone
  const realTime = moment().tz("Africa/Nairobi").format("HH:mm:ss");

  // Simple greeting based on time
  let greeting = "";
  if (realTime < "05:00:00") {
    greeting = "Stay strong 🕵️";
  } else if (realTime < "11:00:00") {
    greeting = "Giving up is gay 🏳️‍🌈";
  } else if (realTime < "15:00:00") {
    greeting = "Buddy-XTR is alive";
  } else if (realTime < "19:00:00") {
    greeting = "Pimps dont simp😁";
  } else {
    greeting = "Cloning is also gay🤳";
  }

  // Construct the about text message
  const aboutText = `
╭───C  
│ 🧑‍💻 *User:* ${pushName} ${greeting}
│ 🌐 *Mode:* ${mode}
│ ⏰ *Time:* ${realTime}
│ 🚀 *Uptime:* ${days}d ${hours}h ${minutes}m ${seconds}s
╰───────────
`;

  // Send the plain text message
  await sock.sendMessage(m.from, { text: aboutText }, { quoted: m });
};

export default aboutCommand;
