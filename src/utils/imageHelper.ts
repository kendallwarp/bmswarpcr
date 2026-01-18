export const getImageUrl = (urlOrBase64?: string): string | undefined => {
    if (!urlOrBase64) return undefined;

    // Check if it's a Google Drive share link and convert to direct download/view link if possible
    // Typical format: https://drive.google.com/file/d/VIDEO_ID/view?usp=sharing
    // Target format: https://lh3.googleusercontent.com/d/VIDEO_ID 
    // OR https://drive.google.com/uc?export=view&id=VIDEO_ID (often has quotas)
    // Reliability of GDrive direct links is patchy without API, but "uc?export=view" is common hack.
    // Better yet, just return the original if we can't be sure, but let's try to normalize basic ones.

    if (urlOrBase64.includes('drive.google.com') && urlOrBase64.includes('/d/')) {
        const idMatch = urlOrBase64.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (idMatch && idMatch[1]) {
            // 'lh3.googleusercontent.com/d/' is often more reliable for images as it bypasses some virus scan interstitial logic for smaller files
            return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
        }
    }

    return urlOrBase64;
};
