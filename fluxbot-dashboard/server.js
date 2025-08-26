const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config({ quiet: true });

const app = express();
const MONGO_URI = process.env.MONGO_URI;

async function connectMongo() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    return client.db('fluxbot');
  } catch (e) {
    console.error('MongoDB error:', e);
  }
}

app.use(express.static('public'));

app.get('/leads', async (req, res) => {
  const db = await connectMongo();
  const leads = await db.collection('leads').find().toArray();
  res.json(leads);
});

app.listen(3000, () => console.log('Dashboard running on port 3000'));