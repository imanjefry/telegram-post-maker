import React from 'react';
import type { ProcessedRow } from '../types';
import { ProcessStatus } from '../types';
import { CheckCircleIcon, XCircleIcon, ClockIcon, PaperAirplaneIcon, SparklesIcon } from './icons';

interface ResultsTableProps {
    rows: ProcessedRow[];
}

// Fix: Use React.ReactElement instead of JSX.Element to avoid namespace errors.
const statusIndicator: Record<ProcessStatus, { icon: React.ReactElement; color: string; }> = {
    [ProcessStatus.PENDING]: { icon: <ClockIcon />, color: 'text-gray-400' },
    [ProcessStatus.GENERATING]: { icon: <SparklesIcon />, color: 'text-yellow-400' },
    [ProcessStatus.POSTING]: { icon: <PaperAirplaneIcon />, color: 'text-blue-400' },
    [ProcessStatus.COMPLETED]: { icon: <CheckCircleIcon />, color: 'text-green-400' },
    [ProcessStatus.ERROR]: { icon: <XCircleIcon />, color: 'text-red-400' },
};

export const ResultsTable: React.FC<ResultsTableProps> = ({ rows }) => {
    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">ردیف</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">داده‌های ورودی</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">متن تولید شده</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">وضعیت</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800/60 divide-y divide-gray-700">
                        {rows.map((row, index) => (
                            <tr key={row.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{row.data.join(', ')}</td>
                                <td className="px-6 py-4 text-sm text-gray-200 max-w-sm">
                                    <p className="truncate" title={row.generatedText}>{row.generatedText || '-'}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className={`flex items-center gap-2 ${statusIndicator[row.status].color}`}>
                                        {statusIndicator[row.status].icon}
                                        <span>{row.status}</span>
                                    </div>
                                    {row.status === ProcessStatus.ERROR && row.error && (
                                        <p className="text-xs text-red-400 mt-1" title={row.error}>
                                            {row.error.length > 30 ? `${row.error.substring(0, 30)}...` : row.error}
                                        </p>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};