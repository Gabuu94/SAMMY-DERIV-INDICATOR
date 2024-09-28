const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
app.use(cors());

// Add a route handler for the root URL
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to my server!' });
});

// Replace with your MongoDB connection string
const mongoUri = 'mongodb://localhost:27017/sam-deriv';

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Token Schema
const tokenSchema = new mongoose.Schema({
  value: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
});

const Token = mongoose.model('Token', tokenSchema);

// Endpoint to generate a new token (admin use)
app.post('/api/generate-token', async (req, res) => {
  const newToken = uuidv4();
  try {
    const token = new Token({ value: newToken });
    await token.save();
    res.status(200).json({ success: true, token: newToken });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating token' });
  }
});

// Endpoint to validate token
app.post('/api/validate-token', async (req, res) => {
  const { token } = req.body;
  try {
    const foundToken = await Token.findOne({ value: token });
    if (foundToken) {
      return res.status(200).json({ success: true });
    }
    res.status(400).json({ success: false, message: 'Invalid token' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

const port = 3001;
app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});