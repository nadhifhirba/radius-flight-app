const Amadeus = require('amadeus');

// Initialize Amadeus using Environment Variables
// These must be set in the Netlify Dashboard
const amadeus = new Amadeus({
    clientId: process.env.AMADEUS_CLIENT_ID,
    clientSecret: process.env.AMADEUS_CLIENT_SECRET
});

// Cache in memory (warm starts only)
let searchCache = {};

exports.handler = async (event, context) => {
    // Only allow GET
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Make sure to use GET' };
    }

    const params = event.queryStringParameters || {};
    const origin = params.origin;
    const maxPrice = params.maxPrice;

    if (!origin) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Origin is required' }) };
    }

    // Check Cache
    const cacheKey = `${origin}-${maxPrice}`;
    if (searchCache[cacheKey]) {
        console.log('Serving from cache:', cacheKey);
        return {
            statusCode: 200,
            body: JSON.stringify(searchCache[cacheKey]),
            headers: { 'Content-Type': 'application/json' }
        };
    }

    console.log(`Searching flights from ${origin} under ${maxPrice}...`);

    try {
        // "Fake" Reverse Search strategy (Simulated Reverse Search)
        const TARGET_DESTINATIONS = ['DPS', 'SIN', 'KUL', 'BKK', 'NRT', 'SYD', 'LHR', 'JFK'];

        const today = new Date();
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + 30);
        const dateStr = futureDate.toISOString().split('T')[0];

        // Parallel Requests
        const searchPromises = TARGET_DESTINATIONS.map(async (dest) => {
            if (dest === origin) return null;

            try {
                const response = await amadeus.shopping.flightOffersSearch.get({
                    originLocationCode: origin,
                    destinationLocationCode: dest,
                    departureDate: dateStr,
                    adults: '1',
                    max: '1',
                    currencyCode: 'IDR'
                });

                if (response.data && response.data.length > 0) {
                    const offer = response.data[0];
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
                return null;
            }
        });

        const results = await Promise.all(searchPromises);
        const validResults = results.filter(r => r !== null);
        validResults.sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total));

        searchCache[cacheKey] = validResults;

        return {
            statusCode: 200,
            body: JSON.stringify(validResults),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' // Public API
            }
        };

    } catch (error) {
        console.error('Amadeus API Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to fetch flight data',
                details: error.message
            }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
};
