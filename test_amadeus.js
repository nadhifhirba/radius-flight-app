const Amadeus = require('amadeus');
require('dotenv').config();

const amadeus = new Amadeus({
    clientId: process.env.AMADEUS_CLIENT_ID,
    clientSecret: process.env.AMADEUS_CLIENT_SECRET
});

async function test() {
    console.log("Testing Amadeus Flight Offers...");

    // Test: CGK to SIN
    try {
        console.log("Asking Flight Offers: CGK -> SIN...");
        const response = await amadeus.shopping.flightOffersSearch.get({
            originLocationCode: 'CGK',
            destinationLocationCode: 'SIN',
            departureDate: '2025-12-30', // Near future based on system time 2025-12-28
            adults: '1'
        });
        console.log("Success! Found " + response.data.length + " offers.");
        console.log("First offer price: " + response.data[0].price.total);
    } catch (error) {
        console.log("Failed:", error.response ? error.response.body : error.message);
    }
}

test();
