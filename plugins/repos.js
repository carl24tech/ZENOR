/**import axios from "axios";
import yts from "yt-search";
import config from '../config.cjs';

const play = async (m, gss) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";
  const args = m.body.slice(prefix.length + cmd.length).trim().split(" ");

  if (cmd === "play") {
    if (args.length === 0 || !args.join(" ")) {
      return m.reply("*Please provide a song name or keywords to search for.*");
    }

    const searchQuery = args.join(" ");
    m.reply("*🎧 Searching for the song...*");

    try {
      const searchResults = await yts(searchQuery);
      if (!searchResults.videos || searchResults.videos.length === 0) {
        return m.reply(`❌ No results found for "${searchQuery}".`);
      }

      const firstResult = searchResults.videos[0];
      const videoUrl = firstResult.url;

      // First API endpoint
      const apiUrl = `https://api.davidcyriltech.my.id/download/ytmp3?url=${videoUrl}`;
      const response = await axios.get(apiUrl);

      if (!response.data.success) {
        return m.reply(`❌ Failed to fetch audio for "${searchQuery}".`);
      }

      const { title, download_url } = response.data.result;

      // Send the audio file
      await gss.sendMessage(
        m.from,
        {
          audio: { url: download_url },
          mimetype: "audio/mp4",
          ptt: false,
        },
        { quoted: m }
      );

      m.reply(`✅ *${title}* has been downloaded successfully!`);
    } catch (error) {
      console.error(error);
      m.reply("❌ An error occurred while processing your request.");
    }
  }
};

export default play;**/













































// app/commands/play.js
import axios from "axios";
import yts from "yt-search";
import config from "../config.cjs";
import fs from "fs";
import os from "os";
import path from "path";
import { spawn } from "child_process";
import ffmpegPath from "ffmpeg-static";

async function downloadToFile(url, outPath) {
  const res = await axios.get(url, {
    responseType: "stream",
    timeout: 60000,
    maxRedirects: 5,
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  await new Promise((resolve, reject) => {
    const w = fs.createWriteStream(outPath);
    res.data.pipe(w);
    w.on("finish", resolve);
    w.on("error", reject);
  });
}

function convertToOpus(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const args = [
      "-y",
      "-i", inputPath,
      "-vn",
      "-ac", "1",
      "-ar", "48000",
      "-b:a", "128k",
      "-c:a", "libopus",
      outputPath
    ];

    const ff = spawn(ffmpegPath, args);
    let err = "";

    ff.stderr.on("data", d => (err += d.toString()));
    ff.on("close", code => {
      if (code === 0) resolve();
      else reject(new Error("FFmpeg failed: " + err.slice(-2000)));
    });
  });
}

const play = async (m, gss) => {
  const prefix = config.PREFIX;
  const body = m.body || "";

  const cmd = body.startsWith(prefix)
    ? body.slice(prefix.length).trim().split(/\s+/)[0]?.toLowerCase()
    : "";

  const args = body.startsWith(prefix)
    ? body.slice(prefix.length).trim().split(/\s+/).slice(1)
    : [];

  if (cmd !== "play") return;

  let inputFile, outputFile;

  try {
    if (!args.length) {
      return m.reply("*Example:* .play shape of you");
    }

    const query = args.join(" ");
    await m.reply(`🔍 *Searching:* ${query}`);

    const search = await yts(query);
    const video = search?.videos?.[0];
    if (!video) return m.reply("❌ *No song found*");

    const youtubeUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
    await m.reply(`🎧 *Processing:* ${video.title}`);

    // Your API
    const apiUrl = `https://apiskeith.vercel.app/download/audio?url=${encodeURIComponent(youtubeUrl)}`;
    const apiRes = await axios.get(apiUrl, { timeout: 30000 });

    if (!apiRes.data?.status || !apiRes.data?.result) {
      return m.reply("❌ *Audio API failed*");
    }

    const audioUrl = apiRes.data.result;

    const tmp = os.tmpdir();
    const id = Date.now();
    inputFile = path.join(tmp, `play_${id}.input`);
    outputFile = path.join(tmp, `play_${id}.ogg`);

    // Download + convert
    await downloadToFile(audioUrl, inputFile);
    await convertToOpus(inputFile, outputFile);

    // Size safety (~18MB)
    if (fs.statSync(outputFile).size > 18 * 1024 * 1024) {
      return m.reply("❌ *Audio too large. Try a shorter song*");
    }

    // 🎙️ SEND AS VOICE NOTE
    await gss.sendMessage(
      m.from,
      {
        audio: fs.readFileSync(outputFile),
        mimetype: "audio/ogg; codecs=opus",
        ptt: true
      },
      { quoted: m }
    );

    await m.reply(`🎙️ *Voice note sent:* ${video.title}`);

  } catch (err) {
    console.error("PLAY ERROR:", err?.response?.data || err);
    await m.reply("❌ *Failed to send audio*");
  } finally {
    try { if (inputFile) fs.unlinkSync(inputFile); } catch {}
    try { if (outputFile) fs.unlinkSync(outputFile); } catch {}
  }
};

export default play;
