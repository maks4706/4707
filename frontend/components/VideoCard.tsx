import Link from 'next/link';

type VideoCardProps = {
  id: string;
  title: string;
  thumbnailUrl?: string | null;
  owner: { displayName: string };
  viewCount: number;
};

export default function VideoCard({ id, title, thumbnailUrl, owner, viewCount }: VideoCardProps) {
  return (
    <Link href={`/watch/${id}`} className="group">
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-800">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">No thumbnail</div>
        )}
      </div>
      <div className="mt-2">
        <h3 className="text-sm font-semibold group-hover:text-indigo-400">{title}</h3>
        <p className="text-xs text-gray-400">{owner.displayName} · {viewCount} views</p>
      </div>
    </Link>
  );
}
