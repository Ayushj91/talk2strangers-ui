"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ImagePlus, Send, Users, MoonStar } from "lucide-react";
import { ROOMS, ROOM_CHATTER, MEMBER_POOL, STRANGER_IMAGES, makeHandle, rand, uid } from "@/lib/data";
import { Bubble, Msg, Toasts, useToasts, hueFor } from "@/components/ChatKit";

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const room = ROOMS.find((r) => r.id === params.roomId) ?? ROOMS[0];
  const [me] = useState(makeHandle);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [count, setCount] = useState(room.baseCount);
  const [activeTyper, setActiveTyper] = useState<string | null>(null);
  const { toasts, push } = useToasts();
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const add = useCallback((m: Omit<Msg, "id" | "ts">) => {
    setMsgs((prev) => [...prev.slice(-80), { ...m, id: uid(), ts: Date.now() }]);
  }, []);

  // welcome + ambient member activity
  useEffect(() => {
    add({ kind: "system", from: "system", text: `you joined as ${me} — handles reset when you leave` });

    const chatter = [...(ROOM_CHATTER[room.id] ?? []), ...ROOM_CHATTER.default];
    let alive = true;

    const loop = () => {
      if (!alive) return;
      const roll = Math.random();
      if (roll < 0.62) {
        // member message (with typing preview)
        const who = rand(MEMBER_POOL);
        setActiveTyper(who);
        setTimeout(() => {
          if (!alive) return;
          setActiveTyper(null);
          add({ kind: "text", from: "them", sender: who, text: rand(chatter) });
        }, 1200 + Math.random() * 900);
      } else if (roll < 0.74) {
        // member shares a photo (arrives hidden for you)
        const who = rand(MEMBER_POOL);
        add({
          kind: "image",
          from: "them",
          sender: who,
          imageUrl: rand(STRANGER_IMAGES) + `?r=${uid()}`,
          mediaState: "pending-in"
        });
      } else if (roll < 0.87) {
        const joined = Math.random() > 0.45;
        setCount((c) => Math.max(2, c + (joined ? 1 : -1)));
        add({
          kind: "system",
          from: "system",
          text: `${makeHandle()} ${joined ? "joined" : "left"} the room`
        });
      } else {
        // someone reacts to the latest message
        setMsgs((prev) => {
          if (!prev.length) return prev;
          const last = [...prev].reverse().find((m) => m.kind === "text");
          if (!last) return prev;
          return prev.map((m) =>
            m.id === last.id ? { ...m, reactions: [...(m.reactions ?? []), rand(["😂", "❤️", "🔥", "👍"])] } : m
          );
        });
      }
      setTimeout(loop, 2800 + Math.random() * 3800);
    };
    const t = setTimeout(loop, 1200);
    return () => {
      alive = false;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id]);

  // autoscroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, activeTyper]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    if (/https?:\/\/|www\./i.test(text)) {
      push("Link blocked before delivery — spam protection is always on", "warn");
      setDraft("");
      return;
    }
    add({ kind: "text", from: "me", sender: me, text, tick: "delivered" });
    setDraft("");
  };

  const sendImage = (file: File) => {
    const url = URL.createObjectURL(file);
    add({ kind: "image", from: "me", sender: me, imageUrl: url, mediaState: "accepted" });
    push("Photo shared — members tap to reveal it on their side");
  };

  const react = (id: string, emoji: string) =>
    setMsgs((prev) =>
      prev.map((m) => (m.id === id ? { ...m, reactions: [...(m.reactions ?? []), emoji] } : m))
    );

  const report = (id: string) => {
    setMsgs((prev) => prev.filter((m) => m.id !== id));
    push("Report sent. Message removed for you — moderation takes it from here.");
  };

  const acceptMedia = (id: string) =>
    setMsgs((prev) => prev.map((m) => (m.id === id ? { ...m, mediaState: "accepted" } : m)));
  const declineMedia = (id: string) =>
    setMsgs((prev) => prev.map((m) => (m.id === id ? { ...m, mediaState: "declined" } : m)));

  const quiet = count < 3;

  return (
    <main className="h-[100dvh] flex flex-col overflow-hidden bg-ink">
      {/* header */}
      <header className="glass-strong border-x-0 border-t-0 shrink-0">
        <div className="mx-auto max-w-4xl px-3 sm:px-6 h-14 flex items-center gap-3">
          <Link href="/rooms" className="p-2 -ml-1 rounded-full hover:bg-white/10" aria-label="Back to rooms">
            <ArrowLeft size={18} />
          </Link>
          <span className="text-2xl">{room.emoji}</span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display font-bold leading-tight truncate">{room.name}</h1>
            <p className="text-[11px] font-mono text-white/40 truncate">
              you are <span style={{ color: `hsl(${hueFor(me)} 70% 72%)` }}>{me}</span>
            </p>
          </div>
          {quiet ? (
            <span className="flex items-center gap-1 text-[11px] font-mono text-gold/80 glass rounded-full px-2.5 py-1.5 shrink-0">
              <MoonStar size={12} /> quiet
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-mono text-white/60 glass rounded-full px-2.5 py-1.5 shrink-0">
              <Users size={13} className="text-mint" />
              <motion.span key={count} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                {count}
              </motion.span>
            </span>
          )}
        </div>
      </header>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto nice-scroll">
        <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {msgs.map((m) => (
              <Bubble
                key={m.id}
                msg={m}
                showSender
                onReact={react}
                onReport={m.from !== "me" ? report : undefined}
                onAcceptMedia={acceptMedia}
                onDeclineMedia={declineMedia}
              />
            ))}
            {activeTyper && (
              <motion.div
                key="typer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="self-start flex items-center gap-2"
              >
                <span className="text-[11px] font-mono" style={{ color: `hsl(${hueFor(activeTyper)} 70% 72%)` }}>
                  {activeTyper}
                </span>
                <div className="glass rounded-2xl rounded-bl-sm px-3 py-2.5 flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="typing-dot h-1.5 w-1.5 rounded-full bg-white/60" />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* composer */}
      <div className="shrink-0 border-t border-white/5 bg-panel/70 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-3 sm:px-6 py-3 flex items-end gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) sendImage(f);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="p-2.5 rounded-full glass hover:bg-white/10 text-white/60 hover:text-white shrink-0"
            aria-label="Share a photo"
          >
            <ImagePlus size={18} />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={`Say something to ${room.name}…`}
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-[15px] placeholder:text-white/30 focus:border-you/50 outline-none min-w-0"
          />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={send}
            disabled={!draft.trim()}
            className="p-2.5 rounded-full bg-gradient-to-r from-you to-str text-ink disabled:opacity-30 shrink-0"
            aria-label="Send"
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>

      <Toasts toasts={toasts} />
    </main>
  );
}
