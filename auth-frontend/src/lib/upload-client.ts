const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class UploadError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = 'UploadError';
  }
}

export async function uploadImage(file: File, token: string): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();
  
  if (!res.ok) {
    throw new UploadError(data.message || 'Upload failed');
  }
  
  return data.url;
}
