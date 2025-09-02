const CORS_PROXY = 'https://corsproxy.io/?';

export async function postToChannel(botToken: string, channelId: string, text: string): Promise<void> {
    const targetUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const url = `${CORS_PROXY}${encodeURIComponent(targetUrl)}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: channelId,
                text: text,
            }),
        });

        // Check if the response is successful, if not, parse the error
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                // If the error response isn't JSON, use the status text
                throw new Error(`خطای ${response.status}: ${response.statusText}`);
            }

            const description = errorData.description || 'یک خطای ناشناخته رخ داد.';
            
            // Provide more helpful, user-friendly messages
            if (response.status === 404 || description.toLowerCase().includes('not found')) {
                throw new Error('توکن ربات تلگرام نامعتبر است. (Not Found)');
            }
            if (description.includes('chat not found')) {
                throw new Error('آیدی کانال پیدا نشد یا ربات در آن عضو نیست. (Chat not found)');
            }
            if (description.includes('bot is not a member')) {
                throw new Error('ربات به عنوان عضو در کانال اضافه نشده است. (Bot not a member)');
            }
             if (response.status === 401) {
                throw new Error('احراز هویت ناموفق بود. توکن ربات را بررسی کنید. (Unauthorized)');
            }
            throw new Error(description); // Fallback for other Telegram errors
        }

    } catch (error) {
        console.error('Error posting to Telegram:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`خطا در ارسال پیام به تلگرام: ${errorMessage}`);
    }
}
