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

      // Test the API directly first
      const testUrl = `https://apiskeith.vercel.app/download/ytmp3?url=${encodeURIComponent(videoUrl)}`;
      console.log("API URL:", testUrl);
      
      const response = await axios.get(testUrl, { 
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      console.log("API Response:", response.data);
      
      // Extract audio URL from response
      let audioUrl = null;
      
      // Method 1: Check if response is a direct URL
      if (typeof response.data === 'string' && response.data.startsWith('http')) {
        audioUrl = response.data;
      }
      // Method 2: Check common response formats
      else if (response.data && typeof response.data === 'object') {
        // Try different possible keys
        const possibleKeys = ['download_url', 'url', 'link', 'audio_url', 'mp3_url', 'downloadUrl'];
        
        for (const key of possibleKeys) {
          if (response.data[key]) {
            audioUrl = response.data[key];
            break;
          }
        }
        
        // If no key found, check if the object itself is the URL data
        if (!audioUrl && response.data.url) {
          audioUrl = response.data.url;
        }
      }

      if (!audioUrl) {
        // Send raw response for debugging
        console.log("Raw response data:", JSON.stringify(response.data, null, 2));
        return m.reply(`❌ Could not find audio URL in API response.\n*Response format:* ${typeof response.data}\n*Song:* ${videoTitle}`);
      }

      console.log("Extracted audio URL:", audioUrl);

      // Send audio to WhatsApp
      await gss.sendMessage(
        m.from,
        {
          audio: { url: audioUrl },
          mimetype: "audio/mpeg",
          fileName: `${videoTitle.substring(0, 50)}.mp3`,
          ptt: false,
        },
        { quoted: m }
      );

      m.reply(`✅ *${videoTitle}*\n🎵 Downloaded successfully!`);

    } catch (error) {
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        response: error.response?.data
      });
      
      if (error.response) {
        m.reply(`❌ API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.code === 'ECONNABORTED') {
        m.reply("❌ Request timeout. The API is taking too long to respond.");
      } else {
        m.reply(`❌ Download failed: ${error.message}`);
      }
    }
  }
};

export default play;
