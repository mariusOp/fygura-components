"use client";

import { useRef } from "react";
import Image, { type StaticImageData } from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ArrowRightIcon } from "lucide-react";
import kickflip from "./images/kickflip.webp";
import legendaryCar from "./images/legendary-car.webp";
import legendaryRoad from "./images/legendary-road.webp";
import sendItRider from "./images/send-it-rider.webp";
import sendItSky from "./images/send-it-sky.webp";
import thumbsUp from "./images/thumbs-up.webp";

gsap.registerPlugin(useGSAP);

export type KineticPosterLayout = "panel" | "split" | "arch" | "jump";

export type KineticPoster = {
  id: string;
  layout: KineticPosterLayout;
  // The "jump" layout splits the word into two lines at the first space.
  word: string;
  // Small print at the bottom of the poster.
  caption: string;
  // The cut-out subject. When there is a photo too, both are the same frame, so they line up.
  subject: StaticImageData;
  photo?: StaticImageData;
  alt: string;
};

type Props = {
  posters?: KineticPoster[];
  label?: string;
};

// The three inks of the poster series. Change them here.
const colors = { paper: "#E8E3D9", ink: "#1B1A17", orange: "#F7901E", backdrop: "#141311" };

// The small print in the header of every poster.
const printDetails = { brand: "Fygura®", date: "14.11.26" };

const settings = { swapDuration: 0.8, morphDuration: 1.1, hold: 0.7 };

// Paper grain, printed over every poster.
const grain =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.1 0 0 0 0 0.1 0 0 0 0 0.08 0 0 0 0.45 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const labelClass = "font-mono text-[1.9cqw] tracking-[0.14em] uppercase";
// The display word reads its width from --wdth (a variable font's width axis, 62 to 125 in Archivo), so GSAP can tween it.
const wordClass = "font-extrabold uppercase leading-[0.78] [font-variation-settings:'wdth'_var(--wdth)]";
const imageClass = "pointer-events-none absolute inset-0 size-full object-cover select-none";

const demoPosters: KineticPoster[] = [
  {
    id: "legendary",
    layout: "panel",
    word: "Legendary",
    caption: "Air-cooled · Classic",
    subject: legendaryCar,
    photo: legendaryRoad,
    alt: "A classic air-cooled coupe parked by a misty road",
  },
  {
    id: "air",
    layout: "split",
    word: "Air",
    caption: "Kickflip · Session 07",
    subject: kickflip,
    alt: "A skateboarder mid-air, the board flipping under his feet",
  },
  {
    id: "yes",
    layout: "arch",
    word: "Yes",
    caption: "Approved · Always",
    subject: thumbsUp,
    alt: "A hand giving a thumbs up",
  },
  {
    id: "send-it",
    layout: "jump",
    word: "Send it",
    caption: "BMX · No brakes",
    subject: sendItRider,
    photo: sendItSky,
    alt: "A BMX rider in the air against an open sky",
  },
];

type Find = (selector: string) => HTMLElement[];

// Every poster moves between two compositions and back, holding each one for a moment.
const morph = () =>
  gsap.timeline({
    repeat: -1,
    yoyo: true,
    repeatDelay: settings.hold,
    defaults: { duration: settings.morphDuration, ease: "expo.inOut" },
  });

const loops: Record<KineticPosterLayout, (find: Find) => gsap.core.Timeline> = {
  // The word grows tall while the photo folds up behind the car and the sun sets.
  panel: (find) =>
    morph()
      .to(find("[data-word]"), { scaleY: 2.1 }, 0)
      .to(find("[data-panel]"), { clipPath: "inset(42% 0% 0% 0%)" }, 0)
      .to(find("[data-sun]"), { yPercent: 70, scale: 0.55 }, 0),

  // The black half crosses to the other side; the sun follows, the letters hop.
  split: (find) =>
    morph()
      .to(find("[data-split]"), { xPercent: 100 }, 0)
      .to(find("[data-sun]"), { xPercent: 22, yPercent: -30, scale: 0.7 }, 0)
      .to(find("[data-subject]"), { yPercent: -5, rotation: -3 }, 0)
      .to(find("[data-letter]"), { yPercent: -14, stagger: 0.08, duration: 0.6 }, 0.1),

  // The diamond becomes a circle and the word swings from narrow to wide.
  arch: (find) =>
    morph()
      .to(find("[data-shape]"), { borderRadius: "50%", rotation: 0, scale: 1.2 }, 0)
      .to(find("[data-word]"), { "--wdth": 125 }, 0)
      .to(find("[data-subject]"), { rotation: -6, transformOrigin: "50% 90%" }, 0),

  // The lines slide past each other, the photo folds into a column and the rider jumps out of it.
  jump: (find) =>
    morph()
      .fromTo(find("[data-line]")[0], { xPercent: 0 }, { xPercent: 14 }, 0)
      .fromTo(find("[data-line]")[1], { xPercent: 0 }, { xPercent: -14 }, 0)
      .to(find("[data-panel]"), { clipPath: "inset(0% 30% 0% 30%)" }, 0)
      .to(find("[data-sun]"), { scale: 0.62 }, 0)
      .to(find("[data-subject]"), { yPercent: -16, rotation: -8 }, 0),
};

// A barcode drawn from fixed bar widths, so it is the same on every render.
const bars = [3, 1, 1, 2, 1, 3, 2, 1, 1, 1, 3, 2, 1, 2, 1, 1, 2, 3, 1, 1, 2, 1, 3, 1];
const barPositions = bars.map((_, index) => bars.slice(0, index).reduce((sum, previous) => sum + previous + 1, 0));

function Barcode() {
  return (
    <svg aria-hidden viewBox="0 0 64 20" preserveAspectRatio="none" className="h-[5cqw] w-[13cqw]" fill="currentColor">
      {bars.map((width, index) =>
        index % 2 === 0 ? <rect key={index} x={barPositions[index]} y="0" width={width} height="20" /> : null,
      )}
    </svg>
  );
}

function Letters(props: { word: string }) {
  return props.word.split("").map((letter, index) => (
    <span key={index} data-letter className="inline-block">
      {letter}
    </span>
  ));
}

// The four poster layouts. Every moving part carries a data attribute the motion code looks for.
function PosterArt(props: { poster: KineticPoster }) {
  const { poster } = props;
  const subject = (sizes: string) => (
    <Image data-subject src={poster.subject} alt={poster.alt} sizes={sizes} className={imageClass} draggable={false} />
  );
  const photo = (sizes: string) =>
    poster.photo ? <Image src={poster.photo} alt="" sizes={sizes} className={imageClass} draggable={false} /> : null;

  // A photo panel with a sun behind the car; the word grows taller as the panel folds away.
  if (poster.layout === "panel") {
    return (
      <>
        <h2 data-word className={`${wordClass} absolute inset-x-[4cqw] top-[10cqw] origin-top text-center text-[19.5cqw] [--wdth:62]`}>
          {poster.word}
        </h2>
        <div className="absolute inset-x-[4cqw] bottom-[17cqw] h-[64cqw]">
          <div data-panel className="absolute inset-0 overflow-hidden [clip-path:inset(0%_0%_0%_0%)]">
            {photo("(min-width: 768px) 40vw, 90vw")}
            <span
              data-sun
              aria-hidden
              className="absolute top-[8cqw] left-[30cqw] size-[34cqw] rounded-full"
              style={{ backgroundColor: colors.orange }}
            />
          </div>
          {subject("(min-width: 768px) 40vw, 90vw")}
        </div>
        <div className="absolute inset-x-[4cqw] bottom-[9cqw] flex items-center gap-[2.5cqw]">
          <Barcode />
          <span className="h-[4.6cqw] flex-1 rounded-full border-[0.4cqw] border-current" />
          <span className="text-[5.4cqw] leading-none font-medium tabular-nums">65 – 73</span>
        </div>
      </>
    );
  }

  // A black half that slides from one side to the other under the skater.
  if (poster.layout === "split") {
    return (
      <>
        <div data-split aria-hidden className="absolute inset-y-0 left-0 w-1/2" style={{ backgroundColor: colors.ink }} />
        <span
          data-sun
          aria-hidden
          className="absolute top-[44cqw] left-[24cqw] size-[52cqw] rounded-full"
          style={{ backgroundColor: colors.orange }}
        />
        <h2
          data-word
          className={`${wordClass} absolute top-[11cqw] left-[4cqw] text-[30cqw] [--wdth:100]`}
          style={{ color: colors.orange }}
        >
          <Letters word={poster.word} />
        </h2>
        <div className="absolute top-[18cqw] left-[22cqw] aspect-965/1600 w-[56cqw]">
          {subject("(min-width: 768px) 30vw, 60vw")}
        </div>
      </>
    );
  }

  // A diamond in a dark arch turns into a circle behind the hand; the word swings narrow to wide.
  if (poster.layout === "arch") {
    return (
      <>
        <div
          aria-hidden
          className="absolute top-[11cqw] left-[18cqw] h-[78cqw] w-[64cqw] overflow-hidden rounded-t-full"
          style={{ backgroundColor: colors.ink }}
        >
          <span
            data-shape
            className="absolute top-[26cqw] left-[12cqw] size-[40cqw] rotate-45"
            style={{ backgroundColor: colors.orange }}
          />
        </div>
        <div className="absolute top-[19cqw] left-[-1cqw] aspect-1600/1581 w-[66cqw]">{subject("(min-width: 768px) 35vw, 75vw")}</div>
        <h2 data-word className={`${wordClass} absolute inset-x-0 top-[91cqw] text-center text-[27cqw] [--wdth:62]`}>
          {poster.word}
        </h2>
      </>
    );
  }

  // Two lines slide past each other; the photo folds into a column and the rider jumps out of it.
  const [firstLine, secondLine] = poster.word.split(" ");
  return (
    <>
      <h2 data-word className={`${wordClass} absolute inset-x-[4cqw] top-[10cqw] text-[23cqw] [--wdth:62]`}>
        <span className="block overflow-hidden">
          <span data-line className="inline-block">
            {firstLine}
          </span>
        </span>
        <span className="block overflow-hidden text-right">
          <span data-line className="inline-block" style={{ color: colors.orange }}>
            {secondLine}
          </span>
        </span>
      </h2>
      <div className="absolute inset-x-[4cqw] bottom-[10cqw] h-[66cqw]">
        <div data-panel className="absolute inset-0 overflow-hidden [clip-path:inset(0%_0%_0%_0%)]">
          {photo("(min-width: 768px) 40vw, 90vw")}
          <span
            data-sun
            aria-hidden
            className="absolute top-[12cqw] left-[24cqw] size-[44cqw] rounded-full"
            style={{ backgroundColor: colors.orange }}
          />
        </div>
        {subject("(min-width: 768px) 40vw, 90vw")}
      </div>
    </>
  );
}

export default function KineticPosters(props: Props) {
  const posters = props.posters ?? demoPosters;
  const label = props.label ?? "Kinetic Posters";
  const root = useRef<HTMLElement>(null);
  const count = String(posters.length).padStart(2, "0");

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;

      const posterElements = gsap.utils.toArray<HTMLElement>("[data-poster]", section);
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const seconds = (value: number) => (reduceMotion ? 0 : value);

      // Only the poster on show plays its loop; reduced motion keeps every poster still.
      const posterLoops = posterElements.map((poster) => {
        const find: Find = (selector) => gsap.utils.toArray<HTMLElement>(selector, poster);
        const layout = poster.dataset.layout as KineticPosterLayout;
        return reduceMotion ? null : loops[layout](find).pause();
      });

      let current = 0;
      let busy = false;
      posterLoops[0]?.play();

      // The poster on show flies out like a card thrown aside; the next one slides in.
      function showNext() {
        if (busy) return;
        busy = true;
        const leaving = posterElements[current];
        const nextIndex = (current + 1) % posterElements.length;
        const arriving = posterElements[nextIndex];

        posterLoops[nextIndex]?.restart();
        gsap
          .timeline({
            onComplete: () => {
              posterLoops[current]?.pause();
              leaving.setAttribute("aria-hidden", "true");
              arriving.setAttribute("aria-hidden", "false");
              current = nextIndex;
              busy = false;
            },
          })
          .set(arriving, { zIndex: 2, autoAlpha: 1 })
          .set(leaving, { zIndex: 1 })
          .fromTo(arriving, { xPercent: 110, rotation: 7 }, { xPercent: 0, rotation: 0, duration: seconds(settings.swapDuration), ease: "expo.out" }, 0)
          .to(leaving, { xPercent: -60, rotation: -9, autoAlpha: 0, duration: seconds(settings.swapDuration * 0.8), ease: "power3.in" }, 0)
          .set(leaving, { xPercent: 0, rotation: 0 });
      }

      // A click anywhere, including the Next button, shows the next poster.
      section.addEventListener("click", showNext);
      return () => {
        section.removeEventListener("click", showNext);
        posterLoops.forEach((loop) => loop?.kill());
      };
    },
    { scope: root, dependencies: [posters] },
  );

  return (
    <section
      ref={root}
      aria-label={label}
      aria-live="polite"
      className="flex h-svh w-full cursor-pointer flex-col items-center justify-center overflow-clip"
      style={{ backgroundColor: colors.backdrop }}
    >
      <div className="relative w-[min(92vw,calc(86svh*0.8))]">
        {posters.map((poster, index) => (
          <article
            key={poster.id}
            data-poster
            data-layout={poster.layout}
            aria-hidden={index !== 0}
            className={`@container absolute inset-0 aspect-4/5 overflow-hidden shadow-[0_40px_80px_-30px_rgb(0_0_0/0.65)] ${index === 0 ? "" : "invisible"}`}
            style={{ backgroundColor: colors.paper, color: colors.ink }}
          >
            <header
              className={`${labelClass} absolute inset-x-[4cqw] top-[4cqw] z-10 flex justify-between mix-blend-difference`}
              style={{ color: colors.paper }}
            >
              <span className="font-sans font-extrabold tracking-normal normal-case">{printDetails.brand}</span>
              <span>
                Poster No. {String(index + 1).padStart(3, "0")} · {printDetails.date}
              </span>
            </header>

            <PosterArt poster={poster} />

            <footer
              className={`${labelClass} absolute inset-x-[4cqw] bottom-[4cqw] z-10 flex items-end justify-between mix-blend-difference`}
              style={{ color: colors.paper }}
            >
              <span>{poster.caption}</span>
              <span className="tabular-nums">
                {String(index + 1).padStart(2, "0")} / {count}
              </span>
            </footer>

            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-55 mix-blend-multiply" style={{ backgroundImage: grain }} />
          </article>
        ))}
        {/* Keeps the stack's height, since every poster is absolutely positioned. */}
        <div aria-hidden className="invisible aspect-4/5" />
      </div>

      <button
        type="button"
        className="mt-6 flex items-center gap-3 border-2 px-5 py-3 font-mono text-xs tracking-[0.18em] uppercase transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4"
        style={{ borderColor: colors.paper, color: colors.paper }}
      >
        Next poster
        <ArrowRightIcon className="size-4" />
      </button>
    </section>
  );
}
