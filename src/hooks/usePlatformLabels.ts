import { useMemo } from 'react';
import { getPlatformMetadata } from '../utils/platformMetadata';

/**
 * Custom hook for platform-specific UI labels and validation
 * Returns adaptive labels based on selected platform
 */
export const usePlatformLabels = (platform: string) => {
    return useMemo(() => {
        const metadata = getPlatformMetadata(platform);
        return {
            adGroupLabel: metadata.adGroupLabel,
            adGroupPlaceholder: metadata.adGroupPlaceholder,
            adIdHelper: metadata.adIdHelper,
            adIdPattern: metadata.adIdPattern,
            showAdGroup: metadata.showAdGroup,
            platformName: metadata.name
        };
    }, [platform]);
};
