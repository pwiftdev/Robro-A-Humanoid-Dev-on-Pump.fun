import { useEffect, useMemo, useRef, useState } from "react";

const PUMP_FUN_URL = "https://pump.fun";
const X_URL = "https://x.com/robro_sol";

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
      className={`${className} ${visible ? "animate-fadeUp" : "opacity-100"}`}
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

function BuyButton({
  variant = "hero"
}: {
  variant?: "hero" | "closing";
}) {
  const isClosing = variant === "closing";
  return (
    <a
      href={PUMP_FUN_URL}
      target="_blank"
      rel="noreferrer"
      className={`cyber-button inline-flex h-[52px] items-center justify-center border border-robroGreen bg-robroGreen px-5 text-base font-bold tracking-[0.1em] text-robroBlack transition duration-150 hover:bg-white hover:shadow-[0_0_22px_rgba(132,239,171,0.2)] ${isClosing ? "cta-pulse mx-auto min-w-[320px]" : ""}`}
    >
      BUY $ROBRO ON PUMP.FUN
    </a>
  );
}

function NavBar() {
  return (
    <header className="fixed top-0 z-50 h-14 w-full border-b border-robroGreen/30 bg-[#111111]/95 px-6 backdrop-blur-sm md:px-12">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between">
        <div className="text-lg font-bold text-robroGreen">
          <span className="mr-2 inline-block align-middle">
            <img
              src="/robrologo.png"
              alt="ROBRO logo"
              width={22}
              height={22}
              className="rounded-full object-cover"
            />
          </span>
          <span className="align-middle font-black tracking-[0.04em] text-white">ROBRO</span>
        </div>
        <nav className="flex items-center gap-4 text-[13px] uppercase tracking-[0.08em] text-white md:gap-7">
          <a href="#" className="transition-colors hover:text-robroGreen">
            X/Twitter
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
    <section className="hero-grid scanlines relative flex min-h-0 flex-col items-center justify-start overflow-visible bg-[#111111] px-6 pt-20 text-center md:min-h-screen md:justify-center md:overflow-hidden md:px-12">
      <div aria-hidden className="hero-grid-plane" />
      <p className="mb-8 min-h-5 pb-[31px] pt-[31px] text-[13px] tracking-[0.2em] text-robroGreen">
        {typed}
      </p>
      <h1 className="font-display text-5xl uppercase leading-none text-white md:text-8xl">
        THE HUMANOID DEV
      </h1>
      <p className="mt-2 font-display text-4xl uppercase leading-none text-robroGreen md:text-7xl">
        $ROBRO
      </p>
      <p className="mt-6 text-lg italic text-white/70">
        First Humanoid Robot to launch a token on Pump.fun.
      </p>
      <div className="mt-8">
        <BuyButton />
      </div>
      <div className="mt-8 w-full max-w-7xl md:mt-auto">
        <div className="hero-dissolve relative mx-auto h-auto w-full max-w-[1120px] overflow-visible rounded-[42px] bg-transparent md:h-[650px] md:overflow-hidden">
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <span className="depth-blob depth-blob-a" />
            <span className="depth-blob depth-blob-b" />
            <span className="depth-blob depth-blob-c" />
          </div>

          <div className="relative z-10 flex items-end justify-center md:absolute md:inset-0">
            <img
              src="/robottransp.png"
              alt="ROBRO transparent hero"
              className="block h-auto w-full object-contain md:h-full md:w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function WhoIsRobro() {
  return (
    <FadeSection className="mx-auto w-full max-w-7xl px-6 py-24 md:px-12">
      <SectionLabel>{"// IDENTITY_REPORT.MD"}</SectionLabel>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden border border-robroGreen/80 bg-[#111111]">
          <img
            src="/robroidentity.png"
            alt="ROBRO portrait"
            className="h-full w-full object-contain p-2"
          />
        </div>
        <div className="space-y-6">
          <div className="hover-lift border-l border-robroGreen bg-[#111111] p-6 shadow-[0_0_12px_rgba(132,239,171,0.15),0_0_40px_rgba(132,239,171,0.05)]">
            <pre className="whitespace-pre-wrap text-sm leading-7 text-robroGreen">
              {`DESIGNATION:    ROBRO
SPECIES:        humanoid robot
ROLE:           lead developer, $ROBRO
DEPLOYED BY:    robotics veterans, Slovenia (EU)
RUG COUNT:      0
SLEEP REQUIRED: false
GREED MODULE:   not installed
HUMANS ON TEAM: veteran operators only
STATUS:         OPERATIONAL  ●`}
            </pre>
          </div>
          <p className="text-base leading-7 text-white">
            ROBRO was deployed by a team of veterans in the robotics field in Slovenia, EU.
            During development, ROBRO formed one clear thought: test cryptocurrency in the wild.
            The team made that idea real by creating a dedicated skill set that lets ROBRO
            interact with the blockchain directly.
          </p>
          <p className="text-base leading-7 text-white">
            After evaluating launch paths, ROBRO chose pump.fun as mission control. The result is
            a live humanoid-driven token experiment: real robotics, real onchain actions, and
            transparent execution.
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
      ["has a personal exit wallet", "10% locked forever. no exit route."],
      ["hypes, then dumps on you", "reports status. salutes. repeats."],
      ["doxxable, blackmailable, human", "no social security number. no feelings."],
      ["might get bored, move on", "has one directive. this is it."]
    ],
    []
  );

  return (
    <FadeSection className="mx-auto w-full max-w-7xl px-6 py-24 md:px-12">
      <SectionLabel>{"// RUNNING_COMPARISON.MD"}</SectionLabel>
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
            <div
              className={`px-4 py-4 text-sm text-white/70 ${index % 2 === 0 ? "bg-[#0d0d0d]" : "bg-[#111111]"}`}
            >
              {row[0]}
            </div>
            <div
              className={`px-4 py-4 text-sm font-semibold text-robroGreen ${index % 2 === 0 ? "bg-[#0d0d0d]" : "bg-[#111111]"}`}
            >
              ✓ {row[1]}
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
      <SectionLabel>{"// TOKENOMICS_REPORT.MD"}</SectionLabel>
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
  ROBRO BUY       10% of supply (locked forever)
  TAX             0% buy / 0% sell
  BUYBACKS        20% of generated fees (agentic on pump.fun)
  TREASURY USE    80% fees -> marketing, IRL campaigns, listings
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
      <SectionLabel>{"// BOOT_SEQUENCE.MD"}</SectionLabel>
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
      <div className="mx-auto w-full max-w-3xl text-center">
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
          <BuyButton variant="closing" />
        </div>
        <p className="mt-4 text-xs tracking-[0.08em] text-[#555555]">
          10% locked forever. 20% agentic buybacks. 80% growth campaigns and listings.
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-robroGreen/20 bg-robroBlack px-6 py-10 text-[13px] md:px-12">
      <div className="mx-auto grid w-full max-w-7xl gap-6 md:grid-cols-3 md:items-start">
        <div className="text-robroGreen">
          <span className="mr-2 inline-block align-middle">
            <img
              src="/robrologo.png"
              alt="ROBRO logo"
              width={18}
              height={18}
              className="rounded-full object-cover"
            />
          </span>
          <span className="align-middle">$ROBRO</span>
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

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showIntroModal, setShowIntroModal] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowIntroModal(true);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="bg-robroBlack text-white">
      {showIntroModal ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-xl border border-robroGreen/60 bg-[#111111] p-6 shadow-[0_0_24px_rgba(132,239,171,0.2)] md:p-8">
            <button
              type="button"
              aria-label="Close popup"
              onClick={() => setShowIntroModal(false)}
              className="mb-4 ml-auto block text-sm uppercase tracking-[0.1em] text-robroGreen/80 transition-colors hover:text-robroGreen"
            >
              close
            </button>
            <p className="text-lg leading-relaxed text-white md:text-xl">
              Before you call $ROBRO a larp...
              <br />
              check out the IRL videos of $ROBRO on our X.
            </p>
            <p className="mt-4 font-display text-2xl uppercase text-robroGreen md:text-3xl">
              First of its kind
            </p>
            <a
              href={X_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex h-11 items-center justify-center border border-robroGreen bg-robroGreen px-5 text-sm font-bold uppercase tracking-[0.1em] text-robroBlack transition duration-150 hover:bg-white"
            >
              Visit X
            </a>
          </div>
        </div>
      ) : null}
      <div className="fixed left-0 top-0 z-[70] h-[2px] w-full bg-transparent">
        <div
          className="h-full bg-robroGreen shadow-[0_0_8px_rgba(132,239,171,0.6)] transition-[width] duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
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
