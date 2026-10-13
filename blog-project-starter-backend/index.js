// server.js

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require("cors")
const { cert, getApps, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const ADMIN_UID = 'NkIM8YtXUmO5c1QPOykCXwUQxL43';
let databaseConnection;

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  if (!databaseConnection) {
    databaseConnection = mongoose.connect(mongoUri).catch((err) => {
      databaseConnection = undefined;
      throw err;
    });
  }

  await databaseConnection;
}

function getFirebaseAuth() {
  const existingApp = getApps().find((firebaseApp) => firebaseApp.name === 'blog-app');
  if (existingApp) {
    return getAuth(existingApp);
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is required');
  }

  const serviceAccount = JSON.parse(serviceAccountJson);
  const firebaseApp = initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id || 'blog-app-d3c4d'
  }, 'blog-app');

  return getAuth(firebaseApp);
}

const app = express();
app.use(cors())

// Middleware
app.use(bodyParser.json());

// Define Schema
const blogSchema = new mongoose.Schema({
  newTitle: String,
  newContent: String,
  date:String,
  likes:Number
});

const Blog = mongoose.model('Blog', blogSchema);

async function requireAdmin(req, res, next) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  let firebaseAuth;
  try {
    firebaseAuth = getFirebaseAuth();
  } catch (err) {
    console.error('Firebase Admin initialization failed:', err.message);
    return res.status(500).json({ message: 'Firebase Admin authentication is not configured' });
  }

  try {
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    if (decodedToken.uid !== ADMIN_UID) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    next();
  } catch (err) {
    console.error('Firebase ID token verification failed:', err.message);
    res.status(401).json({ message: 'Invalid authentication token' });
  }
}

// Routes
app.get('/api/blogs', async (req, res) => {
  try {
    await connectToDatabase();
    const blogs = await Blog.find({});
    res.send(blogs)
  } catch (err) {
    console.error('Failed to fetch blogs:', err.message);
    res.status(500).json({ message: err.message });
  }
});


app.patch('/api/blogs/like/:id', async (req, res) => {
    try {
      await connectToDatabase();
      const blog = await Blog.findById(req.params.id);
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
  
      // Increment the likes of the blog post
      const updatedBlog = await Blog.findByIdAndUpdate(
        req.params.id,
        { $inc: { likes: 1 } },
        { new: true } // This option returns the modified document rather than the original
      );
  
      res.json(updatedBlog);
    } catch (err) {
      console.error('Failed to like blog:', err.message);
      res.status(500).json({ message: err.message });
    }
  });


app.post('/api/blogs', requireAdmin, async (req, res) => {

  const blog = new Blog({
    newTitle: req.body.newTitle,
    newContent: req.body.newContent,
    date:req.body.date,
    likes:req.body.likes
  });

  try {
    await connectToDatabase();
    const newBlog = await blog.save();
    res.status(201).json(newBlog);
  } catch (err) {
    console.error('Failed to create blog:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// Start server locally, but export for Vercel/serverless deployment
if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

module.exports = app;
