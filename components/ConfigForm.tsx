import React from 'react';
import { SpinnerIcon } from './icons';

interface ConfigFormProps {
    googleSheetUrl: string;
    setGoogleSheetUrl: (value: string) => void;
    telegramBotToken: string;
    setTelegramBotToken: (value: string) => void;
    telegramChannelId: string;
    setTelegramChannelId: (value: string) => void;
    geminiPrompt: string;
    setGeminiPrompt: (value: string) => void;
    isProcessing: boolean;
    onSubmit: () => void;
    onReset: () => void;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({
    googleSheetUrl,
    setGoogleSheetUrl,
    telegramBotToken,
    setTelegramBotToken,
    telegramChannelId,
    setTelegramChannelId,
    geminiPrompt,
    setGeminiPrompt,
    isProcessing,
    onSubmit,
    onReset
}) => {
    return (
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-xl">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6 border-b border-gray-700 pb-4">۱. تنظیمات اولیه</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Google Sheet URL */}
                <div className="col-span-1 md:col-span-2">
                    <label htmlFor="googleSheetUrl" className="block text-sm font-medium text-gray-300 mb-2">لینک گوگل شیت (باید عمومی باشد)</label>
                    <input
                        type="url"
                        id="googleSheetUrl"
                        value={googleSheetUrl}
                        onChange={(e) => setGoogleSheetUrl(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                        className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                        disabled={isProcessing}
                    />
                </div>
                
                {/* Telegram Bot Token */}
                <div>
                    <label htmlFor="telegramBotToken" className="block text-sm font-medium text-gray-300 mb-2">توکن ربات تلگرام</label>
                    <input
                        type="text"
                        id="telegramBotToken"
                        value={telegramBotToken}
                        onChange={(e) => setTelegramBotToken(e.target.value)}
                        placeholder="توکن ربات شما"
                        className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                        disabled={isProcessing}
                    />
                </div>
                
                {/* Telegram Channel ID */}
                <div>
                    <label htmlFor="telegramChannelId" className="block text-sm font-medium text-gray-300 mb-2">آیدی کانال تلگرام</label>
                    <input
                        type="text"
                        id="telegramChannelId"
                        value={telegramChannelId}
                        onChange={(e) => setTelegramChannelId(e.target.value)}
                        placeholder="مثال: @YourChannel"
                        className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                        disabled={isProcessing}
                    />
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-2xl font-bold text-cyan-400 mb-6 border-b border-gray-700 pb-4">۲. الگوی تولید محتوا</h2>
                <div>
                    <label htmlFor="geminiPrompt" className="block text-sm font-medium text-gray-300 mb-2">
                        متن راهنمای هوش مصنوعی (پرامپت)
                    </label>
                    <textarea
                        id="geminiPrompt"
                        value={geminiPrompt}
                        onChange={(e) => setGeminiPrompt(e.target.value)}
                        rows={4}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                        disabled={isProcessing}
                        style={{direction: 'rtl'}}
                    ></textarea>
                    {/* Fix: Wrap instructional text in a string literal to prevent JSX from interpreting `{col1}` and `{col2}` as variables. */}
                    <p className="text-xs text-gray-400 mt-2">
                        {"از `{col1}`، `{col2}` و... برای جایگذاری داده‌های هر ستون از گوگل شیت استفاده کنید."}
                    </p>
                </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-700 flex items-center justify-end gap-4">
                <button
                    onClick={onReset}
                    disabled={isProcessing}
                    className="py-2 px-5 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    بازنشانی
                </button>
                <button
                    onClick={onSubmit}
                    disabled={isProcessing}
                    className="py-2 px-8 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-75 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? (
                        <>
                            <SpinnerIcon />
                            <span>در حال پردازش...</span>
                        </>
                    ) : (
                        <span>شروع اتوماسیون</span>
                    )}
                </button>
            </div>
        </div>
    );
};