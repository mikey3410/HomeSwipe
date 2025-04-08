// server/firebase/firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('./homeswipe-6b25b-firebase-adminsdk-fbsvc-1ddca7fe8d.json'); // Ensure the path is correct

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { admin, db };