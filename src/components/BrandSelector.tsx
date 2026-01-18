import React, { useState } from 'react';
import { useBrand } from '../context/BrandContext';
import { Plus, ChevronDown, Check, Edit2, Trash2 } from 'lucide-react';
import { BrandOnboarding } from './BrandOnboarding';
import { BrandEditModal } from './BrandEditModal';

export const BrandSelector: React.FC = () => {
    const { brands, currentBrand, selectBrand, deleteBrand } = useBrand();
    const [isOpen, setIsOpen] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [editingBrand, setEditingBrand] = useState<any>(null);

    const handleDelete = async (brandId: string, brandName: string) => {
        if (confirm(`Delete brand "${brandName}"? This action cannot be undone.`)) {
            await deleteBrand(brandId);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative z-10 w-full mb-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-all w-full"
            >
                {currentBrand ? (
                    <>
                        {currentBrand.logo ? (
                            <img src={currentBrand.logo} className="w-8 h-8 rounded-full object-cover border border-gray-100" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300">
                                {currentBrand.name.charAt(0)}
                            </div>
                        )}
                        <span className="font-bold text-gray-800 dark:text-gray-100 truncate flex-1 text-left text-lg">
                            {currentBrand.name}
                        </span>
                    </>
                ) : (
                    <span className="text-gray-500 font-medium flex-1 text-left">Select Brand...</span>
                )}
                <ChevronDown size={16} className="text-gray-400" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 animate-in fade-in slide-in-from-top-2 z-50">
                    {brands.length > 0 && (
                        <div className="mb-2 max-h-60 overflow-y-auto">
                            {brands.map(brand => (
                                <div
                                    key={brand.id}
                                    className={`flex items-center gap-3 w-full p-2 rounded-lg transition-colors ${currentBrand?.id === brand.id
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    <button
                                        onClick={() => {
                                            selectBrand(brand.id);
                                            setIsOpen(false);
                                        }}
                                        className="flex items-center gap-3 flex-1"
                                    >
                                        {brand.logo ? (
                                            <img src={brand.logo} className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 object-cover" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                                {brand.name.charAt(0)}
                                            </div>
                                        )}
                                        <div className="text-left flex-1">
                                            <p className="font-medium text-sm">{brand.name}</p>
                                            <p className="text-xs text-gray-400">{brand.industry}</p>
                                        </div>
                                        {currentBrand?.id === brand.id && <Check size={14} />}
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingBrand(brand);
                                            setIsOpen(false);
                                        }}
                                        className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                                        title="Edit brand"
                                    >
                                        <Edit2 size={14} className="text-blue-600 dark:text-blue-400" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(brand.id, brand.name);
                                        }}
                                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                                        title="Delete brand"
                                    >
                                        <Trash2 size={14} className="text-red-600 dark:text-red-400" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={() => {
                            setShowOnboarding(true);
                            setIsOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg font-bold text-sm transition-colors"
                    >
                        <Plus size={16} /> New Brand
                    </button>
                </div>
            )}

            {showOnboarding && <BrandOnboarding onClose={() => setShowOnboarding(false)} />}
            {editingBrand && <BrandEditModal brand={editingBrand} onClose={() => setEditingBrand(null)} />}
        </div>
    );
};
