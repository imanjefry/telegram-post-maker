// This file requires the Google API script to be loaded in the main HTML.
// Fix: Add a declaration for the Google API client library (gapi) loaded from a script tag.
declare const gapi: any;

/**
 * Extracts the spreadsheet ID from a standard Google Sheet URL.
 * @param url The full URL of the Google Sheet.
 * @returns The spreadsheet ID.
 */
export function getSpreadsheetIdFromUrl(url: string): string {
    const match = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match || !match[1]) {
        throw new Error('آدرس گوگل شیت نامعتبر است. لطفاً لینک کامل را وارد کنید.');
    }
    return match[1];
}

/**
 * Fetches the metadata for a spreadsheet to find its sheets.
 * @param spreadsheetId The ID of the spreadsheet.
 * @returns The spreadsheet metadata.
 */
async function getSheetMetadata(spreadsheetId: string) {
    try {
        const response = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId,
        });
        return response.result;
    } catch (err: any) {
        throw new Error(`خطا در دریافت اطلاعات شیت: ${err.result?.error?.message || 'از دسترسی به شیت اطمینان حاصل کنید.'}`);
    }
}

/**
 * Reads all data from the first sheet of a spreadsheet.
 * @param spreadsheetId The ID of the spreadsheet.
 * @returns An object containing the sheet values, range, and name.
 */
export async function readSheetData(spreadsheetId: string): Promise<{ values: string[][], range: string, sheetName: string }> {
    const metadata = await getSheetMetadata(spreadsheetId);
    if (!metadata.sheets || metadata.sheets.length === 0) {
        throw new Error("هیچ شیتی در این صفحه گسترده یافت نشد.");
    }
    const firstSheet = metadata.sheets[0];
    const sheetName = firstSheet.properties.title;
    
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId,
            range: sheetName,
        });

        const values = response.result.values || [];
        if (values.length > 0) {
            values.shift(); // Remove header row
        }

        return { values, range: response.result.range, sheetName };
    } catch (err: any) {
         throw new Error(`خطا در خواندن اطلاعات از شیت: ${err.result?.error?.message || 'از دسترسی به شیت اطمینان حاصل کنید.'}`);
    }
}

/**
 * Writes data to a new column in a Google Sheet.
 * @param spreadsheetId The ID of the spreadsheet.
 * @param sheetName The name of the sheet to write to.
 * @param startColumn The zero-based index of the column to start writing to.
 * @param data A 2D array of data to write.
 */
export async function writeDataToSheet(spreadsheetId: string, sheetName: string, startColumn: number, data: string[][]): Promise<void> {
    if (data.length === 0) return;

    // Helper to convert a number to a column letter (A, B, C...)
    const toColumnName = (num: number) => {
        let name = '', rem;
        while (num >= 0) {
            rem = num % 26;
            name = String.fromCharCode(rem + 65) + name;
            num = Math.floor(num / 26) - 1;
        }
        return name;
    };
    
    const startColumnLetter = toColumnName(startColumn);
    // Write header for the new column first
    const headerRange = `${sheetName}!${startColumnLetter}1`;
    try {
        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId,
            range: headerRange,
            valueInputOption: 'RAW',
            resource: {
                values: [['متن تولید شده توسط هوش مصنوعی']],
            },
        });
    } catch (err: any) {
         throw new Error(`خطا در نوشتن سرستون جدید: ${err.result?.error?.message}`);
    }


    // Write the data starting from the second row
    const dataRange = `${sheetName}!${startColumnLetter}2`;
    try {
        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId,
            range: dataRange,
            valueInputOption: 'RAW',
            resource: {
                values: data,
            },
        });
    } catch (err: any) {
        throw new Error(`خطا در ذخیره اطلاعات در شیت: ${err.result?.error?.message}`);
    }
}
