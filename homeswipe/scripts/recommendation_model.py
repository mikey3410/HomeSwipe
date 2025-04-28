# train_recommender_from_firestore.py
import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# 1) Initialize Firebase Admin
cred = credentials.Certificate('../server/firebase/homeswipe-6b25b-firebase-adminsdk-fbsvc-1ddca7fe8d.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# 2) Load all swipes into a DataFrame
swipe_docs = db.collection('swipes').stream()
records = []
for doc in swipe_docs:
    data = doc.to_dict()
    user = data.get('userId')
    home = data.get('homeId')
    action  = data.get('action')
    if user is None or home is None or action is None:
        print(f"Skipping swipe doc {doc.id}: missing one of userId/homeId/action")
        continue
    # map action to binary rating
    rating = 1 if data.get('action') == 'like' else 0
    records.append({
        'userId': data['userId'],
        'homeId': data['homeId'],
        'rating': rating
    })
df_swipes = pd.DataFrame(records)
print(f"Loaded {len(df_swipes)} swipes")

# 3) Load all homes so we know every possible homeId
home_docs = db.collection('homes').stream()
home_ids = [doc.id for doc in home_docs]   # doc.id is the Zillow zpid string
df_homes = pd.DataFrame({'homeId': home_ids})
print(f"Loaded {len(home_ids)} homes")

# 4) Build index lookups
user_ids = df_swipes['userId'].unique().tolist()
home_ids = df_homes['homeId'].unique().tolist()
user2idx = {uid: i for i, uid in enumerate(user_ids)}
home2idx = {hid: i for i, hid in enumerate(home_ids)}

df_swipes['user_idx'] = df_swipes['userId'].map(user2idx)
df_swipes['home_idx'] = df_swipes['homeId'].map(home2idx)
df_swipes = df_swipes.dropna(subset=['user_idx', 'home_idx'])
df_swipes['user_idx'] = df_swipes['user_idx'].astype(int)
df_swipes['home_idx'] = df_swipes['home_idx'].astype(int)

# 5) Create a tf.data.Dataset
ds = tf.data.Dataset.from_tensor_slices((
    {
      'user_idx': df_swipes['user_idx'].values,
      'home_idx': df_swipes['home_idx'].values
    },
    df_swipes['rating'].values
)).shuffle(10_000).batch(512)

# 6) Define the collaborative-filtering model
num_users = len(user_ids)
num_homes = len(home_ids)
embed_dim = 32

u_in = layers.Input(shape=(), name='user_idx')
h_in = layers.Input(shape=(), name='home_idx')
u_emb = layers.Embedding(num_users, embed_dim)(u_in)
h_emb = layers.Embedding(num_homes, embed_dim)(h_in)
dot   = layers.Dot(axes=1)([u_emb, h_emb])
out   = layers.Activation('sigmoid')(dot)

model = keras.Model([u_in, h_in], out)
model.compile(optimizer='adam',
              loss='binary_crossentropy',
              metrics=['AUC'])

# 7) Train
model.fit(ds, epochs=5)

# 8) Save & convert for TensorFlow.js
model.save('models/cf_model_tf2.keras')
print('model saved as models/cs_model_tf2.keras')
# then run in your shell:
# tensorflowjs_converter \
#   --input_format=tf_saved_model \
#   --output_format=tfjs_graph_model \
#   models/cf_model_tf2 \
#   public/models/tfjs_cf_model
