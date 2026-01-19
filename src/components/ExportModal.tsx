
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Papa from 'papaparse';
import { X, FileDown, Calendar, Filter, Loader2 } from 'lucide-react';
import { usePosts } from '../context/PostContext';
import { useLanguage } from '../context/LanguageContext';
import { PLATFORMS } from '../types';

interface ExportModalProps {
    onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ onClose }) => {
    const { t } = useLanguage();
    const { posts } = usePosts();

    // Default range (current month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(firstDay);
    const [endDate, setEndDate] = useState(lastDay);
    const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = () => {
        setIsExporting(true);

        // Filter posts
        const filteredPosts = posts.filter(p => {
            const dateMatch = p.date >= startDate && p.date <= endDate;
            const platformMatch = selectedPlatform === 'all' || p.platform === selectedPlatform;
            return dateMatch && platformMatch;
        });

        // Map to CSV structure (matching ImportModal)
        const csvData = filteredPosts.map(p => ({
            id: p.id,
            date: p.date,
            time: p.time,
            platform: p.platform,
            objective: p.objective,
            status: p.status,
            isPaid: p.isPaid ? 'TRUE' : 'FALSE',
            budget: p.budget,
            copy: p.copy,
            imageURL: p.image || '',
            imageDescription: p.image_description || '',
            campaign_name: p.campaign_name || '',
            ad_group_name: p.ad_group_name || '',
            ad_id: p.ad_id || ''
        }));

        // Generate CSV
        const csv = Papa.unparse(csvData);

        // Final export uses UTF-8 with BOM for Excel compatibility
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        const fileName = `content_export_${startDate}_to_${endDate}.csv`;
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setIsExporting(false);
        onClose();
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
                        <FileDown className="w-5 h-5 text-blue-600" />
                        {t('import.export_for_edit')}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('export.select_range')}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                                <Calendar size={12} /> {t('export.start_date')}
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                                <Calendar size={12} /> {t('export.end_date')}
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                            <Filter size={12} /> {t('filter.platform')}
                        </label>
                        <select
                            value={selectedPlatform}
                            onChange={(e) => setSelectedPlatform(e.target.value)}
                            className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">{t('export.platform_all')}</option>
                            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
                    >
                        {t('btn.cancel')}
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex-1 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown size={18} />}
                        {t('import.export_for_edit')}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
