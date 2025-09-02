import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateSalesText(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = response.text;
        if (!text) {
            throw new Error("پاسخ خالی از هوش مصنوعی دریافت شد.");
        }
        return text;
    } catch (error) {
        console.error('Error generating text with Gemini:', error);
        // Check for specific authentication error from the API call
        if (error instanceof Error && error.message.includes('API key not valid')) {
             throw new Error('کلید API هوش مصنوعی نامعتبر است. لطفاً آن را بررسی کنید.');
        }
        throw new Error('خطا در ارتباط با سرویس هوش مصنوعی.');
    }
}
