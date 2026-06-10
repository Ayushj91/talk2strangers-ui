"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CheckCheck, Flag, ShieldQuestion, SmilePlus } from "lucide-react";
import { EMOJIS } from "@/lib/data";

// ---------------------------------------------------------------
// types
// ---------------------------------------------------------------
export type MediaState = "pending-out" | "accepted" | "pending-in" | "declined";

export type Msg = {
  id: string;
  kind: "text" | "image" | "system" | "game";
  from: "me" | "them" | "system";
  sender?: string; // handle (rooms)
  text?: string;
  imageUrl?: string;
  mediaState?: MediaState;
  tick?: "sent" | "delivered";
  reactions?: string[];
  game?: any;
  ts: number;
};

export function hueFor(handle: string) {
  let h = 0;
  for (let i = 0; i < handle.length; i++) h = (h * 31 + handle.charCodeAt(i)) % 360;
  return h;
}

// ---------------------------------------------------------------
// typing dots
// ---------------------------------------------------------------
export function TypingDots({ label }: { label?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className="flex items-center gap-2 self-start"
    >
      {label && <span className="text-[11px] font-mono text-white/40">{label}</span>}
      <div className="glass rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className="typing-dot inline-block h-1.5 w-1.5 rounded-full bg-str-glow" />
        ))}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------
// emoji reaction picker
// ---------------------------------------------------------------
export function EmojiBar({ onPick, onClose }: { onPick: (e: string) => void; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 6 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="glass-strong rounded-full px-2 py-1.5 flex gap-1 shadow-xl z-20"
    >
      {EMOJIS.map((e, i) => (
        <motion.button
          key={e}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          whileHover={{ scale: 1.35, y: -3 }}
          whileTap={{ scale: 0.9 }}
          className="text-lg leading-none px-1"
          onClick={() => {
            onPick(e);
            onClose();
          }}
        >
          {e}
        </motion.button>
      ))}
    </motion.div>
  );
}

// ---------------------------------------------------------------
// message bubble
// ---------------------------------------------------------------
export function Bubble({
  msg,
  onReact,
  onReport,
  onAcceptMedia,
  onDeclineMedia,
  showSender
}: {
  msg: Msg;
  onReact?: (id: string, emoji: string) => void;
  onReport?: (id: string) => void;
  onAcceptMedia?: (id: string) => void;
  onDeclineMedia?: (id: string) => void;
  showSender?: boolean;
}) {
  const [picker, setPicker] = useState(false);
  const mine = msg.from === "me";

  if (msg.kind === "system") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="self-center text-[11px] font-mono text-white/35 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 my-1"
      >
        {msg.text}
      </motion.div>
    );
  }

  const hue = msg.sender ? hueFor(msg.sender) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className={`group relative max-w-[82%] sm:max-w-[70%] ${mine ? "self-end" : "self-start"}`}
    >
      {showSender && !mine && msg.sender && (
        <div className="mb-0.5 text-[11px] font-mono" style={{ color: `hsl(${hue} 70% 72%)` }}>
          {msg.sender}
        </div>
      )}

      <div className={`relative flex items-end gap-1.5 ${mine ? "flex-row-reverse" : ""}`}>
        <div
          className={`relative rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed break-words ${
            mine
              ? "rounded-br-sm bg-you-soft border border-you/30 text-white shadow-glowYou"
              : "rounded-bl-sm bg-str-soft/70 border border-str/25 text-white"
          }`}
        >
          {msg.kind === "image" ? (
            <MediaBlock msg={msg} onAccept={onAcceptMedia} onDecline={onDeclineMedia} />
          ) : (
            msg.text
          )}

          {mine && msg.tick && (
            <span className="ml-2 inline-flex align-middle text-you-glow/80">
              {msg.tick === "sent" ? <Check size={13} /> : <CheckCheck size={13} />}
            </span>
          )}
        </div>

        {/* hover actions */}
        <div
          className={`flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity ${
            mine ? "flex-row-reverse" : ""
          }`}
        >
          {onReact && (
            <button
              aria-label="React"
              onClick={() => setPicker((p) => !p)}
              className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10"
            >
              <SmilePlus size={15} />
            </button>
          )}
          {!mine && onReport && (
            <button
              aria-label="Report message"
              onClick={() => onReport(msg.id)}
              className="p-1.5 rounded-full text-white/40 hover:text-str hover:bg-str/10"
            >
              <Flag size={14} />
            </button>
          )}
        </div>
      </div>

      {/* reactions */}
      {msg.reactions && msg.reactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mt-1 flex gap-1 ${mine ? "justify-end" : ""}`}
        >
          {msg.reactions.map((r, i) => (
            <span
              key={i}
              className="text-xs glass rounded-full px-1.5 py-0.5 leading-none flex items-center"
            >
              {r}
            </span>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {picker && (
          <div className={`absolute -top-10 z-20 ${mine ? "right-0" : "left-0"}`}>
            <EmojiBar
              onPick={(e) => onReact && onReact(msg.id, e)}
              onClose={() => setPicker(false)}
            />
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---------------------------------------------------------------
// media (image) block with first-time consent flow
// ---------------------------------------------------------------
function MediaBlock({
  msg,
  onAccept,
  onDecline
}: {
  msg: Msg;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}) {
  if (msg.mediaState === "declined") {
    return <span className="text-white/45 text-sm italic">Media declined</span>;
  }

  const blurred = msg.mediaState === "pending-in";
  const waiting = msg.mediaState === "pending-out";

  return (
    <div className="relative -mx-1 -my-0.5">
      <motion.img
        src={msg.imageUrl}
        alt="Shared media"
        initial={false}
        animate={{ filter: blurred ? "blur(26px) saturate(0.6)" : "blur(0px) saturate(1)", scale: blurred ? 1.06 : 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="rounded-xl max-h-64 w-auto max-w-full object-cover select-none"
        draggable={false}
      />
      {blurred && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-black/30 p-3 text-center">
          <ShieldQuestion size={22} className="text-white/80" />
          <p className="text-xs text-white/85 font-medium leading-snug">
            Stranger wants to share a photo.
            <br />
            <span className="text-white/55">First media is hidden until you accept.</span>
          </p>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => onAccept && onAccept(msg.id)}
              className="text-xs font-semibold rounded-full px-3.5 py-1.5 bg-mint text-ink hover:opacity-90"
            >
              Reveal
            </button>
            <button
              onClick={() => onDecline && onDecline(msg.id)}
              className="text-xs font-semibold rounded-full px-3.5 py-1.5 bg-white/10 hover:bg-white/20"
            >
              Decline
            </button>
          </div>
        </div>
      )}
      {waiting && (
        <div className="absolute bottom-1.5 left-1.5 right-1.5 rounded-lg bg-black/60 backdrop-blur px-2 py-1 text-[11px] text-gold flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulseSoft" />
          Hidden until they accept media
        </div>
      )}
      {msg.mediaState === "accepted" && msg.from === "me" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-1.5 left-1.5 rounded-lg bg-black/60 backdrop-blur px-2 py-1 text-[11px] text-mint"
        >
          Accepted ✓
        </motion.div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// toasts
// ---------------------------------------------------------------
export type Toast = { id: string; text: string; tone?: "ok" | "warn" };

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = (text: string, tone: "ok" | "warn" = "ok") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  };
  return { toasts, push };
}

export function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="pointer-events-none fixed bottom-20 left-1/2 z-[60] -translate-x-1/2 flex flex-col items-center gap-2 px-4 w-full max-w-md">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className={`glass-strong rounded-full px-4 py-2 text-sm shadow-xl text-center ${
              t.tone === "warn" ? "text-gold" : "text-white/90"
            }`}
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// auto-scroll helper
export function useAutoScroll(dep: any) {
  useEffect(() => {
    const el = document.getElementById("chat-scroll");
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [dep]);
}
