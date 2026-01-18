// Конфигурация Telegram бота
export const TELEGRAM_CONFIG = {
    botToken: '8220408132:AAEH8pOfsbdZjNZO3sWgpAhfML1am0Z3hqs',
    chatId: '6357901595', // User ID для отправки заявок
};

// Функция для отправки сообщения в Telegram бот
export async function sendToTelegramBot(message) {
    if (!TELEGRAM_CONFIG.botToken) {
        console.warn('Telegram bot token not configured');
        return false;
    }

    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CONFIG.chatId || '@school11_clubs', // Можно использовать username канала
                text: message,
                parse_mode: 'HTML',
            }),
        });

        if (!response.ok) {
            throw new Error(`Telegram API error: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('Error sending to Telegram:', error);
        return false;
    }
}

