// server/routes/zillow.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { db } = require('../firebase/firebase');

// Helper function to cache listings in Firestore
async function cacheHomes(city, listings) {
  const batch = db.batch();
  listings.forEach(home => {
    const docRef = db.collection('homes').doc(
      home.providerListingId || home.zpid || `${home.addressStreet}-${Math.random()}`
    );
    batch.set(docRef, { ...home, city });
  });
  await batch.commit();
}

// GET /api/zillow/homes?city=...
router.get('/homes', async (req, res) => {
  const city = req.query.city;
  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }
  
  try {
    // Check for cached data in Firestore
    const homesSnapshot = await db.collection('homes').where('city', '==', city).get();
    if (!homesSnapshot.empty) {
      const cachedHomes = homesSnapshot.docs.map(doc => doc.data());
      return res.json(cachedHomes);
    }

    // Build query parameters for the external API
    const params = {
      location: `${req.query.city}, ${req.query.state || ''}`.trim(),
      page: '1',
      status_type: 'ForSale',
      sort_by: 'Homes_For_You',
      min_price: req.query.minPrice,
      max_price: req.query.maxPrice,
      min_beds: req.query.bedrooms,
      min_baths: req.query.bathrooms,
    };

    // Remove keys with falsy values
    Object.keys(params).forEach(key => {
      if (!params[key]) {
        delete params[key];
      }
    });

    console.log("RapidAPI request params:", params);

    // Fetch data from the Zillow Base API via RapidAPI
    const response = await axios.request({
      method: 'GET',
      url: 'https://zillow-base1.p.rapidapi.com/WebAPIs/zillow/search',
      params: params,
      headers: {
        'x-rapidapi-key': process.env.ZILLOW_API_KEY,
        'x-rapidapi-host': 'zillow-base1.p.rapidapi.com'
      }
    });

    console.log("RapidAPI response data:", response.data);

    // Extract listings from the response.
    // Adjust this if the API returns data in a different structure.
    const listings = response.data?.searchResultsData || [];

    // Cache the new listings in Firestore
    await cacheHomes(city, listings);

    res.json(listings);
  } catch (error) {
    // Log detailed error information for debugging.
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
    console.error('Error fetching or caching Zillow data:', error.message);
    res.status(500).json({ error: 'Failed to fetch home data' });
  }
});

module.exports = router;