import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, type Brand } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

interface BrandContextType {
    brands: Brand[];
    currentBrand: Brand | null;
    loading: boolean;
    selectBrand: (brandId: string) => void;
    addBrand: (name: string, color: string) => Promise<void>;
    updateBrand: (id: string, updates: Partial<Brand>) => Promise<void>;
    deleteBrand: (id: string) => Promise<void>;
    refreshBrands: () => Promise<void>;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentBrandId, setCurrentBrandId] = useState<string | null>(
        localStorage.getItem('selectedBrandId')
    );

    const currentBrand = brands.find(b => b.id === currentBrandId) || null;

    // Load brands from Supabase
    const loadBrands = async () => {
        if (!user) {
            setBrands([]);
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('brands')
                .select('*')
                .eq('created_by', user.id)
                .order('name');

            if (error) throw error;
            setBrands(data || []);
        } catch (error) {
            console.error('Error loading brands:', error);
            setBrands([]);
        } finally {
            setLoading(false);
        }
    };

    // Load brands on mount and when user changes
    useEffect(() => {
        loadBrands();
    }, [user]);

    // Save selected brand to localStorage
    useEffect(() => {
        if (currentBrandId) {
            localStorage.setItem('selectedBrandId', currentBrandId);
        }
    }, [currentBrandId]);

    // Auto-select first brand if none selected
    useEffect(() => {
        if (!currentBrandId && brands.length > 0) {
            setCurrentBrandId(brands[0].id);
        }
    }, [brands, currentBrandId]);

    const selectBrand = (brandId: string) => {
        setCurrentBrandId(brandId);
    };

    const addBrand = async (name: string, color: string) => {
        if (!user) throw new Error('User not authenticated');

        try {
            const { data, error } = await supabase
                .from('brands')
                .insert({
                    name,
                    color,
                    created_by: user.id
                })
                .select()
                .single();

            if (error) throw error;

            // Add to local state
            setBrands(prev => [...prev, data]);
            selectBrand(data.id);
        } catch (error) {
            console.error('Error adding brand:', error);
            throw error;
        }
    };

    const updateBrand = async (id: string, updates: Partial<Brand>) => {
        try {
            const { error } = await supabase
                .from('brands')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            // Update local state
            setBrands(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
        } catch (error) {
            console.error('Error updating brand:', error);
            throw error;
        }
    };

    const deleteBrand = async (id: string) => {
        try {
            const { error } = await supabase
                .from('brands')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Update local state
            setBrands(prev => prev.filter(b => b.id !== id));

            // If deleted brand was selected, select another or null
            if (currentBrandId === id) {
                const remaining = brands.filter(b => b.id !== id);
                setCurrentBrandId(remaining.length > 0 ? remaining[0].id : null);
            }
        } catch (error) {
            console.error('Error deleting brand:', error);
            throw error;
        }
    };

    const refreshBrands = async () => {
        await loadBrands();
    };

    return (
        <BrandContext.Provider value={{
            brands,
            currentBrand,
            loading,
            selectBrand,
            addBrand,
            updateBrand,
            deleteBrand,
            refreshBrands
        }}>
            {children}
        </BrandContext.Provider>
    );
};

export const useBrand = () => {
    const context = useContext(BrandContext);
    if (!context) throw new Error('useBrand must be used within a BrandProvider');
    return context;
};
