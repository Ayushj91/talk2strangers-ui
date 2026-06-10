"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, MoonStar, ArrowRight } from "lucide-react";
import Nav from "@/components/Nav";
import { ROOMS } from "@/lib/data";

export default function RoomsPage() {
  const [counts, setCounts] = useState<Record<string, number>>(
    Object.fromEntries(ROOMS.map((r) => [r.id, r.baseCount]))
  );

  useEffect(() => {
    const t = setInterval(() => {
      setCounts((c) => {
        const next = { ...c };
        for (const r of ROOMS) {
          const delta = Math.floor(Math.random() * 5) - 2;
          next[r.id] = Math.max(r.id === "3am" ? 1 : 3, next[r.id] + delta);
        }
        return next;
      });
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const topic = ROOMS.filter((r) => r.kind === "topic");
  const mood = ROOMS.filter((r) => r.kind === "mood");

  const Card = ({ room, i }: { room: (typeof ROOMS)[0]; i: number }) => {
    const count = counts[room.id];
    const quiet = count < 3;
    return (
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05, duration: 0.45 }}
        whileHover={{ y: -4 }}
      >
        <Link
          href={`/rooms/${room.id}`}
          className="group relative block glass rounded-2xl p-5 overflow-hidden hover:border-white/20 transition-colors"
        >
          <div
            className={`absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl transition-opacity opacity-50 group-hover:opacity-90 ${
              room.kind === "mood" ? "bg-str/20" : "bg-you/20"
            }`}
          />
          <div className="flex items-start justify-between">
            <span className="text-3xl">{room.emoji}</span>
            {quiet ? (
              <span className="flex items-center gap-1 text-[11px] font-mono text-gold/80 glass rounded-full px-2 py-1">
                <MoonStar size={11} /> quiet room
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-white/55 glass rounded-full px-2 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-mint animate-pulseSoft" />
                {count} live
              </span>
            )}
          </div>
          <h3 className="mt-3 font-display font-bold text-lg">{room.name}</h3>
          <p className="mt-0.5 text-sm text-white/45">{room.desc}</p>
          <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-white/50 group-hover:text-white transition-colors">
            Join <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </motion.div>
    );
  };

  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Nav />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="blob animate-drift h-[360px] w-[360px] bg-str/15 -right-32 top-20" />
        <div className="blob animate-drift2 h-[320px] w-[320px] bg-you/15 -left-28 top-[480px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight">
            Rooms, <span className="gradient-text">live now</span>
          </h1>
          <p className="mt-2 text-white/50 max-w-md">
            You&apos;ll get a fresh anonymous handle the moment you walk in. It dies when you leave.
          </p>
        </motion.div>

        <div className="mt-10">
          <div className="flex items-center gap-3">
            <h2 className="font-mono text-xs uppercase tracking-widest text-you-glow">Topic rooms</h2>
            <div className="thread flex-1 opacity-40" />
          </div>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topic.map((r, i) => (
              <Card key={r.id} room={r} i={i} />
            ))}
          </div>
        </div>

        <div className="mt-12">
          <div className="flex items-center gap-3">
            <h2 className="font-mono text-xs uppercase tracking-widest text-str-glow">
              Mood rooms — energy, not topics
            </h2>
            <div className="thread flex-1 opacity-40" />
          </div>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mood.map((r, i) => (
              <Card key={r.id} room={r} i={i} />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-14 glass rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 justify-between"
        >
          <div className="flex items-center gap-3">
            <Users size={20} className="text-white/50" />
            <p className="text-sm text-white/55">
              Rooms not your thing? Match with one stranger instead.
            </p>
          </div>
          <Link
            href="/chat"
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-ink bg-gradient-to-r from-you to-str shrink-0"
          >
            Go 1-on-1
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
