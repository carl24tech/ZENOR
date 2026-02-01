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













































// app/commands/play.js  (ESM)
import axios from "axios";
import yts from "yt-search";
import config from "../config.cjs";
import fs from "fs";
import os from "os";
import path from "path";
import { spawn } from "child_process";

function runFFmpeg(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    // Converts to WhatsApp-friendly OGG/OPUS
    const args = [
      "-y",
      "-i", inputPath,
      "-vn",
      "-ac", "1",           // mono (more compatible, smaller)
      "-ar", "48000",       // 48k (standard for Opus)
      "-b:a", "128k",
      "-c:a", "libopus",
      outputPath
    ];

    const ff = spawn("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });

    let err = "";
    ff.stderr.on("data", (d) => (err += d.toString()));

    ff.on("close", (code) => {
      if (code === 0) return resolve();
      reject(new Error("ffmpeg failed: " + err.slice(-2000)));
    });
  });
}

async function downloadToFile(url, outPath) {
  const res = await axios.get(url, {
    responseType: "stream",
    timeout: 60000,
    maxRedirects: 5,
    headers: {
      // Some hosts behave better with a UA
      "User-Agent": "Mozilla/5.0"
    }
  });

  await new Promise((resolve, reject) => {
    const w = fs.createWriteStream(outPath);
    res.data.pipe(w);
    w.on("finish", resolve);
    w.on("error", reject);
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

  let inFile = null;
  let outFile = null;

  try {
    if (!args.length) return m.reply("*Example:* .play shape of you");

    const query = args.join(" ");
    await m.reply(`*Searching:* ${query}`);

    const search = await yts(query);
    const video = search?.videos?.[0];
    if (!video) return m.reply("*No song found*");

    const title = video.title;
    const youtubeUrl = `https://www.youtube.com/watch?v=${video.videoId}`;

    await m.reply(`*Processing:* ${title}`);

    // Your API -> gives an audio URL (often mp3). We'll download + convert.
    const apiUrl = `https://apiskeith.vercel.app/download/audio?url=${encodeURIComponent(youtubeUrl)}`;
    const apiRes = await axios.get(apiUrl, { timeout: 30000 });

    if (!apiRes.data?.status || !apiRes.data?.result) {
      return m.reply("*❌ API returned invalid data*");
    }

    const audioUrl = apiRes.data.result;
    if (typeof audioUrl !== "string" || !audioUrl.startsWith("http")) {
      return m.reply("*❌ Invalid audio URL received*");
    }

    // Temp files
    const tmpDir = os.tmpdir();
    const stamp = Date.now();
    inFile = path.join(tmpDir, `play_${stamp}.input`);
    outFile = path.join(tmpDir, `play_${stamp}.opus.ogg`);

    // 1) Download remote audio to local file
    await downloadToFile(audioUrl, inFile);

    // 2) Convert to WhatsApp supported OGG/OPUS
    await runFFmpeg(inFile, outFile);

    // Optional: basic size guard (WhatsApp can reject very large audio)
    const stat = fs.statSync(outFile);
    const maxBytes = 18 * 1024 * 1024; // ~18MB safe-ish; adjust to your needs
    if (stat.size > maxBytes) {
      return m.reply("*❌ Audio is too large. Try a shorter song.*");
    }

    // 3) Send as proper WhatsApp audio
    const oggBuffer = fs.readFileSync(outFile);

    await gss.sendMessage(
      m.from,
      {
        audio: oggBuffer,
        mimetype: "audio/ogg; codecs=opus",
        ptt: false, // true = voice note
      },
      { quoted: m }
    );

    await m.reply(`✅ *${title}* sent successfully!`);
  } catch (error) {
    console.error("PLAY error:", error?.response?.data || error);

    if (error?.response) {
      return m.reply(`*❌ API Error ${error.response.status}:* ${JSON.stringify(error.response.data)}`);
    }
    if (error?.code === "ECONNABORTED") {
      return m.reply("*❌ Timeout. Try a shorter song.*");
    }
    if ((error?.message || "").toLowerCase().includes("ffmpeg")) {
      return m.reply("*❌ ffmpeg failed. Ensure ffmpeg is installed in your host/container.*");
    }
    return m.reply(`*❌ Error:* ${error.message || "Unknown error"}`);
  } finally {
    // Cleanup temp files
    try { if (inFile && fs.existsSync(inFile)) fs.unlinkSync(inFile); } catch {}
    try { if (outFile && fs.existsSync(outFile)) fs.unlinkSync(outFile); } catch {}
  }
};

export default play;
