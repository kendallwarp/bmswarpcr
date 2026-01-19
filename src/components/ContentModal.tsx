
import React, { useState, useEffect } from 'react';
import type { Post } from '../types';
import { PLATFORMS } from '../types';
import { X, CheckCircle, DollarSign, Calendar as CalendarIcon, Copy, Edit2, Save, Trash2, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePosts } from '../context/PostContext';
import { getImageUrl } from '../utils/imageHelper';
import { useLanguage } from '../context/LanguageContext';
import { useBrand } from '../context/BrandContext'; // To select brand if needed

interface ContentModalProps {
    post: Post | null;
    onClose: () => void;
}

export const ContentModal: React.FC<ContentModalProps> = ({ post, onClose }) => {
    const { t } = useLanguage();
    const { posts, updatePost, deletePost } = usePosts();
    const { brands } = useBrand(); // Available brands

    // Sort posts chronologically for navigation
    const sortedPosts = [...posts].sort((a, b) => {
        const dateTimeA = `${a.date}T${a.time}`;
        const dateTimeB = `${b.date}T${b.time}`;
        return dateTimeA.localeCompare(dateTimeB);
    });

    const currentIndex = sortedPosts.findIndex(p => String(p.id) === String(formData.id));
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex !== -1 && currentIndex < sortedPosts.length - 1;

    const navigateTo = (index: number) => {
        if (index >= 0 && index < sortedPosts.length) {
            const newPost = sortedPosts[index];
            setFormData(newPost);
            setPreview(newPost.image ? (getImageUrl(newPost.image) || null) : null);
            setIsEditing(false);
            // Update URL or state if needed, but for now local state is enough
        }
    };

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Post>>({
        platform: 'Instagram',
        status: 'Draft',
        isPaid: false,
        budget: 0,
        brand: 'Default', // Legacy name
        objective: '',
        copy: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        image: '',
        image_description: ''
    });
    const [preview, setPreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (post) {
            setFormData(post);
            setPreview(post.image ? (getImageUrl(post.image) || null) : null);
        }
    }, [post]);

    // Handle form changes
    const handleChange = (field: keyof Post, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!post?.id) return;
        setIsSaving(true);
        try {
            // If brand changed, find the new brand ID
            let brandIdToUpdate = formData.brandId;
            // Loop up brandId if brand name changed (optional sync)
            if (formData.brand) {
                const found = brands.find(b => b.name === formData.brand);
                if (found) brandIdToUpdate = found.id;
            }

            await updatePost(post.id, {
                ...formData,
                brandId: brandIdToUpdate
            });
            setIsEditing(false);
            // alert(t('alert.save_success'));
        } catch (error) {
            console.error("Failed to update post:", error);
            alert("Error saving changes");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (post?.id && confirm(t('confirm.delete_post'))) {
            try {
                await deletePost(post.id);
                onClose();
            } catch (error) {
                console.error("Failed to delete post:", error);
                alert("Failed to delete post");
            }
        }
    };

    const handleCopy = async () => {
        if (formData.copy) {
            try {
                await navigator.clipboard.writeText(formData.copy);
            } catch (err) {
                console.error('Failed to copy', err);
            }
        }
    };

    if (!post) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col md:flex-row border border-gray-200 dark:border-gray-800"
                onClick={e => e.stopPropagation()}
            >
                {/* Image Side */}
                <div className="w-full md:w-1/2 bg-gray-100 dark:bg-black/50 flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 relative group">
                    {formData.image || preview ? (
                        <img
                            src={preview || getImageUrl(formData.image || '')}
                            alt="Post Asset"
                            className="max-w-full max-h-[70vh] object-contain shadow-lg rounded-md"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                    ) : (
                        <div className="text-gray-400 text-center">
                            <span className="block text-4xl mb-2">📷</span>
                            {t('common.no_image')}
                        </div>
                    )}

                    {/* Image URL Edit Input (Overlay only in edit mode) */}
                    {isEditing && (
                        <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-gray-800/90 p-2 rounded-lg shadow-lg backdrop-blur">
                            <label className="text-xs font-bold text-gray-500 mb-1 block">Image URL</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.image || ''}
                                    onChange={(e) => {
                                        handleChange('image', e.target.value);
                                        setPreview(e.target.value); // Optimistic preview
                                    }}
                                    className="flex-1 text-sm bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none px-1"
                                    placeholder="https://..."
                                />
                                <ImageIcon size={16} className="text-gray-400" />
                            </div>
                            <label className="text-xs font-bold text-gray-500 mt-2 mb-1 block">{t('form.image_description')}</label>
                            <textarea
                                value={formData.image_description || ''}
                                onChange={(e) => handleChange('image_description', e.target.value)}
                                className="w-full text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:border-blue-500 outline-none resize-none h-16"
                                placeholder="..."
                            />
                        </div>
                    )}

                    {/* Status Badge */}
                    {!isEditing && (
                        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white dark:bg-gray-800 shadow-md ${formData.status === 'Published' ? 'text-green-600' :
                            formData.status === 'Scheduled' ? 'text-blue-600' :
                                formData.status === 'Approved' ? 'text-purple-600' :
                                    'text-gray-500'
                            } `}>
                            {formData.status}
                        </div>
                    )}

                    {/* Navigation Buttons (Floating) */}
                    {!isEditing && sortedPosts.length > 1 && (
                        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-20">
                            <button
                                onClick={(e) => { e.stopPropagation(); navigateTo(currentIndex - 1); }}
                                disabled={!hasPrev}
                                className={`p-3 rounded-full bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 pointer-events-auto transition-all ${!hasPrev ? 'opacity-0 scale-75 pointer-events-none' : 'hover:scale-110 active:scale-95 text-blue-600 dark:text-blue-400 opacity-90 hover:opacity-100'}`}
                                aria-label="Previous Post"
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); navigateTo(currentIndex + 1); }}
                                disabled={!hasNext}
                                className={`p-3 rounded-full bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 pointer-events-auto transition-all ${!hasNext ? 'opacity-0 scale-75 pointer-events-none' : 'hover:scale-110 active:scale-95 text-blue-600 dark:text-blue-400 opacity-90 hover:opacity-100'}`}
                                aria-label="Next Post"
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Details Side */}
                <div className="w-full md:w-1/2 flex flex-col h-full bg-white dark:bg-gray-900">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex-1 mr-4">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.objective || ''}
                                    onChange={(e) => handleChange('objective', e.target.value)}
                                    placeholder={t('form.objective')}
                                    className="w-full text-xl font-bold bg-gray-50 dark:bg-gray-800 border-none rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            ) : (
                                <h2 className="text-xl font-bold line-clamp-2">{formData.objective || t('common.no_objective')}</h2>
                            )}

                            {/* Meta Row */}
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-2">
                                {isEditing ? (
                                    <>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => handleChange('date', e.target.value)}
                                            className="bg-gray-50 dark:bg-gray-800 rounded px-2 py-1 border border-gray-200 dark:border-gray-700 text-xs"
                                        />
                                        <input
                                            type="time"
                                            value={formData.time}
                                            onChange={(e) => handleChange('time', e.target.value)}
                                            className="bg-gray-50 dark:bg-gray-800 rounded px-2 py-1 border border-gray-200 dark:border-gray-700 text-xs"
                                        />
                                        <select
                                            value={formData.status}
                                            onChange={(e) => handleChange('status', e.target.value)}
                                            className="bg-gray-50 dark:bg-gray-800 rounded px-2 py-1 border border-gray-200 dark:border-gray-700 text-xs font-semibold"
                                        >
                                            <option value="Draft">Draft</option>
                                            <option value="Approved">Approved</option>
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="Published">Published</option>
                                            <option value="Posted">Posted</option>
                                        </select>
                                    </>
                                ) : (
                                    <>
                                        <CalendarIcon size={14} />
                                        {formData.date} {t('common.at')} {formData.time}
                                        <span className="mx-1">•</span>
                                        <span className="font-semibold text-brand-facebook">{formData.platform}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors self-start">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">

                        {/* Platform & Brand Control (Edit Mode Only) */}
                        {isEditing && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t('form.platform')}</label>
                                    <select
                                        value={formData.platform}
                                        onChange={(e) => handleChange('platform', e.target.value)}
                                        className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm"
                                    >
                                        {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Brand</label>
                                    <select
                                        value={formData.brand}
                                        onChange={(e) => handleChange('brand', e.target.value)}
                                        className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm"
                                    >
                                        {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Image Description (View Mode) */}
                        {!isEditing && formData.image_description && (
                            <div>
                                <h3 className="text-sm font-semibold uppercase text-gray-400 tracking-wider mb-2">{t('form.image_description')}</h3>
                                <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg text-sm italic text-gray-600 dark:text-gray-400 border border-blue-100 dark:border-blue-900/30">
                                    {formData.image_description}
                                </div>
                            </div>
                        )}

                        {/* Copy Section */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold uppercase text-gray-400 tracking-wider">{t('form.copy')}</h3>
                                {!isEditing && (
                                    <button onClick={handleCopy} className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium">
                                        <Copy size={12} /> {t('list.copy')}
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <textarea
                                    value={formData.copy || ''}
                                    onChange={(e) => handleChange('copy', e.target.value)}
                                    className="w-full h-32 p-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    placeholder="Write your caption here..."
                                />
                            ) : (
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm whitespace-pre-wrap leading-relaxed border border-gray-100 dark:border-gray-700">
                                    {formData.copy || t('common.no_copy')}
                                </div>
                            )}
                        </div>

                        {/* Stats / Metadata */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Type (Paid/Organic) */}
                            <div className={`p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border ${isEditing ? 'border-blue-200 dark:border-blue-900 border-dashed cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20' : 'border-gray-100 dark:border-gray-700'}`}
                                onClick={() => isEditing && handleChange('isPaid', !formData.isPaid)}
                            >
                                <span className="block text-xs uppercase text-gray-400 mb-1">{t('common.type')}</span>
                                <div className="font-semibold flex items-center gap-2 select-none">
                                    {isEditing ? (
                                        <>
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.isPaid ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}>
                                                {formData.isPaid && <CheckCircle size={10} className="text-white" />}
                                            </div>
                                            {formData.isPaid ? 'Paid Promotion' : 'Organic Post'}
                                        </>
                                    ) : (
                                        <>
                                            {formData.isPaid ? <DollarSign className="w-4 h-4 text-green-500" /> : <CheckCircle className="w-4 h-4 text-gray-400" />}
                                            {formData.isPaid ? t('pdf.paid') : t('pdf.organic')}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Budget */}
                            {(formData.isPaid || isEditing) && (
                                <div className={`p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 ${!formData.isPaid && isEditing ? 'opacity-50' : ''}`}>
                                    <span className="block text-xs uppercase text-gray-400 mb-1">{t('form.budget')}</span>
                                    {isEditing ? (
                                        <div className="flex items-center gap-1">
                                            <span className="text-gray-400 font-bold">$</span>
                                            <input
                                                type="number"
                                                value={formData.budget}
                                                onChange={(e) => handleChange('budget', parseFloat(e.target.value))}
                                                disabled={!formData.isPaid}
                                                className="w-full bg-transparent font-semibold outline-none text-green-600 appearance-none"
                                            />
                                        </div>
                                    ) : (
                                        <span className="font-semibold text-green-600">
                                            ${Number(formData.budget).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20 flex gap-3">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    {t('btn.cancel')}
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex-1 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <span className="animate-spin text-lg">C</span> : <Save size={16} />}
                                    {t('btn.save')}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900"
                                    title={t('btn.delete')}
                                >
                                    <Trash2 size={18} />
                                </button>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex-1 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <Edit2 size={16} />
                                    {t('btn.edit')}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
