import React from 'react';
import { SpinnerIcon } from './icons';

interface ConfigFormProps {
    googleSheetUrl: string;
    setGoogleSheetUrl: (value: string) => void;
    geminiPrompt: string;
    setGeminiPrompt: (value: string) => void;
    isProcessing: boolean;
    onSubmit: () => void;
    onReset: () => void;
    isReady: boolean;
    isSignedIn: boolean;
    onSignIn: () => void;
    onSignOut: () => void;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({
    googleSheetUrl,
    setGoogleSheetUrl,
    geminiPrompt,
    setGeminiPrompt,
    isProcessing,
    onSubmit,
    onReset,
    isReady,
    isSignedIn,
    onSignIn,
    onSignOut,
}) => {
    const isFormDisabled = isProcessing || !isSignedIn;

    return (
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-xl">
            <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-cyan-400">۱. تنظیمات اولیه</h2>
                {isReady && (
                    <div>
                        {isSignedIn ? (
                            <button
                                onClick={onSignOut}
                                className="py-2 px-4 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                            >
                                خروج از حساب گوگل
                            </button>
                        ) : (
                            <button
                                onClick={onSignIn}
                                className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            >
                                ورود با گوگل
                            </button>
                        )}
                    </div>
                )}
            </div>

            {!isSignedIn && isReady && (
                 <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
                    <strong className="font-bold">نیازمند ورود: </strong>
                    <span className="block sm:inline">برای خواندن و نوشتن در گوگل شیت، ابتدا باید وارد حساب گوگل خود شوید.</span>
                </div>
            )}
            
            <fieldset disabled={isFormDisabled} className="space-y-6">
                <div>
                    <label htmlFor="googleSheetUrl" className="block text-sm font-medium text-gray-300 mb-2">لینک گوگل شیت</label>
                    <input
                        type="url"
                        id="googleSheetUrl"
                        value={googleSheetUrl}
                        onChange={(e) => setGoogleSheetUrl(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                        className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition disabled:opacity-50"
                    />
                </div>
           
                <div>
                    <h2 className="text-xl font-bold text-cyan-400 mb-4 pt-4 border-t border-gray-700">۲. الگوی تولید محتوا</h2>
                    <label htmlFor="geminiPrompt" className="block text-sm font-medium text-gray-300 mb-2">
                        متن راهنمای هوش مصنوعی (پرامپت)
                    </label>
                    <textarea
                        id="geminiPrompt"
                        value={geminiPrompt}
                        onChange={(e) => setGeminiPrompt(e.target.value)}
                        rows={4}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition disabled:opacity-50"
                        style={{direction: 'rtl'}}
                    ></textarea>
                    <p className="text-xs text-gray-400 mt-2">
                        {"از `{col1}`، `{col2}` و... برای جایگذاری داده‌های هر ستون از گوگل شیت استفاده کنید."}
                    </p>
                </div>
            </fieldset>
            
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
                    disabled={isFormDisabled}
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