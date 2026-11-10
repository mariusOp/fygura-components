"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { RotateCcw } from "lucide-react";

gsap.registerPlugin(useGSAP);

export type CubeLoaderHero = {
  words: string[];
  line: string;
};

type Props = {
  hero?: CubeLoaderHero;
};

type LoaderKind = "bars" | "hop" | "goo" | "infinity";

const demoHero: CubeLoaderHero = {
  words: ["Motion", "made", "calm"],
  line: "GSAP components for Next.js",
};

const config = {
  turns: 4,
  turnDuration: 0.7,
  holdDuration: 1.2,
  finalScale: 10,
  scaleDuration: 1,
  revealDuration: 0.5,
  wordDuration: 0.9,
  wordStagger: 0.1,
  lineOffset: 12,
  reducedHold: 0.6,
};

const cubeSize = 180;

const faces: { transform: string; tone: string; loader: LoaderKind }[] = [
  { transform: "rotateY(0deg)", tone: "bg-[var(--cl-paper-current)] text-[var(--cl-night-current)]", loader: "bars" },
  { transform: "rotateY(90deg)", tone: "bg-[var(--cl-surface-current)] text-[var(--cl-paper-current)]", loader: "hop" },
  { transform: "rotateY(180deg)", tone: "bg-[var(--cl-paper-current)] text-[var(--cl-night-current)]", loader: "goo" },
  { transform: "rotateY(-90deg)", tone: "bg-[var(--cl-surface-current)] text-[var(--cl-paper-current)]", loader: "infinity" },
];

const labelClass = "font-mono text-[11px] leading-none tracking-[0.06em] uppercase md:text-xs";

function repeat(count: number, className: string) {
  return Array.from({ length: count }, (_, index) => <span key={index} className={className} />);
}

function FaceLoader(props: { kind: LoaderKind }) {
  if (props.kind === "bars") {
    return (
      <span data-loader="bars" className="flex h-8 items-center gap-1">
        {repeat(5, "h-2 w-1 rounded-full bg-current")}
      </span>
    );
  }

  if (props.kind === "hop") {
    return (
      <span data-loader="hop" className="flex items-end gap-1.5 pt-4">
        {repeat(3, "size-2 rounded-full bg-current")}
      </span>
    );
  }

  if (props.kind === "goo") {
    return (
      <span data-loader="goo" className="relative h-8 w-16" style={{ filter: "url(#cube-loader-goo)" }}>
        <svg aria-hidden className="absolute size-0">
          <filter id="cube-loader-goo">
            <feGaussianBlur stdDeviation="3" />
            <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" />
          </filter>
        </svg>
        {repeat(3, "absolute top-1/2 left-1/2 -mt-1.5 -ml-1.5 size-3 rounded-full bg-current")}
      </span>
    );
  }

  return (
    <span data-loader="infinity" className="relative h-8 w-16">
      {repeat(10, "absolute top-1/2 left-1/2 -mt-1 -ml-1 size-2 rounded-full bg-current")}
    </span>
  );
}

export default function CubeLoader(props: Props) {
  const hero = props.hero ?? demoHero;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;

      const select = gsap.utils.selector(section);
      const overlay = select("[data-overlay]")[0];
      const cube = select("[data-cube]")[0];
      const counter = select("[data-counter]")[0];
      const words = select("[data-word]");
      const line = select("[data-line]")[0];
      const replayButton = select("[data-replay]")[0];

      const playBars = () => {
        gsap.to(select("[data-loader=bars] > span"), {
          scaleY: 3.5,
          duration: 0.5,
          ease: "sine.inOut",
          stagger: { each: 0.12, repeat: -1, yoyo: true },
        });
      };

      const playHop = () => {
        const [jumper, ...walkers] = select("[data-loader=hop] > span");
        const step = 14;
        const squash = { scaleX: 1.4, scaleY: 0.6, transformOrigin: "50% 100%", duration: 0.12, ease: "power2.out" };

        gsap
          .timeline({ repeat: -1, defaults: { ease: "sine.inOut" } })
          .to(jumper, squash)
          .to(jumper, { keyframes: { x: [0, step, step * 2], y: [0, -14, 0] }, scaleX: 1, scaleY: 1, duration: 0.5 })
          .to(walkers, { x: -step, duration: 0.5 }, "<")
          .to(jumper, squash)
          .to(jumper, { scaleX: 1, scaleY: 1, duration: 0.2 });
      };

      const playGoo = () => {
        const [core, left, right] = select("[data-loader=goo] > span");
        const travel = { duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: -1 };

        gsap.fromTo(left, { x: -20 }, { x: 20, ...travel });
        gsap.fromTo(right, { x: 20 }, { x: -20, ...travel });
        gsap.to(core, { scale: 0.5, ...travel, duration: 0.45 });
      };

      const playInfinity = () => {
        const dots = select("[data-loader=infinity] > span");
        const path = { progress: 0 };
        const radius = 24;
        const trailGap = 0.022;

        dots.forEach((dot, index) => gsap.set(dot, { scale: 1 - index * 0.08, autoAlpha: 1 - index * 0.08 }));
        gsap.to(path, {
          progress: 1,
          duration: 2.2,
          ease: "none",
          repeat: -1,
          onUpdate: () => {
            dots.forEach((dot, index) => {
              const angle = (path.progress - index * trailGap) * Math.PI * 2;
              const squeeze = 1 + Math.sin(angle) ** 2;
              gsap.set(dot, { x: (radius * Math.cos(angle)) / squeeze, y: (radius * Math.sin(angle) * Math.cos(angle)) / squeeze });
            });
          },
        });
      };

      const playLoaders = () => {
        playBars();
        playHop();
        playGoo();
        playInfinity();
      };

      const showCount = (value: number) => {
        counter.textContent = String(Math.round(value)).padStart(3, "0");
      };

      const reset = () => {
        showCount(0);
        gsap.set(overlay, { autoAlpha: 1 });
        gsap.set(counter, { autoAlpha: 1 });
        gsap.set(cube, { rotationX: 0, rotationY: 0, scale: 1 });
        gsap.set(words, { yPercent: 110 });
        gsap.set(line, { autoAlpha: 0, y: config.lineOffset });
      };

      const buildFull = () => {
        reset();
        const progress = { value: 0 };
        const timeline = gsap.timeline();

        for (let turn = 0; turn < config.turns; turn++) {
          timeline.to(cube, { rotationY: "-=90", duration: config.turnDuration, ease: "power3.inOut" }, `>${config.holdDuration}`);
          timeline.to(
            progress,
            {
              value: ((turn + 1) / config.turns) * 100,
              duration: config.turnDuration,
              ease: "power2.inOut",
              onUpdate: () => showCount(progress.value),
            },
            "<",
          );
        }

        timeline.to(counter, { autoAlpha: 0, duration: 0.3 });
        timeline.to(cube, { scale: config.finalScale, duration: config.scaleDuration, ease: "expo.in" }, "<");
        timeline.to(overlay, { autoAlpha: 0, duration: config.revealDuration });
        timeline.to(words, { yPercent: 0, duration: config.wordDuration, ease: "power4.out", stagger: config.wordStagger }, "<");
        timeline.to(line, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" }, "<0.4");
        return timeline;
      };

      const buildReduced = () => {
        reset();
        showCount(100);
        gsap.set(words, { yPercent: 0 });
        gsap.set(line, { autoAlpha: 1, y: 0 });
        return gsap.timeline({ delay: config.reducedHold }).to(overlay, { autoAlpha: 0, duration: config.revealDuration });
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
          if (!reduced) playLoaders();
          play();

          return () => {
            replayButton.removeEventListener("click", play);
            timeline?.kill();
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
      aria-label="Cube Loader"
      className="relative h-screen w-full overflow-hidden bg-[var(--cl-bg-current)] text-[var(--cl-ink-current)] select-none [--cl-bg-current:var(--cl-bg,#EEEEE8)] [--cl-ink-current:var(--cl-ink,#0C0C0C)] [--cl-lime-current:var(--cl-lime,#C8F31D)] [--cl-lime-ink-current:var(--cl-lime-ink,#0C0C0C)] [--cl-night-current:var(--cl-night,#0C0C0C)] [--cl-surface-current:var(--cl-surface,#232322)] [--cl-paper-current:var(--cl-paper,#F2F2EC)] dark:[--cl-bg-current:var(--cl-bg-dark,#0C0C0C)] dark:[--cl-ink-current:var(--cl-ink-dark,#F2F2EC)]"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-4 text-center">
        <h2 className="flex flex-wrap justify-center gap-x-4 text-[34px] leading-[0.95] font-extrabold tracking-[-0.02em] uppercase md:gap-x-6 md:text-[56px] xl:text-[72px]">
          {hero.words.map((word) => (
            <span key={word} className="inline-block overflow-hidden pb-1">
              <span data-word className="inline-block">
                {word}
              </span>
            </span>
          ))}
        </h2>
        <p data-line className={labelClass}>
          {hero.line}
        </p>
      </div>

      <div
        data-overlay
        className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-24 bg-[var(--cl-night-current)] text-[var(--cl-paper-current)]"
      >
        <div style={{ perspective: 800 }}>
          <div data-cube className="relative" style={{ width: cubeSize, height: cubeSize, transformStyle: "preserve-3d" }}>
            {faces.map((face) => (
              <div
                key={face.transform}
                className={`absolute inset-0 flex items-center justify-center [backface-visibility:hidden] ${face.tone}`}
                style={{ transform: `${face.transform} translateZ(${cubeSize / 2}px)` }}
              >
                <FaceLoader kind={face.loader} />
              </div>
            ))}
          </div>
        </div>
        <span data-counter aria-hidden="true" className={`${labelClass} tabular-nums`}>
          000
        </span>
      </div>

      <button
        type="button"
        data-replay
        className={`${labelClass} absolute right-5 bottom-5 z-20 inline-flex h-9 cursor-pointer items-center gap-2 border-2 border-[var(--cl-ink-current)] bg-[var(--cl-lime-current)] px-4 text-[var(--cl-lime-ink-current)] md:right-8 md:bottom-8`}
      >
        <RotateCcw aria-hidden className="size-4" />
        Replay
      </button>
    </section>
  );
}
