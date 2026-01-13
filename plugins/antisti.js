import config from '../config.cjs';

const antistickerCommand = async (m, Matrix) => {
    try {
        // Basic message validation
        if (!m || !Matrix) throw new Error('Invalid message or client object');
        
        const text = m.body?.trim().toLowerCase() || '';
        const isGroup = m.from?.endsWith('@g.us');
        const isAdmin = isGroup && m.isAdmin;
        const isOwner = [config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
        const isBot = m.sender?.includes(Matrix.user?.id.split(':')[0]);

        // Initialize group settings
        if (!global.antisticker) global.antisticker = {};
        if (!global.antisticker[m.from]) {
            global.antisticker[m.from] = {
                enabled: false,
                lastActive: Date.now()
            };
        }

        // Command handling (works in groups only)
        if (isGroup) {
            // Enable command
            if (text === 'antisticker on') {
                if (!isAdmin && !isOwner && !isBot) {
                    await Matrix.sendMessage(m.from, 
                        { text: '❌ Command restricted to admins/bot' }, 
                        { quoted: m }
                    );
                    return;
                }
                global.antisticker[m.from].enabled = true;
                await Matrix.sendMessage(m.from, 
                    { text: '🛡 Antisticker activated! Stickers will be auto-deleted.' }, 
                    { quoted: m }
                );
                return;
            }

            // Disable command
            if (text === 'antisticker off') {
                if (!isAdmin && !isOwner && !isBot) {
                    await Matrix.sendMessage(m.from, 
                        { text: '❌ Command restricted to admins/bot' }, 
                        { quoted: m }
                    );
                    return;
                }
                global.antisticker[m.from].enabled = false;
                await Matrix.sendMessage(m.from, 
                    { text: '🔓 Antisticker deactivated! Stickers are now allowed.' }, 
                    { quoted: m }
                );
                return;
            }

            // Sticker detection and deletion
            if (global.antisticker[m.from]?.enabled && m.type === 'stickerMessage') {
                // Skip deletion for owner/bot
                if (isOwner || isBot) {
                    console.log('Skipping deletion - sent by owner/bot');
                    return;
                }

                try {
                    // Delete with confirmation
                    await Matrix.sendMessage(m.from, 
                        { text: '⚠ Sticker deleted! This group has antisticker enabled.' }, 
                        { quoted: m }
                    );
                    await Matrix.sendMessage(m.from, 
                        { delete: m.key }
                    );
                } catch (deleteError) {
                    console.error('Failed to delete sticker:', deleteError);
                    await Matrix.sendMessage(m.from, 
                        { text: '⚠ Failed to delete sticker (missing permissions?)' }
                    );
                }
            }
        }

    } catch (error) {
        console.error('Antisticker error:', error);
        if (Matrix && m.from) {
            await Matrix.sendMessage(m.from, 
                { text: '❌ Antisticker crashed! Check console logs.' }
            );
        }
    }
};

export default antistickerCommand;
