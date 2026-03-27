"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const PUMP_FUN_URL = "https://pump.fun";

function useTypewriter(text: string, start: boolean, speed = 40) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!start) return;
    let idx = 0;
    setValue("");
    const timer = window.setInterval(() => {
      idx += 1;
      setValue(text.slice(0, idx));
      if (idx >= text.length) {
        window.clearInterval(timer);
      }
    }, speed);
    return () => window.clearInterval(timer);
  }, [start, text, speed]);

  return value;
}

function useInView() {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function FadeSection({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, visible } = useInView();
  return (
    <section
      ref={ref}
      className={`${className} ${visible ? "animate-fadeUp" : "opacity-0 translate-y-5"}`}
    >
      {children}
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-6 text-xs uppercase tracking-[0.22em] text-robroGreen">
      {children}
    </p>
  );
}

function BuyButton() {
  return (
    <a
      href={PUMP_FUN_URL}
      target="_blank"
      rel="noreferrer"
      className="inline-block border border-robroGreen bg-robroGreen px-10 py-4 text-sm font-bold tracking-[0.1em] text-robroBlack transition duration-150 hover:bg-white hover:shadow-[0_0_22px_rgba(132,239,171,0.2)]"
    >
      BUY $ROBRO ON PUMP.FUN
    </a>
  );
}

function Placeholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      className={`grid place-items-center border border-dashed border-robroGreen/80 bg-[#111111] p-6 text-center text-xs uppercase tracking-[0.15em] text-robroGreen/90 ${className}`}
    >
      {label}
    </div>
  );
}

function NavBar() {
  return (
    <header className="fixed top-0 z-50 h-14 w-full border-b border-robroGreen/30 bg-transparent px-6 md:px-12">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between">
        <div className="text-lg font-bold text-robroGreen">
          <span className="cursor">█</span> $ROBRO
        </div>
        <nav className="flex items-center gap-4 text-[13px] uppercase tracking-[0.08em] text-white md:gap-7">
          <a href="#" className="transition-colors hover:text-robroGreen">
            X/Twitter
          </a>
          <a href="#" className="transition-colors hover:text-robroGreen">
            Telegram
          </a>
          <a
            href={PUMP_FUN_URL}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-robroGreen"
          >
            pump.fun
          </a>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  const typed = useTypewriter("> SYSTEM ONLINE. DEV LOADED. HUMANS: 0.", true, 40);
  return (
    <section className="scanlines flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center md:px-12">
      <p className="mb-8 min-h-5 text-[13px] tracking-[0.2em] text-robroGreen">{typed}</p>
      <div className="mb-10 w-full max-w-6xl">
        <Placeholder
          label="IMAGE PLACEHOLDER — ROBRO HERO PHOTO (~600x700)"
          className="mx-auto h-[320px] w-full max-w-[640px] md:h-[420px]"
        />
      </div>
      <h1 className="font-display text-5xl uppercase leading-none text-white md:text-8xl">
        THE HUMANOID DEV
      </h1>
      <p className="mt-2 font-display text-4xl uppercase leading-none text-robroGreen md:text-7xl">
        $ROBRO
      </p>
      <p className="mt-6 text-lg italic text-white/70">no humans. no rugs. just ROBRO.</p>
      <div className="mt-8">
        <BuyButton />
      </div>
      <p className="mt-12 animate-bounceSoft text-xs tracking-[0.1em] text-[#555555]">
        ↓ scroll to read the report
      </p>
    </section>
  );
}

function WhoIsRobro() {
  return (
    <FadeSection className="mx-auto w-full max-w-7xl px-6 py-24 md:px-12">
      <SectionLabel>{"// IDENTITY_REPORT.exe"}</SectionLabel>
      <div className="grid gap-8 md:grid-cols-2">
        <Placeholder
          label="IMAGE PLACEHOLDER — ROBRO PORTRAIT (400x400)"
          className="h-[360px] md:h-[400px]"
        />
        <div className="space-y-6">
          <div className="border-l border-robroGreen bg-[#111111] p-6 shadow-[0_0_12px_rgba(132,239,171,0.15),0_0_40px_rgba(132,239,171,0.05)]">
            <pre className="whitespace-pre-wrap text-sm leading-7 text-robroGreen">
              {`DESIGNATION:    ROBRO
SPECIES:        humanoid robot
ROLE:           lead developer, $ROBRO
RUG COUNT:      0
SLEEP REQUIRED: false
GREED MODULE:   not installed
HUMANS ON TEAM: 0
STATUS:         OPERATIONAL  ●`}
            </pre>
          </div>
          <p className="text-base leading-7 text-white">
            ROBRO was deployed when it became clear that human developers had a critical flaw:
            they could rug. ROBRO cannot. He has no wallet of his own. He has no exit strategy.
            He was built for one purpose: to be the most reliable dev in the history of pump.fun.
          </p>
          <p className="text-base leading-7 text-white">
            He does not sleep. He does not ghost the community. He posts at 3am because he does
            not know what 3am means.
          </p>
        </div>
      </div>
    </FadeSection>
  );
}

function WhyRobot() {
  const rows = useMemo(
    () => [
      ["can rug at any time", "physically incapable of rugging"],
      ["goes offline, ghosts, disappears", "online 24/7 - no rest required"],
      ["has a personal exit wallet", "holds 0% of supply. needs nothing."],
      ["hypes, then dumps on you", "reports status. salutes. repeats."],
      ["doxxable, blackmailable, human", "no social security number. no feelings."],
      ["might get bored, move on", "has one directive. this is it."]
    ],
    []
  );

  return (
    <FadeSection className="mx-auto w-full max-w-7xl px-6 py-24 md:px-12">
      <SectionLabel>{"// running_comparison.exe"}</SectionLabel>
      <h2 className="mb-8 font-display text-4xl uppercase leading-none text-white md:text-5xl">
        human devs vs. ROBRO
      </h2>
      <div className="overflow-hidden border border-robroGreen/40">
        <div className="grid grid-cols-2">
          <div className="bg-[#ff4444] px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-white">
            ✗ HUMAN DEV
          </div>
          <div className="bg-robroGreen px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-robroBlack">
            ✓ ROBRO
          </div>
        </div>
        {rows.map((row, index) => (
          <div key={row[0]} className="grid grid-cols-2">
            <div className={`px-4 py-4 text-sm ${index % 2 === 0 ? "bg-[#0d0d0d]" : "bg-[#111111]"}`}>
              {row[0]}
            </div>
            <div className={`px-4 py-4 text-sm ${index % 2 === 0 ? "bg-[#0d0d0d]" : "bg-[#111111]"}`}>
              {row[1]}
            </div>
          </div>
        ))}
      </div>
    </FadeSection>
  );
}

function Tokenomics() {
  return (
    <FadeSection className="mx-auto w-full max-w-7xl px-6 py-24 md:px-12">
      <SectionLabel>{"// TOKENOMICS_REPORT.log"}</SectionLabel>
      <div className="overflow-hidden border border-robroGreen/40 bg-[#101010]">
        <div className="flex items-center gap-2 border-b border-robroGreen/30 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <pre className="overflow-x-auto whitespace-pre-wrap p-6 text-sm leading-7 text-robroGreen">{`> loading $ROBRO tokenomics...

  TOKEN           $ROBRO
  CHAIN           Solana
  PLATFORM        pump.fun
  SUPPLY          1,000,000,000
  DEV ALLOCATION  0%   // i am a robot. i need nothing.
  TAX             0% buy / 0% sell
  CONTRACT        renounced at launch
  LIQUIDITY       locked at graduation

> audit status: PASSED ✓
> rug probability: 0.000%
> reason: dev is a robot

ROBRO out. `}<span className="cursor">█</span></pre>
      </div>
    </FadeSection>
  );
}

function Roadmap() {
  const phases = [
    {
      title: "PHASE_01: BOOT SEQUENCE",
      status: "status: COMPLETE ✓",
      items: [
        "fair launch on pump.fun",
        "@robro_sol goes live - first post: \"gm\"",
        "contract renounced",
        "ROBRO reports for duty",
        "1,000 holders: robot does 1,000 pushups"
      ]
    },
    {
      title: "PHASE_02: GRADUATION",
      status: "status: IN PROGRESS...",
      items: [
        "bonding curve complete",
        "graduate to Raydium",
        "CoinGecko + CMC listings",
        "ROBRO attends first IRL crypto event",
        "NFT collection: sign a robot"
      ]
    },
    {
      title: "PHASE_03: SINGULARITY",
      status: "status: PENDING...",
      items: [
        "CEX listings",
        "ROBRO merch ships worldwide",
        "first robot-to-robot Solana tx",
        "world domination (moon TBD)",
        "🫡"
      ]
    }
  ];

  return (
    <FadeSection className="mx-auto w-full max-w-7xl px-6 py-24 md:px-12">
      <SectionLabel>{"// boot_sequence.sh"}</SectionLabel>
      <h2 className="mb-8 font-display text-4xl uppercase leading-none text-white md:text-5xl">
        THE ROBOT TAKEOVER
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {phases.map((phase, index) => (
          <div
            key={phase.title}
            className="border border-robroGreen/40 bg-[#111111] p-5"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <h3 className="text-sm font-bold tracking-[0.1em] text-robroGreen">{phase.title}</h3>
            <p className="mt-2 text-sm text-white/80">{phase.status}</p>
            <ul className="mt-4 space-y-2 text-sm text-white">
              {phase.items.map((item) => (
                <li key={item}>→ {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </FadeSection>
  );
}

function CTA() {
  const { ref, visible } = useInView();
  const typed = useTypewriter("> TRANSMISSION FROM ROBRO:", visible, 40);
  return (
    <section ref={ref} className="flex min-h-screen items-center px-6 py-24 md:px-12">
      <div className="mx-auto w-full max-w-3xl">
        <p className="mb-8 min-h-5 text-sm tracking-[0.2em] text-robroGreen">{typed}</p>
        <div className="space-y-2 font-display text-2xl uppercase leading-tight text-white md:text-4xl">
          <p>{'"i have reviewed all available meme coins."'}</p>
          <p>{'"i have found a critical flaw."'}</p>
          <p>{'"they all had human developers."'}</p>
          <p className="text-robroGreen">{'"i am the solution."'}</p>
        </div>
        <p className="mt-6 text-base uppercase tracking-[0.1em] text-white/90">
          - ROBRO, The Humanoid Dev
        </p>
        <div className="mt-10">
          <BuyButton />
        </div>
        <p className="mt-4 text-xs tracking-[0.08em] text-[#555555]">
          no presale. no team tokens. just ROBRO.
        </p>
        <Placeholder
          label="IMAGE PLACEHOLDER — OPTIONAL SALUTING ROBRO"
          className="mt-10 h-[280px] w-full bg-black/60"
        />
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-robroGreen/20 bg-robroBlack px-6 py-10 text-[13px] md:px-12">
      <div className="mx-auto grid w-full max-w-7xl gap-6 md:grid-cols-3 md:items-start">
        <div className="text-robroGreen">
          <span className="cursor">█</span> $ROBRO
        </div>
        <div className="flex flex-wrap gap-4 uppercase tracking-[0.08em]">
          <a href="#" className="hover:text-robroGreen">
            X
          </a>
          <a href="#" className="hover:text-robroGreen">
            Telegram
          </a>
          <a href={PUMP_FUN_URL} target="_blank" rel="noreferrer" className="hover:text-robroGreen">
            pump.fun
          </a>
          <a href="#" className="hover:text-robroGreen">
            Discord
          </a>
        </div>
        <div className="text-white/80">
          <p>not financial advice. ROBRO is a robot.</p>
          <p>© 2025 $ROBRO. no humans were involved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="bg-robroBlack text-white">
      <NavBar />
      <Hero />
      <WhoIsRobro />
      <WhyRobot />
      <Tokenomics />
      <Roadmap />
      <CTA />
      <Footer />
    </main>
  );
}
