const CORS_PROXY = 'https://corsproxy.io/?';

/**
 * Fetches data from a public Google Sheet URL and parses it as CSV.
 * @param url The full URL of the Google Sheet.
 * @returns A promise that resolves to a 2D array of strings.
 */
export async function fetchAndParseSheet(url: string): Promise<string[][]> {
    try {
        const sheetIdMatch = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (!sheetIdMatch || !sheetIdMatch[1]) {
            throw new Error('آدرس گوگل شیت نامعتبر است. لطفاً لینک کامل را وارد کنید.');
        }
        const sheetId = sheetIdMatch[1];
        
        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;

        const response = await fetch(`${CORS_PROXY}${encodeURIComponent(csvUrl)}`);
        if (!response.ok) {
            throw new Error(`خطا در دسترسی به گوگل شیت. وضعیت: ${response.status}`);
        }

        const csvText = await response.text();
        return parseCsv(csvText);
    } catch (error) {
        console.error('Error fetching or parsing Google Sheet:', error);
        throw new Error('خطا در دریافت اطلاعات از گوگل شیت. از عمومی بودن و صحیح بودن لینک اطمینان حاصل کنید.');
    }
}

/**
 * A simple CSV parser.
 * Handles quoted fields. Does not handle quotes inside quoted fields.
 * @param text The CSV content as a string.
 * @returns A 2D array of strings.
 */
function parseCsv(text: string): string[][] {
    const rows = text.split(/\r?\n/).filter(row => row.trim() !== '');
    // remove header row
    if (rows.length > 0) {
        rows.shift();
    }
    return rows.map(row => {
        const result: string[] = [];
        let currentField = '';
        let inQuotes = false;
        for (let i = 0; i < row.length; i++) {
            const char = row[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(currentField.trim());
                currentField = '';
            } else {
                currentField += char;
            }
        }
        result.push(currentField.trim());
        return result;
    });
}