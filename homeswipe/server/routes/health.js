// server/routes/health.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'HomeSwipe backend is running!' });
});

module.exports = router;