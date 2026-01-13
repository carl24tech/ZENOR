import axios from 'axios';
import config from '../../config.cjs';

const enhanceImage = async (m, gss) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const validCommands = ['hdr', 'hd', 'remini', 'enhance', 'upscale'];

  if (validCommands.includes(cmd)) {
    if (!m.quoted || m.quoted.mtype !== 'imageMessage') {
      return m.reply(`*Send/Reply with an Image to Enhance Your Picture Quality using ${prefix + cmd}*`);
    }

    try {
      // Download the image from the message
      const media = await m.quoted.download();
      
      // Define the API endpoint and API key
      const apiUrl = 'https://api.nexoracle.com/ai/gemini-image?'; // Replace with actual API endpoint
      const apiKey = 'sarkar_786='; // Replace with your actual API key

      // Create form data to send the image to the API
      const formData = new FormData();
      formData.append('image', media, 'image.jpg'); // 'image' is the form field name expected by the API

      // Send the image to the API
      const response = await axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${apiKey}`, // If API uses Bearer token
        },
      });

      // Check if the API response is successful and has enhanced image data
      if (response.data && response.data.enhanced_image_url) {
        const enhancedImageUrl = response.data.enhanced_image_url;
        const caption = `> *Hey ${m.pushName}, here is your enhanced image.*`;

        // Send the enhanced image to the user
        await gss.sendMessage(m.from, { image: { url: enhancedImageUrl }, caption }, { quoted: m });
      } else {
        throw new Error('Enhancement failed or invalid response from API');
      }
    } catch (error) {
      console.error('Error enhancing image:', error);
      m.reply('There was an error enhancing your image. Please try again later.');
    }
  }
};

export default enhanceImage;
