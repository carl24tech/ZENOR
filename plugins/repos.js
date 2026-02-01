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
      const videoTitle = firstResult.title;

      m.reply(`*📥 Downloading:* ${videoTitle}`);

      // Using your YOUTUBE_AUDIO API key
      const apiUrl = `https://apiskeith.vercel.app/download/ytmp3?url=${encodeURIComponent(videoUrl)}`;
      
      const response = await axios.get(apiUrl, { timeout: 30000 });

      // Handle different response formats
      let downloadUrl, title;
      
      if (response.data && response.data.download_url) {
        downloadUrl = response.data.download_url;
        title = response.data.title || videoTitle;
      } else if (response.data && response.data.url) {
        downloadUrl = response.data.url;
        title = response.data.title || videoTitle;
      } else {
        return m.reply(`❌ Invalid response format from download API.`);
      }

      // Clean title for WhatsApp
      const cleanTitle = title.replace(/[^\w\s\-\.]/gi, '').substring(0, 50);

      // Send audio to WhatsApp
      await gss.sendMessage(
        m.from,
        {
          audio: { url: downloadUrl },
          mimetype: "audio/mp4",
          fileName: `${cleanTitle}.mp3`,
          ptt: false,
        },
        { quoted: m }
      );

      m.reply(`✅ *${title}*\n🎵 Downloaded and sent successfully!`);

    } catch (error) {
      console.error("Play command error:", error);
      
      if (error.code === 'ECONNABORTED') {
        m.reply("❌ Download timeout. Try again or use a shorter song.");
      } else {
        m.reply("❌ Failed to download audio. Please try a different song.");
      }
    }
  }
};

export default play;
