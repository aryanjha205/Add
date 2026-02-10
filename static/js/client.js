const adsList = document.getElementById('ads-list');
let currentAds = [];
let currentIndex = 0;

document.addEventListener('DOMContentLoaded', fetchAds);

async function fetchAds() {
    try {
        const res = await fetch('/api/ads');
        const ads = await res.json();
        currentAds = ads;
        if (currentAds.length > 0) {
            startAdRotation();
        } else {
            adsList.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 1rem;">No active ads.</div>';
        }
    } catch (err) {
        adsList.innerHTML = '<div style="text-align: center; color: #ef4444;">Failed to load ads</div>';
    }
}

function startAdRotation() {
    renderSingleAd();
    setInterval(() => {
        currentIndex = (currentIndex + 1) % currentAds.length;
        renderSingleAd();
    }, 6000); // Rotate every 6 seconds
}

function renderSingleAd() {
    const ad = currentAds[currentIndex];
    adsList.style.opacity = '0';

    setTimeout(() => {
        adsList.innerHTML = `
            <div class="ad-card" onclick="handleAdClick('${ad._id}', '${ad.redirect_url}')">
                <img src="${ad.logo_url}" alt="Promotion" onerror="this.src='https://via.placeholder.com/512x512?text=Ad'">
                <div class="ad-card-content">
                    <h3>${ad.ad_text}</h3>
                    <p>Sponsored • Learn More</p>
                </div>
            </div>
        `;
        adsList.style.opacity = '1';
        trackImpression(ad._id);
    }, 500);
}

// Ensure ads-list has transition
adsList.style.transition = 'opacity 0.5s ease';

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
