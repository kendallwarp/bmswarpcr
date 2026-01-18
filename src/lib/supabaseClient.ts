import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Running in offline mode.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    }
});

// Types for database tables
export interface Profile {
    id: string;
    full_name: string;
    avatar_url: string | null;
    role: 'Admin' | 'Editor';
    created_at: string;
    updated_at: string;
}

export interface Brand {
    id: string;
    name: string;
    color: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    // Additional fields
    industry?: string;
    logo?: string;
    activeNetworks?: string[];

    // API Credentials
    meta_access_token?: string;
    meta_ad_account_id?: string;
    tiktok_access_token?: string;
    tiktok_advertiser_id?: string;
    whatsapp_business_account_id?: string;
    whatsapp_phone_number_id?: string;
    linkedin_access_token?: string;
    linkedin_organization_id?: string;
}

export interface Post {
    id: string;
    brand_id: string;
    created_by: string;
    date: string;
    time: string;
    platform: string;
    objective: string;
    status: 'Draft' | 'Approved' | 'Scheduled' | 'Published';
    copy: string;
    image?: string;
    is_paid: boolean;
    budget: number;
    campaign_name?: string;
    ad_group_name?: string;
    ad_id?: string;
    created_at: string;
    updated_at: string;
}
