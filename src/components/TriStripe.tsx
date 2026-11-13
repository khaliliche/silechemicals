/** Thin Italian tricolor line, echoing the Sile Chemicals logo. */
export default function TriStripe({ className = "h-1" }: { className?: string }) {
  return (
    <div aria-hidden className={`flex w-full ${className}`}>
      <span className="flex-1 bg-brand-600" />
      <span className="flex-1 bg-white" />
      <span className="flex-1 bg-accent-500" />
    </div>
  );
}
