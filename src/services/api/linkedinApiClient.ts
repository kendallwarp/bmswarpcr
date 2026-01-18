import { deobfuscate } from '../../utils/encryption';
import type { APICredentials, LinkedInAnalyticsResponse, FetchedKPIData } from '../../types';

/**
 * LinkedIn Marketing - Ad Analytics API Client
 * Endpoint: /adAnalyticsV2
 */

export const fetchLinkedInAnalytics = async (
    credentials: APICredentials,
    dateRange?: { start: Date; end: Date }
): Promise<FetchedKPIData> => {
    const { clientId, clientSecret, adAccountUrn } = credentials.credentials;

    if (!clientId || !clientSecret || !adAccountUrn) {
        throw new Error('Missing required LinkedIn credentials');
    }

    // const deobfuscatedClientId = deobfuscate(clientId); // Unused
    const deobfuscatedClientSecret = deobfuscate(clientSecret);
    const deobfuscatedAccountUrn = deobfuscate(adAccountUrn);

    // Build date range
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startDate = dateRange?.start || thirtyDaysAgo;
    const endDate = dateRange?.end || today;

    const params = new URLSearchParams({
        q: 'analytics',
        pivot: 'CAMPAIGN',
        dateRange: JSON.stringify({
            start: {
                year: startDate.getFullYear(),
                month: startDate.getMonth() + 1,
                day: startDate.getDate()
            },
            end: {
                year: endDate.getFullYear(),
                month: endDate.getMonth() + 1,
                day: endDate.getDate()
            }
        }),
        accounts: `urn:li:sponsoredAccount:${deobfuscatedAccountUrn}`,
        fields: 'costInLocalCurrency,impressions,clicks,externalWebsiteConversions'
    });

    const url = `https://api.linkedin.com/v2/adAnalyticsV2?${params}`;

    try {
        // Note: LinkedIn requires OAuth 2.0 token, not just client credentials
        // This is a simplified example - production needs proper OAuth flow
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${deobfuscatedClientSecret}`, // This should be an OAuth token
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            }
        });

        if (!response.ok) {
            throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`);
        }

        const data: LinkedInAnalyticsResponse = await response.json();

        // Aggregate metrics
        let totalCost = 0;
        let totalImpressions = 0;
        let totalClicks = 0;
        let totalConversions = 0;

        data.elements.forEach(element => {
            totalCost += element.costInLocalCurrency || 0;
            totalImpressions += element.impressions || 0;
            totalClicks += element.clicks || 0;
            totalConversions += element.externalWebsiteConversions || 0;
        });

        const avgCpc = totalClicks > 0 ? totalCost / totalClicks : 0;
        const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

        return {
            platform: 'linkedin',
            spend: totalCost,
            impressions: totalImpressions,
            clicks: totalClicks,
            cpc: avgCpc,
            ctr,
            conversions: totalConversions,
            rawData: data,
            fetchedAt: Date.now()
        };
    } catch (error) {
        console.error('LinkedIn API fetch error:', error);
        throw error;
    }
};
