// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes (we will create these next)
const healthRoutes = require('./routes/health');
const zillowRoutes = require('./routes/zillow');
const swipeRoutes  = require('./routes/swipe');
const recommender = require('./routes/recommender')


// Mount routes
app.use('/api/health', healthRoutes);
app.use('/api/zillow', zillowRoutes);
app.use('/api/swipe', swipeRoutes)
app.use('/api/recommender', recommender);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});