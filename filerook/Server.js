require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { S3Client, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const multerS3 = require('multer-s3');

const app = express();
const port = 5000;

app.use(cors());

// Configure AWS
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Set up multer for S3 uploads
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    }
  })
});

// Handle file upload to S3
app.post('/s3-upload', upload.single('file'), async (req, res) => {
  console.log('Received upload request');
  if (!req.file) {
    console.error('No file uploaded');
    return res.status(400).send('No file uploaded.');
  }

  try {
    console.log('File uploaded successfully:', req.file);
    res.status(200).json({
      message: 'File uploaded successfully.',
      fileDetails: {
        key: req.file.key,
        location: req.file.location,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Error in upload route:', error);
    res.status(500).json({ error: 'Error uploading file to S3.', details: error.message });
  }
});

// New endpoint to get the list of files from S3
app.get('/s3-files', async (req, res) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME
  };

  try {
    const data = await s3Client.send(new ListObjectsV2Command(params));
    const files = data.Contents.map(file => ({
      Key: file.Key,
      Size: file.Size,
      LastModified: file.LastModified
    }));
    res.json(files);
  } catch (error) {
    console.error('Error fetching files from S3:', error);
    res.status(500).send('Error fetching files from S3.');
  }
});

// Add a general error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('An error occurred on the server.');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});