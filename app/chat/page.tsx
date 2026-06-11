"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, Bookmark, Dices, Flag, ImagePlus, Send, SkipForward, LogOut,
  Sparkles, X, Lightbulb, HelpCircle
} from "lucide-react";
import {
  MOODS, OPENERS, REPLIES, QUESTION_REPLIES, NUDGES, TICKER, WYR, TRUTHS,
  DARES, TWENTYQ, STRANGER_IMAGES, makeHandle, rand, uid
} from "@/lib/data";
import { Bubble, Msg, Toasts, useToasts } from "@/components/ChatKit";

type Stage = "mood" | "matching" | "chat" | "next" | "left" | "reported" | "card";

export default function ChatPage() {
  const [stage, setStage] = useState<Stage>("mood");
  const [mood, setMood] = useState<string>("chat");
  const [me] = useState(makeHandle);
  const [stranger, setStranger] = useState(makeHandle);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [nudge, setNudge] = useState<string | null>(null);
  const [gameMenu, setGameMenu] = useState(false);
  const [cardState, setCardState] = useState<"ask" | "waiting" | "mutual">("ask");
  const [saveNudge, setSaveNudge] = useState<"idle" | "sent" | "accepted" | "declined">("idle");
  const { toasts, push } = useToasts();

  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const session = useRef(0); // invalidates stale timers across sessions
  const botReplies = useRef(0);
  const mediaTrustOut = useRef(false); // they accepted my media
  const mediaTrustIn = useRef(false); // I accepted theirs
  const botImageSent = useRef(false);
  const nudgeUsed = useRef(false);
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ----------------------------------------------------------- helpers
  const later = useCallback((ms: number, fn: () => void) => {
    const s = session.current;
    setTimeout(() => {
      if (session.current === s) fn();
    }, ms);
  }, []);

  const add = useCallback((m: Omit<Msg, "id" | "ts">) => {
    const id = uid();
    setMsgs((prev) => [...prev, { ...m, id, ts: Date.now() }]);
    return id;
  }, []);

  const patch = useCallback((id: string, p: Partial<Msg>) => {
    setMsgs((prev) => prev.map((m) => (m.id === id ? { ...m, ...p } : m)));
  }, []);

  const resetSilence = useCallback(() => {
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    if (nudgeUsed.current) return;
    const s = session.current;
    silenceTimer.current = setTimeout(() => {
      if (session.current === s) setNudge(rand(NUDGES));
    }, 22000);
  }, []);

  // ----------------------------------------------------------- bot brain
  const botSay = useCallback(
    (text: string, delay = 1100) => {
      later(400, () => setTyping(true));
      later(400 + delay, () => {
        setTyping(false);
        add({ kind: "text", from: "them", text });
        botReplies.current += 1;
        resetSilence();
      });
    },
    [add, later, resetSilence]
  );

  const botRespondTo = useCallback(
    (userText: string, msgId: string) => {
      // sometimes react to my message
      if (Math.random() < 0.3) {
        later(900, () =>
          patch(msgId, { reactions: [rand(["😂", "❤️", "🔥", "😮"])] })
        );
      }
      const isQ = userText.includes("?");
      botSay(isQ ? rand(QUESTION_REPLIES) : rand(REPLIES), 900 + Math.random() * 1200);

      // once per session, the stranger shares a photo
      if (!botImageSent.current && botReplies.current >= 3 && Math.random() < 0.45) {
        botImageSent.current = true;
        later(4200, () => {
          add({
            kind: "image",
            from: "them",
            imageUrl: rand(STRANGER_IMAGES) + `?r=${uid()}`,
            mediaState: mediaTrustIn.current ? "accepted" : "pending-in"
          });
          botSay("ok wait, look at this", 600);
        });
      }
    },
    [add, botSay, later, patch]
  );

  // ----------------------------------------------------------- lifecycle
  const startMatching = (m: string) => {
    setMood(m);
    setStage("matching");
    session.current += 1;
    later(2600, () => beginSession(m));
  };

  const beginSession = (m: string) => {
    session.current += 1;
    botReplies.current = 0;
    botImageSent.current = false;
    mediaTrustIn.current = false;
    mediaTrustOut.current = false;
    nudgeUsed.current = false;
    setNudge(null);
    setSaveNudge("idle");
    setTyping(false);
    const handle = makeHandle();
    setStranger(handle);
    setMsgs([]);
    setStage("chat");
    add({ kind: "system", from: "system", text: `matched with ${handle} · mood: ${m} · be kind` });
    later(1400, () => botSay(rand(OPENERS[m] ?? OPENERS.chat), 1300));
    resetSilence();
  };

  // graceful next — pre-queued, under 2s
  const next = () => {
    session.current += 1;
    setTyping(false);
    setStage("next");
    later(1500, () => beginSession(mood));
  };

  const report = () => {
    session.current += 1;
    setTyping(false);
    setStage("reported");
  };

  const leave = () => {
    if (saveNudge === "accepted") {
      window.location.href = "/connections";
      return;
    }
    if (msgs.filter((x) => x.from !== "system").length >= 2) {
      setCardState("ask");
      setStage("card");
    } else {
      window.location.href = "/";
    }
  };

  const sendSaveNudge = () => {
    if (saveNudge !== "idle" || stage !== "chat") return;
    setSaveNudge("sent");
    add({ kind: "system", from: "system", text: `you nudged ${stranger} to save this chat ✦` });
    later(2800, () => {
      const accepted = Math.random() < 0.75;
      if (accepted) {
        setSaveNudge("accepted");
        try {
          const cards = JSON.parse(localStorage.getItem("t2s_cards") ?? "[]");
          const dup = cards.some((c: { me: string; them: string }) => c.me === me && c.them === stranger);
          if (!dup) {
            cards.unshift({ id: uid(), me, them: stranger, mood, at: Date.now() });
            localStorage.setItem("t2s_cards", JSON.stringify(cards));
          }
        } catch {}
        add({ kind: "system", from: "system", text: `${stranger} said yes — connection card saved ✓` });
        push("Card saved! Find them in Connections →");
      } else {
        setSaveNudge("declined");
        add({ kind: "system", from: "system", text: `${stranger} passed — that's okay` });
        push("They passed on saving this one");
        later(3000, () => setSaveNudge("idle"));
      }
    });
  };

  // stranger occasionally leaves on their own
  useEffect(() => {
    if (stage !== "chat") return;
    const s = session.current;
    const t = setTimeout(() => {
      if (session.current === s && Math.random() < 0.5) {
        setTyping(false);
        setStage("left");
      }
    }, 110000);
    return () => clearTimeout(t);
  }, [stage, stranger]);

  // autoscroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing, nudge]);

  // ----------------------------------------------------------- sending
  const send = (forced?: string) => {
    const text = (forced ?? draft).trim();
    if (!text) return;
    setDraft("");
    setNudge(null);
    resetSilence();

    if (/https?:\/\/|www\./i.test(text)) {
      push("Link blocked before delivery — spam never reaches a stranger", "warn");
      return;
    }
    if (text.toLowerCase().startsWith("/game")) {
      setGameMenu(true);
      return;
    }
    const id = add({ kind: "text", from: "me", text, tick: "sent" });
    later(500, () => patch(id, { tick: "delivered" }));
    later(700, () => botRespondTo(text, id));
  };

  const sendImage = (file: File) => {
    const url = URL.createObjectURL(file);
    const trusted = mediaTrustOut.current;
    const id = add({
      kind: "image",
      from: "me",
      imageUrl: url,
      mediaState: trusted ? "accepted" : "pending-out"
    });
    if (!trusted) {
      push("First photo stays hidden until they accept");
      later(2600, () => {
        mediaTrustOut.current = true;
        patch(id, { mediaState: "accepted" });
        push("Stranger accepted your media ✓");
        botSay(rand(["oh nice!!", "okay that's a great photo", "hahah I love this"]), 800);
      });
    } else {
      later(900, () => botSay(rand(["another one!! keep them coming", "this one's even better"]), 900));
    }
  };

  const react = (id: string, emoji: string) => {
    patch(id, { reactions: [...(msgs.find((m) => m.id === id)?.reactions ?? []), emoji] });
    resetSilence();
  };

  const acceptMedia = (id: string) => {
    mediaTrustIn.current = true;
    patch(id, { mediaState: "accepted" });
    botSay("right?? thought you'd like it", 800);
  };
  const declineMedia = (id: string) => {
    patch(id, { mediaState: "declined" });
    botSay("no worries! words only then 😄", 700);
  };

  // ----------------------------------------------------------- games
  const startGame = (type: "wyr" | "tod" | "20q") => {
    setGameMenu(false);
    resetSilence();
    if (type === "wyr") {
      const q = rand(WYR);
      add({ kind: "game", from: "me", game: { type: "wyr", q, myPick: null, theirPick: null } });
      botSay("ooh okay, picking…", 700);
    } else if (type === "tod") {
      add({ kind: "game", from: "me", game: { type: "tod", stage: "choose" } });
      botSay("you first. choose wisely 😈", 700);
    } else {
      const round = rand(TWENTYQ);
      add({
        kind: "game",
        from: "them",
        game: { type: "20q", round, asked: [], revealed: false }
      });
      botSay("I'm thinking of something. ask away 👀", 700);
    }
  };

  const playWyr = (id: string, pick: "a" | "b") => {
    const m = msgs.find((x) => x.id === id);
    if (!m || m.game.myPick) return;
    patch(id, { game: { ...m.game, myPick: pick } });
    later(1100, () => {
      const theirs = Math.random() > 0.5 ? "a" : "b";
      setMsgs((prev) =>
        prev.map((x) => (x.id === id ? { ...x, game: { ...x.game, myPick: pick, theirPick: theirs } } : x))
      );
      botSay(
        theirs === pick ? "WE MATCH. great minds 🤝" : "we are fundamentally different people lmao",
        900
      );
    });
  };

  const playTod = (id: string, choice: "truth" | "dare") => {
    const prompt = choice === "truth" ? rand(TRUTHS) : rand(DARES);
    patch(id, { game: { type: "tod", stage: "prompt", choice, prompt } });
    botSay(choice === "truth" ? "the truth, the whole truth 👁️" : "you HAVE to do it now", 900);
  };

  const ask20q = (id: string, q: string) => {
    const m = msgs.find((x) => x.id === id);
    if (!m || m.game.asked.includes(q)) return;
    patch(id, { game: { ...m.game, asked: [...m.game.asked, q] } });
    botSay(m.game.round.answers[q], 800);
  };

  const reveal20q = (id: string) => {
    const m = msgs.find((x) => x.id === id);
    if (!m) return;
    patch(id, { game: { ...m.game, revealed: true } });
    botSay(`it was ${m.game.round.secret}!! were you close?`, 900);
  };

  // ----------------------------------------------------------- connection card
  const exchangeCard = () => {
    setCardState("waiting");
    setTimeout(() => {
      setCardState("mutual");
      try {
        const cards = JSON.parse(localStorage.getItem("t2s_cards") ?? "[]");
        cards.unshift({ id: uid(), me, them: stranger, mood, at: Date.now() });
        localStorage.setItem("t2s_cards", JSON.stringify(cards));
      } catch {}
    }, 1600);
  };

  // ===================================================================
  // RENDER
  // ===================================================================

  // ---------- mood select ----------
  if (stage === "mood") {
    return (
      <main className="relative min-h-[100dvh] flex flex-col overflow-hidden">
        <BackBar />
        <Ambient />
        <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-10">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-xs text-white/40">
            optional — it&apos;s a signal, not a filter
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 font-display font-bold text-3xl sm:text-4xl text-center tracking-tight"
          >
            What are you in the <span className="gradient-text">mood</span> for?
          </motion.h1>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-xl">
            {MOODS.map((m, i) => (
              <motion.button
                key={m.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => startMatching(m.id)}
                className="glass rounded-2xl p-5 text-left hover:border-you/40 transition-colors"
              >
                <span className="text-2xl">{m.emoji}</span>
                <div className="mt-2 font-display font-bold">{m.label}</div>
                <div className="text-xs text-white/40">{m.blurb}</div>
              </motion.button>
            ))}
            <motion.button
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => startMatching("chat")}
              className="rounded-2xl p-5 text-left bg-gradient-to-br from-you/30 to-str/30 border border-white/15 sm:col-span-1 col-span-2"
            >
              <span className="text-2xl">🎲</span>
              <div className="mt-2 font-display font-bold">Surprise me</div>
              <div className="text-xs text-white/50">pure random</div>
            </motion.button>
          </div>
          <p className="mt-8 text-[11px] font-mono text-white/30 text-center max-w-xs">
            you&apos;ll appear as <span className="text-you-glow">{me}</span> — a new identity, every session
          </p>
        </div>
      </main>
    );
  }

  // ---------- matching ----------
  if (stage === "matching") {
    return (
      <main className="relative min-h-[100dvh] flex flex-col overflow-hidden">
        <BackBar />
        <Ambient />
        <div className="relative flex-1 flex flex-col items-center justify-center px-4">
          <div className="relative h-28 w-64 flex items-center justify-center">
            <motion.div
              animate={{ x: [-70, -8, -70] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute h-14 w-14 rounded-full bg-you shadow-glowYou"
            />
            <motion.div
              animate={{ x: [70, 8, 70] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute h-14 w-14 rounded-full bg-str shadow-glowStr"
            />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 font-display font-bold text-xl"
          >
            Finding your stranger…
          </motion.p>
          <p className="mt-1 text-xs font-mono text-white/40">
            mood: {MOODS.find((m) => m.id === mood)?.label ?? "Just Chat"} · matching within your vibe
          </p>
          <WaitTicker />
        </div>
      </main>
    );
  }

  // ---------- connection card flow ----------
  if (stage === "card") {
    return (
      <main className="relative min-h-[100dvh] flex items-center justify-center px-4 overflow-hidden">
        <Ambient />
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative glass-strong rounded-3xl p-7 w-full max-w-sm text-center"
        >
          <Sparkles className="mx-auto text-gold" size={26} />
          {cardState === "ask" && (
            <>
              <h2 className="mt-3 font-display font-bold text-2xl">Keep this one?</h2>
              <p className="mt-2 text-sm text-white/55 leading-relaxed">
                Exchange connection cards with <span className="font-mono text-str-glow">{stranger}</span>.
                Only if you both say yes.
              </p>
              <CardVisual me={me} them={stranger} />
              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={exchangeCard}
                  className="rounded-full py-3 font-semibold text-ink bg-gradient-to-r from-you to-str"
                >
                  Exchange card
                </button>
                <Link href="/" className="rounded-full py-3 font-semibold glass hover:bg-white/10">
                  No thanks, just leave
                </Link>
              </div>
            </>
          )}
          {cardState === "waiting" && (
            <>
              <h2 className="mt-3 font-display font-bold text-2xl">Asking them…</h2>
              <p className="mt-2 text-sm text-white/55">Cards only exchange if it&apos;s mutual.</p>
              <div className="mt-6 flex justify-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="typing-dot h-2 w-2 rounded-full bg-gold" />
                ))}
              </div>
            </>
          )}
          {cardState === "mutual" && (
            <>
              <motion.h2
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="mt-3 font-display font-bold text-2xl gradient-text"
              >
                It&apos;s mutual ✨
              </motion.h2>
              <p className="mt-2 text-sm text-white/55">
                Card saved. You can revisit it — and unlock a persistent thread — anytime.
              </p>
              <CardVisual me={me} them={stranger} glow />
              <div className="mt-6 flex flex-col gap-2">
                <Link
                  href="/connections"
                  className="rounded-full py-3 font-semibold text-ink bg-gradient-to-r from-you to-str"
                >
                  View my connections
                </Link>
                <button onClick={() => beginSession(mood)} className="rounded-full py-3 font-semibold glass hover:bg-white/10">
                  Talk to someone new
                </button>
              </div>
            </>
          )}
        </motion.div>
      </main>
    );
  }

  // ---------- chat / overlays ----------
  return (
    <main className="h-[100dvh] flex flex-col overflow-hidden bg-ink">
      {/* header */}
      <header className="glass-strong border-x-0 border-t-0 shrink-0 relative z-10">
        <div className="mx-auto max-w-3xl px-3 sm:px-6 h-14 flex items-center gap-2.5">
          <Link href="/" className="p-2 -ml-1 rounded-full hover:bg-white/10" aria-label="Home">
            <ArrowLeft size={18} />
          </Link>
          <div className="relative">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-str to-str/40 flex items-center justify-center font-display font-bold text-ink">
              {stranger[0].toUpperCase()}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-mint border-2 border-ink" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-mono text-sm text-str-glow truncate leading-tight">{stranger}</h1>
            <p className="text-[11px] text-white/35 truncate">
              {typing ? "typing…" : `mood-matched · ${MOODS.find((m) => m.id === mood)?.label ?? "Just Chat"}`}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <IconBtn
              label={
                saveNudge === "accepted"
                  ? "Chat saved to connections"
                  : saveNudge === "sent"
                  ? "Waiting for their response…"
                  : "Nudge to save this chat"
              }
              onClick={sendSaveNudge}
              active={saveNudge === "accepted"}
              disabled={saveNudge === "sent" || saveNudge === "accepted"}
            >
              <Bookmark
                size={17}
                className={saveNudge === "accepted" ? "fill-gold text-gold" : ""}
              />
            </IconBtn>
            <IconBtn label="Report & disconnect" onClick={report} danger>
              <Flag size={17} />
            </IconBtn>
            <IconBtn label="Next stranger" onClick={next}>
              <SkipForward size={17} />
            </IconBtn>
            <IconBtn label="End chat" onClick={leave}>
              <LogOut size={17} />
            </IconBtn>
          </div>
        </div>
      </header>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto nice-scroll relative">
        <div className="mx-auto max-w-3xl px-3 sm:px-6 py-4 flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {msgs.map((m) =>
              m.kind === "game" ? (
                <GameCard
                  key={m.id}
                  msg={m}
                  onWyr={playWyr}
                  onTod={playTod}
                  onAsk={ask20q}
                  onReveal={reveal20q}
                />
              ) : (
                <Bubble
                  key={m.id}
                  msg={m}
                  onReact={react}
                  onAcceptMedia={acceptMedia}
                  onDeclineMedia={declineMedia}
                />
              )
            )}
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

      {/* save nudge status bar */}
      <AnimatePresence>
        {saveNudge === "sent" && stage === "chat" && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="mx-auto max-w-3xl w-full px-3 sm:px-6 pb-2"
          >
            <div className="glass-strong rounded-2xl p-3.5 flex items-center gap-3 border-gold/30">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute h-full w-full rounded-full bg-gold animate-ping opacity-60" />
                <span className="relative h-2 w-2 rounded-full bg-gold" />
              </span>
              <p className="text-sm text-white/80 flex-1 leading-snug">
                Nudge sent — waiting for <span className="font-mono text-str-glow">{stranger}</span> to respond…
              </p>
            </div>
          </motion.div>
        )}
        {saveNudge === "accepted" && stage === "chat" && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="mx-auto max-w-3xl w-full px-3 sm:px-6 pb-2"
          >
            <div className="glass-strong rounded-2xl p-3.5 flex items-center gap-3 border-gold/30">
              <Bookmark size={16} className="text-gold fill-gold shrink-0" />
              <p className="text-sm text-white/80 flex-1 leading-snug">
                Card saved with <span className="font-mono text-str-glow">{stranger}</span> — you can come back to this.
              </p>
              <a
                href="/connections"
                className="text-xs font-semibold rounded-full px-3 py-1.5 bg-gold text-ink shrink-0"
              >
                View
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* nudge question */}
      <AnimatePresence>
        {nudge && stage === "chat" && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="mx-auto max-w-3xl w-full px-3 sm:px-6 pb-2"
          >
            <div className="glass-strong rounded-2xl p-3.5 flex items-center gap-3 border-gold/30">
              <Lightbulb size={18} className="text-gold shrink-0" />
              <p className="text-sm text-white/80 flex-1 leading-snug">{nudge}</p>
              <button
                onClick={() => {
                  nudgeUsed.current = true;
                  send(nudge);
                }}
                className="text-xs font-semibold rounded-full px-3 py-1.5 bg-gold text-ink shrink-0"
              >
                Send it
              </button>
              <button onClick={() => setNudge(null)} className="p-1 text-white/40 hover:text-white shrink-0" aria-label="Dismiss">
                <X size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* composer */}
      <div className="shrink-0 border-t border-white/5 bg-panel/70 backdrop-blur-xl relative z-10">
        <div className="mx-auto max-w-3xl px-3 sm:px-6 py-3 flex items-end gap-2">
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
          <IconBtn label="Play a game" onClick={() => setGameMenu(true)} solid>
            <Dices size={18} />
          </IconBtn>
          <IconBtn label="Share a photo" onClick={() => fileRef.current?.click()} solid>
            <ImagePlus size={18} />
          </IconBtn>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Say something… (or type /game)"
            disabled={stage !== "chat"}
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-[15px] placeholder:text-white/30 focus:border-you/50 outline-none min-w-0 disabled:opacity-40"
          />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => send()}
            disabled={!draft.trim() || stage !== "chat"}
            className="p-2.5 rounded-full bg-gradient-to-r from-you to-str text-ink disabled:opacity-30 shrink-0"
            aria-label="Send"
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>

      {/* game picker sheet */}
      <AnimatePresence>
        {gameMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setGameMenu(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-3xl p-5 w-full max-w-sm"
            >
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <Dices size={18} className="text-gold" /> Play something
              </h3>
              <p className="text-xs text-white/45 mt-0.5">Words run out. Games don&apos;t.</p>
              <div className="mt-4 flex flex-col gap-2">
                {[
                  { id: "wyr", t: "Would You Rather", d: "Pick a side, see if you match", e: "⚖️" },
                  { id: "tod", t: "Truth or Dare", d: "The classic, stranger edition", e: "😈" },
                  { id: "20q", t: "20 Questions", d: "They're thinking of something…", e: "🔮" }
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => startGame(g.id as any)}
                    className="glass rounded-2xl p-4 flex items-center gap-3 text-left hover:bg-white/10 transition-colors"
                  >
                    <span className="text-2xl">{g.e}</span>
                    <div>
                      <div className="font-semibold text-sm">{g.t}</div>
                      <div className="text-xs text-white/45">{g.d}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* graceful next overlay */}
      <AnimatePresence>
        {stage === "next" && (
          <Overlay>
            <div className="relative h-16 w-48 flex items-center justify-center">
              <motion.div
                animate={{ x: [-52, 0], opacity: [1, 0.4] }}
                transition={{ duration: 0.7, repeat: Infinity, repeatType: "mirror" }}
                className="absolute h-9 w-9 rounded-full bg-you shadow-glowYou"
              />
              <motion.div
                animate={{ x: [52, 0], opacity: [1, 0.4] }}
                transition={{ duration: 0.7, repeat: Infinity, repeatType: "mirror" }}
                className="absolute h-9 w-9 rounded-full bg-str shadow-glowStr"
              />
            </div>
            <p className="font-display font-bold text-xl">Finding someone new…</p>
            <p className="text-xs font-mono text-white/40 mt-1">already pre-queued · under 2 seconds</p>
          </Overlay>
        )}
        {stage === "left" && (
          <Overlay key="left">
            <span className="text-4xl">👋</span>
            <p className="font-display font-bold text-xl mt-3">Stranger left the chat</p>
            <p className="text-sm text-white/50 mt-1">It happens. The next one might be the good one.</p>
            <button
              onClick={() => beginSession(mood)}
              className="mt-6 rounded-full px-6 py-3 font-semibold text-ink bg-gradient-to-r from-you to-str"
            >
              Find someone new
            </button>
            <Link href="/" className="mt-2 text-sm text-white/50 hover:text-white">
              Back home
            </Link>
          </Overlay>
        )}
        {stage === "reported" && (
          <Overlay key="reported">
            <Flag size={30} className="text-str" />
            <p className="font-display font-bold text-xl mt-3">Report sent. You&apos;re disconnected.</p>
            <p className="text-sm text-white/50 mt-1 max-w-xs text-center">
              One tap, no forms. Their reputation just took the hit — not your evening.
            </p>
            <button
              onClick={() => beginSession(mood)}
              className="mt-6 rounded-full px-6 py-3 font-semibold text-ink bg-gradient-to-r from-you to-str"
            >
              Find someone new
            </button>
            <Link href="/" className="mt-2 text-sm text-white/50 hover:text-white">
              Back home
            </Link>
          </Overlay>
        )}
      </AnimatePresence>

      <Toasts toasts={toasts} />
    </main>
  );
}

// =================================================================
// small pieces
// =================================================================
function IconBtn({
  children,
  label,
  onClick,
  danger,
  solid,
  active,
  disabled
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  solid?: boolean;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.9 }}
      onClick={disabled ? undefined : onClick}
      title={label}
      aria-label={label}
      aria-disabled={disabled}
      className={`p-2.5 rounded-full transition-colors shrink-0 ${
        disabled
          ? "text-white/25 cursor-default"
          : active
          ? "text-gold bg-gold/15"
          : danger
          ? "text-white/55 hover:text-str hover:bg-str/15"
          : solid
          ? "glass text-white/60 hover:text-white hover:bg-white/10"
          : "text-white/55 hover:text-white hover:bg-white/10"
      }`}
    >
      {children}
    </motion.button>
  );
}

function BackBar() {
  return (
    <div className="relative z-10 px-4 pt-4">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white">
        <ArrowLeft size={16} /> talk<span className="gradient-text font-bold">2</span>strangers
      </Link>
    </div>
  );
}

function Ambient() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="blob animate-drift h-[380px] w-[380px] bg-you/20 -left-32 top-1/4" />
      <div className="blob animate-drift2 h-[380px] w-[380px] bg-str/20 -right-32 bottom-1/4" />
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-ink/85 backdrop-blur-md flex flex-col items-center justify-center px-4"
    >
      {children}
    </motion.div>
  );
}

function WaitTicker() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % TICKER.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="mt-10 h-6 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          className="text-xs font-mono text-white/40 text-center"
        >
          meanwhile: {TICKER[i]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function CardVisual({ me, them, glow }: { me: string; them: string; glow?: boolean }) {
  return (
    <div
      className={`mt-5 mx-auto rounded-2xl p-4 bg-gradient-to-br from-you/25 via-panel to-str/25 border border-white/15 max-w-[260px] ${
        glow ? "shadow-glowYou" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-you-glow truncate">{me}</span>
        <div className="thread w-8 shrink-0" />
        <span className="font-mono text-xs text-str-glow truncate">{them}</span>
      </div>
      <p className="mt-3 text-[10px] font-mono text-white/35 text-left">connection card · talk2strangers</p>
    </div>
  );
}

// =================================================================
// game cards
// =================================================================
function GameCard({
  msg,
  onWyr,
  onTod,
  onAsk,
  onReveal
}: {
  msg: Msg;
  onWyr: (id: string, pick: "a" | "b") => void;
  onTod: (id: string, c: "truth" | "dare") => void;
  onAsk: (id: string, q: string) => void;
  onReveal: (id: string) => void;
}) {
  const g = msg.game;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="self-center w-full max-w-md glass-strong rounded-2xl p-4 border-gold/20"
    >
      {g.type === "wyr" && (
        <>
          <Header icon="⚖️" title="Would You Rather" />
          <div className="mt-3 grid grid-cols-1 gap-2">
            {(["a", "b"] as const).map((side) => {
              const picked = g.myPick === side;
              const theirs = g.theirPick === side;
              return (
                <button
                  key={side}
                  disabled={!!g.myPick}
                  onClick={() => onWyr(msg.id, side)}
                  className={`relative rounded-xl px-3.5 py-3 text-sm text-left border transition-all ${
                    picked
                      ? "border-you bg-you-soft"
                      : "border-white/10 bg-white/5 hover:bg-white/10 disabled:hover:bg-white/5"
                  }`}
                >
                  {g.q[side]}
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 flex gap-1">
                    {picked && <Tag color="you">you</Tag>}
                    {theirs && <Tag color="str">them</Tag>}
                  </span>
                </button>
              );
            })}
          </div>
          {g.myPick && !g.theirPick && (
            <p className="mt-2 text-[11px] font-mono text-white/40">waiting for their pick…</p>
          )}
        </>
      )}

      {g.type === "tod" && (
        <>
          <Header icon="😈" title="Truth or Dare" />
          {g.stage === "choose" ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => onTod(msg.id, "truth")}
                className="rounded-xl py-3 font-semibold bg-you-soft border border-you/40 hover:bg-you/30 transition-colors"
              >
                Truth
              </button>
              <button
                onClick={() => onTod(msg.id, "dare")}
                className="rounded-xl py-3 font-semibold bg-str-soft border border-str/40 hover:bg-str/30 transition-colors"
              >
                Dare
              </button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
              <Tag color={g.choice === "truth" ? "you" : "str"}>{g.choice}</Tag>
              <p className="mt-2 text-sm leading-relaxed">{g.prompt}</p>
              <p className="mt-2 text-[11px] font-mono text-white/40">answer in chat — no take-backs</p>
            </motion.div>
          )}
        </>
      )}

      {g.type === "20q" && (
        <>
          <Header icon="🔮" title="20 Questions" />
          <p className="mt-1.5 text-xs text-white/50">They&apos;re thinking of something. Tap to ask:</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {Object.keys(g.round.answers).map((q) => (
              <button
                key={q}
                disabled={g.asked.includes(q) || g.revealed}
                onClick={() => onAsk(msg.id, q)}
                className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${
                  g.asked.includes(q)
                    ? "border-white/5 bg-white/[0.03] text-white/30 line-through"
                    : "border-white/15 bg-white/5 hover:bg-white/10"
                }`}
              >
                {q}
              </button>
            ))}
          </div>
          {g.revealed ? (
            <motion.p initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="mt-3 text-sm font-semibold gradient-text">
              It was: {g.round.secret}
            </motion.p>
          ) : (
            <button
              onClick={() => onReveal(msg.id)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-gold hover:underline"
            >
              <HelpCircle size={13} /> Give up &amp; reveal
            </button>
          )}
        </>
      )}
    </motion.div>
  );
}

function Header({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg">{icon}</span>
      <span className="font-display font-bold text-sm">{title}</span>
      <span className="ml-auto text-[10px] font-mono text-white/30">/game</span>
    </div>
  );
}

function Tag({ children, color }: { children: React.ReactNode; color: "you" | "str" }) {
  return (
    <span
      className={`text-[10px] font-mono rounded-full px-1.5 py-0.5 uppercase ${
        color === "you" ? "bg-you/30 text-you-glow" : "bg-str/30 text-str-glow"
      }`}
    >
      {children}
    </span>
  );
}
