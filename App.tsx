// Fix: Add declarations for Google API and Identity Services client libraries loaded from script tags.
declare const gapi: any;
declare const google: any;

import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ConfigForm } from './components/ConfigForm';
import { ResultsTable } from './components/ResultsTable';
import { getSpreadsheetIdFromUrl, readSheetData, writeDataToSheet } from './services/googleSheetsService';
import { generateSalesText } from './services/geminiService';
import type { ProcessedRow } from './types';
import { ProcessStatus } from './types';

// These must be set in the environment
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

let tokenClient: google.accounts.oauth2.TokenClient;

const App: React.FC = () => {
    const [googleSheetUrl, setGoogleSheetUrl] = useState('');
    const [geminiPrompt, setGeminiPrompt] = useState('برای محصول {col1} با قیمت {col2} و ویژگی‌های {col3} یک متن فروش جذاب بنویس.');
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedRows, setProcessedRows] = useState<ProcessedRow[]>([]);
    const [globalError, setGlobalError] = useState<string | null>(null);

    const [isSignedIn, setIsSignedIn] = useState(false);
    const [isGapiReady, setIsGapiReady] = useState(false);

    useEffect(() => {
        const gapiLoaded = () => {
            if (!GOOGLE_API_KEY) {
                setGlobalError("کلید API گوگل یافت نشد.");
                return;
            }
            gapi.load('client', initializeGapiClient);
        };

        const initializeGapiClient = async () => {
            try {
                await gapi.client.init({
                    apiKey: GOOGLE_API_KEY,
                    discoveryDocs: [DISCOVERY_DOC],
                });
                setIsGapiReady(true);
            } catch (error) {
                setGlobalError("خطا در راه‌اندازی Google Sheets API.");
            }
        };

        const gisLoaded = () => {
            if (!GOOGLE_CLIENT_ID) {
                setGlobalError("شناسه کاربری گوگل (Client ID) یافت نشد.");
                return;
            }
            tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: SCOPES,
                callback: (tokenResponse) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        setIsSignedIn(true);
                    } else {
                        setGlobalError('خطا در دریافت توکن دسترسی گوگل.');
                        setIsSignedIn(false);
                    }
                },
            });
        };

        const checkScripts = setInterval(() => {
            if (window.gapi && window.google) {
                clearInterval(checkScripts);
                gapiLoaded();
                gisLoaded();
            }
        }, 100);

        return () => clearInterval(checkScripts);
    }, []);

    const handleSignIn = () => {
        if (tokenClient) {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        }
    };

    const handleSignOut = () => {
        const token = gapi.client.getToken();
        if (token !== null) {
            google.accounts.oauth2.revoke(token.access_token, () => {
                gapi.client.setToken(null);
                setIsSignedIn(false);
            });
        }
    };
    
    const handleStartAutomation = useCallback(async () => {
        if (!googleSheetUrl || !geminiPrompt) {
            setGlobalError('لطفاً تمام فیلدها را پر کنید.');
            return;
        }

        setIsProcessing(true);
        setGlobalError(null);
        setProcessedRows([]);

        let spreadsheetId: string;
        try {
            spreadsheetId = getSpreadsheetIdFromUrl(googleSheetUrl);
        } catch (error) {
            setGlobalError(error instanceof Error ? error.message : 'URL نامعتبر است.');
            setIsProcessing(false);
            return;
        }

        try {
            const { values: sheetData, sheetName } = await readSheetData(spreadsheetId);
            if (sheetData.length === 0) {
                setGlobalError('گوگل شیت خالی است یا قابل دسترسی نیست.');
                setIsProcessing(false);
                return;
            }
            
            const numColumns = sheetData.length > 0 ? sheetData[0].length : 0;

            const initialRows: ProcessedRow[] = sheetData.map((row, index) => ({
                id: index,
                data: row,
                generatedText: '',
                status: ProcessStatus.PENDING,
            }));
            setProcessedRows(initialRows);

            const generatedTextsForSheet: string[][] = [];

            for (const row of initialRows) {
                let generatedText = '';
                try {
                    setProcessedRows(prev => prev.map(r => r.id === row.id ? { ...r, status: ProcessStatus.GENERATING } : r));
                    
                    let prompt = geminiPrompt;
                    row.data.forEach((cell, i) => {
                        prompt = prompt.replace(new RegExp(`{col${i + 1}}`, 'g'), cell);
                    });

                    generatedText = await generateSalesText(prompt);
                    setProcessedRows(prev => prev.map(r => r.id === row.id ? { ...r, generatedText, status: ProcessStatus.GENERATED } : r));
                    
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    setProcessedRows(prev => prev.map(r => r.id === row.id ? { ...r, status: ProcessStatus.ERROR, error: errorMessage } : r));
                } finally {
                    generatedTextsForSheet.push([generatedText]); // Add generated text or empty string on error
                }
            }
            
            // 2. Write all results back to the sheet
            setProcessedRows(prev => prev.map(r => r.status === ProcessStatus.GENERATED ? { ...r, status: ProcessStatus.WRITING } : r));
            await writeDataToSheet(spreadsheetId, sheetName, numColumns, generatedTextsForSheet);
            setProcessedRows(prev => prev.map(r => r.status === ProcessStatus.WRITING ? { ...r, status: ProcessStatus.SAVED } : r));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'یک خطای ناشناخته رخ داد.';
            setGlobalError(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    }, [googleSheetUrl, geminiPrompt, isSignedIn]);

    const handleReset = () => {
        setGoogleSheetUrl('');
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
                    geminiPrompt={geminiPrompt}
                    setGeminiPrompt={setGeminiPrompt}
                    isProcessing={isProcessing}
                    onSubmit={handleStartAutomation}
                    onReset={handleReset}
                    isReady={isGapiReady && !!GOOGLE_CLIENT_ID}
                    isSignedIn={isSignedIn}
                    onSignIn={handleSignIn}
                    onSignOut={handleSignOut}
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
                        </div>
                        <ResultsTable rows={processedRows} />
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
