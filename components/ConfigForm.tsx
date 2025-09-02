import React from 'react';
import { SpinnerIcon } from './icons';

interface ConfigFormProps {
    googleSheetUrl: string;
    setGoogleSheetUrl: (value: string) => void;
    promptTemplate: string;
    setPromptTemplate: (value: string) => void;
    rowSelection: string;
    setRowSelection: (value: string) => void;
    targetAudience: string;
    setTargetAudience: (value: string) => void;
    toneOfVoice: string;
    setToneOfVoice: (value: string) => void;
    callToAction: string;
    setCallToAction: (value: string) => void;
    includeHashtags: boolean;
    setIncludeHashtags: (value: boolean) => void;
    
    isProcessing: boolean;
    onSubmit: () => void;
    onReset: () => void;
}

const inputClass = "w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition";
const labelClass = "block text-sm font-medium text-gray-300 mb-2";

export const ConfigForm: React.FC<ConfigFormProps> = ({
    googleSheetUrl, setGoogleSheetUrl,
    promptTemplate, setPromptTemplate,
    rowSelection, setRowSelection,
    targetAudience, setTargetAudience,
    toneOfVoice, setToneOfVoice,
    callToAction, setCallToAction,
    includeHashtags, setIncludeHashtags,
    isProcessing, onSubmit, onReset
}) => {
    return (
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-xl">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6 border-b border-gray-700 pb-4">۱. تنظیمات اولیه</h2>
            <div className="space-y-6">
                <div>
                    <label htmlFor="googleSheetUrl" className={labelClass}>لینک گوگل شیت (باید عمومی باشد)</label>
                    <input
                        type="url"
                        id="googleSheetUrl"
                        value={googleSheetUrl}
                        onChange={(e) => setGoogleSheetUrl(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                        className={inputClass}
                        disabled={isProcessing}
                        aria-required="true"
                    />
                </div>
                 <div>
                    <label htmlFor="rowSelection" className={labelClass}>
                        پردازش ردیف‌های خاص (اختیاری)
                    </label>
                    <input
                        type="text"
                        id="rowSelection"
                        value={rowSelection}
                        onChange={(e) => setRowSelection(e.target.value)}
                        placeholder="مثال: 1, 3, 8-5 (خالی گذاشتن برای پردازش همه)"
                        className={`${inputClass} ltr`}
                        disabled={isProcessing}
                        aria-describedby="rowSelectionHelp"
                    />
                    <p id="rowSelectionHelp" className="text-xs text-gray-400 mt-2">
                        شماره ردیف‌ها را با کاما (,) جدا کنید و برای مشخص کردن بازه از خط تیره (-) استفاده کنید.
                    </p>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-2xl font-bold text-cyan-400 mb-6 border-b border-gray-700 pb-4">۲. بهینه‌سازی پرامپت هوش مصنوعی</h2>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="promptTemplate" className={labelClass}>
                            الگوی اصلی متن (پرامپت)
                        </label>
                        <textarea
                            id="promptTemplate"
                            value={promptTemplate}
                            onChange={(e) => setPromptTemplate(e.target.value)}
                            rows={3}
                            className={inputClass}
                            disabled={isProcessing}
                            style={{direction: 'rtl'}}
                            aria-required="true"
                        ></textarea>
                        <p className="text-xs text-gray-400 mt-2">
                            {"از `{col1}`، `{col2}` و... برای جایگذاری داده‌های هر ستون از گوگل شیت استفاده کنید."}
                        </p>
                         <div className="bg-gray-700/50 p-4 rounded-lg mt-4 border border-gray-600">
                            <p className="text-sm font-semibold text-gray-200 mb-3">
                                راهنمای ساختار گوگل شیت:
                            </p>
                            <p className="text-xs text-gray-400 mb-3">
                                برنامه، داده‌ها را ستون به ستون از شیت شما می‌خواند. می‌توانید از placeholder ها برای جایگذاری این داده‌ها در پرامپت خود استفاده کنید:
                            </p>
                            <div className="text-xs space-y-2">
                                <p><code className="bg-gray-800 text-cyan-400 px-1.5 py-0.5 rounded">{'{col1}'}</code> به داده‌های <strong>ستون اول</strong> اشاره دارد.</p>
                                <p><code className="bg-gray-800 text-cyan-400 px-1.5 py-0.5 rounded">{'{col2}'}</code> به داده‌های <strong>ستون دوم</strong> اشاره دارد و الی آخر.</p>
                            </div>
                            <p className="text-sm font-semibold text-gray-200 mt-4 mb-2">مثال:</p>
                            <table className="w-full text-xs text-left text-gray-300 rounded-md overflow-hidden">
                                <thead className="bg-gray-600/50">
                                    <tr>
                                        <th className="px-2 py-1 font-medium">ستون ۱ (نام محصول)</th>
                                        <th className="px-2 py-1 font-medium">ستون ۲ (قیمت)</th>
                                        <th className="px-2 py-1 font-medium">ستون ۳ (ویژگی‌ها)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-700/30">
                                    <tr>
                                        <td className="px-2 py-1 border-t border-gray-600">کفش ورزشی نایکی</td>
                                        <td className="px-2 py-1 border-t border-gray-600">۲,۵۰۰,۰۰۰ تومان</td>
                                        <td className="px-2 py-1 border-t border-gray-600">سبک، مناسب دویدن</td>
                                    </tr>
                                </tbody>
                            </table>
                            <p className="text-xs text-gray-400 mt-3">
                                با این ساختار، پرامپت پیش‌فرض به این شکل ترجمه می‌شود: "برای محصول <strong>کفش ورزشی نایکی</strong> با قیمت <strong>۲,۵۰۰,۰۰۰ تومان</strong> و ویژگی‌های <strong>سبک، مناسب دویدن</strong> یک متن فروش جذاب بنویس."
                            </p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div>
                            <label htmlFor="targetAudience" className={labelClass}>مخاطب هدف</label>
                             <input
                                type="text"
                                id="targetAudience"
                                value={targetAudience}
                                onChange={(e) => setTargetAudience(e.target.value)}
                                placeholder="مثال: مادران جوان، ورزشکاران"
                                className={inputClass}
                                disabled={isProcessing}
                            />
                        </div>
                        <div>
                             <label htmlFor="toneOfVoice" className={labelClass}>لحن نوشته</label>
                             <select id="toneOfVoice" value={toneOfVoice} onChange={e => setToneOfVoice(e.target.value)} className={inputClass} disabled={isProcessing}>
                                 <option>دوستانه و صمیمی</option>
                                 <option>رسمی و حرفه‌ای</option>
                                 <option>هیجان‌زده و پرانرژی</option>
                                 <option>متقاعدکننده و قاطع</option>
                                 <option>طنز و شوخ‌طبعانه</option>
                             </select>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="callToAction" className={labelClass}>دعوت به اقدام (Call to Action)</label>
                        <input
                            type="text"
                            id="callToAction"
                            value={callToAction}
                            onChange={(e) => setCallToAction(e.target.value)}
                            placeholder="مثال: برای خرید کلیک کنید، همین حالا سفارش دهید"
                            className={inputClass}
                            disabled={isProcessing}
                        />
                    </div>
                    <div className="flex items-center pt-2">
                        <input
                            type="checkbox"
                            id="includeHashtags"
                            checked={includeHashtags}
                            onChange={(e) => setIncludeHashtags(e.target.checked)}
                            disabled={isProcessing}
                            className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-cyan-500 focus:ring-cyan-600"
                        />
                        <label htmlFor="includeHashtags" className="ml-2 text-sm text-gray-300">افزودن خودکار هشتگ‌های مرتبط</label>
                    </div>
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