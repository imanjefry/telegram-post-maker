
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="bg-gray-900/80 backdrop-blur-sm shadow-lg shadow-cyan-500/10">
            <div className="max-w-4xl mx-auto py-4 px-4 md:px-6">
                <h1 className="text-3xl font-bold text-center">
                    <span className="text-gray-100">اتوماسیون تولید محتوا با </span>
                    <span className="text-cyan-400">هوش مصنوعی</span>
                </h1>
                <p className="text-center text-gray-400 mt-2">
                    ایجاد و ارسال پست‌های فروش تلگرام، مستقیماً از گوگل شیت
                </p>
            </div>
        </header>
    );
};
