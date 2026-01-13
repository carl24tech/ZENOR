import axios from 'axios';
import config from '../../config.cjs';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const imageCommand = async (message, client) => {
  const PREFIX = config.PREFIX;
  const command = message.body.startsWith(PREFIX) 
    ? message.body.slice(PREFIX.length).split(" ")[0].toLowerCase() 
    : '';
  let query = message.body.slice(PREFIX.length + command.length).trim();

  const supportedCommands = ["image", "img", "gimage"];
  if (supportedCommands.includes(command)) {
    if (!query && !(message.quoted && message.quoted.text)) {
      return client.sendMessage(message.from, {
        text: `Please provide some text. Example usage: ${PREFIX}${command} black cats`
      });
    }

    if (!query && message.quoted && message.quoted.text) {
      query = message.quoted.text;
    }

    // Extract number from the query, default to 3 if not present
    const numberMatch = query.match(/(\d+)$/);
    const imageCount = numberMatch ? Math.min(parseInt(numberMatch[1], 10), 5) : 3; // Max 5 images
    query = numberMatch ? query.replace(/(\d+)$/, '').trim() : query;

    try {
      await client.sendMessage(message.from, { text: "*Please wait while I fetch the images...*" });

      const apiUrl = `https://api.siputzx.my.id/api/images?query=${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl);

      if (response.status === 200 && response.data.status) {
        const images = response.data.data.slice(0, imageCount); // Limit images based on count

        if (images.length === 0) {
          return client.sendMessage(message.from, {
            text: `No images found for "${query}". Please try a different query.`
          });
        }

        for (const img of images) {
          await sleep(500); // Ensure a small delay to avoid API/bot overload
          await client.sendMessage(message.from, {
            image: { url: img.url },
            caption: `Here is an image for "${query}"`,
          }, { quoted: message });
        }
      } else {
        // API returned error or no images
        await client.sendMessage(message.from, {
          text: `*Sorry, I couldn't fetch images for "${query}". Please try again later.*`
        });
      }
    } catch (error) {
      console.error("Error fetching images:", error.message);
      await client.sendMessage(message.from, {
        text: "*Oops! Something went wrong while generating images. Please try again later.*"
      });
    }
  }
};

export default imageCommand;
