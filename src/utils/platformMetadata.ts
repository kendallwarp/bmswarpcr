/**
 * Platform Metadata - Centralized configuration for platform-specific terminology
 * This enables polymorphic UI that adapts to each social media platform's native language
 */

export interface PlatformMetadata {
    name: string;
    adGroupLabel: string;
    adGroupPlaceholder: string;
    adIdHelper: string;
    adIdPattern?: RegExp;
    showAdGroup: boolean;
}

export const PLATFORM_METADATA: Record<string, PlatformMetadata> = {
    facebook: {
        name: 'Facebook',
        adGroupLabel: 'Ad Set Name',
        adGroupPlaceholder: 'Ej: Audiencia 25-34 años',
        adIdHelper: 'Ej: 23847656221840001 (solo números)',
        adIdPattern: /^\d+$/,
        showAdGroup: true
    },
    instagram: {
        name: 'Instagram',
        adGroupLabel: 'Ad Set Name',
        adGroupPlaceholder: 'Ej: Stories Premium',
        adIdHelper: 'Ej: 23847656221840001 (solo números)',
        adIdPattern: /^\d+$/,
        showAdGroup: true
    },
    tiktok: {
        name: 'TikTok',
        adGroupLabel: 'Ad Group Name',
        adGroupPlaceholder: 'Ej: Video Viral 18-24',
        adIdHelper: 'Ej: 1789234567890 (solo números)',
        adIdPattern: /^\d+$/,
        showAdGroup: true
    },
    google: {
        name: 'Google Ads',
        adGroupLabel: 'Ad Group Name',
        adGroupPlaceholder: 'Ej: Búsqueda Brand',
        adIdHelper: 'Ej: 1234567890',
        adIdPattern: /^\d+$/,
        showAdGroup: true
    },
    pinterest: {
        name: 'Pinterest',
        adGroupLabel: 'Ad Group Name',
        adGroupPlaceholder: 'Ej: Inspiración Hogar',
        adIdHelper: 'Ej: 1234567890',
        adIdPattern: /^\d+$/,
        showAdGroup: true
    },
    linkedin: {
        name: 'LinkedIn',
        adGroupLabel: 'Campaign Group',
        adGroupPlaceholder: 'Ej: B2B Decision Makers',
        adIdHelper: 'Ej: urn:li:share:1234567890 o 1234567890',
        adIdPattern: /^(urn:li:\w+:\d+|\d+)$/,
        showAdGroup: true
    },
    whatsapp: {
        name: 'WhatsApp',
        adGroupLabel: 'Segmento de Audiencia',
        adGroupPlaceholder: 'Ej: Clientes VIP',
        adIdHelper: 'Opcional - No aplica para WhatsApp',
        showAdGroup: true // Shown but with different label
    },
    organic: {
        name: 'Orgánico',
        adGroupLabel: 'Segmento de Audiencia',
        adGroupPlaceholder: 'Ej: Seguidores activos',
        adIdHelper: 'No aplica para contenido orgánico',
        showAdGroup: false // Hidden for organic
    },
    twitter: {
        name: 'Twitter/X',
        adGroupLabel: 'Ad Group Name',
        adGroupPlaceholder: 'Ej: Trending Topics',
        adIdHelper: 'Ej: 1234567890',
        adIdPattern: /^\d+$/,
        showAdGroup: true
    },
    youtube: {
        name: 'YouTube',
        adGroupLabel: 'Ad Group Name',
        adGroupPlaceholder: 'Ej: Video Discovery',
        adIdHelper: 'Ej: 1234567890',
        adIdPattern: /^\d+$/,
        showAdGroup: true
    }
};

/**
 * Get platform-specific metadata
 * Falls back to organic if platform not found
 */
export const getPlatformMetadata = (platform: string): PlatformMetadata => {
    const normalizedPlatform = platform.toLowerCase().trim();
    return PLATFORM_METADATA[normalizedPlatform] || PLATFORM_METADATA.organic;
};

/**
 * Validate platform-specific ID format
 */
export const validatePlatformId = (platform: string, id: string): boolean => {
    if (!id) return true; // Empty is valid (optional field)

    const metadata = getPlatformMetadata(platform);
    if (!metadata.adIdPattern) return true; // No pattern = accept anything

    return metadata.adIdPattern.test(id);
};
