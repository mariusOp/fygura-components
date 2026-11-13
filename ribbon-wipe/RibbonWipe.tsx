"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ArrowRightIcon } from "lucide-react";

gsap.registerPlugin(useGSAP, DrawSVGPlugin);

export type RibbonWipeStep = {
  id: string;
  // The big words on the screen; each step is one part of the sentence.
  words: string;
};

type Props = { steps?: RibbonWipeStep[] };

// Change the page colours of the demo here.
const demoColors = {
  background: "#FFFFFF",
  ink: "#111110",
};

// One S-shaped curve, drawn from the bottom right towards the left. Both ends sit outside the
// 1600x900 view, so the round caps never show as dots when a ribbon is empty.
const curve = "M 1750 1450 C 1350 700, 1100 300, 780 300 C 460 300, 120 430, -650 640";

// Change the look here: each copy of the curve moves by `step`, so the ribbons lie side by side.
const ribbonSettings = {
  step: { x: 38, y: -65 },
  firstCopy: -14,
  lastCopy: 18,
  width: 80,
  palette: ["#3DAF80", "#7ADD98", "#B9FF9A", "#FDEB82", "#F25500", "#7ADD98", "#3DAF80", "#B9FF9A", "#FDEB82"],
};

// Seconds one ribbon takes, and the spread of their start times.
const timing = { duration: 0.9, stagger: 0.5 };

const copies = Array.from(
  { length: ribbonSettings.lastCopy - ribbonSettings.firstCopy + 1 },
  (_, index) => ribbonSettings.firstCopy + index,
);

export function Ribbons(props: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className={props.className}
      fill="none"
      strokeLinecap="round"
      strokeWidth={ribbonSettings.width}
    >
      {copies.map((copy, index) => (
        <path
          key={copy}
          data-ribbon
          d={curve}
          stroke={ribbonSettings.palette[index % ribbonSettings.palette.length]}
          transform={`translate(${copy * ribbonSettings.step.x} ${copy * ribbonSettings.step.y})`}
        />
      ))}
    </svg>
  );
}

// "cover" draws the ribbons in until they fill the screen; "reveal" lets the tail follow until nothing is left.
const drawn = {
  cover: { from: "0% 0%", to: "0% 100%" },
  reveal: { from: "0% 100%", to: "100% 100%" },
};

export function drawRibbons(ribbons: Element[], mode: "cover" | "reveal", speed = timing) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const range = drawn[mode];

  return gsap.fromTo(
    ribbons,
    { drawSVG: range.from },
    {
      drawSVG: range.to,
      duration: reduceMotion ? 0 : speed.duration,
      ease: "power2.inOut",
      stagger: { amount: reduceMotion ? 0 : speed.stagger, from: "random" },
    },
  );
}

// A sentence told one step at a time; the ribbons carry the reader from step to step.
const demoSteps: RibbonWipeStep[] = [
  { id: "this", words: "This" },
  { id: "is", words: "is" },
  { id: "transition", words: "a transition." },
];

const labelClass = "font-mono text-[11px] tracking-[0.18em] uppercase md:text-xs";

function formatNumber(value: number) {
  return String(value).padStart(2, "0");
}

// A sentence in three steps; the Next button or a click anywhere moves on through the ribbons.
export default function RibbonWipe(props: Props) {
  const steps = props.steps ?? demoSteps;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;

      const find = gsap.utils.selector(section);
      const stepElements = find("[data-step]") as HTMLElement[];
      const overlay = find("[data-overlay]")[0] as HTMLElement;
      const ribbons = find("[data-ribbon]");
      let current = 0;
      let busy = false;

      function showStep(index: number) {
        stepElements.forEach((step, stepIndex) => {
          gsap.set(step, { autoAlpha: stepIndex === index ? 1 : 0 });
          step.setAttribute("aria-hidden", String(stepIndex !== index));
        });
        current = index;
      }

      // Cover the screen, swap to the next step underneath, then pull the ribbons away.
      async function next() {
        if (busy) return;
        busy = true;
        gsap.set(overlay, { autoAlpha: 1 });
        await drawRibbons(ribbons, "cover");
        showStep((current + 1) % stepElements.length);
        await drawRibbons(ribbons, "reveal");
        gsap.set(overlay, { autoAlpha: 0 });
        busy = false;
      }

      // The Next button sits inside the section, so its click lands here too.
      section.addEventListener("click", next);
      return () => section.removeEventListener("click", next);
    },
    { scope: root, dependencies: [steps] },
  );

  return (
    <section
      ref={root}
      aria-label="Ribbon Wipe"
      aria-live="polite"
      className="relative h-svh w-full cursor-pointer overflow-clip"
      style={{ backgroundColor: demoColors.background, color: demoColors.ink }}
    >
      {steps.map((step, index) => (
        <article
          key={step.id}
          data-step={step.id}
          aria-hidden={index !== 0}
          className={index === 0 ? "absolute inset-0" : "invisible absolute inset-0"}
        >
          <p className={`${labelClass} absolute top-16 right-5 tabular-nums md:top-8 md:right-10`}>
            {formatNumber(index + 1)} / {formatNumber(steps.length)}
          </p>
          <h2 className="absolute inset-x-5 top-1/2 -translate-y-1/2 text-[14vw] leading-[0.9] font-extrabold tracking-[-0.04em] md:inset-x-10 md:text-[15vw]">
            {step.words}
          </h2>
        </article>
      ))}

      <button
        type="button"
        className={`${labelClass} absolute right-5 bottom-6 z-20 flex items-center gap-3 border-2 border-current px-5 py-3 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current md:right-10 md:bottom-10`}
        style={{ backgroundColor: demoColors.background }}
      >
        Next
        <ArrowRightIcon className="size-4" />
      </button>

      <div data-overlay aria-hidden className="pointer-events-none invisible absolute inset-0 z-30">
        <Ribbons className="size-full" />
      </div>
    </section>
  );
}
