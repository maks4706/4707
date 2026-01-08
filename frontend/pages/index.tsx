import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import VideoCard from '../components/VideoCard';
import { apiFetch } from '../lib/api';

type Video = {
  id: string;
  title: string;
  thumbnailUrl?: string;
  owner: { displayName: string };
  viewCount: number;
};

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/feed/recommended')
      .then((data) => setVideos(data.items))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-semibold">Recommended</h1>
      {loading && <p className="mt-4 text-gray-400">Loading feed...</p>}
      {error && <p className="mt-4 text-red-400">{error}</p>}
      {!loading && !error && videos.length === 0 && (
        <p className="mt-4 text-gray-400">No videos yet.</p>
      )}
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <VideoCard key={video.id} {...video} />
        ))}
      </div>
    </Layout>
  );
}
