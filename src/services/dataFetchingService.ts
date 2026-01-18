import { supabase } from '../lib/supabaseClient';
import { fetchMetaInsights } from './api/metaApiClient';
import { fetchTikTokReports } from './api/tiktokApiClient';
import { fetchWhatsAppAnalytics } from './api/whatsappApiClient';
import { fetchLinkedInAnalytics } from './api/linkedinApiClient';
import type { DataFetchResult, FetchedKPIData, APICredentials } from '../types';

/**
 * Core Data Fetching Service
 * Orchestrates API calls to all connected platforms with fallback to CSV data
 */

export const fetchBrandData = async (
    brandId: string,
    dateRange?: { start: Date; end: Date }
): Promise<DataFetchResult> => {
    const result: DataFetchResult = {
        success: false,
        data: [],
        errors: [],
        usedFallback: false
    };

    try {
        // 1. Retrieve brand from Supabase
        const { data: brand, error: brandError } = await supabase
            .from('brands')
            .select('*')
            .eq('id', brandId)
            .single();

        if (brandError || !brand) {
            throw new Error(`Brand not found: ${brandId}`);
        }

        // 2. Get API credentials (TODO: Migrate to Supabase 'api_credentials' table)
        // For now, return empty or mock, since we are moving to production with no data.
        // We will assume no credentials are set up yet.
        const credentials: APICredentials[] = [];

        /* 
        // Future Supabase implementation:
        const { data: credentials } = await supabase
            .from('api_credentials')
            .select('*')
            .eq('brand_id', brandId);
        */

        if (credentials.length === 0) {
            console.warn('No API credentials found (Supabase migration pending for credentials)');
            result.usedFallback = false; // No fallback available either if we removed Dexie
            result.success = true;
            return result;
        }

        // 3. Fetch data from each connected platform
        const fetchPromises: Promise<FetchedKPIData | null>[] = [];

        for (const cred of credentials) {
            if (!cred.isConnected) continue;

            const fetchPromise = (async () => {
                try {
                    switch (cred.platform) {
                        case 'meta':
                            return await fetchMetaInsights(cred, dateRange);
                        case 'tiktok':
                            return await fetchTikTokReports(cred, dateRange);
                        case 'whatsapp':
                            return await fetchWhatsAppAnalytics(cred, dateRange);
                        case 'linkedin':
                            return await fetchLinkedInAnalytics(cred, dateRange);
                        default:
                            return null;
                    }
                } catch (error: any) {
                    console.error(`Error fetching ${cred.platform} data:`, error);
                    result.errors.push({
                        platform: cred.platform,
                        message: error.message || 'Unknown error'
                    });
                    return null;
                }
            })();

            fetchPromises.push(fetchPromise);
        }

        // 4. Wait for all fetches to complete
        const fetchedData = await Promise.all(fetchPromises);
        const validData = fetchedData.filter((d): d is FetchedKPIData => d !== null);

        result.data = validData;
        result.success = true;
        return result;

    } catch (error: any) {
        console.error('fetchBrandData error:', error);
        result.errors.push({
            platform: 'system',
            message: error.message || 'Unknown system error'
        });
        return result;
    }
};

/**
 * Helper: Retry logic with exponential backoff
 */
export const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> => {
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, i);
                console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
};
