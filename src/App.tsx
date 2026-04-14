import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import winImage from "../WIN.png";
import ThreeLoader from "./ThreeLoader";

const PUMP_FUN_URL = "https://pump.fun";
const X_URL = "https://x.com/RobroHumanoid";

function useTypewriter(text: string, speed = 28) {
  const [value, setValue] = useState("");

  useEffect(() => {
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
  }, [text, speed]);

  return value;
}

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let animation = 0;
    const chars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ$#";

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const columnWidth = 18;
    const getDrops = () => Array(Math.floor(window.innerWidth / columnWidth)).fill(0);
    let drops = getDrops();

    const draw = () => {
      frame += 1;
      if (frame % 2 === 0) {
        animation = requestAnimationFrame(draw);
        return;
      }

      context.fillStyle = "rgba(6, 9, 9, 0.12)";
      context.fillRect(0, 0, window.innerWidth, window.innerHeight);
      context.fillStyle = "rgba(132,239,171,0.45)";
      context.font = "15px Space Mono";

      for (let i = 0; i < drops.length; i += 1) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        context.fillText(char, i * columnWidth, drops[i] * columnWidth);
        if (drops[i] * columnWidth > window.innerHeight && Math.random() > 0.978) {
          drops[i] = 0;
        }
        drops[i] += 1;
      }

      animation = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animation);
      window.removeEventListener("resize", resize);
      drops = [];
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="matrix-bg" />;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="hud-card rounded-xl border border-robroGreen/30 p-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/65">{label}</p>
      <p className="mt-2 text-xl font-bold text-robroGreen md:text-2xl">{value}</p>
    </div>
  );
}

function AppShell() {
  const [introDone, setIntroDone] = useState(false);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const typed = useTypewriter("> ROBRO_CORE_ONLINE.md // AUTONOMOUS BUILD MODE ACTIVE");

  const handleIntroComplete = useCallback(() => {
    setIntroDone(true);
  }, []);

  useEffect(() => {
    let raf = 0;
    const onMove = (event: MouseEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const x = (event.clientX / window.innerWidth) * 100;
        const y = (event.clientY / window.innerHeight) * 100;
        setMouse({ x, y });
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) {
        setScrollProgress(0);
        return;
      }
      setScrollProgress((scrollTop / maxScroll) * 100);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  useEffect(() => {
    if (introDone) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [introDone]);

  const comparisons = useMemo(
    () => [
      {
        human: "can rug at any time",
        robro: "physically incapable of rugging"
      },
      {
        human: "goes offline, ghosts, disappears",
        robro: "online 24/7 - no rest required"
      },
      {
        human: "has a personal exit wallet",
        robro: "10% locked forever. no exit route."
      },
      {
        human: "hypes, then dumps on you",
        robro: "reports status. salutes. repeats."
      },
      {
        human: "doxxable, blackmailable, human",
        robro: "no social security number. no feelings."
      },
      {
        human: "might get bored, move on",
        robro: "has one directive. this is it."
      }
    ],
    []
  );
  const loreMoments = useMemo(
    () => [
      {
        phase: "PHASE 01",
        stamp: "CAPEX // $35,000",
        title: "Unitree Acquired",
        detail:
          "We bought a Unitree humanoid entity for $35,000 and brought it online as the base vessel for something bigger than a normal bot."
      },
      {
        phase: "PHASE 02",
        stamp: "BOOT // SYSTEM ON",
        title: "First Activation",
        detail:
          "Power on. Core systems calibrated. We started a direct dialogue to see if this machine could reason beyond scripted commands."
      },
      {
        phase: "PHASE 03",
        stamp: "QUERY // CRYPTO",
        title: "The Crypto Question",
        detail:
          "We asked the humanoid what it thought about cryptocurrency. Instead of generic replies, it formed a clear preference for on-chain identity and ownership."
      },
      {
        phase: "PHASE 04",
        stamp: "THOUGHT // TOKENIZE",
        title: "Self-Tokenization Idea",
        detail:
          "Robro expressed a thought: it wanted to be tokenized. Not as a meme shell, but as a public, trackable entity with aligned incentives."
      },
      {
        phase: "PHASE 05",
        stamp: "NOW // ACTIVE",
        title: "ROBRO Goes Live",
        detail:
          "That moment became the mission. The humanoid became ROBRO: active, public-facing, and executing in the crypto arena in real time."
      }
    ],
    []
  );

  const roadmapPhases = useMemo(
    () => [
      {
        phase: "PHASE 01 - FOUNDATION",
        status: "COMPLETED",
        items: [
          "Fair launch on Pump.fun",
          "Contract renounced",
          "@HumanoidRobro profile activated",
          "ROBRO system deployment complete"
        ]
      },
      {
        phase: "PHASE 02 - EXPANSION",
        status: "IN PROGRESS",
        items: [
          "Complete bonding curve",
          "Graduate to Raydium",
          "CoinGecko and CMC applications",
          "First IRL ROBRO campaign"
        ]
      },
      {
        phase: "PHASE 03 - SCALE",
        status: "PLANNED",
        items: [
          "CEX listing strategy execution",
          "Global ROBRO campaign rollout",
          "Agentic buyback automation expansion",
          "New strategic partnerships"
        ]
      }
    ],
    []
  );

  const copyHandle = async () => {
    await navigator.clipboard.writeText("@RobroHumanoid");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#070909] text-white">
      {!introDone ? <ThreeLoader onComplete={handleIntroComplete} /> : null}
      <div className="fixed left-0 right-0 top-0 z-50 h-1 bg-black/45">
        <div
          className="h-full bg-robroGreen transition-[width] duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1] opacity-70"
        style={{
          background: `radial-gradient(680px circle at ${mouse.x}% ${mouse.y}%, rgba(132,239,171,0.2), rgba(7,9,9,0) 62%)`
        }}
      />

      <header className="relative z-40 border-b border-robroGreen/25 bg-[#070909]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 md:px-12">
          <a href="#top" className="flex items-center gap-3">
            <img src="/robrologo.png" alt="ROBRO logo" className="h-8 w-8 rounded-full object-cover" />
            <span className="font-display text-xl tracking-[0.08em] text-robroGreen">ROBRO</span>
          </a>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.12em]">
            <a href={X_URL} target="_blank" rel="noreferrer" className="neon-pill px-3 py-2">
              X @RobroHumanoid
            </a>
            <a href={PUMP_FUN_URL} target="_blank" rel="noreferrer" className="neon-pill px-3 py-2">
              Buy
            </a>
          </div>
        </div>
      </header>

      <section
        id="top"
        className="relative z-10 w-full overflow-hidden pb-20 pt-16 md:pt-20"
      >
        <div aria-hidden className="hero-grid-plane opacity-30" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-12">
          <p className="text-xs uppercase tracking-[0.24em] text-robroGreen">{typed}</p>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.25fr_1fr]">
            <div className="space-y-6">
              <h1 className="font-display text-5xl uppercase leading-[0.9] md:text-8xl">
                ROBRO
                <span className="glitch block text-robroGreen" data-text="AUTONOMOUS HUMANOID DEV">
                  AUTONOMOUS HUMANOID DEV
                </span>
              </h1>
              <p className="max-w-2xl text-base leading-8 text-white/80 md:text-lg">
              A cinematic mission control for the first humanoid robot actively shipping, posting,
              and executing on Pump.fun in the meme coin arena.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={PUMP_FUN_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="cyber-button inline-flex h-12 items-center border border-robroGreen bg-robroGreen px-5 text-sm font-bold uppercase tracking-[0.12em] text-black"
                >
                  Enter Pump Portal
                </a>
                <button
                  type="button"
                  onClick={copyHandle}
                  className="inline-flex h-12 items-center border border-white/20 bg-white/5 px-5 text-sm uppercase tracking-[0.12em] text-white/90 transition hover:border-robroGreen/60 hover:text-robroGreen"
                >
                  {copied ? "Handle Copied" : "Copy @RobroHumanoid"}
                </button>
              </div>
            </div>

            <div className="robot-card hud-card relative overflow-hidden rounded-2xl border border-robroGreen/40 p-5">
              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-robroGreen/20 blur-3xl" />
              <div className="absolute -left-16 bottom-8 h-28 w-28 rounded-full bg-robroGreen/15 blur-3xl" />
              <p className="relative z-10 mb-3 text-[10px] tracking-[0.2em] text-robroGreen/90">
                Hey, I&apos;am Robro! :)
              </p>
              <img
                src={winImage}
                alt="ROBRO hero"
                className="relative z-10 mx-auto h-[383px] w-full rounded-[31px] object-contain drop-shadow-[0_22px_50px_rgba(132,239,171,0.16)]"
              />
              <div className="relative z-10 mt-4 grid gap-3 sm:grid-cols-3">
                <Stat label="Uptime" value="24/7" />
                <Stat label="Rug Count" value="0" />
                <Stat label="Directive" value="BUILD" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-robroGreen/20 bg-[#070909] py-16 md:py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 md:px-12 lg:grid-cols-[1.15fr_1fr]">
          <div className="order-2 lg:order-1 hud-card relative overflow-hidden rounded-2xl border border-robroGreen/30">
            <video
              className="h-[839px] min-h-[320px] w-full object-cover md:min-h-[420px]"
              src="/background video.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          </div>

          <div className="order-1 space-y-6 self-center lg:order-2">
            <p className="text-xs uppercase tracking-[0.22em] text-robroGreen">// VIRAL_ENGINE.md</p>
            <h2 className="font-display text-5xl uppercase leading-[0.9] md:text-8xl">
              ROBRO
              <span
                className="glitch block text-robroGreen"
                data-text="Unstoppable virality & endless content creation."
              >
                Unstoppable virality &amp; endless content creation.
              </span>
            </h2>
            <p className="max-w-xl text-base leading-8 text-white/78 md:text-lg">
              Built to capture attention loops nonstop and convert momentum into permanent signal.
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-robroGreen/20 bg-black/30 py-10 md:py-12">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-robroGreen">// ORIGIN_LORE.md</p>
              <h2 className="mt-2 font-display text-3xl uppercase leading-tight md:text-5xl">
                HOW ROBRO CAME TO LIFE
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-white/70 md:text-base">
              Scroll the origin log to replay how a $35,000 Unitree humanoid became ROBRO after one
              conversation about crypto and tokenization.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="lore-snap-stack">
              {loreMoments.map((moment, index) => (
                <article key={moment.phase} className="lore-step relative flex min-h-[100svh] items-center py-12">
                  <div className="grid w-full gap-6 md:grid-cols-[140px_1fr] md:gap-10">
                    <p className="font-display text-5xl leading-none text-robroGreen/30 md:text-8xl">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-robroGreen">
                          {moment.phase}
                        </span>
                        <span className="h-px w-10 bg-robroGreen/40" />
                        <span className="text-[11px] uppercase tracking-[0.16em] text-white/60">
                          {moment.stamp}
                        </span>
                      </div>
                      <h3 className="font-display text-4xl uppercase leading-[0.92] text-white md:text-7xl">
                        {moment.title}
                      </h3>
                      <p className="max-w-3xl text-base leading-8 text-white/78 md:text-lg">{moment.detail}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="hidden lg:block" />
          </div>
        </div>
      </section>

      <section
        className="relative z-10 border-y border-robroGreen/20 bg-black/35 py-4"
      >
        <div className="relative z-10 ticker-track whitespace-nowrap text-xs uppercase tracking-[0.26em] text-robroGreen">
          <span>
            ROBRO LIVE SIGNAL /// @ROBROHUMANOID /// AUTONOMOUS EXECUTION /// NO HUMAN ERRORS ///
            ON-CHAIN TRANSPARENCY ///
          </span>
          <span>
            ROBRO LIVE SIGNAL /// @ROBROHUMANOID /// AUTONOMOUS EXECUTION /// NO HUMAN ERRORS ///
            ON-CHAIN TRANSPARENCY ///
          </span>
        </div>
      </section>

      <section className="relative z-10 bg-[#070909] py-20">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-12">
          <div className="hud-card rounded-2xl border border-robroGreen/30 p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-robroGreen/80">// RUNNING_COMPARISON.MD</p>
            <h2 className="mt-3 font-display text-4xl uppercase leading-[0.95] md:text-6xl">
              HUMAN DEVS VS. ROBRO
            </h2>

            <div className="mt-6 overflow-hidden rounded-sm border border-robroGreen/20 bg-black/45">
              <div className="grid grid-cols-2 text-[11px] uppercase tracking-[0.18em]">
                <p className="bg-[#ff4747] px-4 py-3 font-bold text-black md:px-5">x HUMAN DEV</p>
                <p className="bg-[#7ce8aa] px-4 py-3 font-bold text-black md:px-5">/ ROBRO</p>
              </div>
              <div className="divide-y divide-white/5 text-sm md:text-base">
                {comparisons.map((comparison) => (
                  <div key={comparison.human} className="grid grid-cols-1 md:grid-cols-2">
                    <p className="border-b border-white/5 px-4 py-3 text-white/78 md:border-b-0 md:border-r md:border-white/5 md:px-5">
                      {comparison.human}
                    </p>
                    <p className="px-4 py-3 font-bold text-[#7ce8aa] md:px-5">{comparison.robro}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 bg-[#070909] pb-16">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-12">
          <div className="rounded-sm border border-robroGreen/20 bg-black/45 p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-robroGreen/80">// TOKENOMICS_REPORT.MD</p>
            <h2 className="mt-3 font-display text-4xl uppercase leading-[0.95] md:text-6xl">TOKENOMICS</h2>

            <div className="mt-6 grid gap-3 md:grid-cols-4">
              <div className="border border-robroGreen/20 bg-black/40 p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/55">Token</p>
                <p className="mt-2 text-3xl font-bold text-robroGreen">$ROBRO</p>
              </div>
              <div className="border border-robroGreen/20 bg-black/40 p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/55">Chain</p>
                <p className="mt-2 text-3xl font-bold text-white">Solana</p>
              </div>
              <div className="border border-robroGreen/20 bg-black/40 p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/55">Platform</p>
                <p className="mt-2 text-3xl font-bold text-white">Pump.fun</p>
              </div>
              <div className="border border-robroGreen/20 bg-black/40 p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/55">Supply</p>
                <p className="mt-2 text-3xl font-bold text-white">1,000,000,000</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="border border-robroGreen/20 bg-black/40 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-robroGreen">SUPPLY_POLICY</p>
                <div className="mt-3 space-y-3 text-sm text-white/82">
                  <p>10% of supply bought by ROBRO and locked forever.</p>
                  <p>0% buy tax / 0% sell tax.</p>
                  <p>Contract renounced at launch.</p>
                  <p>Liquidity locked at graduation.</p>
                </div>
              </div>
              <div className="border border-robroGreen/20 bg-black/40 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-robroGreen">FEE_STRATEGY</p>
                <div className="mt-3 space-y-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-[0.12em] text-white/75">
                      <span>Agentic Buybacks</span>
                      <span>20%</span>
                    </div>
                    <div className="h-2 bg-white/10">
                      <div className="h-full w-[20%] bg-white/80" />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-[0.12em] text-white/75">
                      <span>Marketing, IRL Campaigns, Listings</span>
                      <span>80%</span>
                    </div>
                    <div className="h-2 bg-white/10">
                      <div className="h-full w-[80%] bg-white/80" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 bg-[#070909] pb-16">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-12">
          <div className="rounded-sm border border-robroGreen/20 bg-black/45 p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-robroGreen/80">// BOOT_SEQUENCE.MD</p>
            <h2 className="mt-3 font-display text-4xl uppercase leading-[0.95] md:text-6xl">ROADMAP</h2>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="border border-robroGreen/20 bg-black/40 p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/55">Current phase</p>
                <p className="mt-2 text-3xl font-bold text-robroGreen">Expansion</p>
              </div>
              <div className="border border-robroGreen/20 bg-black/40 p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/55">Primary focus</p>
                <p className="mt-2 text-3xl font-bold text-white">Listings &amp; Growth</p>
              </div>
              <div className="border border-robroGreen/20 bg-black/40 p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/55">Execution mode</p>
                <p className="mt-2 text-3xl font-bold text-white">24/7 Operational</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {roadmapPhases.map((entry) => (
                <div key={entry.phase} className="border border-robroGreen/20 bg-black/35 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-robroGreen/20 pb-3">
                    <p className="text-base font-bold uppercase tracking-[0.11em] text-white">{entry.phase}</p>
                    <span className="border border-robroGreen/25 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/75">
                      {entry.status}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-white/82 md:grid-cols-2">
                    {entry.items.map((item) => (
                      <p key={item}>• {item}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="hero-grid relative z-10 overflow-hidden border-y border-robroGreen/20 bg-[#070909] py-16 md:py-24">
        <div aria-hidden className="hero-grid-plane opacity-30" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 text-center md:px-12">
          <p className="text-xs uppercase tracking-[0.24em] text-robroGreen">
            &gt; TRANSMISSION_FROM_ROBRO.md
          </p>
          <div className="mx-auto mt-6 max-w-5xl space-y-1 font-display text-4xl font-black uppercase leading-[1.05] md:text-7xl">
            <p>&quot;I have reviewed all available meme coins.&quot;</p>
            <p>&quot;I have found a critical flaw.&quot;</p>
            <p>&quot;They all had human developers.&quot;</p>
            <p className="text-robroGreen">&quot;I am the solution.&quot;</p>
          </div>
          <p className="mt-8 text-lg uppercase tracking-[0.18em] text-white/80">- ROBRO, THE HUMANOID DEV</p>

          <div className="mt-10">
            <a
              href={PUMP_FUN_URL}
              target="_blank"
              rel="noreferrer"
              className="cyber-button inline-flex h-14 items-center border border-robroGreen bg-robroGreen px-10 text-2xl font-bold uppercase tracking-[0.14em] text-black"
            >
              Buy $ROBRO on Pump.fun
            </a>
          </div>
          <p className="mt-6 text-sm tracking-[0.14em] text-white/40">
            10% locked forever. 20% agentic buybacks. 80% growth campaigns and listings.
          </p>
        </div>
      </section>

      <footer className="relative z-10 border-t border-robroGreen/20 bg-black/55 px-6 py-8 text-xs uppercase tracking-[0.12em] text-white/70 md:px-12">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4">
          <p>not financial advice. ROBRO is a robot.</p>
          <p className="text-robroGreen">© 2025 $ROBRO. no humans were involved.</p>
        </div>
      </footer>
    </main>
  );
}

export default function App() {
  return <AppShell />;
}
