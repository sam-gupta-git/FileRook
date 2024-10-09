require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { S3Client, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

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
app.post('/s3-upload', upload.single('file'), (req, res) => {
  console.log('Received upload request');
  if (!req.file) {
    console.error('No file uploaded');
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  console.log('File uploaded successfully:', req.file);
  res.status(200).json({
    message: 'File uploaded successfully.',
    fileDetails: {
      key: req.file.key,
      location: req.file.location,
      size: req.file.size
    }
  });
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

// New endpoint to get a signed URL for a file
app.get('/s3-file/:key', async (req, res) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: req.params.key
  };

  try {
    const command = new GetObjectCommand(params);
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    res.redirect(signedUrl);
  } catch (error) {
    console.error('Error getting signed URL:', error);
    res.status(500).send('Error getting file from S3.');
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('An error occurred on the server.');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});