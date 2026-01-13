import fs from "fs";
import path from "path";
import config from "../../config.cjs";

const toggleAntiLeft = async (message, sock) => {
    try {
        const prefix = config.PREFIX;
        const command = message.body.startsWith(prefix) 
            ? message.body.slice(prefix.length).split(" ")[0].toLowerCase() 
            : "";

        if (command === "antileft") {
            const args = message.body.split(" ").slice(1);
            if (args.length === 0) {
                return await message.reply("⚠️ *Usage:* `!antileft on/off`");
            }

            const newState = args[0].toLowerCase();
            if (newState !== "on" && newState !== "off") {
                return await message.reply("⚠️ *Invalid option!* Use `!antileft on` or `!antileft off`");
            }

            // Update the configuration
            const updatedConfig = { ...config, ANTI_LEFT: newState === "on" };

            // Resolve the path to config.cjs
            const configPath = path.resolve(__dirname, "../../config.cjs");

            // Write the updated config back to the file
            const configContent = `module.exports = ${JSON.stringify(updatedConfig, null, 2)};`;
            fs.writeFileSync(configPath, configContent, "utf8");

            await message.reply(`✅ *Anti-Left has been ${newState === "on" ? "enabled" : "disabled"}.*`);
        }
    } catch (error) {
        console.error("Error toggling Anti-Left:", error);
        await message.reply("❌ *An error occurred while updating Anti-Left settings. Please try again later.*");
    }
};

export default toggleAntiLeft;
