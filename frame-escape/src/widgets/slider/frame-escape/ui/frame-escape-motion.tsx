"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/shared/lib/gsap";

type Props = { children: ReactNode };

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

export default function FrameEscapeMotion(props: Props) {
  const root = useRef<HTMLElement>(null);

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
    { scope: root },
  );

  return (
    <section
      ref={root}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="Frame Escape"
      className="relative h-screen w-full touch-pan-y overflow-hidden outline-none select-none"
    >
      {props.children}
    </section>
  );
}
