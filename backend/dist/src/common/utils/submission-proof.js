"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePublicPostUrl = validatePublicPostUrl;
const PLATFORM_LABELS = {
    TikTok: 'a TikTok video URL',
    Instagram: 'an Instagram Reel or post URL',
    YouTube: 'a YouTube Shorts URL',
};
function validatePublicPostUrl(value, platform) {
    if (!value.trim())
        return 'Paste the direct public URL for your published clip.';
    let url;
    try {
        url = new URL(value.trim());
    }
    catch {
        return 'Enter a valid public post URL.';
    }
    if (url.protocol !== 'https:')
        return 'The post URL must use HTTPS.';
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    const path = url.pathname;
    let valid = false;
    if (platform === 'TikTok') {
        valid =
            ((host === 'tiktok.com' || host.endsWith('.tiktok.com')) &&
                /\/@[^/]+\/video\/\d+/.test(path)) ||
                ((host === 'vm.tiktok.com' || host === 'vt.tiktok.com') && path.length > 1);
    }
    else if (platform === 'Instagram') {
        valid =
            (host === 'instagram.com' || host.endsWith('.instagram.com')) &&
                /^\/(reel|reels|p)\/[^/]+/.test(path);
    }
    else if (platform === 'YouTube') {
        valid =
            (host === 'youtube.com' || host === 'm.youtube.com') &&
                /^\/shorts\/[^/]+/.test(path);
    }
    return valid
        ? null
        : `Use ${PLATFORM_LABELS[platform] ?? 'a direct post URL'}, not a profile, homepage, screenshot, or file link.`;
}
//# sourceMappingURL=submission-proof.js.map