// Backend: server.js (Node.js + Express + MongoDB) - Fixed Auth0 Implementation
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const xss = require('xss');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGO_URI);

// Updated Task model to include user ID
const Task = mongoose.model('Task', {
  title: String,
  completed: Boolean,
  completedAt: Date,
  userId: { type: String, required: true }, // Auth0 user ID
});

// User Profile model for additional user data
const UserProfile = mongoose.model('UserProfile', {
  userId: { type: String, required: true, unique: true }, // Auth0 user ID
  displayName: String,
  avatar: String, // URL to avatar image
  bio: String,
  preferences: {
    theme: { type: String, default: 'dark' },
    emailNotifications: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

app.use(cors());
app.use(express.json());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per minute
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);

// Auth0 JWT verification middleware
const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

const jwtCheck = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token is required' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, getKey, {
    audience: "https://taskmanager-api",
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    algorithms: ['RS256']
  }, (err, decoded) => {
    if (err) {
      console.error('JWT verification error:', err.message);
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = decoded;
    req.userId = decoded.sub; // Auth0 user ID
    next();
  });
};

// Input sanitization and validation
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return xss(input.replace(/[<>]/g, '').trim());
};

const validateTitle = (title) => {
  if (typeof title !== 'string') return false;
  const trimmed = title.trim();
  return trimmed.length > 0 && trimmed.length <= 100;
};

const validateDisplayName = (name) => {
  if (typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= 50;
};

const validateBio = (bio) => {
  if (typeof bio !== 'string') return true; // Bio is optional
  return bio.length <= 500;
};

const validateAvatarUrl = (url) => {
  if (!url || typeof url !== 'string') return true; // Avatar is optional
  if (url.length > 500) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Health check endpoint (public)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Task Manager API'
  });
});

// Helper function to generate consistent shapes avatar
const generateShapesAvatar = (userId) => {
  // Create a consistent seed from user ID
  const seed = Buffer.from(userId).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
  
  // Colors that match the dark UI theme
  const backgroundColor = '0f0f23'; // var(--background)
  const primaryColor = '6366f1';    // var(--primary-color)
  
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=${backgroundColor}&primaryColor=${primaryColor}`;
};

// Profile endpoints
app.get('/profile', jwtCheck, async (req, res) => {
  try {
    let profile = await UserProfile.findOne({ userId: req.userId });
    
    // Create profile if it doesn't exist
    if (!profile) {
      profile = new UserProfile({ 
        userId: req.userId,
        displayName: req.user.name || req.user.email || 'User',
        avatar: generateShapesAvatar(req.userId), // Auto-assign shapes avatar
      });
      await profile.save();
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/profile', jwtCheck, async (req, res) => {
  try {
    const { displayName, avatar, bio, preferences } = req.body;
    
    // Validate all inputs
    if (displayName !== undefined && !validateDisplayName(displayName)) {
      return res.status(400).json({ error: 'Display name must be 1-50 characters long' });
    }
    if (bio !== undefined && !validateBio(bio)) {
      return res.status(400).json({ error: 'Bio must be less than 500 characters' });
    }
    if (avatar !== undefined && !validateAvatarUrl(avatar)) {
      return res.status(400).json({ error: 'Invalid avatar URL or URL too long' });
    }
    
    const updateData = {
      updatedAt: new Date()
    };
    
    if (displayName !== undefined) updateData.displayName = sanitizeInput(displayName);
    if (avatar !== undefined) updateData.avatar = sanitizeInput(avatar);
    if (bio !== undefined) updateData.bio = sanitizeInput(bio);
    if (preferences) updateData.preferences = preferences;
    
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.userId },
      updateData,
      { new: true, upsert: true }
    );
    
    res.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected routes - all task routes now require authentication
app.get('/tasks', jwtCheck, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({ completed: 1, completedAt: 1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/tasks', jwtCheck, async (req, res) => {
  try {
    const cleanTitle = sanitizeInput(req.body.title);
    if (!validateTitle(cleanTitle)) {
      return res.status(400).json({ error: 'Invalid title input.' });
    }
    
    const task = new Task({ 
      title: cleanTitle, 
      completed: false, 
      completedAt: null,
      userId: req.userId 
    });
    
    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/tasks/:id', jwtCheck, async (req, res) => {
  try {
    const cleanTitle = sanitizeInput(req.body.title);
    if (!validateTitle(cleanTitle)) {
      return res.status(400).json({ error: 'Invalid title input.' });
    }
    
    // Make sure the task belongs to the authenticated user
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const update = {
      title: cleanTitle,
      completed: req.body.completed,
      completedAt: req.body.completed ? new Date() : null,
    };
    
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/tasks/:id', jwtCheck, async (req, res) => {
  try {
    // Make sure the task belongs to the authenticated user
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});