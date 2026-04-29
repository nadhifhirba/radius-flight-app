// --- Travelpayouts Affiliate Config ---
// Aviasales uses ?marker= directly (TP's own product, no p= needed)
// Other TP programs: find p= at TP Dashboard → Programs → program → Get Link → p=XXXX in URL
const TP = {
    marker: '714578',  // account marker — who gets paid
    project: '512833', // project ID — tracks clicks from Radiusfly specifically
    programs: {
        aviasales: 4114,   // ✅ confirmed
        traveloka: null,   // fill in p= when approved
        klook: 4110,       // ✅ confirmed
        tripcom: null,     // fill in p= when approved
    }
};

function buildTPLink(destUrl, programId) {
    if (!programId) return destUrl;
    return `https://tp.media/r?marker=${TP.marker}&trs=${TP.project}&p=${programId}&u=${encodeURIComponent(destUrl)}`;
}

function buildAviasalesLink(origin, dest, date) {
    // Aviasales format: /search/ORIGMMDDDES1?marker=MARKER
    const mmdd = date && date.length === 10 ? date.slice(5).replace('-', '') : '';
    const path = mmdd ? `${origin}${mmdd}${dest}1` : `${origin}${dest}`;
    return `https://www.aviasales.com/search/${path}?marker=${TP.marker}&trs=${TP.project}`;
}

// --- 1. Data & Config ---
const MOCK_DATA = [
    { id: 101, city: "Bali", airport: "DPS", country: "Indonesia", img: "images/bali.jpg", price_one: 850000, price_round: 1600000, airline: "Super Air Jet", stops: 0, coords: [-8.748, 115.167], cheapestMonth: "March", cheapestPrice: 1400000, hotelPrice: 500000, historicalAvg: 1800000 },
    { id: 102, city: "Yogyakarta", airport: "YIA", country: "Indonesia", img: "https://images.unsplash.com/photo-1584810359583-96fc3448beaa?q=80&w=800&auto=format&fit=crop", price_one: 550000, price_round: 1000000, airline: "Lion Air", stops: 0, coords: [-7.975, 110.429], cheapestMonth: "February", cheapestPrice: 900000, hotelPrice: 300000, historicalAvg: 1200000 },
    { id: 103, city: "Singapore", airport: "SIN", country: "Singapore", img: "https://images.unsplash.com/photo-1565967511849-76a60a516170?q=80&w=800&auto=format&fit=crop", price_one: 950000, price_round: 2100000, airline: "JetStar", stops: 0, coords: [1.364, 103.991], cheapestMonth: "April", cheapestPrice: 1800000, hotelPrice: 1500000, historicalAvg: 2500000 },
    { id: 104, city: "Kuala Lumpur", airport: "KUL", country: "Malaysia", img: "images/kl.jpg", price_one: 700000, price_round: 1300000, airline: "AirAsia", stops: 0, coords: [2.745, 101.707], cheapestMonth: "March", cheapestPrice: 1100000, hotelPrice: 400000, historicalAvg: 1500000 },
    { id: 105, city: "Bangkok", airport: "DMK", country: "Thailand", img: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=800&auto=format&fit=crop", price_one: 1800000, price_round: 3200000, airline: "AirAsia", stops: 1, coords: [13.913, 100.607], cheapestMonth: "May", cheapestPrice: 2000000, hotelPrice: 600000, historicalAvg: 3000000 },
    { id: 106, city: "Labuan Bajo", airport: "LBJ", country: "Indonesia", img: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=800&auto=format&fit=crop", price_one: 1900000, price_round: 3500000, airline: "Batik Air", stops: 0, coords: [-8.485, 119.883], cheapestMonth: "November", cheapestPrice: 2800000, hotelPrice: 1000000, historicalAvg: 4000000 },
    { id: 107, city: "Tokyo", airport: "NRT", country: "Japan", img: "images/tokyo.jpg", price_one: 4500000, price_round: 8500000, airline: "Scoot", stops: 1, coords: [35.772, 140.393], cheapestMonth: "June", cheapestPrice: 7500000, hotelPrice: 1500000, historicalAvg: 9000000 },
    { id: 108, city: "Lombok", airport: "LOP", country: "Indonesia", img: "https://images.unsplash.com/photo-1573790387438-4da905039392?q=80&w=800&auto=format&fit=crop", price_one: 900000, price_round: 1750000, airline: "Super Air Jet", stops: 0, coords: [-8.762, 116.273], cheapestMonth: "February", cheapestPrice: 1500000, hotelPrice: 600000, historicalAvg: 2000000 },
    { id: 109, city: "Johor Bahru", airport: "JHB", country: "Malaysia", img: "https://images.unsplash.com/photo-1559635071-f938c82eb4db?q=80&w=800", price_one: 500000, price_round: 950000, airline: "AirAsia", stops: 0, coords: [1.636, 103.666], isHiddenGem: true, relatedTo: "Singapore", cheapestMonth: "March", cheapestPrice: 800000, hotelPrice: 350000, historicalAvg: 1100000 },
    { id: 110, city: "Banyuwangi", airport: "BWX", country: "Indonesia", img: "https://images.unsplash.com/photo-1543887019-c0ae985e51c8?q=80&w=800", price_one: 650000, price_round: 1200000, airline: "Citilink", stops: 0, coords: [-8.307, 114.3], isHiddenGem: true, relatedTo: "Bali", cheapestMonth: "April", cheapestPrice: 1000000, hotelPrice: 250000, historicalAvg: 1400000 }
];

// Database for mapping real API results to images/cities
const AIRPORT_DB = {
    "DPS": { city: "Bali", country: "Indonesia", img: "images/bali.jpg", coords: [-8.748, 115.167] },
    "YIA": { city: "Yogyakarta", country: "Indonesia", img: "https://images.unsplash.com/photo-1584810359583-96fc3448beaa?q=80&w=800", coords: [-7.975, 110.429] },
    "JOG": { city: "Yogyakarta", country: "Indonesia", img: "https://images.unsplash.com/photo-1584810359583-96fc3448beaa?q=80&w=800", coords: [-7.788, 110.432] },
    "SUB": { city: "Surabaya", country: "Indonesia", img: "https://images.unsplash.com/photo-1555899434-94d1368aa7af?q=80&w=800", coords: [-7.380, 112.787] },
    "KNO": { city: "Medan", country: "Indonesia", img: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=800", coords: [3.644, 98.885] },
    "PLM": { city: "Palembang", country: "Indonesia", img: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=800", coords: [-2.898, 104.700] },
    "BPN": { city: "Balikpapan", country: "Indonesia", img: "https://images.unsplash.com/photo-1588392382834-a891154bca4d?q=80&w=800", coords: [1.268, 116.894] },
    "MDC": { city: "Manado", country: "Indonesia", img: "https://images.unsplash.com/photo-1621412759538-bc3e4b75aece?q=80&w=800", coords: [1.549, 124.926] },
    "UPG": { city: "Makassar", country: "Indonesia", img: "https://images.unsplash.com/photo-1597211684565-dca64d72bdfe?q=80&w=800", coords: [-5.061, 119.554] },
    "LBJ": { city: "Labuan Bajo", country: "Indonesia", img: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=800", coords: [-8.485, 119.883] },
    "LOP": { city: "Lombok", country: "Indonesia", img: "https://images.unsplash.com/photo-1573790387438-4da905039392?q=80&w=800", coords: [-8.762, 116.273] },
    "SIN": { city: "Singapore", country: "Singapore", img: "https://images.unsplash.com/photo-1565967511849-76a60a516170?q=80&w=800", coords: [1.364, 103.991] },
    "KUL": { city: "Kuala Lumpur", country: "Malaysia", img: "images/kl.jpg", coords: [2.745, 101.707] },
    "DMK": { city: "Bangkok", country: "Thailand", img: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=800", coords: [13.913, 100.607] },
    "BKK": { city: "Bangkok", country: "Thailand", img: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=800", coords: [13.690, 100.750] },
    "NRT": { city: "Tokyo", country: "Japan", img: "images/tokyo.jpg", coords: [35.772, 140.393] },
    "HND": { city: "Tokyo", country: "Japan", img: "images/tokyo.jpg", coords: [35.549, 139.779] },
    "ICN": { city: "Seoul", country: "South Korea", img: "https://images.unsplash.com/photo-1538485399081-7191377e8241?q=80&w=800", coords: [37.460, 126.440] },
    "HKG": { city: "Hong Kong", country: "Hong Kong", img: "https://images.unsplash.com/photo-1506318164473-2dfd3ede3623?q=80&w=800", coords: [22.308, 113.918] },
    "SGN": { city: "Ho Chi Minh City", country: "Vietnam", img: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800", coords: [10.818, 106.651] },
    "MNL": { city: "Manila", country: "Philippines", img: "https://images.unsplash.com/photo-1518518873111-6ca469aa4560?q=80&w=800", coords: [14.508, 121.019] },
    "SYD": { city: "Sydney", country: "Australia", img: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=800", coords: [-33.939, 151.175] },
    "MEL": { city: "Melbourne", country: "Australia", img: "https://images.unsplash.com/photo-1514395462725-fb4566210144?q=80&w=800", coords: [-37.669, 144.841] },
    "DXB": { city: "Dubai", country: "UAE", img: "https://images.unsplash.com/photo-1512453979798-5ea904ac66de?q=80&w=800", coords: [25.253, 55.365] },
    "LHR": { city: "London", country: "UK", img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800", coords: [51.470, -0.454] },
    "JFK": { city: "New York", country: "USA", img: "https://images.unsplash.com/photo-1496442226666-8d4a0e62e6e9?q=80&w=800", coords: [40.641, -73.778] },
    "CDG": { city: "Paris", country: "France", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800", coords: [49.009, 2.556] },
    "AMS": { city: "Amsterdam", country: "Netherlands", img: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?q=80&w=800", coords: [52.310, 4.768] },
    "JHB": { city: "Johor Bahru", country: "Malaysia", img: "https://images.unsplash.com/photo-1559635071-f938c82eb4db?q=80&w=800", coords: [1.636, 103.666] },
    "BWX": { city: "Banyuwangi", country: "Indonesia", img: "https://images.unsplash.com/photo-1543887019-c0ae985e51c8?q=80&w=800", coords: [-8.307, 114.3] }
};

// --- Advanced Features State ---
let userProfile = null;
let searchHistory = JSON.parse(localStorage.getItem('radiusHistory') || '[]');
const IS_DARK_MODE = localStorage.getItem('darkMode') === 'true';

if (IS_DARK_MODE) document.body.classList.add('dark');

// --- 2. Utils & View Logic ---

// Utility: Sanitize text for innerHTML safety
const sanitize = (str) => {
    if (!str) return "";
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
};

const showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const color = type === 'success' ? 'bg-emerald-500' : 'bg-slate-800';
    toast.className = `${color} text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium toast pointer-events-auto flex items-center gap-2`;
    // Toast messages are static in this app, but sanitizing is good practice
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : '•';
    toast.innerHTML = `<span class="font-bold">${icon}</span> ${sanitize(message)}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

function togglePriceAlert() {
    const modal = document.getElementById('alert-modal');
    modal.classList.remove('hidden');
    modal.setAttribute('aria-modal', 'true');
    setTimeout(() => document.getElementById('alert-email').focus(), 50);
}

function closeAlertModal() {
    document.getElementById('alert-modal').classList.add('hidden');
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('alert-modal');
        if (!modal.classList.contains('hidden')) closeAlertModal();
    }
});

async function submitPriceAlert() {
    const email = document.getElementById('alert-email').value.trim();
    const origin = document.getElementById('origin').value;
    const budget = document.getElementById('budget').value;

    const emailInput = document.getElementById('alert-email');
    if (!email || !emailInput.validity.valid) {
        showToast('Masukkan email yang valid', 'error');
        return;
    }

    const btn = document.getElementById('alert-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Menyimpan...';

    try {
        const res = await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, origin, maxPrice: budget })
        });
        if (res.ok) {
            showToast('Price alert aktif! Cek email kamu ✈️', 'success');
            closeAlertModal();
        } else {
            showToast('Gagal menyimpan, coba lagi', 'error');
        }
    } catch {
        showToast('Gagal menyimpan, coba lagi', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Aktifkan Alert';
    }
}

// --- Dark Mode ---
function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', isDark);

    // Update Icons
    const themeIcon = document.getElementById('theme-icon-nav');
    if (themeIcon) {
        themeIcon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    showToast(`${isDark ? 'Night Flight' : 'Standard View'} activated`, 'info');
}

// --- Search History ---
function saveSearch(searchData) {
    const history = JSON.parse(localStorage.getItem('radiusHistory') || '[]');

    // Create a unique key for comparison
    const searchKey = s => `${s.origin}-${s.geoScope}-${s.budget}`;
    const newKey = searchKey(searchData);

    // Filter out if already exists, then add to front
    const updatedHistory = [
        searchData,
        ...history.filter(h => searchKey(h) !== newKey)
    ].slice(0, 5);

    localStorage.setItem('radiusHistory', JSON.stringify(updatedHistory));
    renderRecentSearches();
}

function renderRecentSearches() {
    const history = JSON.parse(localStorage.getItem('radiusHistory') || '[]');
    const container = document.getElementById('recent-searches-container');
    const list = document.getElementById('recent-searches-list');

    if (history.length === 0) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');
    list.innerHTML = history.map(h => `
        <div class="search-chip" onclick="applyHistorySearch(${JSON.stringify(h.origin)}, ${JSON.stringify(String(h.budget))}, ${JSON.stringify(h.tripType)}, ${JSON.stringify(h.geoScope)}, ${JSON.stringify(h.datePref)})">
            ${sanitize(h.origin)} \u2192 ${h.geoScope === 'domestic' ? 'Indonesia' : 'World'} (Rp ${parseInt(h.budget).toLocaleString()})
        </div>
    `).join('');
}

function applyHistorySearch(origin, budget, tripType, geoScope, datePref) {
    document.getElementById('origin').value = origin;
    document.getElementById('budget').value = budget;
    document.getElementById('tripType').value = tripType;
    document.getElementById('geoScope').value = geoScope;
    document.getElementById('datePref').value = datePref;
    handleSearch();
}

// --- Google Sign-in ---
window.onload = function () {
    google.accounts.id.initialize({
        client_id: window.GOOGLE_CLIENT_ID || '',
        callback: handleCredentialResponse
    });

    // Hidden render to enable logic
    google.accounts.id.renderButton(
        document.getElementById("google-signin-hidden"),
        { theme: "outline", size: "large" }
    );
};

function triggerGoogleSignIn() {
    // Programmatically trigger the Google Sign-in
    // Note: Standard GSI doesn't allow direct JS trigger, so we show the hidden button or prompt one-tap
    google.accounts.id.prompt();
    showToast("Redirecting to Google...", "info");
}

function handleCredentialResponse(response) {
    // Decoding JWT payload
    const responsePayload = decodeJwtResponse(response.credential);
    userProfile = {
        name: responsePayload.name,
        picture: responsePayload.picture
    };
    updateUIWithUser();
    showToast(`Welcome back, ${userProfile.name}!`, 'success');
}

function decodeJwtResponse(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

function updateUIWithUser() {
    if (!userProfile) return;
    document.getElementById('account-link').classList.add('hidden');
    const profile = document.getElementById('user-profile');
    profile.classList.remove('hidden');
    document.getElementById('user-avatar').src = userProfile.picture;
    document.getElementById('user-name').innerText = userProfile.name;
}

let map = null;
let markers = [];
let currentView = 'list';

function switchView(view) {
    const listBtn = document.getElementById('view-list');
    const mapBtn = document.getElementById('view-map');
    const grid = document.getElementById('results-grid');
    const mapContainer = document.getElementById('map-container');

    currentView = view;

    if (view === 'list') {
        listBtn.classList.remove('text-slate-500');
        listBtn.classList.add('bg-white', 'shadow-sm', 'text-slate-900');
        listBtn.setAttribute('aria-selected', 'true');

        mapBtn.classList.remove('bg-white', 'shadow-sm', 'text-slate-900');
        mapBtn.classList.add('text-slate-500');
        mapBtn.setAttribute('aria-selected', 'false');

        grid.classList.remove('hidden');
        mapContainer.classList.add('hidden');
    } else {
        mapBtn.classList.remove('text-slate-500');
        mapBtn.classList.add('bg-white', 'shadow-sm', 'text-slate-900');
        mapBtn.setAttribute('aria-selected', 'true');

        listBtn.classList.remove('bg-white', 'shadow-sm', 'text-slate-900');
        listBtn.classList.add('text-slate-500');
        listBtn.setAttribute('aria-selected', 'false');

        grid.classList.add('hidden');
        mapContainer.classList.remove('hidden');

        if (!map) {
            initMap();
        } else {
            setTimeout(() => { map.invalidateSize(); }, 200);
        }
    }
}

function initMap() {
    map = L.map('map-container').setView([2.3, 110], 4);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);
}

// --- 3. Search Logic ---
async function handleSearch(skipGridAnimation = false) {
    const budget = parseInt(document.getElementById('budget').value);
    const tripType = document.getElementById('tripType').value;
    const geoScope = document.getElementById('geoScope').value;
    const originSelect = document.getElementById('origin');
    // Amadeus needs 3 letter code
    const ORIGIN_MAP = {
        'Jakarta': 'CGK', 'Bali': 'DPS', 'Surabaya': 'SUB',
        'Yogyakarta': 'YIA', 'Medan': 'KNO', 'Makassar': 'UPG'
    };
    const originCode = ORIGIN_MAP[originSelect.value] || 'CGK';

    // UI Elements
    const grid = document.getElementById('results-grid');
    const countLabel = document.getElementById('result-count');
    const activeFilter = document.getElementById('active-filter');
    const budgetDisplay = document.getElementById('budget-display');

    if (!skipGridAnimation) document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });

    // Show Loading
    let loadingInterval = null;
    if (currentView === 'list' && !skipGridAnimation) {
        const LOADING_LINES = [
            "Scanning routes across 21 destinations…",
            "Asking Google Flights very nicely…",
            "Calculating how far your budget flies…",
            "Bribing airlines for better deals…",
            "Checking if you can afford business class (you can't)…",
            "Sorting through thousands of fares…",
            "Finding the cheapest seat that isn't the middle one…",
            "Almost there — airlines are slow repliers…",
        ];
        let msgIdx = 0;

        const wrapper = document.createElement('div');
        wrapper.id = 'loading-state';
        wrapper.className = 'col-span-full flex flex-col items-center justify-center py-24 gap-6';

        const plane = document.createElement('div');
        plane.className = 'text-6xl loading-plane';
        plane.setAttribute('aria-hidden', 'true');
        plane.textContent = '✈';

        const dots = document.createElement('div');
        dots.className = 'flex gap-1.5';
        [0, 0.15, 0.3].forEach(delay => {
            const dot = document.createElement('span');
            dot.className = 'w-2 h-2 rounded-full bg-slate-400 animate-bounce';
            dot.style.animationDelay = `${delay}s`;
            dots.appendChild(dot);
        });

        const msg = document.createElement('p');
        msg.id = 'loading-msg';
        msg.className = 'text-slate-500 text-sm font-medium text-center max-w-xs transition-opacity duration-500';
        msg.textContent = LOADING_LINES[0];

        wrapper.appendChild(plane);
        wrapper.appendChild(dots);
        wrapper.appendChild(msg);

        grid.textContent = '';
        grid.appendChild(wrapper);

        loadingInterval = setInterval(() => {
            msgIdx = (msgIdx + 1) % LOADING_LINES.length;
            const el = document.getElementById('loading-msg');
            if (el) {
                el.style.opacity = '0';
                setTimeout(() => { if (el) { el.textContent = LOADING_LINES[msgIdx]; el.style.opacity = '1'; } }, 250);
            }
        }, 2500);
    }

    // --- FETCH DATA ---
    let results = [];
    let isLive = false;

    try {

        const response = await fetch(`/api/search?origin=${originCode}&maxPrice=${budget}&datePref=${document.getElementById('datePref').value}`);
        if (response.ok) {
            const apiData = await response.json();

            // Map API data to our App Data Structure
            results = apiData.map((flight, idx) => {
                const destCode = flight.destination;
                const meta = AIRPORT_DB[destCode] || {
                    city: `Unknown (${destCode})`,
                    country: "Global",
                    img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800", // Fallback
                    coords: [0, 0] // Map wont work well for unknown
                };

                const cost = parseFloat(flight.price.total);

                return {
                    id: `api-${idx}`,
                    city: meta.city,
                    airport: destCode,
                    country: meta.country,
                    img: meta.img,
                    price_one: cost,
                    price_round: cost * 1.8,
                    airline: flight.airline || "Partner Airline",
                    stops: 0,
                    coords: meta.coords,
                    cheapestMonth: "Soon",
                    historicalAvg: cost * 1.2,
                    hotelPrice: cost * 0.5,
                    departureDate: flight.departureDate
                };
            });
            if (results.length > 0) {
                isLive = true;
                showToast("Connected to live flight data!", "success");
            } else {
                showToast("No flights found within that budget. Showing sample destinations.", "info");
                results = MOCK_DATA;
            }
        } else {
            throw new Error("Server not reachable");
        }
    } catch (err) {
        void err;
        showToast("Live data unavailable. Showing sample destinations.", "info");
        results = MOCK_DATA;
    }

    if (loadingInterval) clearInterval(loadingInterval);

    const filtered = results.filter(f => {
        const cost = tripType === 'round' ? f.price_round : f.price_one;
        const matchesBudget = cost <= budget * 1.1;
        const matchesGeo = geoScope === 'domestic' ? f.country === 'Indonesia' : true;
        return matchesBudget && matchesGeo;
    });

    // Save Search
    saveSearch({ origin: originSelect.value, budget, tripType, geoScope, datePref: document.getElementById('datePref').value });

    renderResults(filtered, tripType, originCode, budget, grid, countLabel, activeFilter, budgetDisplay, isLive);
}

function renderResults(filtered, tripType, originCode, budget, grid, countLabel, activeFilter, budgetDisplay, isLive) {
    activeFilter.classList.remove('hidden');
    budgetDisplay.innerText = formatCurrency(budget);

    // --- MAP UPDATE ---
    if (map) {
        markers.forEach(m => map.removeLayer(m));
        markers = [];

        filtered.forEach(f => {
            if (f.coords[0] === 0) return;

            const cost = tripType === 'round' ? f.price_round : f.price_one;
            let color = '#22c55e';
            if (cost < 500000) color = '#10b981';
            else if (cost < 1000000) color = '#f59e0b';
            else color = '#ef4444';

            const circle = L.circleMarker(f.coords, {
                radius: 8, fillColor: color, color: '#ffffff', weight: 2, opacity: 1, fillOpacity: 0.8
            }).addTo(map);

            const safePopupImg = /^https:\/\//.test(f.img) ? f.img : '';
            circle.bindPopup(`
                <div class="p-3">
                    ${safePopupImg ? `<img src="${safePopupImg}" width="200" height="96" class="w-full h-24 object-cover rounded-lg mb-2" loading="lazy" alt="${sanitize(f.city)}">` : ''}
                    <h4 class="font-bold text-slate-900">${sanitize(f.city)}</h4>
                    <p class="text-xs text-slate-500 mb-2">${sanitize(f.airport)}</p>
                    <p class="text-sm font-semibold text-sky-600">${formatCurrency(cost)}</p>
                </div>
            `);
            markers.push(circle);
        });
    }

    grid.innerHTML = '';

    if (filtered.length === 0) {
        const template = document.getElementById('zero-state-template');
        const clone = template.content.cloneNode(true);
        const p = clone.querySelector('p');
        if (p && isLive) {
            p.innerText += " (Live data check performed)";
        }
        grid.appendChild(clone);
        countLabel.innerText = "No flights found.";
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    countLabel.innerText = `Found ${filtered.length} destinations ${isLive ? '(Live)' : ''}`;

    filtered.forEach((f, index) => {
        const cost = tripType === 'round' ? f.price_round : f.price_one;
        const ratio = cost / f.historicalAvg;

        let dealLabel = "Good Deal";
        let dealClass = "text-slate-500";
        let barColor = "bg-slate-300";
        let barWidth = "60%";

        if (ratio < 0.8) { dealLabel = "Great Value"; dealClass = "text-emerald-600"; barColor = "bg-emerald-500"; barWidth = "90%"; }
        else if (ratio > 1.1) { dealLabel = "Standard"; dealClass = "text-orange-500"; barColor = "bg-orange-500"; barWidth = "30%"; }

        // Prediction Logic (Mock)
        const prediction = ratio < 0.85 ? "Buy Now" : "Wait";
        const predictionClass = prediction === "Buy Now" ? "prediction-buy" : "prediction-wait";

        const dateStr = f.departureDate ? `on ${f.departureDate}` : '';
        const INDONESIAN_AIRPORTS = ['DPS', 'SUB', 'KNO', 'LBJ', 'LOP', 'JOG', 'BPN', 'PLM', 'MDC', 'UPG', 'YIA'];
        const isIndonesian = INDONESIAN_AIRPORTS.includes(f.airport);
        const safeOrigin = /^[A-Z]{3}$/.test(originCode) ? originCode : 'CGK';
        const safeAirport = /^[A-Z]{3}$/.test(f.airport) ? f.airport : '';
        const safeDate = f.departureDate ? f.departureDate.replace(/[^0-9-]/g, '') : dateStr;
        // TP-tracked links — Aviasales uses ?marker= directly, others use tp.media/r
        const travelokaRaw = `https://www.traveloka.com/en-id/flight/${safeOrigin}/to/${safeAirport}/${safeDate}/1/ECONOMY`;
        const deepLink = isIndonesian
            ? buildTPLink(travelokaRaw, TP.programs.traveloka)
            : buildAviasalesLink(safeOrigin, safeAirport, f.departureDate);

        const card = document.createElement('div');
        card.className = "group flight-card bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 opacity-0 translate-y-8 flex flex-col";
        card.style.animation = `fadeUp 0.6s ease forwards ${index * 0.1}s`;

        card.innerHTML = `
            <div class="relative h-48 overflow-hidden shrink-0 bg-slate-100">
                <img src="${f.img}"
                     alt="${sanitize(f.city)}"
                     width="800" height="192"
                     loading="lazy"
                     onerror="this.src='https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?auto=format&fit=crop&w=800&q=80'; this.onerror=null;"
                     class="card-image w-full h-full object-cover transition-transform duration-700">
                <div class="absolute top-4 right-4">
                     <span class="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Direct</span>
                </div>
                <div class="prediction-badge ${predictionClass}">
                    ${prediction}
                </div>
            </div>
            <div class="p-6 flex flex-col gap-4 flex-1">
                <div>
                    <h3 class="text-2xl font-normal tracking-tight text-slate-900">${sanitize(f.city)}</h3>
                    <p class="text-slate-500 text-sm">${sanitize(f.country)} • ${sanitize(f.airport)}</p>
                    <div class="flex items-center gap-2 mt-2">
                         <span class="text-[10px] font-bold uppercase tracking-wider ${dealClass}">${dealLabel}</span>
                         <div class="deal-meter-bar flex-1"><div class="deal-meter-fill ${barColor}" style="width: ${barWidth}"></div></div>
                    </div>
                </div>
                <div class="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        <span class="block text-xl font-semibold tracking-tight text-slate-900">${formatCurrency(cost)}</span>
                        <span class="text-xs text-slate-400 font-medium">${sanitize(f.departureDate ? f.departureDate : (tripType === 'one' ? 'One Way' : 'Round Trip'))}</span>
                    </div>
                    <a href="${deepLink}" target="_blank" class="rounded-full bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors affiliate-link" data-destination="${f.airport}" data-origin="${originCode}">Book</a>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

document.addEventListener("DOMContentLoaded", function () {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    renderRecentSearches();

    // Set initial mode status text
    const isDark = document.body.classList.contains('dark');
    const themeIcon = document.getElementById('theme-icon-nav');
    if (themeIcon) {
        themeIcon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    const revealElements = document.querySelectorAll('.reveal-text');
    revealElements.forEach(element => {
        if (element.tagName === 'SELECT' || element.tagName === 'BUTTON') return;
        const text = element.innerText;
        if (!text.trim()) return;
        if (element.children.length === 0) {
            const words = text.split(' ').map(word => `<span class="word-wrapper"><span class="word-inner">${word}&nbsp;</span></span>`).join('');
            element.innerHTML = words;
        } else {
            element.classList.add('opacity-0', 'translate-y-4', 'transition-all', 'duration-700');
        }
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('opacity-0', 'translate-y-4');
                entry.target.classList.add('reveal-active');
                const innerWords = entry.target.querySelectorAll('.word-inner');
                innerWords.forEach((word, index) => {
                    word.style.transitionDelay = `${index * 0.03}s`;
                    word.classList.add('reveal-active');
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    revealElements.forEach(el => observer.observe(el));
});

function toggleMenu() {
    const menu = document.getElementById('fullscreen-menu');
    const opening = menu.classList.toggle('menu-open');
    menu.classList.toggle('menu-closed');
    menu.setAttribute('aria-hidden', opening ? 'false' : 'true');
}

document.addEventListener('click', (e) => {
    const link = e.target.closest('.affiliate-link');
    if (link) {
        const dest = link.dataset.destination;
        const origin = link.dataset.origin;
        if (typeof gtag !== 'undefined') {
            gtag('event', 'affiliate_click', { destination: dest, origin: origin });
        }
    }
});
