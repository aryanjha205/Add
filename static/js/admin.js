const adsTableBody = document.getElementById('ads-table-body');
const adModal = document.getElementById('ad-modal');
const adForm = document.getElementById('ad-form');

// Load Ads on Init
document.addEventListener('DOMContentLoaded', fetchAds);

async function fetchAds() {
    try {
        const res = await fetch('/api/admin/ads');
        const ads = await res.json();
        renderAds(ads);
    } catch (err) {
        console.error('Failed to fetch ads:', err);
    }
}

function renderAds(ads) {
    adsTableBody.innerHTML = ads.map(ad => `
        <tr>
            <td>
                <img src="${ad.logo_url}" alt="Ad" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid var(--glass-border);">
            </td>
            <td>
                <div style="font-weight: 600;">${ad.ad_text.substring(0, 30)}${ad.ad_text.length > 30 ? '...' : ''}</div>
                <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 4px;">${ad.redirect_url}</div>
            </td>
            <td>
                <span class="badge badge-${ad.status}">${ad.status.toUpperCase()}</span>
            </td>
            <td>
                <div style="font-size: 0.85rem;">
                    <div><i class="fas fa-eye"></i> ${ad.impressions || 0}</div>
                    <div><i class="fas fa-mouse-pointer"></i> ${ad.clicks || 0}</div>
                </div>
            </td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn" style="padding: 0.5rem; background: rgba(99, 102, 241, 0.1); color: var(--primary);" onclick="editAd('${ad._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn" style="padding: 0.5rem; background: rgba(239, 68, 68, 0.1); color: var(--danger);" onclick="deleteAd('${ad._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openModal() {
    adModal.style.display = 'flex';
    document.getElementById('modal-title').innerText = 'Create New Ad';
    adForm.reset();
    document.getElementById('ad-id').value = '';
}

function closeModal() {
    adModal.style.display = 'none';
}

async function editAd(id) {
    try {
        const res = await fetch('/api/admin/ads');
        const ads = await res.json();
        const ad = ads.find(a => a._id === id);
        if (!ad) return;

        document.getElementById('ad-id').value = ad._id;
        document.getElementById('logo_url').value = ad.logo_url;
        document.getElementById('ad_text').value = ad.ad_text;
        document.getElementById('redirect_url').value = ad.redirect_url;
        document.getElementById('status').value = ad.status;

        adModal.style.display = 'flex';
        document.getElementById('modal-title').innerText = 'Edit Advertisement';
    } catch (err) {
        alert('Failed to load ad details');
    }
}

adForm.onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('ad-id').value;
    const data = {
        logo_url: document.getElementById('logo_url').value,
        ad_text: document.getElementById('ad_text').value,
        redirect_url: document.getElementById('redirect_url').value,
        status: document.getElementById('status').value
    };

    const url = id ? `/api/admin/ads/${id}` : '/api/admin/ads';
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        if (res.ok) {
            closeModal();
            fetchAds();
        } else {
            alert(result.error || 'Operation failed');
        }
    } catch (err) {
        alert('Operation failed: Network error or server unreachable');
    }
};

async function deleteAd(id) {
    if (!confirm('Are you sure you want to delete this ad?')) return;
    try {
        const res = await fetch(`/api/admin/ads/${id}`, { method: 'DELETE' });
        if (res.ok) fetchAds();
    } catch (err) {
        alert('Deletion failed');
    }
}

// --- Embed Code Logic ---
const embedModal = document.getElementById('embed-modal');
const embedCodeBox = document.getElementById('embed-code-box');

function openEmbedModal() {
    const baseUrl = window.location.origin;
    const snippet = `<!-- Ad Platform Integration Start -->
<div id="ad-platform-panel"></div>
<link rel="stylesheet" href="${baseUrl}/static/css/style.css">
<script>
    (function() {
        const container = document.getElementById('ad-platform-panel');
        container.innerHTML = '<aside class="ads-sidebar" style="position:fixed;right:20px;bottom:20px;z-index:9999;width:250px;background:rgba(15,23,42,0.9);padding:1rem;border-radius:1.5rem;"><div id="external-ads-list" style="transition:opacity 0.5s ease;"></div></aside>';
        
        let currentAds = [];
        let currentIndex = 0;

        async function loadAds() {
            try {
                const res = await fetch('${baseUrl}/api/ads');
                currentAds = await res.json();
                if (currentAds.length > 0) startRotation();
            } catch(e) { console.error('Ads failed', e); }
        }

        function startRotation() {
            renderAd();
            setInterval(() => {
                currentIndex = (currentIndex + 1) % currentAds.length;
                renderAd();
            }, 6000);
        }

        function renderAd() {
            const ad = currentAds[currentIndex];
            const list = document.getElementById('external-ads-list');
            list.style.opacity = '0';
            setTimeout(() => {
                list.innerHTML = \`
                    <div class="ad-card" style="display:flex;align-items:center;gap:12px;cursor:pointer;" onclick="window.open('\${ad.redirect_url}', '_blank')">
                        <img src="\${ad.logo_url}" style="width:48px;height:48px;border-radius:50%;object-shrink:0;border:2px solid #6366f1;">
                        <div style="flex-grow:1;overflow:hidden;">
                            <h3 style="color:#1e293b;font-size:14px;margin:0;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\${ad.ad_text}</h3>
                            <p style="color:#64748b;font-size:11px;margin:0;">Sponsored • Learn More</p>
                        </div>
                    </div>
                \`;
                list.style.opacity = '1';
                fetch('${baseUrl}/api/ads/' + ad._id + '/impression', { method: 'POST' });
            }, 500);
        }
        loadAds();
    })();
<\/script>
<!-- Ad Platform Integration End -->`;

    embedCodeBox.innerText = snippet;
    embedModal.style.display = 'flex';
}

function closeEmbedModal() {
    embedModal.style.display = 'none';
}

function copyEmbedCode() {
    navigator.clipboard.writeText(embedCodeBox.innerText);
    const btn = event.target.closest('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    setTimeout(() => btn.innerHTML = originalText, 2000);
}
