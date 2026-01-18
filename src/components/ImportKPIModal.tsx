import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';
import { db } from '../db';
import { useBrand } from '../context/BrandContext';
import type { KPIData } from '../types';

// Interface removed because unused

export const ImportKPIModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { currentBrand } = useBrand();
    const [file, setFile] = useState<File | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);
    const [preview, setPreview] = useState<any[]>([]);
    const [step, setStep] = useState<'upload' | 'map' | 'confirm'>('upload');
    const [mappings, setMappings] = useState<Record<string, string>>({});
    const [importing, setImporting] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const kpiFields = [
        { category: 'Awareness', fields: ['reach', 'impressions', 'soV', 'growthRate'] },
        { category: 'Engagement', fields: ['likes', 'comments', 'shares', 'saves', 'engagementRate', 'sentiment'] },
        { category: 'Performance', fields: ['clicks', 'ctr', 'conversions', 'bounceRate', 'leads'] },
        { category: 'Financials', fields: ['totalSpend', 'cpc', 'cpm', 'cpl', 'roas', 'cac'] }
    ];

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        Papa.parse(selectedFile, {
            header: true,
            preview: 5,
            complete: (results) => {
                setHeaders(results.meta.fields || []);
                setPreview(results.data);
                setStep('map');

                // Auto-map common column names
                const autoMappings: Record<string, string> = {};
                results.meta.fields?.forEach(col => {
                    const lower = col.toLowerCase().replace(/[^a-z]/g, '');
                    if (lower.includes('reach')) autoMappings[col] = 'awareness.reach';
                    if (lower.includes('impression')) autoMappings[col] = 'awareness.impressions';
                    if (lower.includes('like')) autoMappings[col] = 'engagement.likes';
                    if (lower.includes('comment')) autoMappings[col] = 'engagement.comments';
                    if (lower.includes('share')) autoMappings[col] = 'engagement.shares';
                    if (lower.includes('save')) autoMappings[col] = 'engagement.saves';
                    if (lower.includes('engagementrate') || lower.includes('er')) autoMappings[col] = 'engagement.engagementRate';
                    if (lower.includes('click')) autoMappings[col] = 'performance.clicks';
                    if (lower.includes('ctr')) autoMappings[col] = 'performance.ctr';
                    if (lower.includes('conversion')) autoMappings[col] = 'performance.conversions';
                    if (lower.includes('spend') || lower.includes('cost')) autoMappings[col] = 'financials.totalSpend';
                    if (lower.includes('cpc')) autoMappings[col] = 'financials.cpc';
                    if (lower.includes('cpm')) autoMappings[col] = 'financials.cpm';
                    if (lower.includes('roas')) autoMappings[col] = 'financials.roas';
                    if (lower.includes('month') || lower.includes('date')) autoMappings[col] = 'month';
                });
                setMappings(autoMappings);
            }
        });
    };

    const handleImport = async () => {
        if (!file || !currentBrand) return;

        setImporting(true);
        Papa.parse(file, {
            header: true,
            complete: async (results) => {
                const kpiRecords: KPIData[] = [];

                results.data.forEach((row: any) => {
                    const kpi: any = {
                        id: crypto.randomUUID(),
                        brandId: currentBrand.id,
                        month: '',
                        awareness: { reach: 0, impressions: 0, soV: 0, growthRate: 0 },
                        engagement: { likes: 0, comments: 0, shares: 0, saves: 0, engagementRate: 0, sentiment: 0 },
                        performance: { clicks: 0, ctr: 0, conversions: 0, bounceRate: 0, leads: 0 },
                        financials: { totalSpend: 0, cpc: 0, cpm: 0, cpl: 0, roas: 0, cac: 0 }
                    };

                    Object.entries(mappings).forEach(([csvCol, kpiPath]) => {
                        const value = row[csvCol];
                        if (value === undefined || value === '') return;

                        if (kpiPath === 'month') {
                            kpi.month = value;
                        } else {
                            const [category, field] = kpiPath.split('.');
                            if (kpi[category] && field) {
                                kpi[category][field] = parseFloat(value) || 0;
                            }
                        }
                    });

                    if (kpi.month) kpiRecords.push(kpi as KPIData);
                });

                await db.kpis.bulkAdd(kpiRecords);
                setImporting(false);
                onClose();
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <Upload className="text-blue-500" /> Import KPI Data
                    </h2>
                    <button onClick={onClose}><X className="dark:text-white" /></button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {step === 'upload' && (
                        <div className="text-center py-12">
                            <input type="file" ref={fileRef} hidden accept=".csv,.xlsx" onChange={handleFileSelect} />
                            <div
                                onClick={() => fileRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 cursor-pointer hover:border-blue-500 transition-colors"
                            >
                                <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <p className="text-lg font-medium dark:text-gray-200">Click to upload CSV/Excel</p>
                                <p className="text-sm text-gray-500 mt-2">Supported: CSV files with KPI metrics</p>
                            </div>
                        </div>
                    )}

                    {step === 'map' && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                                    <CheckCircle size={16} /> Auto-mapping detected! Review and adjust mappings below.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {headers.map(header => (
                                    <div key={header} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                                        <label className="block text-xs font-bold text-gray-500 mb-2">{header}</label>
                                        <select
                                            value={mappings[header] || ''}
                                            onChange={e => setMappings({ ...mappings, [header]: e.target.value })}
                                            className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm dark:text-white"
                                        >
                                            <option value="">-- Skip --</option>
                                            <option value="month">Month (YYYY-MM)</option>
                                            {kpiFields.map(cat => (
                                                <optgroup key={cat.category} label={cat.category}>
                                                    {cat.fields.map(field => (
                                                        <option key={field} value={`${cat.category.toLowerCase()}.${field}`}>
                                                            {field}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                <h4 className="font-bold text-sm mb-2 dark:text-white">Preview (First 3 rows)</h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                                {headers.map(h => <th key={h} className="p-2 text-left dark:text-gray-300">{h}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {preview.slice(0, 3).map((row, i) => (
                                                <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                                                    {headers.map(h => <td key={h} className="p-2 dark:text-gray-400">{row[h]}</td>)}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
                    >
                        Cancel
                    </button>
                    {step === 'map' && (
                        <button
                            onClick={handleImport}
                            disabled={importing || !mappings['month']}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {importing ? 'Importing...' : 'Import KPIs'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
