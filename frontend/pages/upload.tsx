import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function Upload() {
  const [token, setToken] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('accessToken');
    if (stored) {
      setToken(stored);
    }
  }, []);

  const handleUpload = () => {
    if (!file) {
      setMessage('Select a video file');
      return;
    }
    const form = new FormData();
    form.append('title', title);
    form.append('description', description);
    form.append('tags', JSON.stringify(tags.split(',').map((tag) => tag.trim()).filter(Boolean)));
    form.append('visibility', visibility);
    form.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/videos/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setMessage('Upload complete! Transcoding started.');
      } else {
        setMessage(`Upload failed: ${xhr.responseText}`);
      }
    };
    xhr.onerror = () => setMessage('Upload failed');
    xhr.send(form);
  };

  return (
    <Layout>
      <h1 className="text-2xl font-semibold">Upload Video</h1>
      <div className="mt-4 grid gap-4 max-w-xl">
        <input
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="Access token"
          className="rounded bg-gray-800 p-2"
        />
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
          className="rounded bg-gray-800 p-2"
        />
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description"
          className="rounded bg-gray-800 p-2"
        />
        <input
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="Tags (comma separated)"
          className="rounded bg-gray-800 p-2"
        />
        <select
          value={visibility}
          onChange={(event) => setVisibility(event.target.value)}
          className="rounded bg-gray-800 p-2"
        >
          <option value="PUBLIC">Public</option>
          <option value="UNLISTED">Unlisted</option>
          <option value="PRIVATE">Private</option>
        </select>
        <input type="file" accept="video/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        <button onClick={handleUpload} className="rounded bg-indigo-500 px-4 py-2">Upload</button>
        <div className="h-2 rounded bg-gray-800">
          <div className="h-full rounded bg-indigo-500" style={{ width: `${progress}%` }} />
        </div>
        {message && <p className="text-sm text-gray-300">{message}</p>}
      </div>
    </Layout>
  );
}
