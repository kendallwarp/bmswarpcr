
import React, { useState, useEffect } from 'react';
import type { Post } from '../types';
import { X, CheckCircle, DollarSign, Calendar as CalendarIcon, Copy } from 'lucide-react';
import { usePosts } from '../context/PostContext';
import { getImageUrl } from '../utils/imageHelper';
import { useLanguage } from '../context/LanguageContext'; // Assuming this context is available


// Assuming PLATFORMS is defined somewhere, e.g., in types.ts


interface ContentModalProps {
    post: Post | null; // If null, creating new
    onClose: () => void;
}

export const ContentModal: React.FC<ContentModalProps> = ({ post, onClose }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState<Partial<Post>>({
        platform: 'Instagram',
        status: 'Draft',
        isPaid: false,
        budget: 0,
        brand: 'Default',
        objective: '',
        copy: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
    });
    const [preview, setPreview] = useState<string | null>(null);
    // const [isSaving, setIsSaving] = useState(false); // Used in handleSave

    useEffect(() => {
        if (post) {
            setFormData(post);
            setPreview(post.image ? (getImageUrl(post.image) || null) : null);
        } else {
            // New Post defaults
            const today = new Date().toISOString().split('T')[0];
            setFormData(prev => ({ ...prev, date: today, time: '10:00', brand: 'Default' }));
            setPreview(null);
        }
    }, [post]);



    /*
    const handleSave = async () => {
        // setIsSaving(true);
        try {
            if (formData.id) {
                await db.posts.update(formData.id, formData);
            } else {
                await db.posts.add({ ...formData, id: Date.now() } as Post); 
            }
            onClose();
        } catch (error) {
            console.error("Failed to save post:", error);
            alert(t('alert.save_failed'));
        } finally {
            // setIsSaving(false);
        }
    };
    */

    const { deletePost } = usePosts();

    const handleCopy = async () => {
        if (post?.copy) {
            try {
                await navigator.clipboard.writeText(post.copy);
                // alert(t('alert.copy_success')); // Optional: Feedback
            } catch (err) {
                console.error('Failed to copy', err);
            }
        }
    };

    const handleDelete = async () => {
        if (formData.id && confirm(t('confirm.delete_post'))) {
            try {
                await deletePost(formData.id);
                onClose();
            } catch (error) {
                console.error("Failed to delete post:", error);
                alert("Failed to delete post. Please try again.");
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col md:flex-row border border-gray-200 dark:border-gray-800"
                onClick={e => e.stopPropagation()}
            >
                {/* Image Side */}
                <div className="w-full md:w-1/2 bg-gray-100 dark:bg-black/50 flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 relative">
                    {preview ? (
                        <img src={preview} alt="Post Asset" className="max-w-full max-h-[70vh] object-contain shadow-lg rounded-md" />
                    ) : (
                        <div className="text-gray-400 text-center">
                            <span className="block text-4xl mb-2">📷</span>
                            {t('common.no_image')}
                        </div>
                    )}

                    {/* Status Badge Overlay */}
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white dark:bg-gray-800 shadow-md ${formData.status === 'Published' ? 'text-green-600' :
                        formData.status === 'Scheduled' ? 'text-blue-600' :
                            formData.status === 'Approved' ? 'text-purple-600' :
                                'text-gray-500'
                        } `}>
                        {formData.status}
                    </div>
                </div>

                {/* Details Side */}
                <div className="w-full md:w-1/2 flex flex-col h-full bg-white dark:bg-gray-900">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                        <div>
                            <h2 className="text-xl font-bold">{formData.objective || t('common.no_objective')}</h2>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <CalendarIcon size={14} />
                                {formData.date} {t('common.at')} {formData.time}
                                <span className="mx-1">•</span>
                                <span className="font-semibold text-brand-facebook">{formData.platform}</span>
                                {formData.brand && (
                                    <>
                                        <span className="mx-1">•</span>
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">{formData.brand}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Copy Section */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold uppercase text-gray-400 tracking-wider">{t('form.copy')}</h3>
                                <button onClick={handleCopy} className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium">
                                    <Copy size={12} /> {t('list.copy')}
                                </button>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm whitespace-pre-wrap leading-relaxed border border-gray-100 dark:border-gray-700">
                                {formData.copy || t('common.no_copy')}
                            </div>
                        </div>

                        {/* Stats / Metadata */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                <span className="block text-xs uppercase text-gray-400 mb-1">{t('common.type')}</span>
                                <span className="font-semibold flex items-center gap-2">
                                    {formData.isPaid ? <DollarSign className="w-4 h-4 text-green-500" /> : <CheckCircle className="w-4 h-4 text-gray-400" />}
                                    {formData.isPaid ? t('pdf.paid') : t('pdf.organic')}
                                </span>
                            </div>
                            {formData.isPaid && (
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <span className="block text-xs uppercase text-gray-400 mb-1">{t('form.budget')}</span>
                                    <span className="font-semibold text-green-600">
                                        ${Number(formData.budget).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Action */}
                    <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20">
                        <button
                            onClick={handleDelete}
                            className="w-full py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900"
                        >
                            {t('btn.delete')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
