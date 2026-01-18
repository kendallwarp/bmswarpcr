import React, { useState, useRef } from 'react';
import { usePosts } from '../context/PostContext';
import { compressImage } from '../utils/compressor';
import { type Platform, type PostStatus, PLATFORMS } from '../types';
import { Upload, X, Plus, Download, RotateCcw, Trash2, Calendar as CalendarIcon, LayoutDashboard, Settings } from 'lucide-react';
import { exportBackup, restoreBackup, clearAllData } from '../utils/backupService';
import { useLanguage } from '../context/LanguageContext';
import { BrandSelector } from './BrandSelector';
import { useBrand } from '../context/BrandContext';

const platforms = PLATFORMS;

interface SidebarProps {
    currentView: 'calendar' | 'dashboard' | 'settings';
    setView: (v: 'calendar' | 'dashboard' | 'settings') => void;
    isOpen?: boolean;
    onClose?: () => void;
    onShowImport: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen = false, onClose, onShowImport }) => {
    const { currentBrand } = useBrand();
    const { addPost } = usePosts();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);

    // Form State
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('09:00');
    const [platform, setPlatform] = useState<Platform>('Instagram');
    // Brand is now handled by Global Context
    const [status, setStatus] = useState<PostStatus>('Draft');
    const [objective, setObjective] = useState('');
    const [copy, setCopy] = useState('');
    const [isPaid, setIsPaid] = useState(false);
    const [budget, setBudget] = useState<number>(0);
    const [image, setImage] = useState<string | null>(null);

    // Campaign fields
    const [campaignName, setCampaignName] = useState('');
    const [adGroupName, setAdGroupName] = useState('');
    const [adId, setAdId] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLoading(true);
            try {
                const compressed = await compressImage(e.target.files[0]);
                setImage(compressed);
            } catch (err) {
                console.error('Compression failed', err);
                alert(t('alert.image_failed'));
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!objective || !copy) return alert(t('alert.fill_required'));

        try {
            await addPost({
                date,
                time,
                platform,
                objective,
                status,
                isPaid,
                budget: isPaid ? Number(budget) : 0,
                copy,
                image: image || undefined,
                brandId: currentBrand?.id,
                // Strategy fields
                campaign_name: campaignName || undefined,
                ad_group_name: adGroupName || undefined,
                ad_id: adId || undefined
            });

            // Reset form
            setObjective('');
            setCopy('');
            setImage(null);
            setCampaignName('');
            setAdGroupName('');
            setAdId('');
            alert(t('alert.post_saved'));
        } catch (error) {
            console.error('Failed to save post', error);
            alert(t('alert.save_failed'));
        }
    };

    return (
        <div
            className={`
                fixed md:relative inset-y-0 left-0 z-40 w-80 
                bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
                h-full flex flex-col shadow-xl 
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}
        >
            <div className="p-6 pb-2 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2 rounded-xl shadow-lg">
                            <CalendarIcon className="text-white w-6 h-6" />
                        </div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300">
                            Warp CR
                        </h1>
                    </div>
                    {/* Cloud Close Button for Mobile */}
                    <button
                        onClick={onClose}
                        className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                        <X size={20} />
                    </button>
                </div>

                <BrandSelector />

                <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mb-4">
                    <button
                        onClick={() => setView('calendar')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold transition-all ${currentView === 'calendar' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-white' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    >
                        <CalendarIcon size={14} /> Calendar
                    </button>
                    <button
                        onClick={() => setView('dashboard')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold transition-all ${currentView === 'dashboard' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-white' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    >
                        <LayoutDashboard size={14} /> Dashboard
                    </button>
                    <button
                        onClick={() => setView('settings')}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-xs font-bold transition-all ${currentView === 'settings' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-white' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    >
                        <Settings size={13} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pt-2">

                {currentView === 'settings' ? (
                    <div className="text-center text-gray-400 mt-10">
                        <Settings className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Configure API connections in the main panel.</p>
                    </div>
                ) : currentView === 'dashboard' ? (
                    <div className="text-center text-gray-400 mt-10">
                        <LayoutDashboard className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Manage KPIs and view insights in the main panel.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
                                <Plus size={20} className="text-blue-500" />
                                {t('sidebar.new_post')}
                            </h2>
                        </div>
                        {/* Import Trigger */}
                        <button
                            onClick={onShowImport}
                            className="w-full mb-6 py-2 border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 hover:border-blue-500 hover:text-blue-500 rounded-lg flex items-center justify-center gap-2 text-sm transition-all"
                        >
                            <Upload className="w-4 h-4" /> {t('sidebar.import_csv')}
                        </button>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Date & Time */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{t('form.date')}</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                        className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{t('form.time')}</label>
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={e => setTime(e.target.value)}
                                        className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Platform */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{t('form.platform')}</label>
                                <select
                                    value={platform}
                                    onChange={e => setPlatform(e.target.value as Platform)}
                                    className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>

                            {/* Objective */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{t('form.objective')}</label>
                                <input
                                    type="text"
                                    value={objective}
                                    onChange={e => setObjective(e.target.value)}
                                    placeholder={t('form.objective') + '...'}
                                    className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            {/* Status & Paid */}
                            <div className="flex gap-4 items-center">
                                <div className="flex-1">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{t('form.status')}</label>
                                    <select
                                        value={status}
                                        onChange={e => setStatus(e.target.value as PostStatus)}
                                        className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="Draft">{t('status.draft')}</option>
                                        <option value="Approved">{t('status.approved')}</option>
                                        <option value="Scheduled">{t('status.scheduled')}</option>
                                        <option value="Published">{t('status.published')}</option>
                                    </select>
                                </div>
                                <div className="flex items-center pt-5">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isPaid}
                                            onChange={e => setIsPaid(e.target.checked)}
                                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('form.paid')}</span>
                                    </label>
                                </div>
                            </div>

                            {isPaid && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{t('form.budget')}</label>
                                    <input
                                        type="number"
                                        value={budget}
                                        onChange={e => setBudget(Number(e.target.value))}
                                        className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            )}

                            {/* Copy */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{t('form.copy')}</label>
                                <textarea
                                    value={copy}
                                    onChange={e => setCopy(e.target.value)}
                                    rows={4}
                                    className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                />
                            </div>

                            {/* Campaign Fields */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                                <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Estrategia de Campaña</h3>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Campaign Name</label>
                                    <input
                                        type="text"
                                        value={campaignName}
                                        onChange={e => setCampaignName(e.target.value)}
                                        placeholder="Ej: Verano 2026"
                                        className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Ad Set / Group</label>
                                    <input
                                        type="text"
                                        value={adGroupName}
                                        onChange={e => setAdGroupName(e.target.value)}
                                        placeholder="Ej: Audiencia 25-34 años"
                                        className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Ad ID (opcional)</label>
                                    <input
                                        type="text"
                                        value={adId}
                                        onChange={e => setAdId(e.target.value)}
                                        placeholder="Ej: 23847656221840001"
                                        className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div
                                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    accept="image/*"
                                />
                                {image ? (
                                    <div className="relative">
                                        <img src={image} alt="Preview" className="max-h-32 mx-auto rounded" />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setImage(null); }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-gray-500 dark:text-gray-400">
                                        <Upload className="w-6 h-6 mx-auto mb-2" />
                                        <p className="text-xs">{t('sidebar.upload_image')}</p>
                                        <p className="text-[10px] mt-1 text-gray-400">{t('sidebar.auto_compressed')}</p>
                                    </div>
                                )}
                                {loading && <p className="text-xs text-blue-500 mt-2">{t('sidebar.compressing')}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? 'Saving...' : t('btn.save')}
                            </button>
                        </form>
                    </>
                )}
            </div>

            {/* Data Management Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={exportBackup}
                        title={t('sidebar.backup')}
                        className="p-2 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        <Download className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                    <label
                        title={t('sidebar.restore')}
                        className="p-2 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                    >
                        <RotateCcw className="w-4 h-4 text-blue-600" />
                        <input
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && restoreBackup(e.target.files[0])}
                        />
                    </label>
                    <button
                        onClick={clearAllData}
                        title={t('sidebar.clear_all')}
                        className="p-2 flex items-center justify-center bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                </div>
            </div>
        </div>
    );
};
