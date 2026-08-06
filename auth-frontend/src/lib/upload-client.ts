const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class UploadError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = 'UploadError';
  }
}

export async function uploadImage(file: File, token: string): Promise<string> {
  // 1. Get the presigned URL and final public URL from the backend
  const presignRes = await fetch(`${API_URL}/upload/presign?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const presignData = await presignRes.json();
  if (!presignRes.ok) {
    throw new UploadError(presignData.message || 'Failed to get upload signature');
  }

  const { presignedUrl, publicUrl } = presignData;

  // 2. Upload the file directly to AWS S3 using the presigned URL
  const uploadRes = await fetch(presignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file, // Send the raw file
  });

  if (!uploadRes.ok) {
    throw new UploadError('Failed to upload image to S3');
  }

  // 3. Return the public S3 URL
  return publicUrl;
}
