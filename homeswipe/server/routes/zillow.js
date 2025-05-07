// server/routes/zillow.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { db } = require('../firebase/firebase');
const cors = require('cors');

// Helper to cache in Firestore
async function cacheHomes(city, listings) {
  const batch = db.batch();
  listings.forEach(home => {
    const id = home.providerListingId || home.zpid ||
               `${home.addressStreet}-${Math.random()}`;
    const ref = db.collection('homes').doc(id);
    
    // Add timestamp to track when homes were added
    const homeWithTimestamp = {
      ...home,
      city,
      addedAt: new Date().toISOString(),
      // Make sure we have an images array
      imgSrcs: home.imgSrcs || 
               (home.imgSrc ? [home.imgSrc] : [])
    };
    
    batch.set(ref, homeWithTimestamp);
  });
  await batch.commit();
}

// Mount this in your server setup:
//   app.use(cors());
//   app.use('/api/zillow', require('./routes/zillow'));

router.get('/homes', async (req, res) => {
  // 1) pull raw strings out of ?city=&state=&minPrice=&maxPrice=&bedrooms=&bathrooms=
  const {
    city = '',
    state = '',
    minPrice: minPS = '',
    maxPrice: maxPS = '',
    bedrooms: bedsPS = '',
    bathrooms: bathsPS = '',
    forceRefresh = 'false'
  } = req.query;

  // 2) parse them exactly once
  const minPrice  = minPS  ? parseInt(minPS,  10) : null;
  const maxPrice  = maxPS  ? parseInt(maxPS,  10) : null;
  const minBeds   = bedsPS ? parseInt(bedsPS, 10) : null;
  const minBaths  = bathsPS? parseInt(bathsPS,10) : null;
  const shouldRefresh = forceRefresh === 'true';

  console.log('Incoming filters →', {
    city, state, minPrice, maxPrice, minBeds, minBaths, shouldRefresh
  });

  try {
    // Check if we have cached data first (unless force refresh is requested)
    if (!shouldRefresh) {
      const cachedQuery = db.collection('homes').where('city', '==', city);
      
      // Apply filters if they exist
      const snapshot = await cachedQuery.limit(50).get();
      
      if (!snapshot.empty) {
        console.log(`Found ${snapshot.size} cached homes for ${city}`);
        
        // Filter in memory
        let cachedHomes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Apply filters in memory
        if (minPrice !== null) cachedHomes = cachedHomes.filter(h => parseInt(String(h.price || '0').replace(/[^0-9]/g, ''), 10) >= minPrice);
        if (maxPrice !== null) cachedHomes = cachedHomes.filter(h => parseInt(String(h.price || '0').replace(/[^0-9]/g, ''), 10) <= maxPrice);
        if (minBeds !== null) cachedHomes = cachedHomes.filter(h => parseInt(h.beds, 10) >= minBeds);
        if (minBaths !== null) cachedHomes = cachedHomes.filter(h => parseInt(h.baths, 10) >= minBaths);
        
        // Return if we have enough homes
        if (cachedHomes.length >= 10) {
          return res.json(cachedHomes);
        }
        
        console.log('Not enough cached homes match filters, fetching fresh data');
      }
    }

    // 3) pass them straight into the RapidAPI call
    const rapidParams = {
      location: `${city}, ${state}`.trim(),
      page: '1',
      status_type: 'ForSale',
      sort_by: 'Homes_For_You',
      ...(minPrice !== null && { min_price: minPrice }),
      ...(maxPrice !== null && { max_price: maxPrice }),
      ...(minBeds  !== null && { min_beds:   minBeds }),
      ...(minBaths !== null && { min_baths:  minBaths }),
    };

    console.log('Calling Zillow API with →', rapidParams);
    const { data } = await axios.request({
      method: 'GET',
      url:    'https://zillow-base1.p.rapidapi.com/WebAPIs/zillow/search',
      params: rapidParams,
      headers: {
        'x-rapidapi-key':  process.env.ZILLOW_API_KEY,
        'x-rapidapi-host': 'zillow-base1.p.rapidapi.com'
      }
    });

    // 4) grab whatever they returned
    const listings = data?.searchResultsData || [];
    console.log('Got back', listings.length, 'homes');

    // Process each listing to ensure it has multiple images
    const enhancedListings = await Promise.all(listings.map(async (home) => {
      // If we already have multiple images, use them
      if (home.imgSrcs && home.imgSrcs.length > 1) {
        return home;
      }
      
      // If we have a zpid, try to fetch additional details with images
      if (home.zpid) {
        try {
          const { data: details } = await axios.request({
            method: 'GET',
            url: 'https://zillow-base1.p.rapidapi.com/WebAPIs/zillow/property-detail',
            params: { zpid: home.zpid },
            headers: {
              'x-rapidapi-key': process.env.ZILLOW_API_KEY,
              'x-rapidapi-host': 'zillow-base1.p.rapidapi.com'
            }
          });
          
          // If we have additional images from details, use them
          if (details && details.detailedData && details.detailedData.pictures && details.detailedData.pictures.length > 0) {
            return {
              ...home,
              imgSrcs: details.detailedData.pictures.map(pic => pic.url),
              // Add any other useful details
              description: details.detailedData.description || home.description,
              yearBuilt: details.detailedData.yearBuilt || home.yearBuilt,
              lotSize: details.detailedData.lotSize || home.lotSize
            };
          }
        } catch (error) {
          console.warn(`Failed to fetch details for property ${home.zpid}:`, error.message);
        }
      }
      
      // Fallback: if we just have a single image, put it in an array
      return {
        ...home,
        imgSrcs: home.imgSrc ? [home.imgSrc] : []
      };
    }));

    // 5) filter if needed
    const filtered = enhancedListings.filter(home => {
      const price = parseInt(
        String(home.unformattedPrice || home.price || '0')
          .replace(/[^0-9]/g, ''), 10
      ) || 0;
      const beds  = parseInt(home.beds,  10) || 0;
      const baths = parseInt(home.baths, 10) || 0;

      if (minPrice  !== null && price < minPrice)  return false;
      if (maxPrice  !== null && price > maxPrice)  return false;
      if (minBeds   !== null && beds  < minBeds)    return false;
      if (minBaths  !== null && baths < minBaths)   return false;
      return true;
    });

    console.log('After manual filter:', filtered.length, 'homes');

    // 6) cache + return
    await cacheHomes(city, filtered);
    return res.json(filtered);

  } catch (err) {
    console.error('Zillow fetch error:', err.response?.data || err.message);
    
    // If the API call fails, try to serve from cache as a fallback
    try {
      const fallbackQuery = db.collection('homes').where('city', '==', city);
      const snapshot = await fallbackQuery.limit(30).get();
      
      if (!snapshot.empty) {
        console.log('API call failed, serving from cache');
        const cachedHomes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        return res.json(cachedHomes);
      }
    } catch (cacheErr) {
      console.error('Cache fallback also failed:', cacheErr);
    }
    
    return res.status(500).json({ error: 'Failed to fetch home data' });
  }
});

// GET fresh data for a specific city
router.get('/refresh/:city', async (req, res) => {
  const { city } = req.params;
  const { state = '', limit = '20' } = req.query;
  
  if (!city) {
    return res.status(400).json({ error: 'City parameter is required' });
  }
  
  try {
    // Call the Zillow API with minimal filters to get fresh data
    const rapidParams = {
      location: `${city}, ${state}`.trim(),
      page: '1',
      status_type: 'ForSale',
      sort_by: 'Newest',
      limit: parseInt(limit, 10)
    };
    
    console.log('Refreshing listings for', city, 'with params:', rapidParams);
    
    const { data } = await axios.request({
      method: 'GET',
      url: 'https://zillow-base1.p.rapidapi.com/WebAPIs/zillow/search',
      params: rapidParams,
      headers: {
        'x-rapidapi-key': process.env.ZILLOW_API_KEY,
        'x-rapidapi-host': 'zillow-base1.p.rapidapi.com'
      }
    });
    
    const listings = data?.searchResultsData || [];
    console.log('Got', listings.length, 'fresh listings for', city);
    
    // Process for multiple images (same as above)
    const enhancedListings = await Promise.all(listings.map(async (home) => {
      if (home.imgSrcs && home.imgSrcs.length > 1) {
        return home;
      }
      
      if (home.zpid) {
        try {
          const { data: details } = await axios.request({
            method: 'GET',
            url: 'https://zillow-base1.p.rapidapi.com/WebAPIs/zillow/property-detail',
            params: { zpid: home.zpid },
            headers: {
              'x-rapidapi-key': process.env.ZILLOW_API_KEY,
              'x-rapidapi-host': 'zillow-base1.p.rapidapi.com'
            }
          });
          
          if (details && details.detailedData && details.detailedData.pictures && details.detailedData.pictures.length > 0) {
            return {
              ...home,
              imgSrcs: details.detailedData.pictures.map(pic => pic.url),
              description: details.detailedData.description || home.description,
              yearBuilt: details.detailedData.yearBuilt || home.yearBuilt,
              lotSize: details.detailedData.lotSize || home.lotSize
            };
          }
        } catch (error) {
          console.warn(`Failed to fetch details for property ${home.zpid}:`, error.message);
        }
      }
      
      return {
        ...home,
        imgSrcs: home.imgSrc ? [home.imgSrc] : []
      };
    }));
    
    // Cache and return the fresh listings
    await cacheHomes(city, enhancedListings);
    
    res.json({
      success: true,
      refreshed: enhancedListings.length,
      listings: enhancedListings
    });
    
  } catch (err) {
    console.error('Error refreshing listings:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to refresh listings' });
  }
});

module.exports = router;
