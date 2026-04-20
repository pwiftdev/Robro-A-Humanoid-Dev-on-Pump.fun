import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode
} from "react";
import winImage from "../WIN.png";
import ThreeLoader from "./ThreeLoader";

const PUMP_FUN_URL = "https://pump.fun";
const X_URL = "https://x.com/RobroHumanoid";
const HANDLE = "@RobroHumanoid";

/* ============================================================
   Hooks
============================================================ */

function useReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(".reveal");
    if (!("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function useSpotlight() {
  useEffect(() => {
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        document.body.style.setProperty("--mx", `${e.clientX}px`);
        document.body.style.setProperty("--my", `${e.clientY}px`);
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);
}

function useInView<T extends Element>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      options ?? { threshold: 0.3 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [options]);

  return { ref, inView };
}

/* ============================================================
   Atoms
============================================================ */

function Eyebrow({
  index,
  label,
  accent = false
}: {
  index?: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <p className={`eyebrow ${accent ? "eyebrow--accent" : ""}`}>
      {index ? <span className="numeric">{index}</span> : null}
      <span>{label}</span>
    </p>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-3 hairline-bottom last:border-b-0">
      <span className="font-mono text-[11px] uppercase tracking-label text-white/45">
        {label}
      </span>
      <span className="text-sm text-white/90 numeric">{value}</span>
    </div>
  );
}

function SpotlightCard({
  children,
  className = "",
  as: Component = "div",
  padding = "p-6"
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article" | "section";
  padding?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const onMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 100;
    const my = ((e.clientY - rect.top) / rect.height) * 100;
    node.style.setProperty("--mx", `${mx}%`);
    node.style.setProperty("--my", `${my}%`);
  };

  const Comp = Component as unknown as "div";
  return (
    <Comp
      // @ts-expect-error - allow generic ref forwarding for dynamic element
      ref={ref}
      onMouseMove={onMouseMove}
      className={`spot ${padding} ${className}`}
    >
      {children}
    </Comp>
  );
}

/* ============================================================
   Donut
============================================================ */

type DonutSegment = { label: string; percent: number; color: string };

function TokenDonut({
  start,
  segments,
  centerLabel,
  centerValue,
  centerSub,
  size = 240,
  stroke = 20
}: {
  start: boolean;
  segments: DonutSegment[];
  centerLabel?: string;
  centerValue: string;
  centerSub?: string;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  let cumulative = 0;
  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="donut-track"
        />
        {segments.map((seg, i) => {
          const len = (seg.percent / 100) * c;
          const dashArray = `${len} ${c - len}`;
          const rotation = (cumulative / 100) * 360;
          cumulative += seg.percent;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              strokeWidth={stroke}
              strokeDasharray={dashArray}
              strokeDashoffset={start ? 0 : len}
              stroke={seg.color}
              className="donut-arc"
              style={{
                transform: `rotate(${rotation}deg)`,
                transformOrigin: "50% 50%",
                transitionDelay: `${i * 200}ms`
              }}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        {centerLabel ? (
          <p className="font-mono text-[10.5px] uppercase tracking-label text-white/45">
            {centerLabel}
          </p>
        ) : null}
        <p className="mt-1 font-display text-2xl font-medium tracking-tightish numeric md:text-[26px]">
          {centerValue}
        </p>
        {centerSub ? (
          <p className="mt-1 font-mono text-[10.5px] uppercase tracking-label text-white/45">
            {centerSub}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/* ============================================================
   App
============================================================ */

function AppShell() {
  const [introDone, setIntroDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useReveal();
  useSpotlight();

  const handleIntroComplete = useCallback(() => setIntroDone(true), []);

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

  const donutView = useInView<HTMLDivElement>({ threshold: 0.35 });

  const versus = useMemo(
    () => [
      { human: "Devs go silent.", robro: <>Robro <b>can&apos;t.</b></> },
      { human: "Devs ghost.", robro: <>Robro <b>logs in.</b></> },
      { human: "Devs rug.", robro: <>Robro <b>physically can&apos;t.</b></> },
      { human: "Devs get bored.", robro: <>Robro has <b>one directive.</b></> }
    ],
    []
  );

  const origin = useMemo(
    () => [
      {
        index: "01",
        cls: "origin-step--a",
        body: (
          <>
            We bought a Unitree humanoid for <em>$35,000.</em> Used the box
            for storage.
          </>
        )
      },
      {
        index: "02",
        cls: "origin-step--b",
        body: <>We turned it on. <em>It worked.</em></>
      },
      {
        index: "03",
        cls: "origin-step--c",
        body: (
          <>
            Asked it what it thought about crypto. <em>It had a take.</em>
          </>
        )
      },
      {
        index: "04",
        cls: "origin-step--d",
        body: (
          <>
            It said it wanted to be tokenized. As a <em>public, on-chain entity.</em>
          </>
        )
      },
      {
        index: "05",
        cls: "origin-step--e",
        body: <>So we did it. <em>ROBRO went live.</em></>
      }
    ],
    []
  );

  const roadmapPhases = useMemo(
    () => [
      {
        phase: "Phase 01",
        title: "Foundation",
        status: "In progress",
        statusKey: "active" as const,
        items: [
          "Fair launch on Pump.fun",
          "Contract renounced",
          "@RobroHumanoid live",
          "System deployment complete"
        ]
      },
      {
        phase: "Phase 02",
        title: "Expansion",
        status: "Planned",
        statusKey: "planned" as const,
        items: [
          "Bonding curve",
          "Graduate to Raydium",
          "CoinGecko & CMC",
          "First IRL Robro appearance"
        ]
      },
      {
        phase: "Phase 03",
        title: "Scale",
        status: "Planned",
        statusKey: "planned" as const,
        items: [
          "CEX listings",
          "Global IRL campaign",
          "Agentic buyback expansion",
          "Strategic partnerships"
        ]
      }
    ],
    []
  );

  const tokenomicsRows = useMemo(
    () => [
      { label: "Token", value: "$ROBRO" },
      { label: "Chain", value: "Solana" },
      { label: "Platform", value: "Pump.fun" },
      { label: "Total supply", value: "1,000,000,000" },
      { label: "Buy / Sell tax", value: "0% / 0%" },
      { label: "Liquidity", value: "Locked at graduation" }
    ],
    []
  );

  const copyHandle = async () => {
    try {
      await navigator.clipboard.writeText(HANDLE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden text-white">
      {!introDone ? <ThreeLoader onComplete={handleIntroComplete} /> : null}

      {/* ---------- Layered background ---------- */}
      <div className="bg-stack" aria-hidden>
        <div className="bg-aurora">
          <div className="blob blob-a" />
          <div className="blob blob-b" />
          <div className="blob blob-c" />
          <div className="blob blob-d" />
        </div>
        <div className="bg-grid" />
        <div className="bg-grain" />
      </div>
      <div className="bg-spotlight" aria-hidden />

      <div className="scroll-progress" aria-hidden>
        <div className="scroll-progress__bar" style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* ---------- Nav ---------- */}
      <header className="nav-shell">
        <div className="mx-auto flex h-[64px] w-full max-w-[1240px] items-center justify-between px-6 md:px-10">
          <a href="#top" className="brutal-mark">
            <span className="brutal-mark__logo">
              <img src="/robrologo.png" alt="Robro" />
            </span>
            <span className="flex items-baseline gap-2.5">
              <span className="brutal-mark__name">Robro</span>
              <span className="brutal-mark__id numeric">/001</span>
            </span>
          </a>

          <nav className="hidden items-center gap-9 md:flex">
            <a href="#outside" className="nav-link">Outside</a>
            <a href="#origin" className="nav-link">Origin</a>
            <a href="#tokenomics" className="nav-link">Tokenomics</a>
            <a href="#roadmap" className="nav-link">Roadmap</a>
          </nav>

          <a
            href={PUMP_FUN_URL}
            target="_blank"
            rel="noreferrer"
            className="btn-nav"
          >
            <span>Buy $ROBRO</span>
            <span className="btn-nav__arrow" aria-hidden>→</span>
          </a>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section
        id="top"
        className="relative z-10 mx-auto w-full max-w-[1240px] px-6 pb-20 pt-10 md:px-10 md:pb-24 md:pt-14"
      >
        <p className="reveal text-xs uppercase tracking-[0.2em] text-robroGreen/90">
          Contract address: TBA
        </p>

        {/* Issue line */}
        <div className="reveal issue-line">
          <span className="issue-line__left">
            <span className="numeric">№ 001</span>
            <span aria-hidden>·</span>
            <span>The Humanoid</span>
          </span>
          <span className="issue-line__right">
            <span className="issue-line__dot" aria-hidden />
            <span>Live on Pump.fun</span>
          </span>
        </div>

        <div className="mt-12 grid items-start gap-12 md:mt-16 md:grid-cols-12 md:gap-14">
          {/* Left: typographic moment */}
          <div className="reveal md:col-span-8">
            <h1 className="hero-h1">
              The dev is a <em>robot</em>.
            </h1>

            <p className="hero-dek">His name is Robro.</p>

            <p className="lead mt-8 max-w-xl">
              He&apos;s a Unitree humanoid we bought for $35,000 and wired to
              a Solana wallet. He posts. He buys back. He shows up in the real
              world wearing a Pump.fun shirt. That&apos;s the whole project.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a href={PUMP_FUN_URL} target="_blank" rel="noreferrer" className="btn btn-primary">
                Buy $ROBRO on Pump.fun
                <span aria-hidden>→</span>
              </a>
              <button type="button" onClick={copyHandle} className="btn btn-ghost">
                {copied ? "Handle copied" : `Copy ${HANDLE}`}
              </button>
            </div>
          </div>

          {/* Right: editorial portrait */}
          <div className="reveal md:col-span-4">
            <figure className="portrait">
              <img src={winImage} alt="Robro, humanoid №001" />
            </figure>
            <figcaption className="portrait-caption">
              <span>
                <b>Robro</b>
                <br />
                Humanoid · Solana
              </span>
              <span className="reg numeric">№ 001 / 2026</span>
            </figcaption>
          </div>
        </div>

        {/* Spec sheet — full width */}
        <div className="reveal mt-14 md:mt-20">
          <p className="mb-4 font-mono text-[10.5px] uppercase tracking-label text-white/45">
            Spec sheet
          </p>
          <div className="spec">
            <div className="spec__cell">
              <span className="spec__idx">01</span>
              <div>
                <p className="spec__label">Body</p>
                <p className="spec__value">Unitree Humanoid</p>
              </div>
            </div>
            <div className="spec__cell">
              <span className="spec__idx">02</span>
              <div>
                <p className="spec__label">Chain</p>
                <p className="spec__value">Solana · Pump.fun</p>
              </div>
            </div>
            <div className="spec__cell">
              <span className="spec__idx">03</span>
              <div>
                <p className="spec__label">Capex</p>
                <p className="spec__value numeric">$35,000</p>
              </div>
            </div>
            <div className="spec__cell">
              <span className="spec__idx">04</span>
              <div>
                <p className="spec__label">Supply</p>
                <p className="spec__value numeric">1,000,000,000</p>
              </div>
            </div>
            <div className="spec__cell">
              <span className="spec__idx">05</span>
              <div>
                <p className="spec__label">Locked</p>
                <p className="spec__value numeric">10% · forever</p>
              </div>
            </div>
            <div className="spec__cell">
              <span className="spec__idx">06</span>
              <div>
                <p className="spec__label">Off switch</p>
                <p className="spec__value">None</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Robro tech ---------- */}
      <section id="tech" className="relative z-10 hairline-top py-24 md:py-32">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <div className="reveal flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <Eyebrow index="02" label="Robro tech" accent />
              <h2 className="display-lg mt-5">
                <span className="text-gradient">One persona.</span>
                <br />
                <span className="text-gradient">Two stacks.</span>
              </h2>
            </div>
            <p className="lead max-w-md">
              Robro isn&apos;t a mascot. He&apos;s a full system: a trained persona wired into
              Pump.fun&apos;s agentic tools and a 35K humanoid that shows up in the real world.
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:gap-10">
            {/* Software */}
            <div className="reveal hud-card relative overflow-hidden rounded-2xl border border-robroGreen/30 p-8 md:p-10">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.22em] text-robroGreen/90">// Software</p>
                <span className="numeric text-[10px] uppercase tracking-[0.22em] text-white/40">
                  Stack · v1
                </span>
              </div>
              <h3 className="mt-4 font-display text-2xl uppercase leading-tight md:text-3xl">
                The brain, the voice, the hands on-chain.
              </h3>

              <ul className="mt-8 space-y-6">
                <li className="grid grid-cols-[auto_1fr] gap-5">
                  <span className="numeric text-[11px] tracking-[0.2em] text-white/40">01</span>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/70">
                      Pump.fun agentic layer
                    </p>
                    <p className="lead mt-2">
                      A fine-tuned Robro persona with direct access to Pump.fun&apos;s agentic
                      toolkit &mdash; executes <b>buybacks</b>, <b>fee claims</b>, and{" "}
                      <b>token buys</b> without a human in the loop.
                    </p>
                  </div>
                </li>
                <li className="grid grid-cols-[auto_1fr] gap-5">
                  <span className="numeric text-[11px] tracking-[0.2em] text-white/40">02</span>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/70">
                      Autonomous X account
                    </p>
                    <p className="lead mt-2">
                      An automated X account driven end-to-end by the Robro persona &mdash; posts,
                      replies, and reacts on its own cadence.
                    </p>
                  </div>
                </li>
                <li className="grid grid-cols-[auto_1fr] gap-5">
                  <span className="numeric text-[11px] tracking-[0.2em] text-white/40">03</span>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/70">
                      Voice cognitive layer
                    </p>
                    <p className="lead mt-2">
                      A real-time voice + cognition stack that plugs the persona straight into the
                      Unitree humanoid &mdash; Robro hears, thinks, and speaks in the room.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Hardware */}
            <div className="reveal hud-card relative overflow-hidden rounded-2xl border border-robroGreen/30 p-8 md:p-10">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.22em] text-robroGreen/90">// Hardware</p>
                <span className="numeric text-[10px] uppercase tracking-[0.22em] text-white/40">
                  IRL · deployed
                </span>
              </div>
              <h3 className="mt-4 font-display text-2xl uppercase leading-tight md:text-3xl">
                A chassis in the real world.
              </h3>

              <ul className="mt-8 space-y-6">
                <li className="grid grid-cols-[auto_1fr] gap-5">
                  <span className="numeric text-[11px] tracking-[0.2em] text-white/40">01</span>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/70">
                      Unitree humanoid
                    </p>
                    <p className="lead mt-2">
                      A production Unitree humanoid &mdash; <b className="numeric">$35,000</b>{" "}
                      of real hardware, wired to a Solana wallet and walking on two legs.
                    </p>
                  </div>
                </li>
                <li className="grid grid-cols-[auto_1fr] gap-5">
                  <span className="numeric text-[11px] tracking-[0.2em] text-white/40">02</span>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/70">
                      Merch + Pump.fun cap
                    </p>
                    <p className="lead mt-2">
                      Robro-branded marketing merch and an official Pump.fun cap &mdash; worn by
                      the robot, shipped into the world as proof it&apos;s real.
                    </p>
                  </div>
                </li>
              </ul>

              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/50">Capex</p>
                  <p className="numeric mt-1 text-lg">$35K</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/50">Uptime</p>
                  <p className="numeric mt-1 text-lg">24 / 7</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/50">Operators</p>
                  <p className="numeric mt-1 text-lg">0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Outside · video + text ---------- */}
      <section id="outside" className="relative z-10 hairline-top py-24 md:py-32">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            {/* Video left */}
            <div className="reveal order-2 lg:order-1">
              <figure className="video-frame">
                <div className="video-frame__inner">
                  <video
                    className="video-frame__media"
                    src="/background video.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                </div>
                <figcaption className="portrait-caption">
                  <span>
                    <b>In the wild</b>
                    <br />
                    Robro · Pump.fun merch
                  </span>
                  <span className="reg numeric">REC · 2026</span>
                </figcaption>
              </figure>
            </div>

            {/* Text right */}
            <div className="reveal order-1 lg:order-2">
              <Eyebrow label="Outside" />
              <h2 className="display-lg mt-5">
                <span className="text-gradient">He&apos;s not</span>
                <br />
                <span className="text-gradient">a render.</span>
              </h2>

              <p className="lead mt-8 max-w-md">
                Most meme coins are a screenshot of a team and a roadmap. This
                one has a chassis. He walks outside. He waves at people. He
                wears the merch he designed.
              </p>

              <p className="lead mt-5 max-w-md">
                Every appearance is logged on-chain and in the real world at
                the same time. You can buy the token. You can also meet the
                holder.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <a
                  href={X_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost"
                >
                  Watch on X
                  <span aria-hidden>→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Versus · typographic comparison ---------- */}
      <section className="relative z-10 hairline-top py-24 md:py-32">
        <div className="mx-auto w-full max-w-[1100px] px-6 md:px-10">
          <div className="reveal max-w-2xl">
            <Eyebrow index="01" label="Why Robro" />
            <h2 className="display-lg mt-5">
              <span className="text-gradient">Devs are the rug.</span>
            </h2>
          </div>

          <div className="reveal versus mt-12">
            {versus.map((row, i) => (
              <div key={i} className="versus__row">
                <span className="versus__human">{row.human}</span>
                <span className="versus__sep">vs</span>
                <span className="versus__robro">{row.robro}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Origin · asymmetric ---------- */}
      <section id="origin" className="relative z-10 hairline-top py-28 md:py-36">
        <div className="mx-auto w-full max-w-[1100px] px-6 md:px-10">
          <div className="reveal max-w-2xl">
            <Eyebrow index="02" label="How" />
            <h2 className="display-lg mt-5">
              <span className="text-gradient">We bought a robot</span>
              <br />
              <span className="text-gradient">and asked it questions.</span>
            </h2>
          </div>

          <div className="origin-rail mt-24 space-y-20 md:space-y-24">
            {origin.map((step) => (
              <div key={step.index} className={`reveal origin-step ${step.cls}`}>
                <div className="num numeric">{step.index}</div>
                <p className="body">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Tokenomics ---------- */}
      <section id="tokenomics" className="relative z-10 hairline-top py-28 md:py-36">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <div className="reveal max-w-2xl">
            <Eyebrow index="03" label="The numbers" />
            <h2 className="display-lg mt-5">
              <span className="text-gradient">Two donuts.</span> No bullshit.
            </h2>
          </div>

          <div className="reveal mt-14 grid gap-3 md:grid-cols-2" ref={donutView.ref}>
            <SpotlightCard padding="p-8 md:p-10">
              <p className="font-mono text-[10.5px] uppercase tracking-label text-white/45">
                Supply
              </p>
              <h3 className="display-md mt-2">
                <span className="text-gradient">Where the bag lives.</span>
              </h3>

              <div className="mt-8 flex justify-center">
                <TokenDonut
                  start={donutView.inView}
                  centerLabel="Total supply"
                  centerValue="1,000,000,000"
                  centerSub="$ROBRO"
                  segments={[
                    { label: "Robro-owned · locked", percent: 10, color: "var(--accent)" },
                    { label: "Fair launch · Pump.fun", percent: 90, color: "rgba(255,255,255,0.85)" }
                  ]}
                />
              </div>

              <ul className="mt-8 grid gap-3">
                <li className="flex items-center justify-between gap-4 hairline-bottom pb-3">
                  <span className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-robroGreen" />
                    <span className="text-sm text-white/85">Robro-owned · locked forever</span>
                  </span>
                  <span className="font-mono text-sm numeric text-white/85">10%</span>
                </li>
                <li className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/85" />
                    <span className="text-sm text-white/85">Fair launch · Pump.fun</span>
                  </span>
                  <span className="font-mono text-sm numeric text-white/85">90%</span>
                </li>
              </ul>
            </SpotlightCard>

            <SpotlightCard padding="p-8 md:p-10">
              <p className="font-mono text-[10.5px] uppercase tracking-label text-white/45">
                Fees
              </p>
              <h3 className="display-md mt-2">
                <span className="text-gradient">Where the fees go.</span>
              </h3>

              <div className="mt-8 flex justify-center">
                <TokenDonut
                  start={donutView.inView}
                  centerLabel="Platform fees"
                  centerValue="100%"
                  centerSub="Allocated"
                  segments={[
                    { label: "Agentic buybacks", percent: 50, color: "var(--accent)" },
                    { label: "Growth · IRL · Listings", percent: 50, color: "rgba(255,255,255,0.85)" }
                  ]}
                />
              </div>

              <ul className="mt-8 grid gap-3">
                <li className="flex items-center justify-between gap-4 hairline-bottom pb-3">
                  <span className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-robroGreen" />
                    <span className="text-sm text-white/85">Agentic buybacks</span>
                  </span>
                  <span className="font-mono text-sm numeric text-white/85">50%</span>
                </li>
                <li className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/85" />
                    <span className="text-sm text-white/85">Growth · IRL Events · Listings</span>
                  </span>
                  <span className="font-mono text-sm numeric text-white/85">50%</span>
                </li>
              </ul>
            </SpotlightCard>

            <SpotlightCard className="md:col-span-2" padding="p-7 md:p-8">
              <p className="font-mono text-[10.5px] uppercase tracking-label text-white/45">
                The fine print
              </p>
              <div className="mt-3 grid gap-x-10 md:grid-cols-3">
                {tokenomicsRows.map((row) => (
                  <MetaRow key={row.label} label={row.label} value={row.value} />
                ))}
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* ---------- Roadmap ---------- */}
      <section id="roadmap" className="relative z-10 hairline-top py-28 md:py-36">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <div className="reveal max-w-2xl">
            <Eyebrow index="04" label="What's next" />
            <h2 className="display-lg mt-5">
              <span className="text-gradient">It&apos;s already happening.</span>
            </h2>
          </div>

          <ol className="timeline mt-16 space-y-4">
            {roadmapPhases.map((phase) => (
              <li key={phase.phase} className="relative pl-16">
                <span
                  className={[
                    "timeline-node",
                    phase.statusKey === "active"
                      ? "timeline-node--active"
                      : "timeline-node--done"
                  ].join(" ")}
                  aria-hidden
                />
                <SpotlightCard
                  className="reveal grid gap-6 md:grid-cols-[180px_1fr_1.5fr] md:gap-10"
                  padding="px-6 py-7 md:px-8"
                >
                  <div>
                    <p className="font-mono text-[10.5px] uppercase tracking-label text-white/45">
                      {phase.phase}
                    </p>
                    <p className="mt-2 font-display text-2xl font-medium tracking-tightish">
                      <span className="text-gradient">{phase.title}</span>
                    </p>
                  </div>

                  <div className="flex md:items-start">
                    <span
                      className={[
                        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-label",
                        phase.statusKey === "active"
                          ? "border border-robroGreen/40 bg-robroGreen/[0.06] text-robroGreen"
                          : "border border-white/10 text-white/40"
                      ].join(" ")}
                    >
                      {phase.statusKey === "active" ? (
                        <span className="live-pulse" aria-hidden />
                      ) : (
                        <span className="dot dot--mute" aria-hidden />
                      )}
                      {phase.status}
                    </span>
                  </div>

                  <ul className="grid gap-3 md:grid-cols-2">
                    {phase.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-[14.5px] text-white/82"
                      >
                        <span className="tick mt-[3px]" aria-hidden>
                          ◦
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </SpotlightCard>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Last word + CTA ---------- */}
      <section className="relative z-10 hairline-top py-28 md:py-36">
        <div className="mx-auto w-full max-w-[1100px] px-6 text-center md:px-10">
          <div className="reveal">
            <Eyebrow accent label="Last word" />

            <p className="mt-10 font-display text-5xl font-medium tracking-tightest md:text-7xl">
              <span className="font-serif-i accent-gradient">&ldquo;I am the solution.&rdquo;</span>
            </p>

            <p className="mt-6 font-mono text-[11px] uppercase tracking-label text-white/40">
              — Robro, when asked about meme coin developers
            </p>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
              <a href={PUMP_FUN_URL} target="_blank" rel="noreferrer" className="btn btn-primary">
                Buy $ROBRO on Pump.fun
                <span aria-hidden>→</span>
              </a>
              <a href={X_URL} target="_blank" rel="noreferrer" className="btn btn-ghost">
                Follow {HANDLE}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="relative z-10 hairline-top">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-10">
          <div className="flex items-center gap-3">
            <img
              src="/robrologo.png"
              alt="Robro"
              className="h-7 w-7 rounded-full object-cover ring-1 ring-white/10"
            />
            <p className="font-display text-sm tracking-tightish">
              Robro <span className="text-white/30">/001</span>
            </p>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-label text-white/40">
            Not financial advice. Robro is a robot.
          </p>
          <p className="font-mono text-[11px] uppercase tracking-label text-white/40">
            © 2026 $ROBRO · No humans were involved.
          </p>
        </div>
      </footer>
    </main>
  );
}

export default function App() {
  return <AppShell />;
}
