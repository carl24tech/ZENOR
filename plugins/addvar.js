import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import config from '../../config.cjs';

// Load .env variables
dotenv.config();

const addVarCommand = async (m, Matrix) => {

    const text = m.message?.conversation || m.message?.extendedTextMessage?.text || null; // Extract text

    const prefix = config.PREFIX;

    // Ignore group and broadcast messages
    if (m.key.remoteJid.endsWith('@g.us') || m.key.remoteJid === 'status@broadcast') {
        console.log('Group or broadcast message ignored.');
        return;
    }

    // Check if the command is `addvar`
    if (text?.startsWith(`${prefix}addvar`)) {

        if (m.sender !== config.OWNER_NUMBER + '@s.whatsapp.net') {
            await Matrix.sendMessage(m.from, { text: '📛 THIS IS AN OWNER COMMAND' }, { quoted: m });
            return;
                await m.React('⏳');
        }

        // Parse the command
        const args = text.slice(prefix.length).trim().split(' ');
        const [command, variable, newValue] = args;

        if (!variable || !newValue) {
            await Matrix.sendMessage(m.from, { text: '❌ Usage: .addvar <VARIABLE_NAME> <VALUE>' }, { quoted: m });
            return;
        }

        try {
            // Path to the .env file
            const envFilePath = path.resolve(process.cwd(), '.env');

            // Check if .env file exists
            if (!fs.existsSync(envFilePath)) {
                await Matrix.sendMessage(m.from, { text: '❌ .env file not found. Make sure it exists in the project root.' }, { quoted: m });
                return;
            }

            // Read the .env file
            const envContent = fs.readFileSync(envFilePath, 'utf-8');
            const envLines = envContent.split('\n');

            // Check if the variable already exists in the .env file
            const existingVariable = envLines.find(line => line.startsWith(`${variable}=`));

            if (existingVariable) {
                await Matrix.sendMessage(m.from, { text: `❌ Variable ${variable} is already defined in the .env file.` }, { quoted: m });
                return;
            }

            // Add the new variable to the .env file
            const newEnvLines = [...envLines, `${variable}=${newValue}`];

            // Write the updated .env file
            fs.writeFileSync(envFilePath, newEnvLines.join('\n'), 'utf-8');

            // Reload dotenv to reflect the changes
            dotenv.config();

            await Matrix.sendMessage(m.from, { text: `✅ Variable ${variable} has been added with value ${newValue}.` }, { quoted: m });
await m.React('✅'); 
        } catch (err) {
            console.error('Error adding variable:', err.message);
            await Matrix.sendMessage(m.from, { text: `❌ Failed to add variable: ${err.message}` }, { quoted: m });
        }

    }

};

export default addVarCommand;
