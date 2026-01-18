import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { useBrand } from './BrandContext';
import { type Post, type Platform, type PostStatus } from '../types';

interface PostContextType {
    posts: Post[];
    loading: boolean;
    error: string | null;
    addPost: (post: Omit<Post, 'id' | 'createdAt'>) => Promise<void>;
    bulkAddPosts: (posts: Omit<Post, 'id' | 'createdAt'>[]) => Promise<void>;
    updatePost: (id: string | number, updates: Partial<Post>) => Promise<void>;
    deletePost: (id: string | number) => Promise<void>;
    bulkDeletePosts: (ids: (string | number)[]) => Promise<void>;
    bulkUpdatePostStatus: (ids: (string | number)[], status: any) => Promise<void>;
    refreshPosts: () => Promise<void>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { currentBrand } = useBrand();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load posts from Supabase
    const loadPosts = async () => {
        if (!user || !currentBrand) {
            setPosts([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('brand_id', currentBrand.id)
                .order('date', { ascending: false });

            if (error) throw error;

            // Transform snake_case to camelCase
            const formattedPosts: Post[] = (data || []).map(p => ({
                id: p.id,
                date: p.date,
                time: p.time,
                platform: p.platform,
                objective: p.objective,
                status: p.status,
                isPaid: p.is_paid,
                budget: p.budget,
                copy: p.copy,
                image: p.image,
                brandId: p.brand_id,
                createdAt: p.created_at,
                // Optional strategy fields
                campaign_name: p.campaign_name,
                ad_group_name: p.ad_group_name,
                ad_id: p.ad_id
            }));

            setPosts(formattedPosts);
        } catch (err: any) {
            console.error('Error loading posts:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Load posts when current brand changes
    useEffect(() => {
        loadPosts();
    }, [user, currentBrand]);

    const addPost = async (postData: Omit<Post, 'id' | 'createdAt'>) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user authenticated');
            if (!currentBrand) throw new Error('No current brand selected');


            // Map camelCase to snake_case for Supabase
            const dbPost = {
                brand_id: currentBrand.id, // Use currentBrand.id from context
                created_by: user.id,
                date: postData.date,
                time: postData.time,
                platform: postData.platform,
                objective: postData.objective,
                status: postData.status,
                copy: postData.copy,
                image: postData.image,
                is_paid: postData.isPaid,
                budget: postData.budget,
                // Strategy fields
                campaign_name: postData.campaign_name,
                ad_group_name: postData.ad_group_name,
                ad_id: postData.ad_id
            };

            const { data, error } = await supabase
                .from('posts')
                .insert([dbPost])
                .select()
                .single();

            if (error) throw error;

            // Optimistic update
            const newPost: Post = {
                id: data.id,
                date: data.date,
                time: data.time,
                platform: data.platform as Platform,
                objective: data.objective,
                status: data.status as PostStatus,
                isPaid: data.is_paid,
                budget: data.budget,
                copy: data.copy,
                image: data.image,
                brandId: data.brand_id,
                createdAt: data.created_at,
                campaign_name: data.campaign_name,
                ad_group_name: data.ad_group_name,
                ad_id: data.ad_id
            };

            setPosts(prev => [...prev, newPost]);
        } catch (err: any) {
            console.error('Error adding post:', err);
            throw err;
        }
    };

    const bulkAddPosts = async (postsData: Omit<Post, 'id' | 'createdAt'>[]) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user authenticated');
            if (!currentBrand) throw new Error('No current brand selected');

            // Map all posts to snake_case
            const dbPosts = postsData.map(p => ({
                brand_id: currentBrand.id, // Use currentBrand.id from context
                created_by: user.id,
                date: p.date,
                time: p.time,
                platform: p.platform,
                objective: p.objective,
                status: p.status,
                copy: p.copy,
                image: p.image,
                is_paid: p.isPaid,
                budget: p.budget,
                campaign_name: p.campaign_name,
                ad_group_name: p.ad_group_name,
                ad_id: p.ad_id
            }));

            const { data, error } = await supabase
                .from('posts')
                .insert(dbPosts)
                .select();

            if (error) throw error;

            // Transform back to camelCase for state
            const newPosts: Post[] = (data || []).map(p => ({
                id: p.id,
                date: p.date,
                time: p.time,
                platform: p.platform as Platform,
                objective: p.objective,
                status: p.status as PostStatus,
                isPaid: p.is_paid,
                budget: p.budget,
                copy: p.copy,
                image: p.image,
                brandId: p.brand_id,
                createdAt: p.created_at,
                campaign_name: p.campaign_name,
                ad_group_name: p.ad_group_name,
                ad_id: p.ad_id
            }));

            setPosts(prev => [...prev, ...newPosts]);
        } catch (err: any) {
            console.error('Error bulk adding posts:', err);
            throw err;
        }
    };

    const updatePost = async (id: string | number, updates: Partial<Post>) => {
        try {
            // Transform updates to snake_case
            const dbUpdates: any = {};
            if (updates.date !== undefined) dbUpdates.date = updates.date;
            if (updates.time !== undefined) dbUpdates.time = updates.time;
            if (updates.platform !== undefined) dbUpdates.platform = updates.platform;
            if (updates.objective !== undefined) dbUpdates.objective = updates.objective;
            if (updates.status !== undefined) dbUpdates.status = updates.status;
            if (updates.isPaid !== undefined) dbUpdates.is_paid = updates.isPaid;
            if (updates.budget !== undefined) dbUpdates.budget = updates.budget;
            if (updates.copy !== undefined) dbUpdates.copy = updates.copy;
            if (updates.image !== undefined) dbUpdates.image = updates.image;
            if (updates.campaign_name !== undefined) dbUpdates.campaign_name = updates.campaign_name;
            if (updates.ad_group_name !== undefined) dbUpdates.ad_group_name = updates.ad_group_name;
            if (updates.ad_id !== undefined) dbUpdates.ad_id = updates.ad_id;

            dbUpdates.updated_at = new Date().toISOString();

            const { error } = await supabase
                .from('posts')
                .update(dbUpdates)
                .eq('id', id);

            if (error) throw error;

            // Optimistic update
            setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        } catch (err: any) {
            console.error('Error updating post:', err);
            throw err;
        }
    };

    const deletePost = async (id: string | number) => {
        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setPosts(prev => prev.filter(p => p.id !== id));
        } catch (err: any) {
            console.error('Error deleting post:', err);
            throw err;
        }
    };

    const bulkDeletePosts = async (ids: (string | number)[]) => {
        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .in('id', ids);

            if (error) throw error;

            setPosts(prev => prev.filter(p => !ids.includes(p.id!)));
        } catch (err: any) {
            console.error('Error bulk deleting posts:', err);
            throw err;
        }
    };

    const bulkUpdatePostStatus = async (ids: (string | number)[], status: any) => {
        try {
            const { error } = await supabase
                .from('posts')
                .update({ status, updated_at: new Date().toISOString() })
                .in('id', ids);

            if (error) throw error;

            setPosts(prev => prev.map(p => ids.includes(p.id!) ? { ...p, status } : p));
        } catch (err: any) {
            console.error('Error bulk updating posts:', err);
            throw err;
        }
    };

    const refreshPosts = async () => {
        await loadPosts();
    };

    return (
        <PostContext.Provider value={{
            posts,
            loading,
            error,
            addPost,
            bulkAddPosts,
            updatePost,
            deletePost,
            bulkDeletePosts,
            bulkUpdatePostStatus,
            refreshPosts
        }}>
            {children}
        </PostContext.Provider>
    );
};

export const usePosts = () => {
    const context = useContext(PostContext);
    if (!context) throw new Error('usePosts must be used within a PostProvider');
    return context;
};
