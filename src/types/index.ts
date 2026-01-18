export const PLATFORMS = ['Instagram', 'Facebook', 'Twitter', 'Google Ads', 'WhatsApp', 'TikTok', 'LinkedIn'] as const;
export type Platform = typeof PLATFORMS[number];

export type PostStatus = 'Draft' | 'Approved' | 'Scheduled' | 'Published';

export interface Post {
    id?: string | number; // Auto-incremented by Dexie (number) or UUID by Supabase (string)
    date: string; // ISO Date string (YYYY-MM-DD)
    time: string; // 24h format (HH:mm)
    platform: Platform;
    objective: string;
    status: PostStatus;
    isPaid: boolean;
    budget: number; // Currency value
    copy: string;
    image?: string; // Base64 string or URL
    brand?: string; // Brand name (optional for backward compatibility)
    createdAt?: number | string; // Timestamp (number) or ISO string
    brandId?: string; // Link to Brand ID - Made optional to support types, but required for Supabase

    // Strategy fields (unified backend, polymorphic UI)
    campaign_name?: string;      // Master campaign (cross-platform grouper)
    ad_group_name?: string;      // Generic: Ad Set/Ad Group/Campaign Group
    ad_id?: string;              // Platform-specific ID
}

export interface Brand {
    id: string;
    name: string;
    logo: string; // Base64
    industry: string;
    activeNetworks: Platform[];
    colors: {
        primary: string;
        secondary: string;
    };
}

export interface KPIData {
    id: string;
    brandId: string;
    month: string; // YYYY-MM
    awareness: {
        reach: number;
        impressions: number;
        soV: number;
        growthRate: number;
    };
    engagement: {
        likes: number;
        comments: number;
        shares: number;
        saves: number;
        engagementRate: number;
        sentiment: number;
    };
    performance: {
        clicks: number;
        ctr: number;
        conversions: number;
        bounceRate: number;
        leads: number;
    };
    financials: {
        totalSpend: number;
        cpc: number;
        cpm: number;
        cpl: number;
        roas: number;
        cac: number;
    };
}

export interface APICredentials {
    id: string;
    brandId: string;
    platform: 'meta' | 'tiktok' | 'whatsapp' | 'linkedin';
    credentials: {
        // Meta (Facebook/Instagram)
        appId?: string;
        appSecret?: string;
        pageAccessToken?: string;
        adAccountId?: string; // act_567890

        // TikTok
        clientKey?: string;
        clientSecret?: string;
        accessToken?: string;
        advertiserId?: string;

        // WhatsApp Business Cloud
        phoneNumberId?: string;
        wabaId?: string; // WhatsApp Business Account ID
        permanentAccessToken?: string;

        // LinkedIn Marketing
        clientId?: string;
        // clientSecret already covered
        adAccountUrn?: string;
    };
    isConnected: boolean;
    lastSync?: number;
}

// API Response Types
export interface MetaInsightsResponse {
    data: Array<{
        spend: string;
        purchase_roas?: Array<{ value: string }>;
        cpc: string;
        ctr: string;
        impressions: string;
        actions?: Array<{ action_type: string; value: string }>;
    }>;
}

export interface TikTokReportResponse {
    data: {
        list: Array<{
            metrics: {
                spend: number;
                cpc: number;
                conversion: number;
                video_views_p75: number;
                comments: number;
                likes: number;
                shares: number;
                impressions: number;
            };
        }>;
    };
}

export interface WhatsAppAnalyticsResponse {
    conversation_analytics: {
        cost: Array<{ value: number }>;
    };
    messages_sent: number;
    messages_delivered: number;
}

export interface LinkedInAnalyticsResponse {
    elements: Array<{
        costInLocalCurrency: number;
        impressions: number;
        clicks: number;
        externalWebsiteConversions: number;
    }>;
}

// Unified Data Structure
export interface FetchedKPIData {
    platform: 'meta' | 'tiktok' | 'whatsapp' | 'linkedin';
    spend: number;
    impressions: number;
    clicks: number;
    cpc: number;
    ctr?: number;
    roas?: number;
    engagementRate?: number;
    conversions?: number;
    rawData: any;
    fetchedAt: number;
}

export interface DataFetchResult {
    success: boolean;
    data?: FetchedKPIData[];
    errors: Array<{ platform: string; message: string }>;
    usedFallback: boolean;
}
