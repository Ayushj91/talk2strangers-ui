"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight, MessageCircle, Users, EyeOff, Flag, Sparkles,
  Dice5, ImagePlus, Ghost, Zap, ShieldCheck
} from "lucide-react";
import Nav from "@/components/Nav";
import { ROOMS, TICKER, rand } from "@/lib/data";

// ---------------------------------------------------------------
// hero demo conversation (the signature element)
// ---------------------------------------------------------------
const DEMO_SCRIPT: { from: "a" | "b"; text: string }[] = [
  { from: "a", text: "okay weird question. can't sleep?" },
  { from: "b", text: "never can. 2:47am here 🌙" },
  { from: "a", text: "same. tell me something nobody you know knows" },
  { from: "b", text: "I talk to my plants. full conversations." },
  { from: "a", text: "…do they ever win the argument" },
  { from: "b", text: "the cactus is undefeated" },
  { from: "a", text: "ok I needed this laugh, thank you stranger" }
];

function HeroDemo() {
  const [count, setCount] = useState(0);
  const [typing, setTyping] = useState<null | "a" | "b">(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    let i = 0;
    const step = () => {
      if (!alive) return;
      if (i >= DEMO_SCRIPT.length) {
        setTimeout(() => {
          if (!alive) return;
          setCount(0);
          i = 0;
          setTimeout(step, 900);
        }, 3200);
        return;
      }
      setTyping(DEMO_SCRIPT[i].from);
      setTimeout(() => {
        if (!alive) return;
        setTyping(null);
        i += 1;
        setCount(i);
        setTimeout(step, 700);
      }, 1100);
    };
    const t = setTimeout(step, 800);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [count, typing]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.7, ease: "easeOut" }}
      className="relative glass-strong rounded-3xl p-4 sm:p-5 w-full max-w-md shadow-2xl"
    >
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute h-full w-full rounded-full bg-mint animate-ping opacity-60" />
            <span className="relative h-2 w-2 rounded-full bg-mint" />
          </span>
          <span className="text-xs font-mono text-white/50">two strangers, right now</span>
        </div>
        <span className="text-[10px] font-mono text-white/30">nothing is stored</span>
      </div>
      <div ref={scrollRef} className="flex flex-col gap-2.5 pt-4 h-[290px] overflow-y-auto no-scrollbar">
        <AnimatePresence initial={false}>
          {DEMO_SCRIPT.slice(0, count).map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                m.from === "a"
                  ? "self-start rounded-bl-sm bg-str-soft/70 border border-str/25"
                  : "self-end rounded-br-sm bg-you-soft border border-you/30"
              }`}
            >
              {m.text}
            </motion.div>
          ))}
        </AnimatePresence>
        {typing && (
          <div className={`flex gap-1 px-3.5 py-2.5 rounded-2xl glass w-fit ${typing === "b" ? "self-end" : "self-start"}`}>
            {[0, 1, 2].map((i) => (
              <span key={i} className={`typing-dot h-1.5 w-1.5 rounded-full ${typing === "b" ? "bg-you-glow" : "bg-str-glow"}`} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------
// live ticker
// ---------------------------------------------------------------
function Ticker() {
  const items = [...TICKER, ...TICKER];
  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-white/[0.02] py-2.5">
      <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
        {items.map((t, i) => (
          <span key={i} className="text-xs font-mono text-white/40 flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-gradient-to-r from-you to-str" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// page
// ---------------------------------------------------------------
export default function Landing() {
  const reduce = useReducedMotion();

  return (
    <main className="relative overflow-x-clip">
      <Nav />

      {/* ambient field */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="blob animate-drift h-[420px] w-[420px] bg-you/25 -left-32 top-10" />
        <div className="blob animate-drift2 h-[460px] w-[460px] bg-str/20 -right-40 top-64" />
        <div className="blob h-[300px] w-[300px] bg-you/10 left-1/3 top-[820px]" />
      </div>

      {/* ------------------------------ hero ------------------------------ */}
      <section className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-14 sm:pt-24 pb-16 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 text-xs font-mono text-white/60"
          >
            <Ghost size={13} className="text-you-glow" />
            no accounts · no profiles · nothing stored
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-5 font-display font-bold tracking-tight text-[2.6rem] leading-[1.05] sm:text-6xl"
          >
            Two strangers.
            <br />
            One <span className="gradient-text">real</span> conversation.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-5 text-white/55 text-base sm:text-lg max-w-md leading-relaxed"
          >
            The internet&apos;s late-night line. Drop into a room or match 1-on-1 with someone
            you&apos;d never meet otherwise — in under three seconds, with zero forms.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-8 flex flex-col sm:flex-row gap-3"
          >
            <Link
              href="/chat"
              className="group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-semibold text-ink bg-gradient-to-r from-you to-str hover:shadow-glowYou transition-shadow"
            >
              Talk to someone now
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/rooms"
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-semibold glass hover:bg-white/10 transition-colors"
            >
              <Users size={17} className="text-str-glow" />
              Browse rooms
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-8 flex items-center gap-4"
          >
            <div className="thread w-24" />
            <p className="text-xs font-mono text-white/35">
              you&apos;re <span className="text-you-glow">violet</span> · they&apos;re{" "}
              <span className="text-str-glow">coral</span>
            </p>
          </motion.div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <HeroDemo />
        </div>
      </section>

      <Ticker />

      {/* ------------------------------ two modes ------------------------------ */}
      <section className="relative mx-auto max-w-6xl px-4 sm:px-6 py-20">
        <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight">
          Pick your <span className="gradient-text">energy</span>
        </h2>
        <p className="mt-2 text-white/50 max-w-lg">
          Both modes are live the moment you land. No onboarding, no sign-up, no waiting screen.
        </p>

        <div className="mt-10 grid md:grid-cols-2 gap-5">
          {/* 1-on-1 */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55 }}
            whileHover={reduce ? {} : { y: -6 }}
            className="relative overflow-hidden glass rounded-3xl p-7 group"
          >
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-you/20 blur-3xl group-hover:bg-you/30 transition-colors" />
            <MessageCircle className="text-you-glow" size={26} />
            <h3 className="mt-4 font-display font-bold text-2xl">1-on-1 stranger chat</h3>
            <p className="mt-2 text-white/55 leading-relaxed text-sm">
              One tap on a mood — Laugh, Vent, Debate, Weird — and you&apos;re matched in under
              1.5 seconds. Graceful Next pre-queues your next match so there&apos;s never a dead
              loading screen.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-white/45 font-mono">
              <li>→ typing indicators &amp; delivery ticks</li>
              <li>→ nudge questions when it goes quiet</li>
              <li>→ /games, photos &amp; reactions</li>
              <li>→ connection cards at the end</li>
            </ul>
            <Link href="/chat" className="mt-6 inline-flex items-center gap-1.5 text-you-glow font-semibold text-sm">
              Start matching <ArrowRight size={15} />
            </Link>
          </motion.div>

          {/* rooms */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, delay: 0.1 }}
            whileHover={reduce ? {} : { y: -6 }}
            className="relative overflow-hidden glass rounded-3xl p-7 group"
          >
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-str/20 blur-3xl group-hover:bg-str/30 transition-colors" />
            <Users className="text-str-glow" size={26} />
            <h3 className="mt-4 font-display font-bold text-2xl">Live chat rooms</h3>
            <p className="mt-2 text-white/55 leading-relaxed text-sm">
              Topic rooms that never sleep — Music, Gaming, Tech — and mood rooms tuned to a
              feeling, not a subject. 3AM Thoughts hits different when everyone in it can&apos;t
              sleep either.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {ROOMS.slice(0, 7).map((r) => (
                <span key={r.id} className="text-xs glass rounded-full px-2.5 py-1 text-white/60">
                  {r.emoji} {r.name}
                </span>
              ))}
            </div>
            <Link href="/rooms" className="mt-6 inline-flex items-center gap-1.5 text-str-glow font-semibold text-sm">
              See who&apos;s in <ArrowRight size={15} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------ feature strip ------------------------------ */}
      <section className="relative mx-auto max-w-6xl px-4 sm:px-6 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Zap, title: "Graceful Next", body: "Your next match is queued before this one closes. Transitions under 2 seconds, never a dead screen." },
            { icon: Dice5, title: "Games on tap", body: "Truth or Dare, Would You Rather, 20 Questions — one command when words run out." },
            { icon: ImagePlus, title: "Consent-first media", body: "First photos arrive hidden. Nobody sees anything they didn't say yes to." },
            { icon: Sparkles, title: "Connection cards", body: "Great talk? Mutually exchange cards at the end and keep the thread alive." }
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-5"
            >
              <f.icon size={20} className="text-gold" />
              <h4 className="mt-3 font-display font-semibold">{f.title}</h4>
              <p className="mt-1.5 text-sm text-white/50 leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ------------------------------ invisible algorithm ------------------------------ */}
      <section className="relative border-y border-white/5 bg-white/[0.015]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-mint">
              <ShieldCheck size={14} /> the invisible algorithm
            </div>
            <h2 className="mt-3 font-display font-bold text-3xl sm:text-4xl tracking-tight leading-tight">
              Good conversations rise.
              <br />
              Bad actors quietly <span className="gradient-text">disappear</span>.
            </h2>
            <p className="mt-4 text-white/55 leading-relaxed max-w-md">
              There are no filters to set, no karma to grind, no badges to show off. A silent
              reputation engine watches behaviour — not identity — and routes you toward people
              who talk the way you do.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {[
                { icon: EyeOff, t: "Invisible scoring", d: "Long, kind conversations lift your match pool. Spam sinks it. You never see a number." },
                { icon: Flag, t: "One-tap report", d: "Report and disconnect in a single action — under 200ms, no forms, no menus." },
                { icon: Ghost, t: "Ephemeral by design", d: "Messages are never stored. When the chat ends, it's gone everywhere, forever." }
              ].map((x) => (
                <div key={x.t} className="flex gap-3.5 items-start">
                  <div className="glass rounded-xl p-2.5 shrink-0">
                    <x.icon size={17} className="text-white/70" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{x.t}</h4>
                    <p className="text-sm text-white/45 leading-relaxed">{x.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* rep visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-strong rounded-3xl p-6 font-mono text-sm"
          >
            <div className="text-white/40 text-xs mb-4">// what the engine sees (you never will)</div>
            {[
              ["session length 17m 42s", "+5", "text-mint"],
              ["partner sent connection card", "+3", "text-mint"],
              ["emoji reaction sent", "+1", "text-mint"],
              ["nudge question used", "+1", "text-mint"],
              ["link blocked (spam attempt)", "-15", "text-str"],
              ["nexted in 6 seconds", "-2", "text-str"]
            ].map(([k, v, c], i) => (
              <motion.div
                key={k as string}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.1 }}
                className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0"
              >
                <span className="text-white/60">{k}</span>
                <span className={`${c} font-semibold`}>{v}</span>
              </motion.div>
            ))}
            <div className="mt-4 thread" />
            <p className="mt-3 text-[11px] text-white/35">
              scores decay 5% daily — everyone gets a path back
            </p>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------ CTA ------------------------------ */}
      <section className="relative mx-auto max-w-6xl px-4 sm:px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="font-mono text-xs text-white/40">{rand(TICKER)}</p>
          <h2 className="mt-4 font-display font-bold text-4xl sm:text-5xl tracking-tight">
            Someone&apos;s waiting <span className="gradient-text">right now</span>
          </h2>
          <Link
            href="/chat"
            className="mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 font-semibold text-ink bg-gradient-to-r from-you to-str hover:shadow-glowStr transition-shadow text-lg"
          >
            Start talking <ArrowRight size={19} />
          </Link>
          <p className="mt-4 text-xs text-white/35 font-mono">free · no sign-up · 18+ only</p>
        </motion.div>
      </section>

      {/* ------------------------------ footer ------------------------------ */}
      <footer className="border-t border-white/5">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 flex flex-col sm:flex-row gap-6 items-center justify-between">
          <div className="font-display font-bold">
            talk<span className="gradient-text">2</span>strangers
          </div>
          <p className="text-xs text-white/35 font-mono text-center">
            conversations are ephemeral · no message is ever stored · be kind, you&apos;re anonymous not invisible
          </p>
          <p className="text-xs text-white/25 font-mono">© 2026 · 18+</p>
        </div>
      </footer>
    </main>
  );
}
