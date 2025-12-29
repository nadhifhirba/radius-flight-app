const express = require('express');
const Amadeus = require('amadeus');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Note: For production, restrict this to your specific domain (e.g., radius-travel.netlify.app)
app.use(express.json());
app.use(express.static('.')); // Serve generic static files (index.html, styles.css)

// Initialize Amadeus
const amadeus = new Amadeus({
    clientId: process.env.AMADEUS_CLIENT_ID,
    clientSecret: process.env.AMADEUS_CLIENT_SECRET
});

// Cache to prevent hitting rate limits during dev
let searchCache = {};

// Routes
app.get('/api/search', async (req, res) => {
    try {
        const { origin, maxPrice } = req.query;

        if (!origin) {
            return res.status(400).json({ error: 'Origin is required' });
        }

        const cacheKey = `${origin}-${maxPrice}`;
        if (searchCache[cacheKey]) {

            return res.json(searchCache[cacheKey]);
        }

        // Searching flights from origin under maxPrice...

        // "Fake" Reverse Search by checking curated popular destinations
        // This defeats the endpoint limitation in Sandbox
        const TARGET_DESTINATIONS = ['DPS', 'SIN', 'KUL', 'BKK', 'NRT', 'SYD', 'LHR', 'JFK'];

        // Calculate a future date (e.g., 30 days from now) for valid search
        const today = new Date();
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + 30);
        const dateStr = futureDate.toISOString().split('T')[0];

        // Parallel Requests
        // Note: Amadeus Sandbox has rate limits, so we batch them slightly or just hope for the best in demo
        const searchPromises = TARGET_DESTINATIONS.map(async (dest) => {
            if (dest === origin) return null; // Don't search for self

            try {
                // Using Flight Offers Search (Shopping)
                const response = await amadeus.shopping.flightOffersSearch.get({
                    originLocationCode: origin,
                    destinationLocationCode: dest,
                    departureDate: dateStr,
                    adults: '1',
                    max: '1', // Just need the cheapest one per dest
                    currencyCode: 'IDR'
                });

                if (response.data && response.data.length > 0) {
                    const offer = response.data[0];
                    // Filter by budget manually since flightOffers doesn't strictly enforce maxPrice the same way
                    if (parseFloat(offer.price.total) <= parseFloat(maxPrice)) {
                        return {
                            destination: dest,
                            price: offer.price,
                            departureDate: dateStr,
                            airline: offer.itineraries[0].segments[0].carrierCode
                        };
                    }
                }
                return null;
            } catch (err) {
                // Ignore individual failures (destination might not have flights)
                return null;
            }
        });

        const results = await Promise.all(searchPromises);
        const validResults = results.filter(r => r !== null);

        // Sort by price
        validResults.sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total));

        searchCache[cacheKey] = validResults;

        // Clear cache after 5 minutes
        setTimeout(() => delete searchCache[cacheKey], 5 * 60 * 1000);

        res.json(validResults);
    } catch (error) {
        console.error('Amadeus API Error:', error.response ? error.response.body : error);
        res.status(500).json({
            error: 'Failed to fetch flight data',
            details: error.response ? JSON.parse(error.response.body) : error.message
        });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Radius Flight Server running at http://localhost:${PORT}`);
});
