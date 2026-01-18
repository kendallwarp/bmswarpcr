import { deobfuscate } from '../../utils/encryption';
import type { APICredentials, WhatsAppAnalyticsResponse, FetchedKPIData } from '../../types';

/**
 * WhatsApp Business Cloud - Analytics API Client
 * Endpoint: /v19.0/{waba_id}
 */

export const fetchWhatsAppAnalytics = async (
    credentials: APICredentials,
    dateRange?: { start: Date; end: Date }
): Promise<FetchedKPIData> => {
    const { wabaId, permanentAccessToken } = credentials.credentials;

    if (!wabaId || !permanentAccessToken) {
        throw new Error('Missing required WhatsApp credentials: WABA ID and Permanent Access Token');
    }

    const deobfuscatedToken = deobfuscate(permanentAccessToken);
    const deobfuscatedWabaId = deobfuscate(wabaId);

    // Build date range
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startDate = dateRange?.start || thirtyDaysAgo;
    const endDate = dateRange?.end || today;

    const params = new URLSearchParams({
        access_token: deobfuscatedToken,
        start: Math.floor(startDate.getTime() / 1000).toString(),
        end: Math.floor(endDate.getTime() / 1000).toString(),
        granularity: 'daily'
    });

    const url = `https://graph.facebook.com/v19.0/${deobfuscatedWabaId}?${params}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`WhatsApp API error: ${response.status} ${response.statusText}`);
        }

        const data: WhatsAppAnalyticsResponse = await response.json();

        // Calculate metrics
        const totalCost = data.conversation_analytics?.cost?.reduce((sum, item) => sum + item.value, 0) || 0;
        const messagesDelivered = data.messages_delivered || 0;
        // const deliveryRate = messagesSent > 0 ? (messagesDelivered / messagesSent) * 100 : 0; // Unused

        // We use conversations as a proxy metric
        const conversations = data.conversation_analytics?.cost?.length || 0;

        return {
            platform: 'whatsapp',
            spend: totalCost,
            impressions: conversations, // Using conversations as proxy
            clicks: messagesDelivered,
            cpc: conversations > 0 ? totalCost / conversations : 0,
            conversions: messagesDelivered,
            rawData: data,
            fetchedAt: Date.now()
        };
    } catch (error) {
        console.error('WhatsApp API fetch error:', error);
        throw error;
    }
};
