"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Lock, Trash2, MessageCircle, X } from "lucide-react";
import Nav from "@/components/Nav";

type Card = { id: string; me: string; them: string; mood: string; at: number };

export default function ConnectionsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [premium, setPremium] = useState<Card | null>(null);

  useEffect(() => {
    try {
      setCards(JSON.parse(localStorage.getItem("t2s_cards") ?? "[]"));
    } catch {}
    setLoaded(true);
  }, []);

  const remove = (id: string) => {
    const next = cards.filter((c) => c.id !== id);
    setCards(next);
    localStorage.setItem("t2s_cards", JSON.stringify(next));
  };

  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Nav />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="blob animate-drift h-[340px] w-[340px] bg-gold/10 right-0 top-24" />
        <div className="blob animate-drift2 h-[300px] w-[300px] bg-you/15 -left-24 top-96" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight">
            Your <span className="gradient-text">connections</span>
          </h1>
          <p className="mt-2 text-white/50 max-w-md">
            The conversations that earned a second life. Exchanged mutually, kept on this device.
          </p>
        </motion.div>

        {loaded && cards.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 glass rounded-3xl p-10 text-center"
          >
            <Sparkles size={28} className="mx-auto text-gold" />
            <h2 className="mt-4 font-display font-bold text-xl">No cards yet</h2>
            <p className="mt-2 text-sm text-white/50 max-w-xs mx-auto leading-relaxed">
              When a conversation is good enough that you both want to keep it, you&apos;ll exchange a
              connection card at the end. They&apos;ll live here.
            </p>
            <Link
              href="/chat"
              className="mt-6 inline-flex rounded-full px-6 py-3 font-semibold text-ink bg-gradient-to-r from-you to-str"
            >
              Go meet someone
            </Link>
          </motion.div>
        )}

        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {cards.map((c, i) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ delay: i * 0.05 }}
                className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-you/20 via-panel to-str/20 border border-white/12"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm text-you-glow truncate">{c.me}</span>
                  <div className="thread w-10 shrink-0" />
                  <span className="font-mono text-sm text-str-glow truncate">{c.them}</span>
                </div>
                <p className="mt-3 text-[11px] font-mono text-white/40">
                  mood: {c.mood} · {new Date(c.at).toLocaleDateString()}{" "}
                  {new Date(c.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setPremium(c)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold glass hover:bg-white/10"
                  >
                    <MessageCircle size={13} /> Open thread
                    <Lock size={11} className="text-gold" />
                  </button>
                  <button
                    onClick={() => remove(c.id)}
                    aria-label="Delete card"
                    className="rounded-full p-2 glass text-white/40 hover:text-str hover:bg-str/10"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* premium modal */}
      <AnimatePresence>
        {premium && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPremium(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-3xl p-6 w-full max-w-sm text-center relative"
            >
              <button
                onClick={() => setPremium(null)}
                className="absolute right-4 top-4 text-white/40 hover:text-white"
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <div className="mx-auto h-12 w-12 rounded-2xl bg-gold/15 flex items-center justify-center">
                <Lock size={22} className="text-gold" />
              </div>
              <h3 className="mt-4 font-display font-bold text-xl">Persistent threads</h3>
              <p className="mt-2 text-sm text-white/55 leading-relaxed">
                Reopen the line to <span className="font-mono text-str-glow">{premium.them}</span> any
                time with a persistent chat thread — a premium feature, coming with accounts.
              </p>
              <div className="mt-5 glass rounded-2xl p-4 text-left text-sm">
                <div className="flex justify-between py-1.5">
                  <span className="text-white/60">One connection</span>
                  <span className="font-semibold">₹49 one-time</span>
                </div>
                <div className="flex justify-between py-1.5 border-t border-white/5">
                  <span className="text-white/60">All connections</span>
                  <span className="font-semibold">₹99 / month</span>
                </div>
              </div>
              <button
                disabled
                className="mt-5 w-full rounded-full py-3 font-semibold text-ink bg-gradient-to-r from-you to-str opacity-60 cursor-not-allowed"
              >
                Coming soon in this preview
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
