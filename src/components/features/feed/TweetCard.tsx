import { Tweet } from "react-tweet";

export function TweetCard({ id }: { id: string }) {
  return (
    <div className="break-inside-avoid mb-4 rounded-xl border border-border bg-card hover:monarch-glow transition-shadow duration-300">
      <Tweet id={id} />
    </div>
  );
}
