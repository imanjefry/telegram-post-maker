import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ConfigForm } from './components/ConfigForm';
import { ResultsTable } from './components/ResultsTable';
import { fetchAndParseSheet } from './services/googleSheetsService';
import { generateSalesText } from './services/geminiService';
import type { ProcessedRow } from './types';
import { ProcessStatus } from './types';

const parseRowSelection = (selection: string): Set<number> | null => {
    if (!selection.trim()) {
        return null; // Process all rows
    }
    const selectedRows = new Set<number>();
    const parts = selection.split(',').map(p => p.trim());
    for (const part of parts) {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(Number);
            if (!isNaN(start) && !isNaN(end) && start > 0 && start <= end) {
                for (let i = start; i <= end; i++) {
                    selectedRows.add(i);
                }
            }
        } else {
            const rowNum = Number(part);
            if (!isNaN(rowNum) && rowNum > 0) {
                selectedRows.add(rowNum);
            }
        }
    }
    return selectedRows;
};


const App: React.FC = () => {
    // Main config
    const [googleSheetUrl, setGoogleSheetUrl] = useState('');
    const [promptTemplate, setPromptTemplate] = useState('برای محصول {col1} با قیمت {col2} و ویژگی‌های {col3} یک متن فروش جذاب بنویس.');
    const [rowSelection, setRowSelection] = useState('');
    
    // Prompt optimization
    const [targetAudience, setTargetAudience] = useState('عموم مردم');
    const [toneOfVoice, setToneOfVoice] = useState('دوستانه و صمیمی');
    const [callToAction, setCallToAction] = useState('همین حالا برای دریافت مشاوره از متخصصین ما و خرید این محصول از فروشگاه آنلاین بوف کالا اقدام کنید: www.buffkala.com');
    const [includeHashtags, setIncludeHashtags] = useState(true);

    // App state
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedRows, setProcessedRows] = useState<ProcessedRow[]>([]);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [copyButtonText, setCopyButtonText] = useState('کپی همه متن‌ها');

    const handleStartAutomation = useCallback(async () => {
        if (!googleSheetUrl || !promptTemplate) {
            setGlobalError('لطفاً آدرس گوگل شیت و الگوی اصلی متن را پر کنید.');
            return;
        }
        
        setIsProcessing(true);
        setGlobalError(null);
        setProcessedRows([]);

        try {
            let sheetData = await fetchAndParseSheet(googleSheetUrl);
            
            const selectedRows = parseRowSelection(rowSelection);
            if (selectedRows) {
                sheetData = sheetData.filter((_, index) => selectedRows.has(index + 1));
            }

            if (sheetData.length === 0) {
                setGlobalError('هیچ ردیفی برای پردازش یافت نشد. (ممکن است گوگل شیت خالی باشد یا شماره ردیف‌ها مطابقت نداشته باشد)');
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

            for (let i = 0; i < initialRows.length; i++) {
                const row = initialRows[i];
                try {
                    setProcessedRows(prev => prev.map(r => r.id === row.id ? { ...r, status: ProcessStatus.GENERATING } : r));
                    
                    const systemInstruction = `شما یک متخصص بازاریابی برای برند "بوف کالا" هستی. وظیفه شما نوشتن یک پست فروش جذاب و متقاعدکننده برای محصول زیر است. پست نهایی باید فقط به زبان فارسی و بدون هیچ‌گونه کاراکتر ستاره (*) باشد.`;
                    let userMessage = `
**اطلاعات پایه محصول:**
${promptTemplate}

**دستورالعمل‌های تولید محتوا:**
- **مخاطب هدف:** ${targetAudience}
- **لحن نوشته:** ${toneOfVoice}
- **ایموجی‌ها:** از ایموجی‌های مرتبط و جذاب در متن استفاده کن تا خوانایی و جذابیت آن بیشتر شود.
- **دعوت به اقدام (Call to Action):** در انتهای متن، مخاطب را به این کار دعوت کن: "${callToAction}"
${includeHashtags ? '- **هشتگ‌ها:** در انتهای متن، چند هشتگ مرتبط و پربازدید اضافه کن.' : ''}
                    `;
                    row.data.forEach((cell, i) => {
                        userMessage = userMessage.replace(new RegExp(`{col${i + 1}}`, 'g'), cell);
                    });

                    const rawText = await generateSalesText(userMessage, systemInstruction);
                    const generatedText = rawText.replace(/\*/g, ''); // Ensure no asterisks are in the final text

                    setProcessedRows(prev => prev.map(r => r.id === row.id ? { ...r, generatedText, status: ProcessStatus.COMPLETED } : r));

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
    }, [googleSheetUrl, promptTemplate, targetAudience, toneOfVoice, callToAction, includeHashtags, rowSelection]);

    const handleReset = () => {
        setGoogleSheetUrl('');
        setPromptTemplate('برای محصول {col1} با قیمت {col2} و ویژگی‌های {col3} یک متن فروش جذاب بنویس.');
        setRowSelection('');
        setTargetAudience('عموم مردم');
        setToneOfVoice('دوستانه و صمیمی');
        setCallToAction('همین حالا برای دریافت مشاوره از متخصصین ما و خرید این محصول از فروشگاه آنلاین بوف کالا اقدام کنید: www.buffkala.com');
        setIncludeHashtags(true);
        setIsProcessing(false);
        setProcessedRows([]);
        setGlobalError(null);
    };

    const handleDownloadCsv = () => {
        if (processedRows.length === 0 || !processedRows[0]?.data) {
            return;
        }

        const numColumns = processedRows[0].data.length;
        const headers = Array.from({ length: numColumns }, (_, i) => `ستون ${i + 1}`);
        headers.push('متن تولید شده');

        const csvRows = [
            headers.join(','),
            ...processedRows.map(row => {
                const data = row.data.map(field => `"${(field || '').replace(/"/g, '""')}"`);
                const generated = `"${(row.generatedText || '').replace(/"/g, '""')}"`;
                return [...data, generated].join(',');
            })
        ];

        const csvContent = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'نتایج_هوش_مصنوعی_بوف_کالا.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCopyResults = () => {
        if (processedRows.length === 0) return;

        const textsToCopy = processedRows
            .map(row => row.generatedText)
            .filter(Boolean)
            .join('\n\n');
        
        if (textsToCopy) {
            navigator.clipboard.writeText(textsToCopy).then(() => {
                setCopyButtonText('کپی شد!');
                setTimeout(() => setCopyButtonText('کپی همه متن‌ها'), 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                setCopyButtonText('خطا در کپی');
                setTimeout(() => setCopyButtonText('کپی همه متن‌ها'), 2000);
            });
        }
    };


    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <Header />
            <main className="max-w-4xl mx-auto p-4 md:p-6">
                <ConfigForm
                    googleSheetUrl={googleSheetUrl}
                    setGoogleSheetUrl={setGoogleSheetUrl}
                    promptTemplate={promptTemplate}
                    setPromptTemplate={setPromptTemplate}
                    rowSelection={rowSelection}
                    setRowSelection={setRowSelection}
                    targetAudience={targetAudience}
                    setTargetAudience={setTargetAudience}
                    toneOfVoice={toneOfVoice}
                    setToneOfVoice={setToneOfVoice}
                    callToAction={callToAction}
                    setCallToAction={setCallToAction}
                    includeHashtags={includeHashtags}
                    setIncludeHashtags={setIncludeHashtags}
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
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-cyan-400">نتایج پردازش</h2>
                             {!isProcessing && (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleCopyResults}
                                        className="py-2 px-5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition"
                                        aria-label="کپی همه متن‌های تولید شده"
                                    >
                                        {copyButtonText}
                                    </button>
                                    <button
                                        onClick={handleDownloadCsv}
                                        className="py-2 px-5 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition"
                                        aria-label="دانلود نتایج به صورت فایل CSV"
                                    >
                                        دانلود نتایج (CSV)
                                    </button>
                                </div>
                            )}
                        </div>
                        <ResultsTable rows={processedRows} />
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;