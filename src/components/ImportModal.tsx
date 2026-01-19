
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Papa from 'papaparse';
import { X, Upload, AlertTriangle, Check, Loader2, FileDown } from 'lucide-react';
import { usePosts } from '../context/PostContext';
import { type Post, type Platform, PLATFORMS } from '../types';
import { getImageUrl } from '../utils/imageHelper';
import { useLanguage } from '../context/LanguageContext';
import { useBrand } from '../context/BrandContext';

// Simple types for CSV row
interface CSVRow {
    date: string;
    time: string;
    platform: string;
    objective: string;
    status: string;
    isPaid: string; // 'TRUE' | 'FALSE' or 'Yes' | 'No'
    budget: string;
    copy: string;
    imageURL: string;
    imageDescription?: string;
    campaign_name?: string;
    ad_group_name?: string;
    ad_id?: string;
}

interface ImportModalProps {
    onClose: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ onClose }) => {
    const { t } = useLanguage();
    const { currentBrand } = useBrand();
    const [data, setData] = useState<Partial<Post>[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [encoding, setEncoding] = useState<'UTF-8' | 'ISO-8859-1'>('ISO-8859-1');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const downloadTemplate = () => {
        const headers = ['date', 'time', 'platform', 'objective', 'status', 'isPaid', 'budget', 'copy', 'imageURL', 'imageDescription', 'campaign_name', 'ad_group_name', 'ad_id'];
        const sampleRow = ['2024-01-01', '09:00', 'Instagram', 'Brand Awareness', 'Draft', 'FALSE', '0', 'Sample copy here', 'https://example.com/image.jpg', 'Modern design with blue tones', '', '', ''];

        // Create CSV content
        const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'content_plan_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | File) => {
        const file = e instanceof File ? e : e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        parseFile(file, encoding);
    };

    const parseFile = (file: File, enc: string) => {
        setLoading(true);
        setErrors([]);
        setData([]);

        Papa.parse<CSVRow>(file, {
            header: true,
            skipEmptyLines: true,
            encoding: enc, // Dynamic encoding
            complete: (results) => {
                const parsedPosts: Partial<Post>[] = [];
                const newErrors: string[] = [];

                results.data.forEach((row) => {
                    // v1.0.1 - Added encoding selector and detailed error reporting
                    // Logic: If the row is totally empty or missing critical identifiers, we might skip, 
                    // but we will be very relaxed as requested.
                    const dateValue = (row.date || new Date().toISOString().split('T')[0]).trim();
                    const platformValue = row.platform?.trim();
                    const copyValue = row.copy?.trim() || '';

                    // Normalize Date (Handle dd/mm/yyyy, mm/dd/yyyy, yyyy-mm-dd)
                    let normalizedDate = dateValue;
                    if (dateValue.includes('/')) {
                        const parts = dateValue.split('/');
                        if (parts.length === 3) {
                            if (parts[0].length === 4) {
                                normalizedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                            } else {
                                normalizedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                            }
                        }
                    }

                    // Normalize Platform
                    const normalizePlatform = (p: string | undefined): Platform => {
                        if (!p) return 'Instagram';
                        const match = PLATFORMS.find((known: string) => known.toLowerCase() === p.toLowerCase());
                        return match || 'Instagram';
                    };

                    parsedPosts.push({
                        date: normalizedDate,
                        time: row.time || '09:00',
                        platform: normalizePlatform(platformValue),
                        objective: row.objective || 'General',
                        status: (() => {
                            const s = (row.status || 'Draft').trim();
                            if (/^posted$/i.test(s)) return 'Published';
                            if (/^published$/i.test(s)) return 'Published';
                            if (/^scheduled$/i.test(s)) return 'Scheduled';
                            if (/^approved$/i.test(s)) return 'Approved';
                            return 'Draft';
                        })(),
                        isPaid: row.isPaid?.toLowerCase() === 'true' || row.isPaid?.toLowerCase() === 'yes',
                        budget: parseFloat(row.budget?.replace(/[^0-9.]/g, '') || '0') || 0,
                        copy: copyValue,
                        image: row.imageURL || undefined,
                        image_description: row.imageDescription || undefined,
                        brand: currentBrand?.name || 'Unassigned',
                        brandId: currentBrand?.id,
                        campaign_name: row.campaign_name?.trim() || undefined,
                        ad_group_name: row.ad_group_name?.trim() || undefined,
                        ad_id: row.ad_id?.trim() || undefined,
                        createdAt: Date.now()
                    });
                });

                if (results.errors.length > 0) {
                    results.errors.forEach(err => newErrors.push(`CSV Error: ${err.message}`));
                }

                setData(parsedPosts);
                setErrors(newErrors);
                setLoading(false);
            },
            error: (error) => {
                setErrors([`Parse Error: ${error.message} `]);
                setLoading(false);
            }
        });
    };

    const { bulkAddPosts } = usePosts();

    const handleSave = async () => {
        if (data.length === 0) return;
        setSaving(true);
        try {
            // @ts-ignore - ID is auto-incremented or handled by backend
            await bulkAddPosts(data as Omit<Post, 'id' | 'createdAt'>[]);
            alert(t('import.success_message', { count: data.length }));
            onClose();
        } catch (err: any) {
            console.error('Import Error Details:', err);
            const errorMessage = err.message || JSON.stringify(err);
            alert(`${t('import.error_saving')}\n\nDetalles del error: ${errorMessage}`);
        } finally {
            setSaving(false);
        }
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 w-full max-w-4xl h-[80vh] flex flex-col rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Upload className="w-5 h-5 text-blue-600" />
                        {t('import.title')}
                    </h2>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onClose();
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden p-6 flex flex-col">
                    {!currentBrand ? (
                        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-yellow-300 dark:border-yellow-700 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
                            <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
                            <p className="text-lg font-medium text-yellow-700 dark:text-yellow-300">
                                {t('import.no_brand_selected') || 'No brand selected'}
                            </p>
                            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                                {t('import.select_brand_first') || 'Please select a brand before importing posts'}
                            </p>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 relative">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
                            />
                            {loading ? (
                                <Loader2 className="w-10 h-10 text-blue-500 animate-spin relative z-10" />
                            ) : (
                                <>
                                    <Upload className="w-12 h-12 text-gray-400 mb-4 relative z-10" />
                                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300 relative z-10">
                                        {t('import.drag')}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2 relative z-10">
                                        {t('import.columns')}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); downloadTemplate(); }}
                                        className="mt-6 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline z-10 relative cursor-pointer"
                                    >
                                        <FileDown className="w-4 h-4" /> {t('import.download_template')}
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Encoding Selector */}
                            <div className="mb-4 flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
                                <div className="text-sm text-blue-700 dark:text-blue-300">
                                    <span className="font-bold">¿Los caracteres se ven bien?</span> Si ves símbolos extraños, cambia la codificación:
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            const newEnc = 'UTF-8';
                                            setEncoding(newEnc);
                                            if (selectedFile) parseFile(selectedFile, newEnc);
                                        }}
                                        className={`px-3 py-1 text-xs font-bold rounded ${encoding === 'UTF-8' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 border border-gray-200 dark:border-gray-700'}`}
                                    >
                                        UTF-8
                                    </button>
                                    <button
                                        onClick={() => {
                                            const newEnc = 'ISO-8859-1';
                                            setEncoding(newEnc);
                                            if (selectedFile) parseFile(selectedFile, newEnc);
                                        }}
                                        className={`px-3 py-1 text-xs font-bold rounded ${encoding === 'ISO-8859-1' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 border border-gray-200 dark:border-gray-700'}`}
                                    >
                                        Excel (Windows)
                                    </button>
                                </div>
                            </div>
                            {errors.length > 0 && (
                                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg overflow-y-auto max-h-32">
                                    <h3 className="font-bold text-red-700 dark:text-red-400 flex items-center gap-2 mb-2">
                                        <AlertTriangle className="w-4 h-4" /> {t('import.errors')}
                                    </h3>
                                    <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-300">
                                        {errors.map((err, i) => <li key={i}>{err}</li>)}
                                    </ul>
                                </div>
                            )}

                            <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase font-semibold text-gray-500 sticky top-0">
                                        <tr>
                                            <th className="p-3">{t('form.date')}</th>
                                            <th className="p-3">{t('form.platform')}</th>
                                            <th className="p-3">{t('form.image')}</th>
                                            <th className="p-3">{t('form.image_description')}</th>
                                            <th className="p-3">{t('form.copy')}</th>
                                            <th className="p-3">{t('form.status')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {data.map((post, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <td className="p-3 whitespace-nowrap">{post.date}</td>
                                                <td className="p-3">
                                                    <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium">
                                                        {post.platform}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    {post.image ? (
                                                        <img src={getImageUrl(post.image)} alt="Preview" className="w-8 h-8 rounded object-cover" />
                                                    ) : <span className="text-gray-400">-</span>}
                                                </td>
                                                <td className="p-3 max-w-xs truncate text-gray-600 dark:text-gray-400">
                                                    {post.image_description || <span className="text-gray-400">-</span>}
                                                </td>
                                                <td className="p-3 max-w-xs truncate text-gray-600 dark:text-gray-400">
                                                    {post.copy}
                                                </td>
                                                <td className="p-3">{post.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 flex justify-end gap-3">
                                <button
                                    onClick={() => setData([])}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded font-medium transition-colors"
                                >
                                    {t('import.back')}
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || errors.length > 0}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    {t('import.import_btn')} ({data.length})
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};
