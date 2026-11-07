"use client";

import { useRef } from "react";
import Image, { type StaticImageData } from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import carpetImage from "./images/carpet-floor.webp";
import mountains from "./images/mountains.png";
import sakura from "./images/sakura.webp";
import smoke from "./images/smoke.webp";

gsap.registerPlugin(useGSAP);

export type Frame = {
  title: string;
  category: string;
  description: string;
  image: StaticImageData;
};

const imagePool = [mountains, smoke, sakura];

const texts = [
  {
    title: "Room to Breathe",
    category: "Design",
    description: "Good interfaces leave space. We design layouts where every element has room, so the work stays in focus.",
  },
  {
    title: "Motion with Intent",
    category: "Motion",
    description: "Every animation has a reason: to guide the eye, explain a change or make a moment worth remembering.",
  },
  {
    title: "Built to Last",
    category: "Code",
    description: "Clean Next.js and TypeScript, structured so the next developer can read it, change it and ship it.",
  },
  {
    title: "From Figma to Live",
    category: "Services",
    description: "We turn designs into fast, responsive sites that match the file down to the pixel and the easing.",
  },
  {
    title: "Ready to Launch",
    category: "Templates",
    description: "Animated Next.js templates, made with the same care as client work and ready for your content.",
  },
  {
    title: "Drop-in Motion",
    category: "Components",
    description: "GSAP components for any project: sliders, text effects, page transitions and scroll moments.",
  },
];

const demoFrames: Frame[] = texts.map((text, index) => ({
  ...text,
  image: imagePool[index % imagePool.length],
}));

const config = {
  visibleRange: 3,
  spreadDistance: 1.4,
  arcDrop: 24,
  arcTurn: 14,
  smoothing: 0.08,
  wheelSensitivity: 0.004,
  dragSensitivity: 0.006,
  maxWheelDelta: 120,
  snapDelay: 0.25,
  dragThreshold: 6,
  closeSpeed: 1.4,
};

const ink = "text-[#2b2b2b]";
const imageClass = "pointer-events-none absolute -bottom-[40%] left-1/2 w-[240%] max-w-none -translate-x-1/2";
const navButtonClass =
  "flex size-10 items-center justify-center rounded-full bg-white/80 text-[#2b2b2b] shadow-[0_6px_20px_rgba(0,0,0,0.08)] backdrop-blur transition-transform hover:scale-105";

type Props = { frames?: Frame[] };

export default function FrameEscape({ frames = demoFrames }: Props) {
  const root = useRef<HTMLElement>(null);
  const cards = [...frames, ...frames].map((frame, index) => ({
    ...frame,
    number: String((index % frames.length) + 1).padStart(2, "0"),
  }));
  const total = String(frames.length).padStart(2, "0");
  const startOffset = (index: number) => (index < cards.length / 2 ? index : index - cards.length);

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;

      const q = gsap.utils.selector(section);
      const cards = q("[data-card]") as HTMLElement[];
      const line = q("[data-line]")[0];
      const prevButton = q("[data-prev]")[0];
      const nextButton = q("[data-next]")[0];
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const touch = window.matchMedia("(hover: none)").matches;
      const wrap = gsap.utils.wrap(-cards.length / 2, cards.length / 2);
      const duration = (seconds: number) => (reduced ? 0 : seconds);

      const state = { position: 0, target: 0, spread: 0 };
      const drag = { active: false, startX: 0, lastX: 0 };
      let openTimeline: gsap.core.Timeline | null = null;
      let closing = false;
      let afterClose: (() => void) | null = null;

      const offsetOf = (index: number) => wrap(index - state.position);
      const activeCard = () => cards.find((_, index) => Math.abs(offsetOf(index)) < 0.5) ?? cards[0];
      const isBusy = () => openTimeline !== null || closing;

      const render = () => {
        const cardWidth = cards[0].offsetWidth;
        const step = section.clientWidth * (section.clientWidth >= 768 ? 0.25 : 0.5);
        cards.forEach((card, index) => {
          const offset = offsetOf(index);
          const side = Math.sign(offset) * Math.min(Math.abs(offset), 1);
          gsap.set(card, {
            x: offset * step + side * state.spread * cardWidth * config.spreadDistance,
            y: Math.abs(side) * state.spread * config.arcDrop,
            rotationY: -side * state.spread * config.arcTurn,
            transformPerspective: 1200,
            zIndex: 100 - Math.round(Math.abs(offset) * 10),
            autoAlpha: Math.abs(offset) > config.visibleRange ? 0 : 1,
          });
        });
      };

      const tick = () => {
        const difference = state.target - state.position;
        if (Math.abs(difference) < 0.0005) {
          if (state.position === state.target) return;
          state.position = state.target;
        } else {
          state.position += difference * (reduced ? 1 : config.smoothing);
        }
        render();
      };

      const openFrame = () => {
        if (isBusy()) return;
        const card = activeCard();
        openTimeline = gsap
          .timeline({ onUpdate: render })
          .to(card.querySelector("[data-panel]"), { autoAlpha: 0, duration: duration(0.9), ease: "sine.inOut" }, 0)
          .to(card.querySelector("[data-escape]"), { opacity: 1, duration: duration(1.1), ease: "sine.inOut" }, 0.1)
          .to(state, { spread: 1, duration: duration(0.9), ease: "power2.inOut" }, 0)
          .to(line, { scaleX: 1, duration: duration(0.7), ease: "power3.out" }, duration(0.4))
          .fromTo(
            card.querySelector("[data-caption]"),
            { autoAlpha: 0, y: 12 },
            { autoAlpha: 1, y: 0, duration: duration(0.6), ease: "power3.out" },
            duration(0.55),
          );
      };

      const closeFrame = () => {
        if (!openTimeline) return;
        const timeline = openTimeline;
        openTimeline = null;
        closing = true;
        timeline
          .eventCallback("onReverseComplete", () => {
            timeline.kill();
            closing = false;
            const next = afterClose;
            afterClose = null;
            next?.();
          })
          .timeScale(config.closeSpeed)
          .reverse();
      };

      const snap = gsap.delayedCall(config.snapDelay, () => {
        state.target = Math.round(state.target);
      });

      const moveBy = (amount: number) => {
        if (isBusy()) {
          closeFrame();
          return;
        }
        state.target += amount;
        snap.restart(true);
      };

      const go = (direction: number) => {
        if (isBusy()) {
          afterClose = () => go(direction);
          closeFrame();
          return;
        }
        state.target = Math.round(state.target) + direction;
      };

      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
        const limitedDelta = gsap.utils.clamp(-config.maxWheelDelta, config.maxWheelDelta, delta);
        moveBy(limitedDelta * config.wheelSensitivity);
      };

      const onPointerDown = (event: PointerEvent) => {
        if ((event.target as HTMLElement).closest("button")) return;
        drag.active = true;
        drag.startX = event.clientX;
        drag.lastX = event.clientX;
      };

      const onPointerMove = (event: PointerEvent) => {
        if (!drag.active) return;
        const delta = drag.lastX - event.clientX;
        drag.lastX = event.clientX;
        if (Math.abs(event.clientX - drag.startX) > config.dragThreshold) moveBy(delta * config.dragSensitivity);
      };

      const stopDrag = () => {
        drag.active = false;
      };

      const onKey = (event: KeyboardEvent) => {
        if (event.key === "ArrowLeft") go(-1);
        if (event.key === "ArrowRight") go(1);
      };

      const onPrev = () => go(-1);
      const onNext = () => go(1);

      const cardListeners = cards.map((card) => {
        const enter = () => {
          if (!touch && !drag.active && card === activeCard()) openFrame();
        };
        const leave = () => {
          if (!touch) closeFrame();
        };
        const tap = (event: MouseEvent) => {
          const dragged = Math.abs(event.clientX - drag.startX) > config.dragThreshold;
          if (!touch || dragged || card !== activeCard()) return;
          if (openTimeline) closeFrame();
          else openFrame();
        };
        card.addEventListener("mouseenter", enter);
        card.addEventListener("mouseleave", leave);
        card.addEventListener("click", tap);
        return () => {
          card.removeEventListener("mouseenter", enter);
          card.removeEventListener("mouseleave", leave);
          card.removeEventListener("click", tap);
        };
      });

      gsap.set(line, { scaleX: 0, transformOrigin: "50% 50%" });
      gsap.ticker.add(tick);
      prevButton.addEventListener("click", onPrev);
      nextButton.addEventListener("click", onNext);
      section.addEventListener("wheel", onWheel, { passive: false });
      section.addEventListener("pointerdown", onPointerDown);
      section.addEventListener("pointerleave", stopDrag);
      section.addEventListener("keydown", onKey);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", stopDrag);
      window.addEventListener("resize", render);
      render();

      return () => {
        gsap.ticker.remove(tick);
        snap.kill();
        cardListeners.forEach((removeListeners) => removeListeners());
        prevButton.removeEventListener("click", onPrev);
        nextButton.removeEventListener("click", onNext);
        section.removeEventListener("wheel", onWheel);
        section.removeEventListener("pointerdown", onPointerDown);
        section.removeEventListener("pointerleave", stopDrag);
        section.removeEventListener("keydown", onKey);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", stopDrag);
        window.removeEventListener("resize", render);
      };
    },
    { scope: root, dependencies: [frames.length] },
  );

  return (
    <section
      ref={root}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="Frame Escape"
      className="relative h-screen w-full touch-pan-y overflow-hidden outline-none select-none"
    >
      <div className="absolute inset-0 bg-linear-to-b from-[#f1f1f1] via-[#ececec] to-[#e2e2e2]" aria-hidden="true" />

      <Image
        src={carpetImage}
        alt=""
        priority
        sizes="(min-width: 768px) 100vw, 180vw"
        className="pointer-events-none absolute bottom-0 left-1/2 w-[180vw] max-w-none -translate-x-1/2 translate-y-[12%] md:w-full md:translate-y-[20%]"
      />

      <div
        data-row
        className="absolute inset-x-0 top-[calc(50svh-var(--card-w)*0.6)] h-[calc(var(--card-w)*1.35)] md:top-[19vh] [--card-step:50vw] [--card-w:44vw] md:[--card-step:25vw] md:[--card-w:min(300px,21vw,calc(52svh/1.35))]"
      >
        <span
          data-line
          className="absolute bottom-full left-1/2 z-200 -ml-[calc(var(--card-w)/2)] h-0.5 w-(--card-w) bg-[#d31f22]"
          aria-hidden="true"
        />
        {cards.map((frame, index) => (
          <article
            key={index}
            data-card
            aria-roledescription="slide"
            aria-label={`${frame.title}, ${frame.category}`}
            className="absolute top-0 left-1/2 -ml-[calc(var(--card-w)/2)] h-full w-(--card-w)"
            style={{
              transform: `translateX(calc(var(--card-step) * ${startOffset(index)}))`,
              visibility: Math.abs(startOffset(index)) > config.visibleRange ? "hidden" : undefined,
            }}
          >
            <div
              data-panel
              className="absolute inset-0 overflow-hidden rounded-[3px] bg-white shadow-[0_34px_50px_-18px_rgba(0,0,0,0.38)]"
            >
              <div className={`relative z-10 px-[8%] pt-[8%] ${ink}`}>
                <div className="flex items-center justify-between text-[8px] tracking-[0.25em] uppercase md:text-[9px]">
                  <span className="tabular-nums opacity-50">{frame.number}</span>
                  <span className="opacity-50">{frame.category}</span>
                </div>
                <div className="mt-2 h-px bg-current opacity-15" />
                <h3 className="mt-3 text-[17px] leading-tight font-light tracking-tight md:text-xl">{frame.title}</h3>
              </div>
              <Image src={frame.image} alt="" sizes="480px" className={imageClass} />
              <div className="absolute inset-x-0 bottom-0 h-[16%] bg-linear-to-t from-white via-white/90 to-transparent" />
              <p
                className={`absolute inset-x-[8%] bottom-[5%] z-10 flex justify-between text-[8px] tracking-[0.25em] uppercase opacity-40 md:text-[9px] ${ink}`}
              >
                <span>Fygura</span>
                <span className="tabular-nums">
                  {frame.number} / {total}
                </span>
              </p>
            </div>

            <Image data-escape src={frame.image} alt="" sizes="900px" className={`${imageClass} opacity-10`} />

            <div
              data-caption
              className={`pointer-events-none absolute bottom-[108%] left-1/2 w-[72vw] -translate-x-1/2 text-center opacity-0 md:top-[30%] md:bottom-auto md:left-[150%] md:w-56 md:translate-x-0 md:text-left ${ink}`}
            >
              <p className="text-[10px] tracking-[0.2em] uppercase opacity-50">
                <span className="tabular-nums">{frame.number}</span> — {frame.category}
              </p>
              <p className="mt-2 text-xl font-light tracking-tight md:text-2xl">{frame.title}</p>
              <p className="mt-2 text-xs leading-relaxed opacity-70">{frame.description}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="absolute right-6 bottom-6 flex gap-2 md:right-10 md:bottom-10">
        <button type="button" data-prev aria-label="Previous frame" className={navButtonClass}>
          <ChevronLeftIcon className="size-4" />
        </button>
        <button type="button" data-next aria-label="Next frame" className={navButtonClass}>
          <ChevronRightIcon className="size-4" />
        </button>
      </div>
    </section>
  );
}
