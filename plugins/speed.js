import config from '../config.cjs';

const speed = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd === 'speed') {
    const start = Date.now();

    await m.React('⚡');

    const progressBars = [
      '[░░░░░░░░░░] 0%',
      '[█░░░░░░░░░] 10%',
      '[██░░░░░░░░] 20%',
      '[███░░░░░░░] 30%',
      '[████░░░░░░] 40%',
      '[█████░░░░░] 50%',
      '[██████░░░░] 60%',
      '[███████░░░] 70%',
      '[████████░░] 80%',
      '[█████████░] 90%',
      '[██████████] 100%'
    ];

    const loadingText = (bar) =>
      `🚀 *Speed Test in Progress*\n\n${bar}\n\n⚡ Optimizing performance...`;

    // Send initial message
    const msg = await Matrix.sendMessage(m.from, {
      text: loadingText(progressBars[0])
    }, { quoted: m });

    // Animate progress bar
    for (let i = 1; i < progressBars.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 450));

      await Matrix.sendMessage(m.from, {
        text: loadingText(progressBars[i]),
        edit: msg.key
      });
    }

    const end = Date.now();
    const speedMs = end - start;

    const finalText =
      `⚡ *Speed Test Complete*\n\n` +
      `🚀 Response Time: *${speedMs}ms*\n` +
      `✅ Status: *Ultra Fast*`;

    await new Promise(resolve => setTimeout(resolve, 500));

    await Matrix.sendMessage(m.from, {
      text: finalText,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true
      }
    }, { quoted: m });
  }
};

export default speed;
