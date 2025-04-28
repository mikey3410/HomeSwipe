const express = require('express');
const tf = require('@tensorflow/tfjs');
const router = express.Router();
const { db, admin } = require('../firebase/firebase');

// In-memory cache of trained models
const userModels = new Map();

// Feature normalization constants
const FEATURE_RANGES = {
  price: { min: 50000, max: 2000000 },
  beds: { min: 0, max: 7 },
  baths: { min: 0, max: 5 },
  area: { min: 500, max: 6000 },
  yearBuilt: { min: 1900, max: 2024 },
  lotSize: { min: 0, max: 20000 },
};

// Helper to normalize a feature between 0 and 1
function normalizeFeature(value, feature) {
  if (value === null || value === undefined) return 0;
  
  const { min, max } = FEATURE_RANGES[feature];
  // Convert string to number if needed and parse out non-numeric characters
  if (typeof value === 'string') {
    value = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
  }
  
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

// Helper to extract and normalize features from a home
function extractFeatures(home) {
  const price = parseFloat(String(home.unformattedPrice || home.price || '0')
                    .replace(/[^0-9]/g, '')) || 0;

  return [
    normalizeFeature(price, 'price'),
    normalizeFeature(home.beds, 'beds'),
    normalizeFeature(home.baths, 'baths'),
    normalizeFeature(home.livingArea || home.area, 'area'),
    normalizeFeature(home.yearBuilt, 'yearBuilt'),
    normalizeFeature(home.lotSize, 'lotSize'),
    // Location quality proxy (if available)
    home.walkScore ? home.walkScore / 100 : 0.5,
    // Convert home type to one-hot encoding (simplified)
    home.homeType === 'SINGLE_FAMILY' ? 1 : 0,
    home.homeType === 'CONDO' ? 1 : 0,
    home.homeType === 'TOWNHOUSE' ? 1 : 0
  ];
}

// Feature names for generating insights
const FEATURE_NAMES = [
  'price', 
  'beds', 
  'baths', 
  'area', 
  'yearBuilt', 
  'lotSize', 
  'walkScore',
  'SINGLE_FAMILY',
  'CONDO',
  'TOWNHOUSE'
];

// Helper to batch fetch homes (Firestore "in" only allows 10)
async function fetchHomesByIds(homeIds) {
  if (!homeIds || homeIds.length === 0) {
    console.log("No home IDs provided to fetch");
    return [];
  }
  
  console.log(`Fetching ${homeIds.length} homes by IDs`);
  const batches = [];

  for (let i = 0; i < homeIds.length; i += 10) {
    const batchIds = homeIds.slice(i, i + 10);
    
    try {
      // Try to fetch by document ID first
      console.log(`Fetching batch ${i/10 + 1} with IDs:`, batchIds);
      let snapshot = await db.collection('homes')
        .where(admin.firestore.FieldPath.documentId(), 'in', batchIds)
        .get();

      // If no results, try fetching by homeId field instead
      if (snapshot.empty) {
        console.log("No results with document IDs, trying homeId field");
        snapshot = await db.collection('homes')
          .where('homeId', 'in', batchIds)
          .get();
      }

      const homes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`Found ${homes.length} homes in batch ${i/10 + 1}`);
      batches.push(...homes);
    } catch (error) {
      console.error('Error fetching homes batch:', error);
      // Continue with other batches even if one fails
    }
  }

  return batches;
}

// Create model with expanded architecture
function createModel(inputShape) {
  const model = tf.sequential();
  
  // Input layer
  model.add(tf.layers.dense({ 
    inputShape: [inputShape], 
    units: 32, 
    activation: 'relu',
    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
  }));
  
  // Hidden layers
  model.add(tf.layers.dropout({ rate: 0.2 }));
  model.add(tf.layers.dense({ 
    units: 16, 
    activation: 'relu',
    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
  }));
  
  // Output layer
  model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
  
  model.compile({ 
    optimizer: tf.train.adam(0.001), 
    loss: 'binaryCrossentropy', 
    metrics: ['accuracy'] 
  });
  
  return model;
}

// Helper function to prepare user's training data
async function prepareUserTrainingData(userId) {
  // Fetch user's swipes
  const swipesSnapshot = await db.collection('swipes')
    .where('userId', '==', userId)
    .get();

  const swipes = swipesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  if (swipes.length < 5) {
    throw new Error('Not enough swipes yet. Please swipe on at least 5 homes.');
  }

  // Fetch all swiped homes
  const homeIds = swipes.map(s => s.homeId);
  const homes = await fetchHomesByIds(homeIds);

  // Prepare training data with expanded features
  const swipeData = swipes.map(swipe => {
    const home = homes.find(h => h.id === swipe.homeId);
    if (!home) return null;
    return {
      features: extractFeatures(home),
      label: swipe.action === 'like' ? 1 : 0
    };
  }).filter(x => x !== null);

  if (swipeData.length < 5) {
    throw new Error('Not enough valid training data. Please swipe on more homes.');
  }

  return {
    swipeData,
    swipeCount: swipes.length,
    homes
  };
}

// Helper function to train a model for a user
async function trainUserModel(userId) {
  try {
    const { swipeData, swipeCount } = await prepareUserTrainingData(userId);
    
    const inputShape = swipeData[0].features.length;
    const xs = tf.tensor2d(swipeData.map(d => d.features));
    const ys = tf.tensor2d(swipeData.map(d => [d.label]));

    console.log(`Training model for user: ${userId} with ${swipeData.length} examples`);
    
    const model = createModel(inputShape);

    // Train the model
    const history = await model.fit(xs, ys, {
      epochs: 100,
      batchSize: 8,
      shuffle: true,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
          }
        }
      }
    });

    // Analyze feature importance
    // This is a simplified approach - in production you might use SHAP values or a more sophisticated approach
    const featureImportance = {};
    
    // Using a simple sensitivity analysis approach
    for (let i = 0; i < inputShape; i++) {
      // Create a baseline prediction
      const baselinePrediction = model.predict(xs);
      
      // Create a modified input with this feature zeroed out
      const modifiedXs = xs.clone();
      
      // Use tf.tidy to clean up intermediate tensors
      tf.tidy(() => {
        // Create a zeros tensor for the column we want to modify
        const zeros = tf.zeros([xs.shape[0], 1]);
        
        // For each feature, zero it out and measure the change in prediction
        const left = i === 0 ? null : xs.slice([0, 0], [xs.shape[0], i]);
        const right = i === xs.shape[1] - 1 ? null : xs.slice([0, i + 1], [xs.shape[0], xs.shape[1] - i - 1]);
        
        // Concatenate the parts with zeros in the middle
        let parts = [];
        if (left) parts.push(left);
        parts.push(zeros);
        if (right) parts.push(right);
        
        const zeroedFeatureXs = tf.concat(parts, 1);
        const modifiedPrediction = model.predict(zeroedFeatureXs);
        
        // Calculate the absolute mean difference
        const diff = tf.abs(tf.sub(baselinePrediction, modifiedPrediction));
        const importance = diff.mean().dataSync()[0];
        
        // Store the feature importance
        featureImportance[FEATURE_NAMES[i] || `feature_${i}`] = importance;
      });
    }
    
    // Normalize importance scores to sum to 1
    const totalImportance = Object.values(featureImportance).reduce((a, b) => a + b, 0);
    Object.keys(featureImportance).forEach(key => {
      featureImportance[key] = featureImportance[key] / totalImportance;
    });
    
    // Calculate final accuracy
    const finalAcc = history.history.acc[history.history.acc.length - 1];
    const finalLoss = history.history.loss[history.history.loss.length - 1];

    // Store model and metadata
    const timestamp = new Date().toISOString();
    userModels.set(userId, {
      model,
      lastSwipeCount: swipeCount,
      inputShape,
      trainedAt: timestamp,
      accuracy: finalAcc,
      loss: finalLoss,
      featureImportance
    });

    // Clean up tensors
    xs.dispose();
    ys.dispose();
    
    return { 
      trained: true,
      swipeCount, 
      accuracy: finalAcc,
      trainedAt: timestamp,
      featureImportance
    };
  } catch (error) {
    console.error(`Error training model for user ${userId}:`, error);
    throw error;
  }
}

// POST /recommendations
router.post('/recommendations', async (req, res) => {
  try {
    const { userId, limit = 10 } = req.body;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    console.log(`Processing recommendations request for user: ${userId} with limit: ${limit}`);
    
    // Check if model exists or needs retraining
    let userModelEntry = userModels.get(userId);
    
    if (!userModelEntry) {
      console.log(`No existing model found for user: ${userId}, training new model`);
      try {
        // Try to train a new model
        await trainUserModel(userId);
        userModelEntry = userModels.get(userId);
        console.log(`Model training completed for user: ${userId}`);
      } catch (err) {
        // If training fails due to not enough swipes, return appropriate error
        console.error(`Model training failed for user: ${userId}:`, err.message);
        if (err.message && err.message.includes('Not enough swipes')) {
          return res.status(400).json({ 
            error: 'Not enough swipes yet', 
            message: 'Please swipe on at least 5 homes to get personalized recommendations',
            swipeCount: err.swipeCount || 0
          });
        }
        // Otherwise, pass the error along
        throw err;
      }
    } else {
      console.log(`Using existing model for user: ${userId} from ${userModelEntry.trainedAt}`);
    }
    
    // Get homes from the relevant city for the user
    // (alternatively, could use a radius from user's preferred location)
    // First, get user's swipes without ordering (to avoid needing composite index)
    const userSwipesSnapshot = await db.collection('swipes')
      .where('userId', '==', userId)
      .limit(20) // Get more swipes to increase chance of finding recent ones
      .get();
    
    // Then sort them in memory by timestamp
    const recentSwipes = userSwipesSnapshot.docs
      .map(doc => doc.data())
      .sort((a, b) => {
        // Sort descending by timestamp (most recent first)
        return new Date(b.timestamp) - new Date(a.timestamp);
      })
      .slice(0, 5); // Take only the 5 most recent
    
    const recentHomeIds = recentSwipes.map(s => s.homeId);
    const recentHomes = await fetchHomesByIds(recentHomeIds);
    
    // Extract cities from recent homes
    const userCities = [...new Set(recentHomes
      .filter(h => h.city)
      .map(h => h.city))];
    
    // Default to all homes if we can't determine user's preferred cities
    let availableHomes = [];
    if (userCities.length > 0) {
      for (const city of userCities) {
        const citySnapshot = await db.collection('homes')
          .where('city', '==', city)
          .limit(200)  // Limit to prevent processing too many homes
          .get();
          
        availableHomes.push(...citySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      }
    } else {
      // Fallback if no city preference can be determined
      const allHomesSnapshot = await db.collection('homes')
        .limit(200)
        .get();
        
      availableHomes = allHomesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }

    // Filter out homes the user has already swiped on
    const seenHomeIds = new Set(recentSwipes.map(s => s.homeId));
    availableHomes = availableHomes.filter(h => !seenHomeIds.has(h.id));

    if (availableHomes.length === 0) {
      return res.status(404).json({ 
        error: 'No unseen homes available',
        message: 'We could not find any new homes for you in your preferred areas.'
      });
    }

    // Extract features for prediction
    const availableFeatures = availableHomes.map(h => extractFeatures(h));

    // Make predictions
    const predictionTensor = userModelEntry.model.predict(tf.tensor2d(availableFeatures));
    const scores = await predictionTensor.data();

    // Add scores to homes and sort
    const housesWithScores = availableHomes.map((house, i) => ({
      ...house,
      score: scores[i],
      confidence: Math.abs(scores[i] - 0.5) * 2 // 0 = low confidence, 1 = high confidence
    }));

    // Sort by score (highest first)
    housesWithScores.sort((a, b) => b.score - a.score);

    // Take top N homes
    const topHouses = housesWithScores.slice(0, limit);

    // Return recommendations
    res.json({
      recommendations: topHouses,
      meta: {
        modelInfo: {
          trained: userModelEntry.trainedAt,
          trainingExamples: userModelEntry.lastSwipeCount,
          features: userModelEntry.inputShape,
          accuracy: Math.round(userModelEntry.accuracy * 100) / 100
        }
      }
    });

  } catch (err) {
    console.error('Error in recommendation:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /model-stats/:userId
router.get('/model-stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }
    
    // Get user model if it exists
    const userModelEntry = userModels.get(userId);
    
    // Count user's swipes
    const swipesSnapshot = await db.collection('swipes')
      .where('userId', '==', userId)
      .get();
    
    const swipeCount = swipesSnapshot.size;
    
    if (!userModelEntry) {
      return res.json({
        trained: false,
        swipeCount,
        message: swipeCount < 5 
          ? 'Not enough swipes to train a model yet' 
          : 'Model has not been trained yet'
      });
    }
    
    // Return model statistics
    res.json({
      trained: true,
      swipeCount,
      lastTrainedAt: userModelEntry.trainedAt,
      accuracy: userModelEntry.accuracy,
      featureImportance: userModelEntry.featureImportance || {},
      message: 'Model is trained and ready'
    });
    
  } catch (err) {
    console.error('Error fetching model stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /train
router.post('/train', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }
    
    try {
      // Train a new model
      const stats = await trainUserModel(userId);
      res.json({
        success: true,
        message: 'Model trained successfully',
        ...stats
      });
    } catch (err) {
      if (err.message && err.message.includes('Not enough swipes')) {
        return res.status(400).json({
          error: 'Training failed',
          message: err.message,
          swipeCount: err.swipeCount || 0
        });
      }
      throw err;
    }
  } catch (err) {
    console.error('Error training model:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /debug-add-swipes
router.post('/debug-add-swipes', async (req, res) => {
  try {
    const { userId, count = 10 } = req.body;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    console.log(`Adding ${count} debug swipes for user: ${userId}`);
    
    // Get some random homes from the database
    const homesSnapshot = await db.collection('homes')
      .limit(count)
      .get();
    
    if (homesSnapshot.empty) {
      return res.status(404).json({ error: 'No homes found in database' });
    }
    
    const homes = homesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Add swipes for these homes
    const batch = db.batch();
    const actions = ['like', 'dislike'];
    const swipes = [];
    
    homes.forEach((home, index) => {
      // Randomly assign like/dislike with a bias toward likes (70% likes)
      const action = Math.random() < 0.7 ? 'like' : 'dislike';
      const swipeRef = db.collection('swipes').doc();
      
      const swipeData = {
        userId,
        homeId: home.id,
        action,
        timestamp: new Date(Date.now() - (index * 60000)).toISOString() // Spread out timestamps
      };
      
      batch.set(swipeRef, swipeData);
      swipes.push(swipeData);
    });
    
    await batch.commit();
    
    res.json({ 
      success: true, 
      message: `Added ${swipes.length} test swipes for user ${userId}`,
      swipes
    });
    
  } catch (err) {
    console.error('Error adding debug swipes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

