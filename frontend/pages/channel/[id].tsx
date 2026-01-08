import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import VideoCard from '../../components/VideoCard';
import { apiFetch } from '../../lib/api';

type Channel = {
  id: string;
  displayName: string;
  description?: string;
  avatarUrl?: string;
  videos: any[];
};

export default function Channel() {
  const router = useRouter();
  const { id } = router.query;
  const [channel, setChannel] = useState<Channel | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    apiFetch(`/users/${id}`)
      .then((data) => setChannel(data))
      .catch((err) => setError(err.message));
  }, [id]);

  return (
    <Layout>
      {error && <p className="text-red-400">{error}</p>}
      {!channel ? (
        <p className="text-gray-400">Loading channel...</p>
      ) : (
        <div>
          <div className="flex items-center gap-4">
            {channel.avatarUrl ? (
              <img src={channel.avatarUrl} className="h-16 w-16 rounded-full" alt={channel.displayName} />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gray-800" />
            )}
            <div>
              <h1 className="text-2xl font-semibold">{channel.displayName}</h1>
              <p className="text-sm text-gray-400">{channel.description}</p>
            </div>
          </div>
          <h2 className="mt-6 text-lg font-semibold">Videos</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {channel.videos.map((video: any) => (
              <VideoCard key={video.id} id={video.id} title={video.title} thumbnailUrl={video.thumbnailUrl} owner={{ displayName: channel.displayName }} viewCount={video.viewCount} />
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
