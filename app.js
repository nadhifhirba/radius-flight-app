// --- 1. Data & Config ---
const MOCK_DATA = [
    { id: 101, city: "Bali", airport: "DPS", country: "Indonesia", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop", price_one: 850000, price_round: 1600000, airline: "Super Air Jet", stops: 0, coords: [-8.748, 115.167], cheapestMonth: "March", cheapestPrice: 1400000, hotelPrice: 500000, historicalAvg: 1800000 },
    { id: 102, city: "Yogyakarta", airport: "YIA", country: "Indonesia", img: "https://images.unsplash.com/photo-1584810359583-96fc3448beaa?q=80&w=800&auto=format&fit=crop", price_one: 550000, price_round: 1000000, airline: "Lion Air", stops: 0, coords: [-7.975, 110.429], cheapestMonth: "February", cheapestPrice: 900000, hotelPrice: 300000, historicalAvg: 1200000 },
    { id: 103, city: "Singapore", airport: "SIN", country: "Singapore", img: "https://images.unsplash.com/photo-1565967511849-76a60a516170?q=80&w=800&auto=format&fit=crop", price_one: 950000, price_round: 2100000, airline: "JetStar", stops: 0, coords: [1.364, 103.991], cheapestMonth: "April", cheapestPrice: 1800000, hotelPrice: 1500000, historicalAvg: 2500000 },
    { id: 104, city: "Kuala Lumpur", airport: "KUL", country: "Malaysia", img: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=800&auto=format&fit=crop", price_one: 700000, price_round: 1300000, airline: "AirAsia", stops: 0, coords: [2.745, 101.707], cheapestMonth: "March", cheapestPrice: 1100000, hotelPrice: 400000, historicalAvg: 1500000 },
    { id: 105, city: "Bangkok", airport: "DMK", country: "Thailand", img: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=800&auto=format&fit=crop", price_one: 1800000, price_round: 3200000, airline: "AirAsia", stops: 1, coords: [13.913, 100.607], cheapestMonth: "May", cheapestPrice: 2000000, hotelPrice: 600000, historicalAvg: 3000000 },
    { id: 106, city: "Labuan Bajo", airport: "LBJ", country: "Indonesia", img: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=800&auto=format&fit=crop", price_one: 1900000, price_round: 3500000, airline: "Batik Air", stops: 0, coords: [-8.485, 119.883], cheapestMonth: "November", cheapestPrice: 2800000, hotelPrice: 1000000, historicalAvg: 4000000 },
    { id: 107, city: "Tokyo", airport: "NRT", country: "Japan", img: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=800&auto=format&fit=crop", price_one: 4500000, price_round: 8500000, airline: "Scoot", stops: 1, coords: [35.772, 140.393], cheapestMonth: "June", cheapestPrice: 7500000, hotelPrice: 1500000, historicalAvg: 9000000 },
    { id: 108, city: "Lombok", airport: "LOP", country: "Indonesia", img: "https://images.unsplash.com/photo-1573790387438-4da905039392?q=80&w=800&auto=format&fit=crop", price_one: 900000, price_round: 1750000, airline: "Super Air Jet", stops: 0, coords: [-8.762, 116.273], cheapestMonth: "February", cheapestPrice: 1500000, hotelPrice: 600000, historicalAvg: 2000000 },
    { id: 109, city: "Johor Bahru", airport: "JHB", country: "Malaysia", img: "https://images.unsplash.com/photo-1559635071-f938c82eb4db?q=80&w=800", price_one: 500000, price_round: 950000, airline: "AirAsia", stops: 0, coords: [1.636, 103.666], isHiddenGem: true, relatedTo: "Singapore", cheapestMonth: "March", cheapestPrice: 800000, hotelPrice: 350000, historicalAvg: 1100000 },
    { id: 110, city: "Banyuwangi", airport: "BWX", country: "Indonesia", img: "https://images.unsplash.com/photo-1543887019-c0ae985e51c8?q=80&w=800", price_one: 650000, price_round: 1200000, airline: "Citilink", stops: 0, coords: [-8.307, 114.3], isHiddenGem: true, relatedTo: "Bali", cheapestMonth: "April", cheapestPrice: 1000000, hotelPrice: 250000, historicalAvg: 1400000 }
];

// Database for mapping real API results to images/cities
const AIRPORT_DB = {
    "DPS": { city: "Bali", country: "Indonesia", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800", coords: [-8.748, 115.167] },
    "YIA": { city: "Yogyakarta", country: "Indonesia", img: "https://images.unsplash.com/photo-1584810359583-96fc3448beaa?q=80&w=800", coords: [-7.975, 110.429] },
    "SIN": { city: "Singapore", country: "Singapore", img: "https://images.unsplash.com/photo-1565967511849-76a60a516170?q=80&w=800", coords: [1.364, 103.991] },
    "KUL": { city: "Kuala Lumpur", country: "Malaysia", img: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=800", coords: [2.745, 101.707] },
    "DMK": { city: "Bangkok", country: "Thailand", img: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=800", coords: [13.913, 100.607] },
    "BKK": { city: "Bangkok", country: "Thailand", img: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=800", coords: [13.690, 100.750] },
    "NRT": { city: "Tokyo", country: "Japan", img: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=800", coords: [35.772, 140.393] },
    "HND": { city: "Tokyo", country: "Japan", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800", coords: [35.549, 139.779] },
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
    "AMS": { city: "Amsterdam", country: "Netherlands", img: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?q=80&w=800", coords: [52.310, 4.768] }
};

// --- 2. Utils & View Logic ---
const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumSignificantDigits: 3 }).format(val);
};

const showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const color = type === 'success' ? 'bg-emerald-500' : 'bg-slate-800';
    toast.className = `${color} text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium toast pointer-events-auto flex items-center gap-2`;
    toast.innerHTML = `<i data-lucide="${type === 'success' ? 'check-circle' : 'bell'}" class="w-4 h-4"></i> ${message}`;
    container.appendChild(toast);
    lucide.createIcons();
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

function togglePriceAlert() {
    const origin = document.getElementById('origin').value;
    const budget = document.getElementById('budget').value;
    showToast(`Alert set for flights from ${origin} under ${formatCurrency(budget)}`, 'info');
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

        mapBtn.classList.remove('bg-white', 'shadow-sm', 'text-slate-900');
        mapBtn.classList.add('text-slate-500');

        grid.classList.remove('hidden');
        mapContainer.classList.add('hidden');
    } else {
        mapBtn.classList.remove('text-slate-500');
        mapBtn.classList.add('bg-white', 'shadow-sm', 'text-slate-900');

        listBtn.classList.remove('bg-white', 'shadow-sm', 'text-slate-900');
        listBtn.classList.add('text-slate-500');

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
    const originCode = originSelect.value === 'Jakarta' ? 'CGK' : (originSelect.value === 'Bali' ? 'DPS' : 'SUB');

    // UI Elements
    const grid = document.getElementById('results-grid');
    const countLabel = document.getElementById('result-count');
    const activeFilter = document.getElementById('active-filter');
    const budgetDisplay = document.getElementById('budget-display');

    if (!skipGridAnimation) document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });

    // Show Loading
    if (currentView === 'list' && !skipGridAnimation) {
        grid.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            grid.innerHTML += `<div class="h-[400px] w-full rounded-2xl skeleton"></div>`;
        }
    }

    // --- FETCH DATA ---
    let results = [];
    let isLive = false;

    try {
        // Attempt fetch from local node server
        // Convert budget to somewhat comparable currency (approx) for API filter if needed, 
        // but Amadeus Inspiration search takes 'maxPrice'.
        // Origin MUST be a valid IATA code (CGK, DPS, SUB).

        console.log(`Fetching from API: origin=${originCode}&maxPrice=${budget}`);
        const response = await fetch(`/api/search?origin=${originCode}&maxPrice=${budget}`);
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

                // Amadeus Price is usually one-way or roundtrip depending on query, 
                // Flight Inspiration is typically One-Way or Roundtrip based on API defaults.
                // It actually returns the 'price' object.
                // We'll treat 'price.total' as the base cost.
                const cost = parseFloat(flight.price.total);

                return {
                    id: `api-${idx}`,
                    city: meta.city,
                    airport: destCode,
                    country: meta.country,
                    img: meta.img,
                    price_one: cost, // Simplification
                    price_round: cost * 1.8, // Estimate
                    airline: "Partner Airline", // API doesn't always give airline in this endpoint easily
                    stops: 0, // Assumption/Simplification for 'Inspiration'
                    coords: meta.coords,
                    cheapestMonth: "Soon", // API returns departureDate
                    historicalAvg: cost * 1.2, // Mock comp
                    hotelPrice: cost * 0.5, // Mock est
                    departureDate: flight.departureDate
                };
            });
            isLive = true;
            showToast("Connected to Amadeus Live Data!", "success");
        } else {
            throw new Error("Server not reachable");
        }
    } catch (err) {
        console.warn("API Fetch Failed, falling back to mock data.", err);
        showToast("Live/Local Server unavailable. Using Mock Data.", "info");
        // Fallback to MOCK_DATA
        results = MOCK_DATA;
    }

    // --- FILTERING (Frontend refinement) ---
    const filtered = results.filter(f => {
        const cost = tripType === 'round' ? f.price_round : f.price_one;
        // API already filtered by budget, but double check for Mock fallback
        const matchesBudget = cost <= budget * 1.1; // 10% buffer
        const matchesGeo = geoScope === 'domestic' ? f.country === 'Indonesia' : true;
        return matchesBudget && matchesGeo;
    });

    // Render Data
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
            // Skip 0,0 coords
            if (f.coords[0] === 0) return;

            const cost = tripType === 'round' ? f.price_round : f.price_one;
            let color = '#22c55e';
            if (cost < 500000) color = '#10b981';
            else if (cost < 1000000) color = '#f59e0b';
            else color = '#ef4444';

            const circle = L.circleMarker(f.coords, {
                radius: 8, fillColor: color, color: '#ffffff', weight: 2, opacity: 1, fillOpacity: 0.8
            }).addTo(map);

            circle.bindPopup(`
                <div class="p-3">
                    <img src="${f.img}" class="w-full h-24 object-cover rounded-lg mb-2">
                    <h4 class="font-bold text-slate-900">${f.city}</h4>
                    <p class="text-xs text-slate-500 mb-2">${f.airport}</p>
                    <p class="text-sm font-semibold text-sky-600">${formatCurrency(cost)}</p>
                </div>
            `);
            markers.push(circle);
        });
    }

    grid.innerHTML = '';

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-20 text-center">
                <div class="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-400">
                    <i data-lucide="plane-off" class="w-10 h-10"></i>
                </div>
                <h3 class="text-3xl md:text-5xl font-light tracking-tight mb-4">No flights found.</h3>
                <p class="text-xl text-slate-500 mb-8 max-w-lg">
                   We couldn't find flights within this budget ${isLive ? 'from Amadeus Live Data' : ''}.
                </p>
            </div>
        `;
        countLabel.innerText = "No flights found.";
        lucide.createIcons();
        return;
    }

    countLabel.innerText = `Found ${filtered.length} destinations ${isLive ? '(Live)' : ''}`;

    filtered.forEach((f, index) => {
        const cost = tripType === 'round' ? f.price_round : f.price_one;
        const ratio = cost / f.historicalAvg;

        // Dynamic Badge
        let dealLabel = "Good Deal";
        let dealClass = "text-slate-500";
        let barColor = "bg-slate-300";
        let barWidth = "60%";

        if (ratio < 0.8) { dealLabel = "Great Value"; dealClass = "text-emerald-600"; barColor = "bg-emerald-500"; barWidth = "90%"; }
        else if (ratio > 1.1) { dealLabel = "Standard"; dealClass = "text-orange-500"; barColor = "bg-orange-500"; barWidth = "30%"; }

        // Google Flights Deep Link
        // https://www.google.com/travel/flights?q=Flights%20to%20DPS%20from%20CGK%20on%202024-05-20
        // If Api gave date, use it.
        const dateStr = f.departureDate ? `on ${f.departureDate}` : '';
        const deepLink = `https://www.google.com/travel/flights?q=Flights to ${f.airport} from ${originCode} ${dateStr}`;

        const card = document.createElement('div');
        card.className = "group flight-card bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 opacity-0 translate-y-8 flex flex-col";
        card.style.animation = `fadeUp 0.6s ease forwards ${index * 0.1}s`;

        card.innerHTML = `
            <div class="relative h-48 overflow-hidden shrink-0">
                <img src="${f.img}" alt="${f.city}" loading="lazy" class="card-image w-full h-full object-cover transition-transform duration-700">
                <div class="absolute top-4 left-4">
                     <span class="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Direct</span>
                </div>
            </div>
            <div class="p-6 flex flex-col gap-4 flex-1">
                <div>
                    <h3 class="text-2xl font-normal tracking-tight text-slate-900">${f.city}</h3>
                    <p class="text-slate-500 text-sm">${f.country} • ${f.airport}</p>
                    <div class="flex items-center gap-2 mt-2">
                         <span class="text-[10px] font-bold uppercase tracking-wider ${dealClass}">${dealLabel}</span>
                         <div class="deal-meter-bar flex-1"><div class="deal-meter-fill ${barColor}" style="width: ${barWidth}"></div></div>
                    </div>
                </div>
                <div class="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        <span class="block text-xl font-semibold tracking-tight text-slate-900">${formatCurrency(cost)}</span>
                        <span class="text-xs text-slate-400 font-medium">${f.departureDate ? f.departureDate : (tripType === 'one' ? 'One Way' : 'Round Trip')}</span>
                    </div>
                    <a href="${deepLink}" target="_blank" class="rounded-full bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors">Book</a>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
    lucide.createIcons();
}

document.addEventListener("DOMContentLoaded", function () {
    lucide.createIcons();

    // Word Reveal Setup (Same as before)
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
    menu.classList.toggle('menu-open');
    menu.classList.toggle('menu-closed');
}
