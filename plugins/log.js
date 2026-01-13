
import axios from 'axios';
import config from '../../config.cjs';

const LogoCmd = async (message, bot) => {
  const prefix = config.PREFIX;
  const userName = message.pushName || "User";
  const command = message.body.startsWith(prefix) ? message.body.slice(prefix.length).split(" ")[0].toLowerCase() : '';

  const sendMessage = async (text) => {
    await bot.sendMessage(message.from, { text }, { quoted: message });
  };

  // Logo styles API list
  const logoStyles = {
    logo: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html&name=",
    blackpink: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/online-blackpink-style-logo-maker-effect-711.html&name=",
    glossysilver: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-glossy-silver-3d-text-effect-online-802.html&name=",
    Naruto: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html&name=",
    digitalglitch: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html&name=",
    pixelglitch: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html&name=",
    water: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-water-effect-text-online-295.html&name=", // Added Water style
    bulb: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/text-effects-incandescent-bulbs-219.html&name=", // Added Water style
zodiac: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/free-zodiac-online-logo-maker-491.html&name=", // Added Water style
water3D: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/water-3d-text-effect-online-126.html&name=", // Added Water style
dragonfire: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/dragon-fire-text-effect-111.html&name=", // Added Water style
bokeh: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/bokeh-text-effect-86.html&name=", // Added Water style
Queencard: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-a-personalized-queen-card-avatar-730.html&name=", // Added Water style
birthdaycake: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/birthday-cake-96.html&name=", // Added birthday cake style
underwater: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/3d-underwater-text-effect-online-682.html&name=", // Added Water style
glow: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/advanced-glow-effects-74.html&name=", // Added Water style
wetglass: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/write-text-on-wet-glass-online-589.html&name=", // Added Water style
graffiti: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/graffiti-color-199.html&name=", // Added Water style
halloween: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/cards-halloween-online-81.html&name=", // Added Water style
tattoo: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/make-tattoos-online-by-your-name-309.html&name=", // Added Water style
luxury: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/free-luxury-logo-maker-create-logo-online-458.html&name=", // Added Water style
avatar: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-avatar-gold-online-303.html&name=", // Added Water style
blood: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/write-blood-text-on-the-wall-264.html&name=", // Added Water style
hacker: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html&name=", // Added Water style
paint: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html&name=", // Added Water style
rotation: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-elegant-rotation-logo-online-586.html&name=", // Added Water style
graffiti2: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html&name=", // Added Water style
typography: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-online-typography-art-effects-with-multiple-layers-811.html&name=", // Added Water style
horror: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/writing-horror-letters-on-metal-plates-265.html=", // Added Water style
valentine: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/beautiful-flower-valentine-s-day-greeting-cards-online-512.html&name=", // Added Water style
team: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-logo-team-logo-gaming-assassin-style-574.html&name=", // Added Water style
gold: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/modern-gold-3-212.html&name=", // Added Water style
pentakill: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-a-lol-pentakill-231.html&name=", // Added Water style
galaxy: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/galaxy-text-effect-new-258.html&name=", // Added Water style
birthdayflower: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/write-name-on-flower-birthday-cake-pics-472.html&name=", // Added Water style
pubg: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/pubg-mascot-logo-maker-for-an-esports-team-612.html&name=", // Added Water style
   sand3D: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/realistic-3d-sand-text-effect-online-580.html&name=", // Added Water style
wall: "https://api-pink-venom.vercel.app/api/logo?url=https://textpro.me/break-wall-text-effect-871.html", // Added Water style
womensday: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-beautiful-international-women-s-day-cards-399.html&name=", // Added Water style
thunder1: "https://api-pink-venom.vercel.app/api/logo?url=https://textpro.me/online-thunder-text-effect-generator-1031.html&name=", // Added Water style
snow: "https://api-pink-venom.vercel.app/api/logo?url=https://textpro.me/create-beautiful-3d-snow-text-effect-online-1101.html&name=", // Added Water style
thunder: "https://api-pink-venom.vercel.app/api/logo?url=https://textpro.me/online-thunder-text-effect-generator-1031.html&name=", // Added Water style
 textlight: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/text-light-effets-234.html&name=", // Added Water style
sand: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/write-in-sand-summer-beach-online-576.html&name=" // Added Sand style
  };

  if (logoStyles[command]) {
    const userInput = message.body.slice(prefix.length + command.length + 1).trim();
    if (!userInput) {
      await sendMessage("⚠️ Please provide text to generate a logo!");
      return;
    }

    try {
      await bot.sendMessage(message.from, { react: { text: '⏳', key: message.key } });

      const apiUrl = logoStyles[command] + encodeURIComponent(userInput);
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (data.status && data.result && data.result.download_url) {
        const imageUrl = data.result.download_url;
        await bot.sendMessage(message.from, { image: { url: imageUrl }, caption: "Here is your logo!" }, { quoted: message });

        await bot.sendMessage(message.from, { react: { text: '✅', key: message.key } });
      } else {
        await sendMessage("⚠️ Failed to generate the logo. Please try again later!");
      }
    } catch (error) {
      console.error(error);
      await sendMessage("⚠️ An error occurred while generating the logo. Please try again later!");
    }
  }
};

export default LogoCmd;



