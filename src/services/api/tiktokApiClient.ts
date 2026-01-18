import { deobfuscate } from '../../utils/encryption';
import type { APICredentials, TikTokReportResponse, FetchedKPIData } from '../../types';

/**
 * TikTok for Business - Reporting API Client
 * Endpoint: /v1.3/reports/integrated/get/
 */

export const fetchTikTokReports = async (
    credentials: APICredentials,
    dateRange?: { start: Date; end: Date }
): Promise<FetchedKPIData> => {
    const { accessToken, advertiserId } = credentials.credentials;

    if (!accessToken || !advertiserId) {
        throw new Error('Missing required TikTok credentials: Access Token and Advertiser ID');
    }

    const deobfuscatedToken = deobfuscate(accessToken);
    const deobfuscatedAdvertiserId = deobfuscate(advertiserId);

    // Build date range
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startDate = dateRange?.start || thirtyDaysAgo;
    const endDate = dateRange?.end || today;

    const requestBody = {
        advertiser_id: deobfuscatedAdvertiserId,
        service_type: 'AUCTION',
        report_type: 'BASIC',
        data_level: 'AUCTION_CAMPAIGN',
        dimensions: ['campaign_id', 'stat_time_day'],
        metrics: ['spend', 'cpc', 'conversion', 'video_views_p75', 'comments', 'likes', 'shares', 'impressions'],
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        page_size: 1000
    };

    const url = 'https://business-api.tiktok.com/open_api/v1.3/reports/integrated/get/';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Access-Token': deobfuscatedToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`TikTok API error: ${response.status} ${response.statusText}`);
        }

        const data: TikTokReportResponse = await response.json();

        // Aggregate metrics
        let totalSpend = 0;
        let totalImpressions = 0;
        let totalClicks = 0;
        let totalConversions = 0;
        let totalEngagements = 0;
        let totalVideoViews = 0;

        data.data.list.forEach(item => {
            const m = item.metrics;
            totalSpend += m.spend || 0;
            totalImpressions += m.impressions || 0;
            totalConversions += m.conversion || 0;
            totalVideoViews += m.video_views_p75 || 0;

            // Calculate total engagements
            totalEngagements += (m.likes || 0) + (m.comments || 0) + (m.shares || 0);
        });

        // Calculate derived metrics
        const avgCpc = data.data.list.reduce((sum, item) => sum + (item.metrics.cpc || 0), 0) / data.data.list.length;
        const engagementRate = totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0;

        return {
            platform: 'tiktok',
            spend: totalSpend,
            impressions: totalImpressions,
            clicks: totalClicks,
            cpc: avgCpc,
            engagementRate,
            conversions: totalConversions,
            rawData: data,
            fetchedAt: Date.now()
        };
    } catch (error) {
        console.error('TikTok API fetch error:', error);
        throw error;
    }
};
