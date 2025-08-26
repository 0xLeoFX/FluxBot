const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
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
app.use(express.json());

app.get('/leads', async (req, res) => {
  const db = await connectMongo();
  const leads = await db.collection('leads').find().toArray();
  const consents = await db.collection('consents').find().toArray();
  res.json({ leads, consents });
});

app.post('/process-lead', async (req, res) => {
  const db = await connectMongo();
  await db.collection('leads').updateOne({ _id: req.body._id }, { $set: { processed: true } });
  io.emit('leadUpdated');
  res.send('Lead processed');
});

io.on('connection', (socket) => {
  console.log('Client connected');
});

server.listen(3000, () => console.log('Dashboard running on port 3000'));