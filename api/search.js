const Amadeus = require('amadeus');

const amadeus = new Amadeus({
    clientId: process.env.AMADEUS_CLIENT_ID,
    clientSecret: process.env.AMADEUS_CLIENT_SECRET
});

let searchCache = {};

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { origin, maxPrice } = req.query;

    if (!origin) {
        return res.status(400).json({ error: 'Origin is required' });
    }

    const cacheKey = `${origin}-${maxPrice}`;
    if (searchCache[cacheKey]) {
        return res.json(searchCache[cacheKey]);
    }

    try {
        const TARGET_DESTINATIONS = ['DPS', 'SIN', 'KUL', 'BKK', 'NRT', 'SYD', 'LHR', 'JFK'];

        const today = new Date();
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + 30);
        const dateStr = futureDate.toISOString().split('T')[0];

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
            } catch {
                return null;
            }
        });

        const results = await Promise.all(searchPromises);
        const validResults = results.filter(r => r !== null);
        validResults.sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total));

        searchCache[cacheKey] = validResults;
        setTimeout(() => delete searchCache[cacheKey], 5 * 60 * 1000);

        res.json(validResults);
    } catch (error) {
        console.error('Amadeus API Error:', error.response ? error.response.body : error);
        res.status(500).json({
            error: 'Failed to fetch flight data',
            details: error.response ? JSON.parse(error.response.body) : error.message
        });
    }
};
