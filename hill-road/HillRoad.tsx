"use client";

import { useRef } from "react";
import Image, { type StaticImageData } from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import coach from "./images/coach.webp";
import grass from "./images/grass.webp";
import printTexture from "./images/print-texture.webp";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export type HillRoadPoster = {
  title: string;
  number: string;
  headline: string;
  meta: { label: string; value: string }[];
  // A transparent side view of the vehicle on the road.
  vehicle: { image: StaticImageData; alt: string };
};

type Props = {
  poster?: HillRoadPoster;
  label?: string;
};

// The landscape as cut-paper shapes, drawn in the scene's own 968 x 962 box.
// Each shape is lit from its ridge (`light`) to its fold (`shade`); `stripes` adds mowing lines.
// `speed` is how far a layer rises while you scroll, as a share of the scene height (0 stays put).
type Hill = {
  id: string;
  path: string;
  light: string;
  shade: string;
  stripes?: boolean;
  speed: number;
};

const sceneBox = { width: 968, height: 962 };

// Change the paper, ink and title colours here.
const colors = { paper: "#F3E1B6", ink: "#1A1303", title: "#98B580", backdrop: "#2A2620" };

const settings = {
  // How long the poster stays pinned while the scene plays, as a share of the screen height.
  pinLength: "+=400%",
  scrubSmoothing: 0.6,
  // How far below its place the title starts, as a share of the scene height.
  titleRise: 0.34,
  // The vehicle drives in from this far left (in % of its own width) and stops in its place.
  vehicleFrom: -170,
  vehicleTo: 0,
};

const demoPoster: HillRoadPoster = {
  title: "voyage",
  number: "014",
  headline: "Take the long way",
  meta: [
    { label: "Title", value: "Voyage" },
    { label: "Date", value: "14·11·26" },
    { label: "Time", value: "6:10 am" },
    { label: "Route", value: "Hill road" },
    { label: "Print", value: "Riso" },
  ],
  vehicle: { image: coach, alt: "A 1950s coach driving along a country road" },
};

// The hills behind the road, back to front.
const hills: Hill[] = [
  {
    id: "back",
    path: "M0 372 C160 330 330 318 520 350 C650 372 780 394 968 382 V962 H0 Z",
    light: "#C2C463",
    shade: "#9DA447",
    speed: 0.05,
  },
  {
    id: "back-right",
    path: "M300 520 C460 420 690 360 968 350 V962 H300 Z",
    light: "#B5B957",
    shade: "#949C41",
    speed: 0.08,
  },
  {
    id: "band",
    path: "M0 500 C180 468 380 460 560 478 C720 494 860 478 968 462 V962 H0 Z",
    light: "#8F9A35",
    shade: "#6E7826",
    speed: 0.12,
  },
  {
    id: "slope",
    path: "M0 496 C150 480 330 504 500 556 C620 594 720 646 820 696 C880 724 930 738 968 742 V962 H0 Z",
    light: "#E2CB2E",
    shade: "#ABA327",
    stripes: true,
    speed: 0.17,
  },
  {
    id: "slope-right",
    path: "M360 780 C500 650 690 566 860 546 C910 540 948 542 968 546 V962 H360 Z",
    light: "#D2C230",
    shade: "#A39C27",
    stripes: true,
    speed: 0.22,
  },
];

// The road: a paper-coloured lens laid over the hills, thin at the edges and wide in the middle.
const road: Hill = {
  id: "road",
  // Its lower part runs on under the fields, so nothing behind shows through while they move.
  path: "M0 676 C300 626 668 626 968 676 L968 860 L0 860 Z",
  light: "#F8E8C2",
  shade: "#EAD6A6",
  speed: 0,
};

// Where the vehicle's wheels touch the road: its left edge, width and baseline, in the same box.
const vehiclePlace = { left: 271, width: 426, baseline: 712 };

// The fields in front of the road. They move only a little, so they stay whole.
const ground: Hill[] = [
  {
    id: "field",
    path: "M0 736 C200 714 420 728 600 760 C720 782 860 778 968 758 V962 H0 Z",
    light: "#9A9228",
    shade: "#6E6E2A",
    stripes: true,
    speed: 0.03,
  },
  {
    id: "field-sunlit",
    path: "M400 962 C520 862 700 806 968 794 V962 Z",
    light: "#D4C52E",
    shade: "#A69C25",
    stripes: true,
    speed: 0.08,
  },
  {
    id: "field-left",
    path: "M0 838 C120 800 260 806 360 850 C410 872 440 920 452 962 H0 Z",
    light: "#8C8627",
    shade: "#686A26",
    stripes: true,
    speed: 0.05,
  },
];

const labelClass = "text-[1.75cqw] leading-none";

// A barcode drawn from fixed bar widths, so it is the same on every render.
const bars = [3, 1, 2, 1, 4, 1, 1, 3, 2, 1, 1, 2, 3, 1, 2, 4, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 4, 1, 2, 2, 1, 3, 1];
const barPositions = bars.map((_, index) => bars.slice(0, index).reduce((sum, previous) => sum + previous + 1, 0));

function Barcode() {
  return (
    <svg aria-hidden viewBox="0 0 120 30" preserveAspectRatio="none" className="h-full w-full" fill="currentColor">
      {bars.map((width, index) =>
        index % 2 === 0 ? <rect key={index} x={barPositions[index]} y="0" width={width} height="30" /> : null,
      )}
    </svg>
  );
}

// One cut-paper hill: a hard-edged shape lit from its ridge, with photographed grass blended over
// the colour and, on the fields, faint mowing stripes. A soft shadow falls on the hill behind.
function HillShape(props: { hill: Hill }) {
  const { hill } = props;
  const gradientId = `hill-road-gradient-${hill.id}`;
  const grassId = `hill-road-grass-${hill.id}`;
  const stripesId = `hill-road-stripes-${hill.id}`;

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${sceneBox.width} ${sceneBox.height}`}
      className="absolute inset-0 size-full drop-shadow-[0_-0.3cqw_0.6cqw_rgb(60_58_14/0.3)]"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor={hill.light} />
          <stop offset="0.6" stopColor={hill.shade} />
          <stop offset="1" stopColor={hill.shade} />
        </linearGradient>
        <pattern id={grassId} width="700" height="408" patternUnits="userSpaceOnUse">
          <image href={grass.src} width="700" height="408" preserveAspectRatio="none" />
        </pattern>
        <pattern id={stripesId} width="46" height="46" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
          <rect width="23" height="46" fill="#2A2A08" opacity="0.06" />
        </pattern>
      </defs>
      <g className="isolate">
        <path d={hill.path} fill={`url(#${gradientId})`} />
        <path d={hill.path} fill={`url(#${grassId})`} className="mix-blend-overlay" opacity="0.38" />
        {hill.stripes && <path d={hill.path} fill={`url(#${stripesId})`} />}
      </g>
    </svg>
  );
}

// The poster is pinned; scrolling lifts the hills into place, each at its own speed, while the
// title climbs out from behind them and the vehicle drives along the road. The fields in front move only a little.
// The poster is already in its final, composed state without JavaScript or with reduced motion.
export default function HillRoad(props: Props) {
  const poster = props.poster ?? demoPoster;
  const label = props.label ?? "Hill Road";
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const find = gsap.utils.selector(root);
        const scene = find("[data-scene]")[0] as HTMLElement;

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: settings.pinLength,
            pin: true,
            scrub: settings.scrubSmoothing,
            invalidateOnRefresh: true,
          },
        });

        // Each layer starts lower by its speed and rises to its place: the nearer, the further it travels.
        (find("[data-hill]") as HTMLElement[]).forEach((layer) => {
          const speed = Number(layer.dataset.speed);
          timeline.from(layer, { y: () => scene.offsetHeight * speed, duration: 1 }, 0);
        });

        timeline
          // The title starts hidden behind the hills and climbs out from under them.
          .from(find("[data-title]"), { y: () => scene.offsetHeight * settings.titleRise, duration: 1 }, 0)
          .fromTo(
            find("[data-vehicle]"),
            { xPercent: settings.vehicleFrom },
            { xPercent: settings.vehicleTo, duration: 0.85 },
            0.1,
          )
          // A small bump in the road, twice, so the vehicle feels driven rather than slid.
          .to(find("[data-vehicle]"), { y: -3, duration: 0.05, yoyo: true, repeat: 3, ease: "sine.inOut" }, 0.45)
          .from(find("[data-meta] > *"), { y: 12, autoAlpha: 0, stagger: 0.03, duration: 0.15 }, 0)
          .from(find("[data-footer]"), { y: 20, autoAlpha: 0, duration: 0.2 }, 0.75);
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [poster] },
  );

  return (
    <section ref={root} aria-label={label}>
      <div className="flex h-svh items-center justify-center px-3" style={{ backgroundColor: colors.backdrop }}>
        <article
          className="@container relative aspect-4/5 w-[min(94vw,calc(92svh*0.8))] overflow-hidden shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7)]"
          style={{ backgroundColor: colors.paper, color: colors.ink }}
        >
          <dl data-meta className="absolute inset-x-[5cqw] top-[9cqw] flex justify-between gap-[2cqw]">
            {poster.meta.map((item) => (
              <div key={item.label} className={`${labelClass} flex gap-[0.7cqw]`}>
                <dt className="font-medium">{item.label}</dt>
                <dd className="font-extrabold uppercase before:font-medium before:content-['-_']">{item.value}</dd>
              </div>
            ))}
          </dl>

          {/* The scene uses the hill paths' units (sceneBox); the title sits behind the hills. */}
          <div data-scene className="absolute inset-x-[1.6cqw] top-[10cqw] h-[96.2cqw] overflow-hidden">
            <h2
              data-title
              className="absolute inset-x-0 top-[8cqw] text-center text-[24cqw] leading-none font-black tracking-[-0.04em] lowercase"
              style={{ color: colors.title }}
            >
              {poster.title}
            </h2>

            {hills.map((hill) => (
              <div key={hill.id} data-hill data-speed={hill.speed} className="absolute inset-0">
                <HillShape hill={hill} />
              </div>
            ))}

            <HillShape hill={road} />
            <div
              data-vehicle
              className="absolute"
              style={{
                left: `${(vehiclePlace.left / sceneBox.width) * 100}%`,
                width: `${(vehiclePlace.width / sceneBox.width) * 100}%`,
                bottom: `${100 - (vehiclePlace.baseline / sceneBox.height) * 100}%`,
              }}
            >
              <Image
                src={poster.vehicle.image}
                alt={poster.vehicle.alt}
                sizes="(min-width: 768px) 30vw, 45vw"
                className="w-full select-none drop-shadow-[0_0.3cqw_0.2cqw_rgb(40_36_10/0.45)]"
                draggable={false}
              />
            </div>

            {ground.map((hill) => (
              <div key={hill.id} data-hill data-speed={hill.speed} className="absolute inset-0">
                <HillShape hill={hill} />
              </div>
            ))}
          </div>

          <div data-footer className="absolute inset-x-0 top-[107.5cqw] bottom-[2.5cqw] flex flex-col items-center">
            <p className={`${labelClass} text-center`}>
              Poster No. <span className="mt-[0.6cqw] block tabular-nums">{poster.number}</span>
            </p>
            <p className="mt-[1.6cqw] text-[3.4cqw] leading-none font-extrabold tracking-[0.3em] uppercase">{poster.headline}</p>
            <div className="mt-auto h-[4.6cqw] w-[32cqw]">
              <Barcode />
            </div>
          </div>

          {/* Print finish: a warm wash, paper fibres with film grain and dust, and darker edges. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#F0D890] opacity-15 mix-blend-multiply" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-cover mix-blend-multiply"
            style={{ backgroundImage: `url(${printTexture.src})` }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgb(150_110_40/0.22))]"
          />
        </article>
      </div>
    </section>
  );
}
