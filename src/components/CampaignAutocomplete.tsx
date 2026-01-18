import React, { useState, useEffect, useMemo } from 'react';
import { usePosts } from '../context/PostContext';

interface CampaignAutocompleteProps {
    brandId: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

/**
 * Campaign Autocomplete Component
 * Suggests existing campaign names across ALL platforms for cross-platform linking
 */
export const CampaignAutocomplete: React.FC<CampaignAutocompleteProps> = ({
    brandId,
    value,
    onChange,
    placeholder = 'Ej: Verano 2026'
}) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const { posts } = usePosts();

    // Query all unique campaign names for this brand across all platforms
    const campaigns = useMemo(() => {
        if (!posts) return [];
        const uniqueCampaigns = new Set(
            posts
                .filter(p => p.brandId === brandId) // Filter by brandId
                .map(p => p.campaign_name)
                .filter((name): name is string => !!name && name.trim().length > 0)
        );
        return Array.from(uniqueCampaigns).sort();
    }, [brandId, posts]);

    useEffect(() => {
        if (value && value.length > 0) {
            const filtered = campaigns.filter(c =>
                c.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setShowSuggestions(false);
        }
    }, [value, campaigns]);

    return (
        <div className="relative">
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                onFocus={() => value && setShowSuggestions(suggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder={placeholder}
                className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {suggestions.map(campaign => (
                        <button
                            key={campaign}
                            type="button"
                            onClick={() => {
                                onChange(campaign);
                                setShowSuggestions(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-sm"
                        >
                            <span className="font-medium">{campaign}</span>
                            <span className="text-xs text-gray-500 ml-2">
                                (usado en {campaigns.filter(c => c === campaign).length} posts)
                            </span>
                        </button>
                    ))}
                </div>
            )}
            {value && campaigns.length > 0 && !showSuggestions && (
                <p className="text-xs text-gray-500 mt-1">
                    💡 Tip: Usa campañas existentes para vincular posts entre plataformas
                </p>
            )}
        </div>
    );
};
