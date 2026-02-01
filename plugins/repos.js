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













































import axios from "axios";
import yts from "yt-search";
import config from '../config.cjs';

const play = async (m, gss) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";
  const args = m.body.slice(prefix.length + cmd.length).trim().split(" ");

  if (cmd === "play") {
    try {
      if (!args.length) return m.reply("*Send a song name*\nEx: .play despacito");
      
      const query = args.join(" ");
      await m.reply(`🔍 *Searching for:* ${query}`);
      
      // Search YouTube
      const search = await yts(query);
      const video = search.videos[0];
      if (!video) return m.reply("❌ *No results found*");
      
      const title = video.title;
      const url = video.url;
      
      await m.reply(`⬇️ *Downloading:* ${title}`);
      
      // Create the audio URL using your API
      const audioUrl = `https://apiskeith.vercel.app/download/ytmp3?url=${encodeURIComponent(url)}`;
      
      // **THIS IS THE KEY FIX:**
      // WhatsApp often rejects external URLs. We need to download first then send as buffer
      const response = await axios.get(audioUrl, {
        responseType: 'stream',
        timeout: 60000,
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'audio/*'
        }
      });
      
      // Collect stream data into buffer
      const chunks = [];
      for await (const chunk of response.data) {
        chunks.push(chunk);
      }
      const audioBuffer = Buffer.concat(chunks);
      
      // Send audio as buffer (not URL) - WhatsApp accepts this better
      await gss.sendMessage(
        m.from,
        {
          audio: audioBuffer,
          mimetype: "audio/mpeg",
          fileName: `${title.substring(0, 30)}.mp3`,
          ptt: false,
        },
        { quoted: m }
      );
      
      await m.reply(`✅ *${title}*\n🎵 Now playing!`);
      
    } catch (error) {
      console.error("Play error:", error);
      await m.reply("❌ Failed to play. Try: .play [song name]");
    }
  }
};

export default play;
