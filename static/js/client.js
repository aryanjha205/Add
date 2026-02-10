const adsList = document.getElementById('ads-list');

document.addEventListener('DOMContentLoaded', fetchAds);

async function fetchAds() {
    try {
        const res = await fetch('/api/ads');
        const ads = await res.json();
        renderClientAds(ads);
    } catch (err) {
        adsList.innerHTML = '<div style="text-align: center; color: #ef4444;">Failed to load ads</div>';
    }
}

function renderClientAds(ads) {
    if (ads.length === 0) {
        adsList.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 2rem;">No active ads available.</div>';
        return;
    }

    adsList.innerHTML = ads.map(ad => `
        <div class="ad-card" onclick="handleAdClick('${ad._id}', '${ad.redirect_url}')">
            <img src="${ad.logo_url}" alt="Promotion" onerror="this.src='https://via.placeholder.com/300x150?text=Ad+Image'">
            <h3>${ad.ad_text}</h3>
            <p>Click to learn more</p>
        </div>
    `).join('');

    // Track Impressions
    ads.forEach(ad => trackImpression(ad._id));
}

async function handleAdClick(adId, redirectUrl) {
    // Track click
    try {
        await fetch(`/api/ads/${adId}/click`, { method: 'POST' });
    } catch (err) {
        console.error('Click tracking failed:', err);
    }
    // Open in new tab
    window.open(redirectUrl, '_blank');
}

async function trackImpression(adId) {
    try {
        await fetch(`/api/ads/${adId}/impression`, { method: 'POST' });
    } catch (err) {
        console.error('Impression tracking failed:', err);
    }
}
