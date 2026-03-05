import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center px-4">
        <div className="text-6xl mb-4">🦋</div>
        <h1 className="font-heading text-4xl font-bold mb-2">404</h1>
        <p className="text-muted-foreground mb-6">
          This page seems to have flown away.
        </p>
        <Link
          href="/"
          className="inline-flex px-6 py-3 rounded-xl bg-monarch-orange text-white font-semibold hover:bg-monarch-orange/90 transition-colors"
        >
          ← Back Home
        </Link>
      </div>
    </div>
  );
}
