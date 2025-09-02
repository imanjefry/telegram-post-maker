
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

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
        throw new Error('خطا در ارتباط با سرویس هوش مصنوعی.');
    }
}
