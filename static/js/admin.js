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
        container.innerHTML = '<aside class="ads-sidebar" id="external-ads-list" style="position:fixed;left:0;top:0;z-index:9999;"></aside>';
        
        async function loadAds() {
            try {
                const res = await fetch('${baseUrl}/api/ads');
                const ads = await res.json();
                const list = document.getElementById('external-ads-list');
                list.innerHTML = ads.map(ad => \`
                    <div class="ad-card" onclick="window.open('\${ad.redirect_url}', '_blank')">
                        <img src="\${ad.logo_url}" style="width:100%;border-radius:8px;">
                        <h3 style="color:white;font-size:14px;margin-top:8px;">\${ad.ad_text}</h3>
                    </div>
                \`).join('');
            } catch(e) { console.error('Ads failed', e); }
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
