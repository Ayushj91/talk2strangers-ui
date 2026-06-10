"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export function Logo({ size = "text-xl" }: { size?: string }) {
  return (
    <Link href="/" className={`font-display font-bold tracking-tight ${size} flex items-baseline gap-px`}>
      <span>talk</span>
      <span className="gradient-text">2</span>
      <span>strangers</span>
    </Link>
  );
}

const LINKS = [
  { href: "/chat", label: "1-on-1" },
  { href: "/rooms", label: "Rooms" },
  { href: "/connections", label: "Connections" }
];

export default function Nav() {
  const path = usePathname();
  const [online, setOnline] = useState(1184);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setOnline((o) => Math.max(800, o + Math.floor(Math.random() * 21) - 9));
    }, 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="sticky top-0 z-40">
      <div className="glass-strong border-x-0 border-t-0">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  path.startsWith(l.href)
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-white/60">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-mint opacity-60 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
              </span>
              {online.toLocaleString()} online
            </div>
            <Link
              href="/chat"
              className="hidden md:inline-flex text-sm font-semibold rounded-full px-4 py-1.5 bg-gradient-to-r from-you to-str text-ink hover:opacity-90 transition-opacity"
            >
              Talk now
            </Link>
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10"
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden glass-strong border-x-0 px-4 py-3 flex flex-col gap-1"
          >
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm text-white/80 hover:bg-white/5"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/chat"
              onClick={() => setOpen(false)}
              className="mt-1 text-center text-sm font-semibold rounded-xl px-4 py-2.5 bg-gradient-to-r from-you to-str text-ink"
            >
              Talk now
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
