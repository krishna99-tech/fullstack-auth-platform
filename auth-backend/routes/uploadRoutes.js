const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'ap-south-1' });

router.get('/presign', authMiddleware, async (req, res) => {
  try {
    const { filename, contentType } = req.query;
    if (!filename || !contentType) {
      return res.status(400).json({ message: 'filename and contentType are required' });
    }

    const bucketName = process.env.UPLOADS_BUCKET;
    if (!bucketName) {
      return res.status(500).json({ message: 'UPLOADS_BUCKET environment variable is not configured on the server.' });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Sanitize filename to avoid S3 path issues
    const safeFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const key = `uploads/${uniqueSuffix}-${safeFilename}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    // Construct the public URL assuming path-style or virtual-hosted style
    const region = process.env.AWS_REGION || 'ap-south-1';
    const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

    res.status(200).json({
      presignedUrl: signedUrl,
      publicUrl: publicUrl
    });
  } catch (err) {
    console.error('Error generating presigned URL:', err);
    res.status(500).json({ message: 'Failed to generate upload URL', error: err.message });
  }
});

module.exports = router;
