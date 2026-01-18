import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import type { FilterState } from './Calendar';
import { PLATFORMS } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface FilterBarProps {
    filters: FilterState;
    onFilterChange: (key: keyof FilterState, value: string) => void;
    onClear: () => void;
    availableBrands: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, onClear, availableBrands }) => {
    const { t } = useLanguage();

    return (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-800">
            {/* Search */}
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder={t('filter.search')}
                    value={filters.query}
                    onChange={(e) => onFilterChange('query', e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <Filter className="w-4 h-4 text-gray-400 mr-1" />

                {/* Platform */}
                <select
                    value={filters.platform}
                    onChange={(e) => onFilterChange('platform', e.target.value)}
                    className="text-sm bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="All">{t('filter.platform')}: {t('filter.all')}</option>
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>

                {/* Brand */}
                <select
                    value={filters.brand}
                    onChange={(e) => onFilterChange('brand', e.target.value)}
                    className="text-sm bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="All">{t('filter.brand')}: {t('filter.all')}</option>
                    {availableBrands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>

                {/* Status */}
                <select
                    value={filters.status}
                    onChange={(e) => onFilterChange('status', e.target.value)}
                    className="text-sm bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="All">{t('filter.status')}: {t('filter.all')}</option>
                    <option value="Draft">{t('status.draft')}</option>
                    <option value="Scheduled">{t('status.scheduled')}</option>
                    <option value="Approved">{t('status.approved')}</option>
                    <option value="Published">{t('status.published')}</option>
                    <option value="Posted">{t('status.posted')}</option>
                </select>

                {(filters.platform !== 'All' || filters.status !== 'All' || filters.brand !== 'All' || filters.query) && (
                    <button
                        onClick={onClear}
                        className="text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded flex items-center gap-1"
                    >
                        <X className="w-3 h-3" /> {t('filter.clear')}
                    </button>
                )}
            </div>
        </div>
    );
};
