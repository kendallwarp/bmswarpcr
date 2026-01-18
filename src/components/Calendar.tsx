import React, { useState, useMemo } from 'react';
import { usePosts } from '../context/PostContext';
import type { Post } from '../types';
import { PostCard } from './PostCard';
import { ContentModal } from './ContentModal';
import { generatePDFRequest } from '../utils/pdfGenerator';
import { ListView } from './ListView';
import { Download, LayoutGrid, List } from 'lucide-react';
import clsx from 'clsx';
import { startOfWeek, addDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

import { FilterBar } from './FilterBar';
import { ExportModal } from './ExportModal';
import { useLanguage } from '../context/LanguageContext';
import { useBrand } from '../context/BrandContext';

export interface FilterState {
    platform: string;
    status: string;
    brand: string;
    query: string;
}

export const Calendar: React.FC = () => {
    const { t, language } = useLanguage();
    const { currentBrand, brands } = useBrand();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const { posts: allPosts } = usePosts();

    // Filters
    const [filters, setFilters] = useState<FilterState>({
        platform: 'All',
        status: 'All',
        brand: 'All',
        query: ''
    });

    // Get available brands from BrandContext instead of posts
    const availableBrands = useMemo(() => {
        return brands.map(b => b.name).sort();
    }, [brands]);

    // Filter posts for current brand
    const postsRaw = useMemo(() => {
        if (!currentBrand) return [];
        // Support legacy 'brand' string and new 'brandId'
        // But better to rely on PostContext filtering by brandId already
        // PostContext loads posts for currentBrandId, so allPosts should already be filtered?
        // Let's check PostContext loadPosts implementation.
        // It does: .eq('brand_id', currentBrand.id)
        // So allPosts are already filtered for the current brand.
        return allPosts;
    }, [allPosts, currentBrand]);

    // Filtered Posts
    const posts = useMemo(() => {
        return postsRaw.filter(post => {
            const matchesPlatform = filters.platform === 'All' || post.platform === filters.platform;
            const matchesStatus = filters.status === 'All' || post.status === filters.status;
            const matchesBrand = filters.brand === 'All' || post.brand === filters.brand;
            const matchesQuery = !filters.query ||
                post.copy.toLowerCase().includes(filters.query.toLowerCase()) ||
                post.objective.toLowerCase().includes(filters.query.toLowerCase());

            return matchesPlatform && matchesStatus && matchesBrand && matchesQuery;
        });
    }, [postsRaw, filters]);

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleClearFilters = () => {
        setFilters({ platform: 'All', status: 'All', brand: 'All', query: '' });
    };

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: addDays(monthEnd, 6 - monthEnd.getDay())
    });

    const weekDays = useMemo(() => {
        const start = startOfWeek(new Date(), { weekStartsOn: 0 });
        return Array.from({ length: 7 }).map((_, i) =>
            format(addDays(start, i), 'EEE', { locale: language === 'es' ? es : undefined })
        );
    }, [language]);

    const [showExportModal, setShowExportModal] = useState(false);

    const handleExportReport = async (startDate: string, endDate: string, brand: string) => {
        // Filter independent of view mode, based on selected range and brand
        let postsToExport = postsRaw.filter(p => p.date >= startDate && p.date <= endDate);

        if (brand !== 'All') {
            const selectedBrandObj = brands.find(b => b.name === brand);
            if (selectedBrandObj) {
                postsToExport = postsToExport.filter(p => p.brandId === selectedBrandObj.id);
            } else {
                postsToExport = postsToExport.filter(p => p.brand === brand);
            }
        }

        const title = brand !== 'All' ? t('pdf.report_for', { brand }) : t('pdf.social_plan');

        const translationMap: Record<string, string> = {
            'pdf.generated': t('pdf.generated'),
            'pdf.content_details': t('pdf.content_details'),
            'pdf.no_preview': t('pdf.no_preview'),
            'pdf.organic': t('pdf.organic'),
            'pdf.paid': t('pdf.paid'),
            'pdf.objective': t('form.objective'),
            'pdf.copy': t('form.copy'),
        };

        await generatePDFRequest(postsToExport, startDate, endDate, title, translationMap, language);
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
                availableBrands={availableBrands}
            />
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold capitalize">
                        {format(currentDate, 'MMMM yyyy', { locale: language === 'es' ? es : undefined })}
                    </h2>
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-0.5 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={clsx(
                                "p-1.5 rounded-md transition-all",
                                viewMode === 'grid' ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-300" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            )}
                            title={t('cal.view_grid')}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={clsx(
                                "p-1.5 rounded-md transition-all",
                                viewMode === 'list' ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-300" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            )}
                            title={t('cal.view_list')}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="mr-2 px-3 py-1 text-sm bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 rounded hover:bg-purple-100 flex items-center gap-1"
                    >
                        <Download className="w-4 h-4" /> {t('export.title')}
                    </button>
                    <button
                        onClick={() => setCurrentDate(sub => addDays(sub, -30))} // Rough prev month
                        className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200"
                    >
                        {t('cal.prev')}
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className="px-3 py-1 text-sm bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded hover:bg-blue-100"
                    >
                        {t('cal.today')}
                    </button>
                    <button
                        onClick={() => setCurrentDate(sub => addDays(sub, 30))} // Rough next month
                        className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200"
                    >
                        {t('cal.next')}
                    </button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <ListView posts={posts} onSelectPost={setSelectedPost} />
            ) : (
                <>
                    {/* Grid Header */}
                    <div className="hidden md:grid grid-cols-7 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        {weekDays.map(day => (
                            <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Grid Days */}
                    <div className="grid grid-cols-1 md:grid-cols-7 flex-1 auto-rows-auto overflow-y-auto">
                        {calendarDays.map((day, index) => {
                            const dayStr = format(day, 'yyyy-MM-dd');
                            const dayPosts = posts.filter(p => p.date === dayStr);
                            const isCurrentMonth = isSameMonth(day, monthStart);

                            return (
                                <div
                                    key={day.toISOString()}
                                    style={{ zIndex: 50 - index }}
                                    className={clsx(
                                        "relative flex flex-col h-auto min-h-[100px] md:min-h-[120px] p-2 border-b border-r border-gray-100 dark:border-gray-700 transition-colors",
                                        !isCurrentMonth && "bg-gray-50/50 dark:bg-gray-800/50 text-gray-400",
                                        isToday(day) && "bg-blue-50/30 dark:bg-blue-900/10"
                                    )}
                                >
                                    <div className={clsx(
                                        "flex justify-between items-start mb-4 pb-1 sticky top-0 z-10 p-1 -mx-1 -mt-1 rounded-sm border-b border-transparent transition-colors",
                                        isToday(day)
                                            ? "bg-blue-50 dark:bg-blue-900/50"
                                            : !isCurrentMonth
                                                ? "bg-gray-50 dark:bg-gray-800"
                                                : "bg-white dark:bg-gray-800"
                                    )}>
                                        <div className="flex items-center gap-2">
                                            <span className={clsx(
                                                "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full shadow-sm",
                                                isToday(day) ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                            )}>
                                                {format(day, 'd')}
                                            </span>
                                            {/* Show Day Name on Mobile */}
                                            <span className="md:hidden text-xs font-medium text-gray-400 uppercase">
                                                {format(day, 'EEE', { locale: language === 'es' ? es : undefined })}
                                            </span>
                                        </div>
                                        {dayPosts.length > 0 && (
                                            <span className="text-[10px] font-semibold bg-white/80 dark:bg-gray-800/80 px-1.5 py-0.5 rounded-full border border-gray-100 dark:border-gray-700 text-gray-500">
                                                {dayPosts.length}
                                            </span>
                                        )}
                                    </div>

                                    {/* Post List */}
                                    <div className="space-y-1 px-2">
                                        {dayPosts.map((post: Post) => (
                                            <PostCard key={post.id} post={post} onClick={(p) => setSelectedPost(p)} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {selectedPost && (
                <ContentModal post={selectedPost} onClose={() => setSelectedPost(null)} />
            )}

            {showExportModal && (
                <ExportModal
                    onClose={() => setShowExportModal(false)}
                    onExport={handleExportReport}
                    initialDate={currentDate}
                    availableBrands={availableBrands}
                />
            )}
        </div>
    );
};
