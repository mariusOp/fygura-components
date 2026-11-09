"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

gsap.registerPlugin(useGSAP);

export type CounterCurtainHero = {
  words: string[];
  line: string;
  columns: number;
};

type Props = {
  words?: string[];
  hero?: CounterCurtainHero;
};

const demoWords = ["Motion", "Craft", "Detail", "Rhythm", "Fygura"];

const demoHero: CounterCurtainHero = {
  words: ["Motion", "made", "calm"],
  line: "GSAP components for Next.js",
  columns: 6,
};

const config = {
  windowWidth: 0.6,
  windowMaxWidth: 460,
  windowHeight: 0.3,
  progressGap: 20,
  wordRollDuration: 0.45,
  fillDuration: 0.4,
  holdOnFill: 0.6,
  stepMin: 1,
  stepMax: 13,
  stepDurationMin: 0.12,
  stepDurationMax: 0.35,
  pauseChance: 0.3,
  pauseMin: 0.12,
  pauseMax: 0.45,
  counterOutDuration: 0.7,
  expandDuration: 1.2,
  columnDuration: 1.1,
  columnStagger: 0.09,
  wordDuration: 0.9,
  wordStagger: 0.1,
  holdBeforeExit: 0.25,
  reducedHold: 0.6,
  reducedFade: 0.5,
  progressFadeDuration: 0.3,
  expandOverlap: 0.35,
  wordsOverlap: 0.7,
  lineOverlap: 0.5,
  lineDuration: 0.7,
  lineOffset: 12,
  counterExitPercent: -120,
  wordHiddenPercent: 110,
};

const wordSizeClass = "text-[32px] leading-[0.9] font-extrabold tracking-[-0.03em] uppercase md:text-[60px]";
const reelClass = `${wordSizeClass} relative h-[1.1em] w-full overflow-hidden`;
const reelWordClass = "absolute inset-0 flex items-center justify-center whitespace-nowrap";

export default function CounterCurtain(props: Props) {
  const words = props.words ?? demoWords;
  const hero = props.hero ?? demoHero;
  const lastWord = words[words.length - 1];
  const columnIndexes = Array.from({ length: hero.columns }, (_, index) => index);
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;

      const select = gsap.utils.selector(section);
      const overlay = select("[data-overlay]")[0];
      const windowLayer = select("[data-window]")[0];
      const reelWords = select("[data-reel-word]");
      const fill = select("[data-fill]")[0];
      const progressLine = select("[data-progress]")[0];
      const backdrop = select("[data-backdrop]")[0];
      const columns = select("[data-column]");
      const slices = select("[data-slice]");
      const counter = select("[data-counter]")[0];
      const heroWords = select("[data-word]");
      const line = select("[data-line]")[0];
      const replayButton = select("[data-replay]")[0];

      const showCount = (value: number) => {
        counter.textContent = String(Math.round(value)).padStart(3, "0");
      };

      const windowSize = () => ({
        width: Math.min(config.windowMaxWidth, section.clientWidth * config.windowWidth),
        height: section.clientHeight * config.windowHeight,
      });

      const windowInset = () => {
        const size = windowSize();
        const sideInset = (section.clientWidth - size.width) / 2;
        const verticalInset = (section.clientHeight - size.height) / 2;
        return `inset(${verticalInset}px ${sideInset}px)`;
      };

      const rollToWord = (from: number, to: number) => {
        gsap.to(reelWords[from], { yPercent: -100, duration: config.wordRollDuration, ease: "power3.inOut" });
        gsap.fromTo(
          reelWords[to],
          { yPercent: 100, autoAlpha: 1 },
          { yPercent: 0, duration: config.wordRollDuration, ease: "power3.inOut" },
        );
      };

      const reset = () => {
        showCount(0);
        const size = windowSize();
        gsap.killTweensOf(reelWords);
        gsap.set(reelWords, { yPercent: 100, autoAlpha: 0 });
        gsap.set(reelWords[0], { yPercent: 0, autoAlpha: 1 });
        gsap.set(fill, { autoAlpha: 0 });
        gsap.set(progressLine, {
          width: size.width,
          xPercent: -50,
          y: size.height / 2 + config.progressGap,
          scaleX: 0,
          transformOrigin: "0% 50%",
          autoAlpha: 1,
        });
        gsap.set(overlay, { autoAlpha: 1 });
        gsap.set(backdrop, { autoAlpha: 1 });
        gsap.set(columns, { yPercent: 0 });
        gsap.set(slices, { autoAlpha: 0 });
        gsap.set(windowLayer, { autoAlpha: 1, clipPath: windowInset() });
        gsap.set(counter, { yPercent: 0 });
        gsap.set(heroWords, { yPercent: config.wordHiddenPercent });
        gsap.set(line, { autoAlpha: 0, y: config.lineOffset });
      };

      const addCountSteps = (timeline: gsap.core.Timeline) => {
        const progress = { value: 0 };
        let shownWord = 0;

        const updateProgress = () => {
          showCount(progress.value);
          gsap.set(progressLine, { scaleX: progress.value / 100 });
          const word = Math.min(words.length - 1, Math.floor((progress.value / 100) * words.length));
          if (word === shownWord) return;
          rollToWord(shownWord, word);
          shownWord = word;
        };

        let planned = 0;
        while (planned < 100) {
          const next = Math.min(100, planned + gsap.utils.random(config.stepMin, config.stepMax, 1));
          timeline.to(progress, {
            value: next,
            duration: gsap.utils.random(config.stepDurationMin, config.stepDurationMax),
            ease: "power1.out",
            onUpdate: updateProgress,
          });
          if (Math.random() < config.pauseChance) {
            timeline.to({}, { duration: gsap.utils.random(config.pauseMin, config.pauseMax) });
          }
          planned = next;
        }

        timeline.to({}, { duration: config.holdBeforeExit });
      };

      const buildFull = () => {
        reset();
        const timeline = gsap.timeline();
        addCountSteps(timeline);

        timeline.to(fill, { autoAlpha: 1, duration: config.fillDuration, ease: "power2.out" });
        timeline.to(
          counter,
          { yPercent: config.counterExitPercent, duration: config.counterOutDuration, ease: "power3.inOut" },
          "<",
        );
        timeline.to(progressLine, { autoAlpha: 0, duration: config.progressFadeDuration }, "<");
        timeline.to(
          windowLayer,
          { clipPath: "inset(0px 0px)", duration: config.expandDuration, ease: "expo.inOut" },
          `-=${config.expandOverlap}`,
        );
        timeline.to({}, { duration: config.holdOnFill });
        timeline.set(slices, { autoAlpha: 1 });
        timeline.set(windowLayer, { autoAlpha: 0 });
        timeline.set(backdrop, { autoAlpha: 0 });
        timeline.to(columns, {
          yPercent: -100,
          duration: config.columnDuration,
          ease: "power4.inOut",
          stagger: config.columnStagger,
        });
        timeline.to(
          heroWords,
          { yPercent: 0, duration: config.wordDuration, ease: "power4.out", stagger: config.wordStagger },
          `-=${config.wordsOverlap}`,
        );
        timeline.to(line, { autoAlpha: 1, y: 0, duration: config.lineDuration, ease: "power3.out" }, `-=${config.lineOverlap}`);
        return timeline;
      };

      const buildReduced = () => {
        reset();
        showCount(100);
        gsap.set(heroWords, { yPercent: 0 });
        gsap.set(line, { autoAlpha: 1, y: 0 });
        return gsap
          .timeline({ delay: config.reducedHold })
          .to(overlay, { autoAlpha: 0, duration: config.reducedFade });
      };

      const motionQuery = gsap.matchMedia();

      motionQuery.add(
        { full: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" },
        (context) => {
          const reduced = Boolean(context.conditions?.reduced);
          let timeline: gsap.core.Timeline | null = null;

          const play = () => {
            timeline?.kill();
            timeline = reduced ? buildReduced() : buildFull();
          };

          replayButton.addEventListener("click", play);
          play();

          return () => {
            replayButton.removeEventListener("click", play);
            timeline?.kill();
            gsap.killTweensOf(reelWords);
          };
        },
      );

      return () => motionQuery.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-label="Counter Curtain"
      className="relative h-screen w-full overflow-hidden bg-[var(--cc-bg-current)] text-[var(--cc-ink-current)] select-none [--cc-bg-current:var(--cc-bg,#EEEEE8)] [--cc-ink-current:var(--cc-ink,#0C0C0C)] [--cc-lime-current:var(--cc-lime,#C8F31D)] [--cc-lime-ink-current:var(--cc-lime-ink,#0C0C0C)] [--cc-night-current:var(--cc-night,#0C0C0C)] [--cc-surface-current:var(--cc-surface,#232322)] [--cc-paper-current:var(--cc-paper,#F2F2EC)] dark:[--cc-bg-current:var(--cc-bg-dark,#0C0C0C)] dark:[--cc-ink-current:var(--cc-ink-dark,#F2F2EC)]"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-4 text-center md:gap-8">
        <h2 className="flex flex-wrap justify-center gap-x-4 text-[56px] leading-[0.9] font-extrabold tracking-[-0.03em] uppercase md:gap-x-6 md:text-[104px] xl:text-[132px]">
          {hero.words.map((word) => (
            <span key={word} className="inline-block overflow-hidden pb-1">
              <span data-word className="inline-block">
                {word}
              </span>
            </span>
          ))}
        </h2>
        <p data-line className="font-mono text-[11px] tracking-[0.2em] uppercase md:text-xs">
          {hero.line}
        </p>
      </div>

      <div data-overlay className="pointer-events-none absolute inset-0 z-10">
        <div data-backdrop className="absolute inset-0 bg-[var(--cc-night-current)]" />
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${hero.columns}, 1fr)` }}>
          {columnIndexes.map((column) => (
            <div key={column} data-column className="relative overflow-hidden bg-[var(--cc-night-current)]">
              <div
                data-slice
                className="absolute inset-y-0 flex items-center justify-center bg-[var(--cc-lime-current)] text-[var(--cc-lime-ink-current)] opacity-0"
                style={{ width: `${hero.columns * 100}%`, left: `-${column * 100}%` }}
              >
                <span className={wordSizeClass}>{lastWord}</span>
              </div>
            </div>
          ))}
        </div>

        <div data-window className="absolute inset-0 bg-[var(--cc-surface-current)] text-[var(--cc-paper-current)]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={reelClass} aria-hidden="true">
              {words.map((word) => (
                <span key={word} data-reel-word className={reelWordClass}>
                  {word}
                </span>
              ))}
            </div>
          </div>
          <div
            data-fill
            className="absolute inset-0 flex items-center justify-center bg-[var(--cc-lime-current)] text-[var(--cc-lime-ink-current)] opacity-0"
          >
            <div className={reelClass} aria-hidden="true">
              <span className={reelWordClass}>{lastWord}</span>
            </div>
          </div>
        </div>

        <span data-progress className="absolute top-1/2 left-1/2 h-0.5 bg-[var(--cc-lime-current)]" />

        <div className="absolute bottom-3 left-5 overflow-hidden text-[var(--cc-paper-current)] md:bottom-6 md:left-8">
          <span
            data-counter
            aria-hidden="true"
            className="block font-mono text-[88px] leading-[0.9] font-extrabold tracking-[-0.03em] tabular-nums uppercase md:text-[160px] xl:text-[200px]"
          >
            000
          </span>
        </div>
      </div>

      <button
        type="button"
        data-replay
        className="absolute right-5 bottom-5 z-20 inline-flex h-9 cursor-pointer items-center gap-2 border-2 border-[var(--cc-ink-current)] bg-[var(--cc-lime-current)] px-4 font-mono text-[11px] tracking-[0.2em] text-[var(--cc-lime-ink-current)] uppercase md:right-8 md:bottom-8 md:text-xs"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        Replay
      </button>
    </section>
  );
}
