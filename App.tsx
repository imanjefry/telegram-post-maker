
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ConfigForm } from './components/ConfigForm';
import { ResultsTable } from './components/ResultsTable';
import { fetchAndParseSheet } from './services/googleSheetsService';
import { generateSalesText } from './services/geminiService';
import { postToChannel } from './services/telegramService';
import type { ProcessedRow } from './types';
import { ProcessStatus } from './types';

const App: React.FC = () => {
    const [googleSheetUrl, setGoogleSheetUrl] = useState('');
    const [telegramBotToken, setTelegramBotToken] = useState('');
    const [telegramChannelId, setTelegramChannelId] = useState('');
    const [geminiPrompt, setGeminiPrompt] = useState('برای محصول {col1} با قیمت {col2} و ویژگی‌های {col3} یک متن فروش جذاب برای تلگرام بنویس.');
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedRows, setProcessedRows] = useState<ProcessedRow[]>([]);
    const [globalError, setGlobalError] = useState<string | null>(null);

    const handleStartAutomation = useCallback(async () => {
        if (!googleSheetUrl || !telegramBotToken || !telegramChannelId || !geminiPrompt) {
            setGlobalError('لطفاً تمام فیلدها را پر کنید.');
            return;
        }

        setIsProcessing(true);
        setGlobalError(null);
        setProcessedRows([]);

        try {
            const sheetData = await fetchAndParseSheet(googleSheetUrl);
            if (sheetData.length === 0) {
                setGlobalError('گوگل شیت خالی است یا قابل دسترسی نیست.');
                setIsProcessing(false);
                return;
            }

            const initialRows: ProcessedRow[] = sheetData.map((row, index) => ({
                id: index,
                data: row,
                generatedText: '',
                status: ProcessStatus.PENDING,
            }));
            setProcessedRows(initialRows);

            for (const row of initialRows) {
                try {
                    // 1. Generate Text
                    setProcessedRows(prev => prev.map(r => r.id === row.id ? { ...r, status: ProcessStatus.GENERATING } : r));
                    
                    let prompt = geminiPrompt;
                    row.data.forEach((cell, i) => {
                        prompt = prompt.replace(new RegExp(`{col${i + 1}}`, 'g'), cell);
                    });

                    const generatedText = await generateSalesText(prompt);
                    setProcessedRows(prev => prev.map(r => r.id === row.id ? { ...r, generatedText, status: ProcessStatus.POSTING } : r));
                    
                    // 2. Post to Telegram
                    await postToChannel(telegramBotToken, telegramChannelId, generatedText);
                    setProcessedRows(prev => prev.map(r => r.id === row.id ? { ...r, status: ProcessStatus.COMPLETED } : r));

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    setProcessedRows(prev => prev.map(r => r.id === row.id ? { ...r, status: ProcessStatus.ERROR, error: errorMessage } : r));
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'یک خطای ناشناخته رخ داد.';
            setGlobalError(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    }, [googleSheetUrl, telegramBotToken, telegramChannelId, geminiPrompt]);

    const handleReset = () => {
        setGoogleSheetUrl('');
        setTelegramBotToken('');
        setTelegramChannelId('');
        setIsProcessing(false);
        setProcessedRows([]);
        setGlobalError(null);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <Header />
            <main className="max-w-4xl mx-auto p-4 md:p-6">
                <ConfigForm
                    googleSheetUrl={googleSheetUrl}
                    setGoogleSheetUrl={setGoogleSheetUrl}
                    telegramBotToken={telegramBotToken}
                    setTelegramBotToken={setTelegramBotToken}
                    telegramChannelId={telegramChannelId}
                    setTelegramChannelId={setTelegramChannelId}
                    geminiPrompt={geminiPrompt}
                    setGeminiPrompt={setGeminiPrompt}
                    isProcessing={isProcessing}
                    onSubmit={handleStartAutomation}
                    onReset={handleReset}
                />

                {globalError && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative my-4" role="alert">
                        <strong className="font-bold">خطا: </strong>
                        <span className="block sm:inline">{globalError}</span>
                    </div>
                )}

                {processedRows.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-cyan-400 mb-4">نتایج پردازش</h2>
                        <ResultsTable rows={processedRows} />
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
