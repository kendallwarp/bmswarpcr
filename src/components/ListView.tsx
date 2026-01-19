import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { usePosts } from '../context/PostContext';
import { type Post, type PostStatus } from '../types';
import { getImageUrl } from '../utils/imageHelper';
import { Trash2, Square, CheckSquare, Edit3, Image as ImageIcon, FileDown } from 'lucide-react';
import { ExportModal } from './ExportModal';
import { format } from 'date-fns';
import clsx from 'clsx';

interface ListViewProps {
    posts: Post[];
    onSelectPost: (post: Post) => void;
}

export const ListView: React.FC<ListViewProps> = ({ posts, onSelectPost }) => {
    const { t } = useLanguage();
    const { bulkDeletePosts, bulkUpdatePostStatus } = usePosts();
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    // Toggle single selection
    const toggleSelect = (id: string | number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    // Toggle select all
    const toggleSelectAll = () => {
        if (selectedIds.size === posts.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(posts.map(p => p.id!).filter(Boolean)));
        }
    };

    // Bulk Delete
    const handleBulkDelete = async () => {
        if (!confirm(t('confirm.bulk_delete', { count: selectedIds.size }))) return;

        setIsBulkProcessing(true);
        try {
            await bulkDeletePosts(Array.from(selectedIds));
            setSelectedIds(new Set());
        } catch (error) {
            console.error(error);
            alert(t('alert.bulk_delete_error'));
        } finally {
            setIsBulkProcessing(false);
        }
    };

    // Bulk Status Change
    const handleBulkStatus = async (status: PostStatus) => {
        setIsBulkProcessing(true);
        try {
            await bulkUpdatePostStatus(Array.from(selectedIds), status);
            setSelectedIds(new Set());
        } catch (error) {
            console.error(error);
            alert(t('alert.bulk_status_error'));
        } finally {
            setIsBulkProcessing(false);
        }
    };


    if (posts.length === 0) {
        return <div className="p-8 text-center text-gray-500">{t('list.no_posts')}</div>;
    }

    return (
        <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Bulk Actions Bar */}
            {selectedIds.size > 0 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900 flex items-center justify-between animate-in slide-in-from-top-2">
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        {selectedIds.size} {t('list.selected')}
                    </span>
                    <div className="flex items-center gap-2">
                        <select
                            onChange={(e) => handleBulkStatus(e.target.value as PostStatus)}
                            className="text-sm border-gray-300 dark:border-gray-600 rounded p-1 bg-white dark:bg-gray-800"
                            defaultValue=""
                        >
                            <option value="" disabled>{t('list.set_status')}</option>
                            <option value="Draft">{t('status.draft')}</option>
                            <option value="Scheduled">{t('status.scheduled')}</option>
                            <option value="Approved">{t('status.approved')}</option>
                            <option value="Published">{t('status.published')}</option>
                        </select>
                        <button
                            onClick={handleBulkDelete}
                            disabled={isBulkProcessing}
                            className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                            title={t('btn.delete_selected')}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Quick Actions Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/30 dark:bg-gray-800/30">
                <span className="text-sm text-gray-500 font-medium">{posts.length} {t('nav.posts')}</span>
                <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all border border-blue-100 dark:border-blue-800"
                >
                    <FileDown size={14} /> {t('import.export_for_edit')}
                </button>
            </div>

            {/* Table Header */}
            <div className="flex-1 overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="w-10 px-4 py-3 text-center">
                                <button onClick={toggleSelectAll} className="opacity-50 hover:opacity-100 flex items-center justify-center">
                                    {selectedIds.size === posts.length && posts.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                </button>
                            </th>
                            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-300">{t('list.date')}</th>
                            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-300">{t('list.img')}</th>
                            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-300 w-24">{t('list.platform')}</th>
                            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-300">{t('list.brand')}</th>
                            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-300">Campaign</th>
                            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-300">Ad Set / Group</th>
                            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-300 max-w-xs">{t('list.copy')}</th>
                            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-300 w-24">{t('list.status')}</th>
                            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-300 w-20 text-right">{t('list.action')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {posts.slice().sort((a, b) => b.date.localeCompare(a.date)).map(post => {
                            const isSelected = selectedIds.has(post.id!);
                            const imgUrl = getImageUrl(post.image);
                            return (
                                <tr key={post.id} className={clsx("hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group", isSelected && "bg-blue-50 dark:bg-blue-900/10")}>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={() => toggleSelect(post.id!)} className="text-gray-400 hover:text-blue-600">
                                            {isSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-400">
                                        {format(new Date(post.date), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden border border-gray-200 dark:border-gray-600 relative">
                                            {imgUrl ? (
                                                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-4 h-4 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={clsx(
                                            "px-2 py-0.5 rounded text-xs font-medium border",
                                            post.platform === 'Instagram' && "bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-900",
                                            post.platform === 'Facebook' && "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900",
                                            post.platform === 'LinkedIn' && "bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-900",
                                        )}>
                                            {post.platform}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">{post.brand}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
                                        {post.campaign_name || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
                                        {post.ad_group_name || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-xs truncate" title={post.copy}>
                                        {post.copy}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={clsx(
                                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                                            post.status === 'Published' && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
                                            post.status === 'Scheduled' && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
                                            post.status === 'Approved' && "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
                                            post.status === 'Draft' && "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
                                        )}>
                                            {post.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => onSelectPost(post)}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all"
                                            title={t('btn.edit')}
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {isExportModalOpen && (
                <ExportModal onClose={() => setIsExportModalOpen(false)} />
            )}
        </div>
    );
};
