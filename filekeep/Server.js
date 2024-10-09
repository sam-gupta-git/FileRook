const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb+srv://sam78748:XAws2QjzcmETiC1v@alphacluster.1aqkl.mongodb.net/?retryWrites=true&w=majority&appName=AlphaCluster', { useNewUrlParser: true, useUnifiedTopology: true });

// Create a schema for file metadata
const fileSchema = new mongoose.Schema({
  filename: String,
  path: String,
  size: Number,
  uploadDate: { type: Date, default: Date.now },
});

const File = mongoose.model('File', fileSchema);

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Handle file upload
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const newFile = new File({
    filename: req.file.originalname,
    path: req.file.path,
    size: req.file.size,
  });

  try {
    await newFile.save();
    res.status(200).send('File uploaded successfully.');
  } catch (error) {
    console.error('Error saving file metadata:', error);
    res.status(500).send('Error uploading file.');
  }
});

// New endpoint to get the list of files
app.get('/files', async (req, res) => {
  try {
    const files = await File.find().sort({ uploadDate: -1 });
    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).send('Error fetching files.');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});