// server/routes/swipe.js
const express = require('express');
const router = express.Router();
const { db } = require('../firebase/firebase');

// POST /api/swipe
router.post('/', async (req, res) => {
  const { userId, homeId, action } = req.body;

  // Validate required fields
  if (!userId || !homeId || !action) {
    return res.status(400).json({ error: 'Missing required fields: userId, homeId, and action are required.' });
  }

  try {
    // Create a new swipe document in the 'swipes' collection
    // The document includes the user ID, the home ID, the swipe action, and a timestamp.
    await db.collection('swipes').add({
      userId,
      homeId,
      action,
      timestamp: new Date().toISOString()
    });

    console.log(`User ${userId} swiped ${action} on home ${homeId}`);
    res.json({ status: 'success', message: 'Swipe recorded' });
  } catch (error) {
    console.error('Error recording swipe:', error.message);
    res.status(500).json({ error: 'Failed to record swipe' });
  }
});

module.exports = router;