"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Bookmark, Send, Sparkles, Trash2, X } from "lucide-react";
import Nav from "@/components/Nav";
import { REPLIES, QUESTION_REPLIES, rand, uid } from "@/lib/data";
import { Bubble, Msg, Toasts, useToasts } from "@/components/ChatKit";

type Card = { id: string; me: string; them: string; mood: string; at: number };
type ThreadMsg = Omit<Msg, "game">;

export default function ConnectionsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [thread, setThread] = useState<Card | null>(null);
  const [threadMsgs, setThreadMsgs] = useState<ThreadMsg[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toasts, push } = useToasts();
  const sessionRef = useRef(0);

  useEffect(() => {
    try {
      setCards(JSON.parse(localStorage.getItem("t2s_cards") ?? "[]"));
    } catch {}
    setLoaded(true);
  }, []);

  // autoscroll thread
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [threadMsgs, typing]);

  const openThread = (c: Card) => {
    setThread(c);
    sessionRef.current += 1;
    setTyping(false);
    setDraft("");
    try {
      const saved: ThreadMsg[] = JSON.parse(localStorage.getItem(`t2s_thread_${c.id}`) ?? "[]");
      setThreadMsgs(saved);
    } catch {
      setThreadMsgs([]);
    }
  };

  const closeThread = () => {
    setThread(null);
    setTyping(false);
    setDraft("");
    sessionRef.current += 1;
  };

  const saveMsgs = useCallback((cardId: string, msgs: ThreadMsg[]) => {
    try {
      localStorage.setItem(`t2s_thread_${cardId}`, JSON.stringify(msgs));
    } catch {}
  }, []);

  const send = () => {
    if (!draft.trim() || !thread) return;
    const text = draft.trim();
    setDraft("");

    const myMsg: ThreadMsg = { id: uid(), kind: "text", from: "me", text, tick: "sent", ts: Date.now() };
    const s = sessionRef.current;

    setThreadMsgs((prev) => {
      const next = [...prev, myMsg];
      saveMsgs(thread.id, next);
      return next;
    });

    // deliver tick
    setTimeout(() => {
      if (sessionRef.current !== s) return;
      setThreadMsgs((prev) => {
        const next = prev.map((m) => (m.id === myMsg.id ? { ...m, tick: "delivered" as const } : m));
        saveMsgs(thread.id, next);
        return next;
      });
    }, 500);

    // bot reply
    setTyping(true);
    const delay = 900 + Math.random() * 1100;
    setTimeout(() => {
      if (sessionRef.current !== s) return;
      setTyping(false);
      const reply: ThreadMsg = {
        id: uid(),
        kind: "text",
        from: "them",
        text: text.includes("?") ? rand(QUESTION_REPLIES) : rand(REPLIES),
        ts: Date.now()
      };
      setThreadMsgs((prev) => {
        const next = [...prev, reply];
        saveMsgs(thread.id, next);
        return next;
      });
    }, delay);
  };

  const remove = (id: string) => {
    const next = cards.filter((c) => c.id !== id);
    setCards(next);
    localStorage.setItem("t2s_cards", JSON.stringify(next));
    try { localStorage.removeItem(`t2s_thread_${id}`); } catch {}
    if (thread?.id === id) closeThread();
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
                    onClick={() => openThread(c)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold bg-gradient-to-r from-you/30 to-str/30 border border-white/15 hover:from-you/45 hover:to-str/45 transition-all"
                  >
                    <Send size={12} /> Continue chatting
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

      {/* thread chat modal */}
      <AnimatePresence>
        {thread && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong flex flex-col w-full sm:max-w-lg sm:rounded-3xl overflow-hidden"
              style={{ height: "min(680px, 100dvh)" }}
            >
              {/* thread header */}
              <div className="shrink-0 border-b border-white/5 px-4 h-14 flex items-center gap-3">
                <button
                  onClick={closeThread}
                  className="p-2 -ml-1 rounded-full text-white/50 hover:text-white hover:bg-white/10"
                  aria-label="Close"
                >
                  <ArrowLeft size={17} />
                </button>
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-str to-str/40 flex items-center justify-center font-display font-bold text-ink text-sm">
                    {thread.them[0].toUpperCase()}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-mint border-2 border-panel" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-str-glow truncate leading-tight">{thread.them}</p>
                  <p className="text-[11px] text-white/35">saved connection · anonymous thread</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Bookmark size={14} className="text-gold fill-gold" />
                  <span className="text-[11px] font-mono text-gold/70">saved</span>
                </div>
              </div>

              {/* messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto nice-scroll">
                <div className="px-4 py-4 flex flex-col gap-2.5">
                  {threadMsgs.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="self-center text-center py-8"
                    >
                      <Bookmark size={22} className="mx-auto text-gold/50 mb-3" />
                      <p className="text-sm text-white/50 font-medium">
                        This line is still open with{" "}
                        <span className="font-mono text-str-glow">{thread.them}</span>.
                      </p>
                      <p className="text-xs text-white/30 mt-1">Say something.</p>
                    </motion.div>
                  )}
                  <AnimatePresence initial={false}>
                    {threadMsgs.map((m) => (
                      <Bubble key={m.id} msg={m as Msg} />
                    ))}
                    {typing && (
                      <motion.div
                        key="typing"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="self-start glass rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex gap-1"
                      >
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="typing-dot h-1.5 w-1.5 rounded-full bg-str-glow" />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* composer */}
              <div className="shrink-0 border-t border-white/5 bg-panel/70 backdrop-blur-xl px-4 py-3 flex items-end gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder={`Message ${thread.them}…`}
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-[15px] placeholder:text-white/30 focus:border-you/50 outline-none min-w-0"
                />
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={send}
                  disabled={!draft.trim()}
                  className="p-2.5 rounded-full bg-gradient-to-r from-you to-str text-ink disabled:opacity-30 shrink-0"
                  aria-label="Send"
                >
                  <Send size={17} />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toasts toasts={toasts} />
    </main>
  );
}
