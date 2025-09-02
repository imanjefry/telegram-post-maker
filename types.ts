
export enum ProcessStatus {
    PENDING = 'در انتظار',
    GENERATING = 'در حال تولید متن',
    POSTING = 'در حال ارسال به تلگرام',
    COMPLETED = 'انجام شد',
    ERROR = 'خطا'
}

export interface SheetRow {
    id: number;
    data: string[];
}

export interface ProcessedRow extends SheetRow {
    generatedText: string;
    status: ProcessStatus;
    error?: string;
}
