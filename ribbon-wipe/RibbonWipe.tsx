"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(useGSAP, DrawSVGPlugin);

export type RibbonWipePage = {
  id: string;
  label: string;
  title: string;
  text: string;
  background: string;
  ink: string;
};

type Props = { pages?: RibbonWipePage[] };

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

const demoPages: RibbonWipePage[] = [
  {
    id: "studio",
    label: "Studio",
    title: "Good things take shape",
    text: "A small studio for brands that like a little colour. Pick a page above and watch the ribbons carry you there.",
    background: "#111110",
    ink: "#FDEB82",
  },
  {
    id: "work",
    label: "Work",
    title: "Selected work, 2024–2026",
    text: "Identities, websites and motion for record labels, bakeries and one very serious sock company.",
    background: "#FDEB82",
    ink: "#111110",
  },
  {
    id: "contact",
    label: "Contact",
    title: "Say hello",
    text: "New projects start with a short call. Tell us what you are making and when it needs to be out in the world.",
    background: "#3DAF80",
    ink: "#111110",
  },
];

const navButtonClass =
  "px-2 py-3 font-mono text-[11px] tracking-[0.18em] uppercase underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current data-[active=true]:underline md:text-xs";

// A small three-page site that switches pages through the ribbons.
export default function RibbonWipe(props: Props) {
  const pages = props.pages ?? demoPages;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;

      const find = gsap.utils.selector(section);
      const pageElements = find("[data-page]") as HTMLElement[];
      const overlay = find("[data-overlay]")[0] as HTMLElement;
      const ribbons = find("[data-ribbon]");
      let currentPage = pageElements[0];
      let busy = false;

      function showPage(page: HTMLElement) {
        gsap.set(pageElements, { autoAlpha: 0 });
        gsap.set(page, { autoAlpha: 1 });
        pageElements.forEach((item) => item.setAttribute("aria-hidden", String(item !== page)));
        currentPage = page;
      }

      // Cover the screen, swap the page underneath, then pull the ribbons away.
      async function goTo(pageId: string, fromKeyboard: boolean) {
        const nextPage = pageElements.find((page) => page.dataset.page === pageId);
        if (busy || !nextPage || nextPage === currentPage) return;

        busy = true;
        gsap.set(overlay, { autoAlpha: 1 });
        await drawRibbons(ribbons, "cover");
        showPage(nextPage);
        // Keyboard users keep their place in the new page's menu; a mouse click needs no focus ring.
        if (fromKeyboard) nextPage.querySelector<HTMLElement>(`[data-go="${pageId}"]`)?.focus({ preventScroll: true });
        await drawRibbons(ribbons, "reveal");
        gsap.set(overlay, { autoAlpha: 0 });
        busy = false;
      }

      function onClick(event: MouseEvent) {
        const button = (event.target as Element).closest<HTMLElement>("[data-go]");
        // A click from Enter or Space has no pointer position, so detail is 0.
        if (button?.dataset.go) goTo(button.dataset.go, event.detail === 0);
      }

      section.addEventListener("click", onClick);
      return () => section.removeEventListener("click", onClick);
    },
    { scope: root, dependencies: [pages] },
  );

  return (
    <section ref={root} aria-label="Ribbon Wipe" className="relative h-svh w-full overflow-clip">
      {pages.map((page, index) => (
        <article
          key={page.id}
          data-page={page.id}
          aria-hidden={index !== 0}
          className={index === 0 ? "absolute inset-0" : "invisible absolute inset-0"}
          style={{ backgroundColor: page.background, color: page.ink }}
        >
          <nav aria-label="Pages" className="absolute inset-x-0 top-0 flex justify-end gap-3 p-3 md:justify-center md:gap-6 md:py-6">
            {pages.map((target) => (
              <button key={target.id} type="button" data-go={target.id} data-active={target.id === page.id} className={navButtonClass}>
                {target.label}
              </button>
            ))}
          </nav>

          <div className="absolute inset-x-5 bottom-10 md:inset-x-10 md:bottom-14">
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase opacity-70 md:text-xs">
              {String(index + 1).padStart(2, "0")} / {page.label}
            </p>
            <h2 className="mt-4 max-w-[12ch] text-[16vw] leading-[0.86] font-extrabold tracking-[-0.03em] uppercase md:text-[9vw]">
              {page.title}
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed opacity-80 md:text-lg">{page.text}</p>
          </div>
        </article>
      ))}

      <div data-overlay aria-hidden className="pointer-events-none invisible absolute inset-0 z-10">
        <Ribbons className="size-full" />
      </div>
    </section>
  );
}
