export default function PreviewBanner() {
  return (
    <div
      role="status"
      className="relative z-50 border-b border-white/5 bg-gradient-to-r from-you/10 via-white/[0.03] to-str/10 px-4 py-2 text-center text-xs sm:text-sm text-white/65"
    >
      <span className="font-mono text-you-glow">Mock preview</span>
      <span className="hidden sm:inline"> — </span>
      <span className="block sm:inline mt-0.5 sm:mt-0">
        everything you see is simulated. The real thing is coming soon.
      </span>
    </div>
  );
}
