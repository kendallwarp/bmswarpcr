import React, { useState, useMemo } from 'react';
import { usePosts } from '../context/PostContext';
import type { Post } from '../types';
import { PostCard } from './PostCard';
import { ContentModal } from './ContentModal';
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
    const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');
    const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
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

    // Logic for Calendar Days based on View
    const calendarDays = useMemo(() => {
        if (calendarView === 'day') {
            return [currentDate];
        }
        if (calendarView === 'week') {
            const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sun start
            return Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
        }
        // Month View
        return eachDayOfInterval({
            start: startDate,
            end: addDays(monthEnd, 6 - monthEnd.getDay())
        });
    }, [calendarView, currentDate, startDate, monthEnd]);

    const weekDays = useMemo(() => {
        const start = startOfWeek(new Date(), { weekStartsOn: 0 });
        return Array.from({ length: 7 }).map((_, i) =>
            format(addDays(start, i), 'EEE', { locale: language === 'es' ? es : undefined })
        );
    }, [language]); // Only depending on language now

    const navigateDate = (direction: 'prev' | 'next') => {
        const factor = direction === 'next' ? 1 : -1;
        if (calendarView === 'day') setCurrentDate(d => addDays(d, 1 * factor));
        else if (calendarView === 'week') setCurrentDate(d => addDays(d, 7 * factor));
        else setCurrentDate(d => addDays(d, 30 * factor)); // Month jump
    };

    const [showExportModal, setShowExportModal] = useState(false);

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
                availableBrands={availableBrands}
            />
            {/* Header */}
            <div className="p-4 flex flex-col md:flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700 gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                    <h2 className="text-lg font-bold capitalize whitespace-nowrap">
                        {calendarView === 'day'
                            ? format(currentDate, 'dd MMMM yyyy', { locale: language === 'es' ? es : undefined })
                            : format(currentDate, 'MMMM yyyy', { locale: language === 'es' ? es : undefined })
                        }
                    </h2>

                    {/* View Switcher Tabs */}
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                        {(['day', 'week', 'month'] as const).map((v) => (
                            <button
                                key={v}
                                onClick={() => setCalendarView(v)}
                                className={clsx(
                                    "px-3 py-1 rounded-md text-xs font-medium capitalize transition-all",
                                    calendarView === v
                                        ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                )}
                            >
                                {t(`cal.view_${v}`) || v}
                            </button>
                        ))}
                    </div>

                    <div className="flex bg-gray-100 dark:bg-gray-700 p-0.5 rounded-lg hidden md:flex">
                        <button
                            onClick={() => setDisplayMode('grid')}
                            className={clsx(
                                "p-1.5 rounded-md transition-all",
                                displayMode === 'grid' ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-300" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            )}
                            title={t('cal.view_grid')}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setDisplayMode('list')}
                            className={clsx(
                                "p-1.5 rounded-md transition-all",
                                displayMode === 'list' ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-300" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            )}
                            title={t('cal.view_list')}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto justify-end">
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="mr-2 px-3 py-1 text-sm bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 rounded hover:bg-purple-100 flex items-center gap-1"
                    >
                        <Download className="w-4 h-4" /> <span className="hidden md:inline">{t('export.title')}</span>
                    </button>
                    <button
                        onClick={() => navigateDate('prev')}
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
                        onClick={() => navigateDate('next')}
                        className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200"
                    >
                        {t('cal.next')}
                    </button>
                </div>
            </div>

            {displayMode === 'list' ? (
                <ListView posts={posts} onSelectPost={setSelectedPost} />
            ) : (
                <>
                    {/* Grid Header - Hidden for Day View */}
                    {calendarView !== 'day' && (
                        <div className="hidden md:grid grid-cols-7 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            {weekDays.map(day => (
                                <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase">
                                    {day}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Grid Days */}
                    <div className={clsx(
                        "grid flex-1 auto-rows-auto overflow-y-auto",
                        calendarView === 'day' ? "grid-cols-1" : "grid-cols-1 md:grid-cols-7"
                    )}>
                        {calendarDays.map((day, index) => {
                            const dayStr = format(day, 'yyyy-MM-dd');
                            const dayPosts = posts.filter(p => p.date === dayStr);
                            // In week/day views, we don't want to dim days usually
                            const isCurrentMonth = calendarView === 'month' ? isSameMonth(day, monthStart) : true;

                            return (
                                <div
                                    key={day.toISOString()}
                                    style={{ zIndex: 50 - index }}
                                    className={clsx(
                                        "relative flex flex-col h-auto min-h-[100px] p-2 border-b border-r border-gray-100 dark:border-gray-700 transition-colors",
                                        calendarView === 'day' ? "min-h-[300px]" : "md:min-h-[120px]",
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
                                            {/* Show Day Name on Mobile or Day View */}
                                            {(calendarView === 'day' || window.innerWidth < 768) && (
                                                <span className="text-xs font-medium text-gray-400 uppercase">
                                                    {format(day, 'EEEE', { locale: language === 'es' ? es : undefined })}
                                                </span>
                                            )}
                                        </div>
                                        {dayPosts.length > 0 && (
                                            <span className="text-[10px] font-semibold bg-white/80 dark:bg-gray-800/80 px-1.5 py-0.5 rounded-full border border-gray-100 dark:border-gray-700 text-gray-500">
                                                {dayPosts.length}
                                            </span>
                                        )}
                                    </div>

                                    {/* Post List */}
                                    <div className={clsx(
                                        "space-y-1 px-2",
                                        calendarView === 'month' ? "grid gap-1 space-y-0" : "" // Use grid gap for month view pills? or just space-y-1
                                    )}>
                                        {dayPosts.map((post: Post) => (
                                            <PostCard
                                                key={post.id}
                                                post={post}
                                                onClick={(p) => setSelectedPost(p)}
                                                variant={calendarView === 'month' ? 'minimal' : 'default'}
                                            />
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
                />
            )}
        </div>
    );
};
