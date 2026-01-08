import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { apiFetch } from '../../lib/api';

type Video = {
  id: string;
  title: string;
  description?: string;
  sourceUrl: string;
  thumbnailUrl?: string;
  viewCount: number;
  owner: { displayName: string };
  assets: { resolution: string; url: string }[];
};

type Comment = {
  id: string;
  body: string;
  user: { displayName: string };
  createdAt: string;
};

export default function Watch() {
  const router = useRouter();
  const { id } = router.query;
  const [video, setVideo] = useState<Video | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBody, setCommentBody] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    apiFetch(`/videos/${id}`)
      .then((data) => setVideo(data))
      .catch((err) => setError(err.message));
    apiFetch(`/videos/${id}/comments`)
      .then((data) => setComments(data))
      .catch((err) => setError(err.message));
  }, [id]);

  const handleComment = async () => {
    if (!commentBody) return;
    try {
      const newComment = await apiFetch(`/videos/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: commentBody })
      });
      setComments([newComment, ...comments]);
      setCommentBody('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (error) {
    return (
      <Layout>
        <p className="text-red-400">{error}</p>
      </Layout>
    );
  }

  return (
    <Layout>
      {!video ? (
        <p className="text-gray-400">Loading video...</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div>
            <video
              className="w-full rounded-lg bg-black"
              controls
              poster={video.thumbnailUrl}
              src={video.assets?.[1]?.url ?? video.assets?.[0]?.url ?? video.sourceUrl}
            />
            <h1 className="mt-4 text-2xl font-semibold">{video.title}</h1>
            <p className="text-sm text-gray-400">{video.owner.displayName} · {video.viewCount} views</p>
            <p className="mt-3 text-gray-300">{video.description}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Comments</h2>
            <div className="mt-2 flex gap-2">
              <input
                value={commentBody}
                onChange={(event) => setCommentBody(event.target.value)}
                className="w-full rounded bg-gray-800 p-2 text-sm"
                placeholder="Add a comment"
              />
              <button onClick={handleComment} className="rounded bg-indigo-500 px-3 text-sm">Post</button>
            </div>
            <div className="mt-4 space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="rounded bg-gray-900 p-3">
                  <p className="text-sm text-gray-400">{comment.user.displayName}</p>
                  <p className="text-sm">{comment.body}</p>
                </div>
              ))}
              {comments.length === 0 && <p className="text-gray-500">No comments yet.</p>}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
