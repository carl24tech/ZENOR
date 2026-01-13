











import config from "../../config.cjs";

const hackingPrank = async (m, sock) => {
  const prefix = config.PREFIX;

  if (!m.body.startsWith(`${prefix}hack`)) return;

  const target = m.body.split(" ")[1] || "unknown user";
  const steps = [
    `🕷️ *Initializing DarkNet Connection...*`,
    `🔍 *Tracking ${target}'s digital footprint...*`,
    `📡 *Bypassing deep-layer security walls...*`,
    `🔓 *Injecting malware into ${target}'s device...*`,
    `📂 *Accessing personal files...*`,
    `📞 *Listening through the microphone...*`,
    `👁️ *Activating front camera...*`,
    `💀 *ERROR: Unknown entity detected...*`,
    `⚠️ *WARNING! SYSTEM OVERRIDE INITIATED...*`,
    `🔴 *DATA LEAK IN PROGRESS...*`,
    `❗ *STOP! YOU ARE BEING WATCHED!*`,
    `👤 *The shadows are near...*`
  ];

  for (let step of steps) {
    await sock.sendMessage(m.from, { text: step }, { quoted: m });
    await new Promise((resolve) => setTimeout(resolve, Math.random() * (4000 - 2000) + 2000)); // Random delay for suspense
  }

  await sock.sendMessage(m.from, { text: `☠️ *System, ${target} terminated,, Please dump it..*` }, { quoted: m });
};

export default hackingPrank;






















