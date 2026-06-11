"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const KEY = "t2s_preview_dismissed";

export default function PreviewBanner() {
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    setDismissed(localStorage.getItem(KEY) === "1");
  }, []);

  const dismiss = () => {
    localStorage.setItem(KEY, "1");
    setDismissed(true);
  };

  if (dismissed === null || dismissed) return null;

  return (
    <div
      role="status"
      className="relative z-50 border-b border-white/5 bg-gradient-to-r from-you/10 via-white/[0.03] to-str/10 px-10 py-2 text-center text-xs sm:text-sm text-white/65"
    >
      <span className="font-mono text-you-glow">Mock preview</span>
      <span className="hidden sm:inline"> — </span>
      <span className="block sm:inline mt-0.5 sm:mt-0">
        everything you see is simulated. The real thing is coming soon.
      </span>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss preview notice"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
