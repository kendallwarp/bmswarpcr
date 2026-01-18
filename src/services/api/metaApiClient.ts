import { deobfuscate } from '../../utils/encryption';
import type { APICredentials, MetaInsightsResponse, FetchedKPIData } from '../../types';

/**
 * Meta (Facebook & Instagram) Marketing API Client
 * Endpoint: v19.0/{ad_account_id}/insights
 */

export const fetchMetaInsights = async (
    credentials: APICredentials,
    dateRange?: { start: Date; end: Date }
): Promise<FetchedKPIData> => {
    const { pageAccessToken, adAccountId } = credentials.credentials;

    if (!adAccountId || !pageAccessToken) {
        throw new Error('Missing required Meta credentials: Ad Account ID and Page Access Token');
    }

    const deobfuscatedToken = deobfuscate(pageAccessToken);
    const deobfuscatedAccountId = deobfuscate(adAccountId);

    // Build date range params
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startDate = dateRange?.start || thirtyDaysAgo;
    const endDate = dateRange?.end || today;

    const params = new URLSearchParams({
        access_token: deobfuscatedToken,
        level: 'campaign',
        fields: 'spend,purchase_roas,cpc,ctr,impressions,actions',
        time_range: JSON.stringify({
            since: startDate.toISOString().split('T')[0],
            until: endDate.toISOString().split('T')[0]
        })
    });

    const url = `https://graph.facebook.com/v19.0/${deobfuscatedAccountId}/insights?${params}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Meta API error: ${response.status} ${response.statusText}`);
        }

        const data: MetaInsightsResponse = await response.json();

        // Aggregate metrics across all campaigns
        let totalSpend = 0;
        let totalImpressions = 0;
        let totalClicks = 0;
        let totalRoas = 0;
        let roasCount = 0;
        let totalCtr = 0;
        let ctrCount = 0;

        data.data.forEach(campaign => {
            totalSpend += parseFloat(campaign.spend || '0');
            totalImpressions += parseInt(campaign.impressions || '0');

            if (campaign.ctr) {
                totalCtr += parseFloat(campaign.ctr);
                ctrCount++;
            }

            if (campaign.purchase_roas && campaign.purchase_roas.length > 0) {
                totalRoas += parseFloat(campaign.purchase_roas[0].value);
                roasCount++;
            }

            // Extract link clicks from actions
            if (campaign.actions) {
                const linkClicks = campaign.actions.find(a => a.action_type === 'link_click');
                if (linkClicks) {
                    totalClicks += parseInt(linkClicks.value);
                }
            }
        });

        const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
        const avgCtr = ctrCount > 0 ? totalCtr / ctrCount : 0;
        const avgRoas = roasCount > 0 ? totalRoas / roasCount : 0;

        return {
            platform: 'meta',
            spend: totalSpend,
            impressions: totalImpressions,
            clicks: totalClicks,
            cpc: avgCpc,
            ctr: avgCtr,
            roas: avgRoas,
            rawData: data,
            fetchedAt: Date.now()
        };
    } catch (error) {
        console.error('Meta API fetch error:', error);
        throw error;
    }
};
