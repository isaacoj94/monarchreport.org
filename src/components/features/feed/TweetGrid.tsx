import { TweetCard } from "./TweetCard";

export function TweetGrid({ tweetIds }: { tweetIds: string[] }) {
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
      {tweetIds.map((id) => (
        <TweetCard key={id} id={id} />
      ))}
    </div>
  );
}
