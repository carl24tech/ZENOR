import config from "../../config.cjs";
import ytSearch from "yt-search";
import fetch from "node-fetch";

const DOWNLOAD_APIS = [
    "https://ditzdevs-ytdl-api.hf.space/api/ytmp3?url=",
    "https://api.siputzx.my.id/api/d/ytmp3?url=",
    "https://apisnothing.vercel.app/api/download/ytmp3?url="
];

const play = async (message, client) => {
    const prefix = config.PREFIX;
    const args = message.body.slice(prefix.length).trim().split(" ");
    const command = args[0].toLowerCase();
    const query = args.slice(1).join(" ");

    if (command !== "play1") return;

    if (!query) return message.reply("❌ *Please provide a song name or YouTube link!*");

    await message.reply("⏳ *Searching for the best match...*");
    try {
        const searchResults = await ytSearch(query);
        if (!searchResults.videos.length) return message.reply("❌ *No results found!*");

        const video = searchResults.videos[0];
        const caption = `🎵 *Title:* ${video.title}\n📺 *Channel:* ${video.author.name}\n👁 *Views:* ${video.views}\n⏳ *Duration:* ${video.timestamp}\n\n📥 *Choose a format to download:*\n1️⃣ Video\n2️⃣ Audio`;

        const response = await client.sendMessage(message.chat, { image: { url: video.thumbnail }, caption }, { quoted: message });
        const messageId = response.key.id;
        const videoUrl = video.url;

        // Event Listener for User Selection
        const listener = async (msg) => {
            const newMsg = msg.messages[0];
            if (!newMsg.message) return;

            const userResponse = newMsg.message.conversation || newMsg.message.extendedTextMessage?.text;
            const isReplyToBot = newMsg.message.contextInfo?.stanzaId === messageId;

            if (isReplyToBot) {
                let downloadUrl = null;
                let fileType = "audio";
                let mimetype = "audio/mpeg";

                if (userResponse === "1") {
                    downloadUrl = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${videoUrl}`;
                    fileType = "video";
                    mimetype = "video/mp4";
                } else if (userResponse === "2") {
                    downloadUrl = await getAvailableMp3Url(videoUrl);
                } else {
                    return client.sendMessage(message.chat, { text: "❌ *Invalid selection! Please reply with 1 or 2.*" }, { quoted: newMsg });
                }

                if (!downloadUrl) return message.reply("❌ *Download failed, try another song!*");

                try {
                    const downloadResponse = await fetch(downloadUrl);
                    const downloadData = await downloadResponse.json();
                    if (!downloadData.success) return message.reply("❌ *Download failed, please try again.*");

                    const fileUrl = downloadData.result.download_url;
                    await client.sendMessage(message.chat, { [fileType]: { url: fileUrl }, mimetype, caption: `🎶 *BUDDY MUSIC PLAYER*\n\n🔹 *Title:* ${video.title}\n🔹 *Format:* ${fileType.toUpperCase()}\n\n🤺 *Enjoy your download!*`, footer: "POWERED BY SPARK-X API" }, { quoted: newMsg });

                } catch (error) {
                    console.error("Download Error:", error);
                    message.reply("❌ *Error downloading the file. Please try again.*");
                }

                // Remove listener after one use
                client.ev.off("messages.upsert", listener);
            }
        };

        client.ev.on("messages.upsert", listener);

    } catch (error) {
        console.error("Error:", error);
        return message.reply("❌ *An error occurred while processing your request.*");
    }
};

// Function to find a working MP3 API
const getAvailableMp3Url = async (videoUrl) => {
    for (const api of DOWNLOAD_APIS) {
        try {
            const response = await fetch(`${api}${videoUrl}`);
            const data = await response.json();
            if (data.success && data.result.download_url) {
                return data.result.download_url;
            }
        } catch (error) {
            console.warn(`API failed: ${api}`);
        }
    }
    return null;
};

export default play;
