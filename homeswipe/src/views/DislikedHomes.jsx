import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

function DislikedHomes() {
  const [homes, setHomes] = useState([]);
  const navigate = useNavigate();
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const userId = currentUser?.uid;

  useEffect(() => {
    const fetchDislikedHomes = async () => {
      if (!userId) return;

      const q = query(
        collection(db, 'swipes'),
        where('userId', '==', userId),
        where('action', '==', 'dislike')
      );
      const snapshot = await getDocs(q);
      const homeIds = snapshot.docs.map(doc => doc.data().homeId);

      if (homeIds.length > 0) {
        const fetchedHomes = [];
        for (const id of homeIds) {
          const q = query(collection(db, 'homes'), where('zpid', '==', id));
          const snapshot = await getDocs(q);
          snapshot.forEach(doc => fetchedHomes.push(doc.data()));
        }
        setHomes(fetchedHomes);
      }
    };

    fetchDislikedHomes();
  }, [userId]);

  return (
    <div className="p-8">
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={() => navigate('/preferences')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition"
        >
          ← Back to Preferences
        </button>
        <button
          onClick={() => navigate('/liked')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition"
        >
          💝 View Liked Homes
        </button>
      </div>

      <h2 className="text-xl font-bold mb-4 text-center">💔 Disliked Homes</h2>

      {homes.length === 0 ? (
        <p className="text-gray-500 text-center">No disliked homes found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {homes.map((home, i) => (
            <div key={i} className="border p-4 rounded shadow">
              <img
                src={home.imgSrc || 'https://via.placeholder.com/400x300'}
                alt="Home"
                className="w-full h-48 object-cover rounded"
              />
               <div className="p-4">
              <h3 className="font-semibold text-lg">
                ${Number(home.unformattedPrice || home.price).toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600">
                {home.addressStreet}, {home.addressCity}, {home.addressState} {home.addressZipcode}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                🏡 {home.beds || 'N/A'} Beds • 🛁 {home.baths || 'N/A'} Baths •  📐 {home.area || 'N/A'} sqft
              </p>
            </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DislikedHomes;
