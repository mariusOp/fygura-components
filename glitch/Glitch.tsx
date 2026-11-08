"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

gsap.registerPlugin(useGSAP);

export type GlitchLine = {
  text: string;
  caption: string;
};

type Props = {
  lines?: GlitchLine[];
};

const demoLines: GlitchLine[] = [
  { text: "SIGNAL", caption: "Loud and clear" },
  { text: "NO SIGNAL", caption: "Lost somewhere in the static" },
  { text: "REBOOT", caption: "Turn it off and on again" },
  { text: "ONLINE", caption: "Back in the loop" },
];

function formatNumber(value: number) {
  return String(value).padStart(2, "0");
}

type Layers = {
  bands: HTMLElement[];
  ghosts: HTMLElement[];
  top: HTMLElement;
  bottom: HTMLElement;
};

type GhostSettings = {
  offsetX: number;
  offsetY: number;
  stepMin: number;
  stepMax: number;
};

const config = {
  bandCount: 5,
  entryDuration: 0.6,
  entryStagger: 0.09,
  entryOvershoot: "back.out(1.8)",
  lineDuration: 5.5,
  hoverDuration: 1,
  hoverPower: 2.2,
  maxStripes: 4,
  maxBlur: 6,
  maxBlurHover: 12,
  jump: 20,
  weights: [100, 300, 500, 700],
  opacities: [0.1, 0.4, 0.8],
  ghosts: [
    { offsetX: 10, offsetY: 15, stepMin: 0.07, stepMax: 0.3 },
    { offsetX: -5, offsetY: -10, stepMin: 0.1, stepMax: 0.42 },
  ] as GhostSettings[],
  shadow:
    "calc(var(--glitch-k) * -8) calc(var(--glitch-k) * 10) 0 var(--glitch-accent-current), calc(var(--glitch-k) * 8) calc(var(--glitch-k) * -10) 0 var(--glitch-warm-current)",
};

function createLayer(base: HTMLElement, color?: string) {
  const layer = base.cloneNode(true) as HTMLElement;
  layer.removeAttribute("data-base");
  layer.dataset.layer = "";
  layer.style.position = "absolute";
  layer.style.inset = "0";
  layer.style.pointerEvents = "none";
  if (color) layer.style.color = color;
  return layer;
}

function createStripePath() {
  const points: string[] = [];
  const stripeCount = gsap.utils.random(2, config.maxStripes, 1);
  for (let stripe = 0; stripe < stripeCount; stripe += 1) {
    const top = gsap.utils.random(0, 90);
    const bottom = Math.min(100, top + gsap.utils.random(6, 28));
    points.push(`-10% ${top}%`, `110% ${top}%`, `110% ${bottom}%`, `-10% ${bottom}%`);
  }
  return `polygon(${points.join(",")})`;
}

export default function Glitch(props: Props) {
  const lines = props.lines ?? demoLines;
  const firstLine = lines[0];
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;

      const wordElement = section.querySelector<HTMLElement>("[data-word]");
      const baseElement = section.querySelector<HTMLElement>("[data-base]");
      const captionElement = section.querySelector<HTMLElement>("[data-caption]");
      const counterElement = section.querySelector<HTMLElement>("[data-counter]");
      const announcerElement = section.querySelector<HTMLElement>("[data-announcer]");
      if (!wordElement || !baseElement || !captionElement || !counterElement || !announcerElement) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let index = 0;
      let power = 1;
      let entering = false;
      let timeline: gsap.core.Timeline | null = null;
      let ambient: gsap.core.Timeline | null = null;
      let nextCall: gsap.core.Tween | null = null;
      let hoverCall: gsap.core.Tween | null = null;
      let ghostCalls: gsap.core.Tween[] = [];
      let layers: Layers | null = null;

      const allLayers = () => (layers ? [...layers.bands, ...layers.ghosts, layers.top, layers.bottom] : []);

      const buildLayers = (text: string) => {
        wordElement.replaceChildren(baseElement);
        baseElement.textContent = text;

        const bands = Array.from({ length: config.bandCount }, (_, band) => {
          const element = createLayer(baseElement);
          const top = band === 0 ? -20 : (band * 100) / config.bandCount;
          const bottom = band === config.bandCount - 1 ? -20 : 100 - ((band + 1) * 100) / config.bandCount;
          element.style.clipPath = `inset(${top}% -10% ${bottom}% -10%)`;
          element.style.textShadow = config.shadow;
          return element;
        });
        const ghosts = config.ghosts.map(() => createLayer(baseElement, "var(--glitch-accent-current)"));
        const top = createLayer(baseElement, "var(--glitch-accent-current)");
        const bottom = createLayer(baseElement, "var(--glitch-warm-current)");
        top.style.clipPath = "inset(-20% -10% 67% -10%)";
        bottom.style.clipPath = "inset(67% -10% -20% -10%)";

        layers = { bands, ghosts, top, bottom };
        wordElement.append(...allLayers());
        gsap.set(allLayers(), { autoAlpha: 0 });
      };

      const clean = () => {
        gsap.set(allLayers(), { autoAlpha: 0, x: 0, y: 0, skewX: 0, filter: "none" });
        gsap.set(baseElement, { opacity: 1, visibility: "visible" });
        gsap.set(wordElement, { x: 0, skewX: 0 });
      };

      const killTimers = () => {
        nextCall?.kill();
        nextCall = null;
      };

      const stopAmbient = () => {
        ghostCalls.forEach((call) => call.kill());
        ghostCalls = [];
        ambient?.kill();
        ambient = null;
        hoverCall?.kill();
        hoverCall = null;
        power = 1;
        clean();
      };

      const runGhost = (ghost: HTMLElement, settings: GhostSettings, position: number) => {
        const frame = () => {
          const silent = Math.random() < 0.3;
          const side = Math.random() < 0.5 ? 0 : 1;
          const maxBlur = power > 1 ? config.maxBlurHover : config.maxBlur;
          gsap.set(ghost, {
            clipPath: createStripePath(),
            autoAlpha: silent ? 0 : gsap.utils.random(config.opacities),
            x: (settings.offsetX + side * gsap.utils.random(-config.jump, config.jump)) * power,
            y: (settings.offsetY + side * gsap.utils.random(-config.jump, config.jump)) * power,
            fontWeight: gsap.utils.random(config.weights),
            filter: `blur(${gsap.utils.random(0, maxBlur)}px)`,
          });
          if (power > 1 && position === 0) {
            gsap.set(wordElement, { x: gsap.utils.random(-6, 6), skewX: gsap.utils.random(-6, 6) });
          }
          ghostCalls[position] = gsap.delayedCall(
            gsap.utils.random(settings.stepMin, settings.stepMax) / power,
            frame,
          );
        };
        frame();
      };

      const buildAmbient = (current: Layers) => {
        const tl = gsap.timeline({ repeat: -1 });
        [0, 1].forEach((cycle) => {
          const sign = cycle === 0 ? 1 : -1;
          tl.set(baseElement, { visibility: "hidden" }, cycle);
          current.bands.forEach((band, position) => {
            const direction = position % 2 === 0 ? -sign : sign;
            tl.set(band, { autoAlpha: 1, x: direction * 8, "--glitch-k": "1px" }, cycle);
            tl.to(band, { x: 0, "--glitch-k": "0px", duration: 0.2, ease: "power2.out" }, cycle);
          });
          tl.set(current.bands, { autoAlpha: 0 }, cycle + 0.2);
          tl.set(baseElement, { visibility: "visible" }, cycle + 0.2);

          const jitterStart = cycle + 0.6;
          tl.set([current.top, current.bottom], { autoAlpha: 1 }, jitterStart);
          tl.set(wordElement, { x: 2, skewX: 5 }, jitterStart);
          tl.set(current.top, { x: 13, y: -1, skewX: -13 }, jitterStart);
          tl.set(current.bottom, { x: -22, y: 5, skewX: 21 }, jitterStart);
          tl.set(wordElement, { x: -2, skewX: 0 }, jitterStart + 0.04);
          tl.set(current.top, { x: 8, skewX: -8 }, jitterStart + 0.06);
          tl.set(current.bottom, { x: -12, skewX: 10 }, jitterStart + 0.06);
          tl.set([current.top, current.bottom], { autoAlpha: 0 }, jitterStart + 0.12);
          tl.set(wordElement, { x: 0, skewX: 0 }, jitterStart + 0.12);
        });
        tl.set({}, {}, 2);
        return tl;
      };

      const startAmbient = () => {
        if (!layers) return;
        config.ghosts.forEach((settings, position) => runGhost(layers!.ghosts[position], settings, position));
        ambient = buildAmbient(layers);
      };

      const settle = () => {
        entering = false;
        timeline = null;
        if (document.hidden) return;
        if (!reduced) startAmbient();
        nextCall = gsap.delayedCall(config.lineDuration, goNext);
      };

      const showProgress = () => {
        const { text, caption } = lines[index];
        const number = String(index + 1).padStart(2, "0");
        const total = String(lines.length).padStart(2, "0");
        counterElement.textContent = `${number} / ${total}`;
        announcerElement.textContent = text;
        gsap.to(captionElement, {
          opacity: 0,
          duration: 0.15,
          onComplete: () => {
            captionElement.textContent = caption;
            gsap.to(captionElement, { opacity: 1, duration: 0.25 });
          },
        });
      };

      const beginTransition = () => {
        killTimers();
        stopAmbient();
        timeline?.kill();
        entering = true;
      };

      const enter = () => {
        beginTransition();
        buildLayers(lines[index].text);
        if (!layers) return;
        const next = gsap.timeline({ onComplete: settle });
        timeline = next;
        gsap.set(baseElement, { visibility: "hidden" });
        layers.bands.forEach((band, position) => {
          const direction = position % 2 === 0 ? -1 : 1;
          const start = position * config.entryStagger;
          next.set(band, { autoAlpha: 1 }, start);
          next.fromTo(
            band,
            { xPercent: direction * 45, "--glitch-k": "1px" },
            { xPercent: 0, "--glitch-k": "0px", duration: config.entryDuration, ease: config.entryOvershoot },
            start,
          );
        });
        next.call(clean);
      };

      const crossfade = () => {
        beginTransition();
        const next = gsap.timeline({ onComplete: settle });
        timeline = next;
        next.to(wordElement, { opacity: 0, duration: 0.2 });
        next.call(() => {
          baseElement.textContent = lines[index].text;
        });
        next.to(wordElement, { opacity: 1, duration: 0.3 });
      };

      function goNext() {
        index = (index + 1) % lines.length;
        showProgress();
        if (reduced) crossfade();
        else enter();
      }

      const hoverGlitch = () => {
        if (reduced || entering || power > 1) return;
        power = config.hoverPower;
        hoverCall = gsap.delayedCall(config.hoverDuration, () => {
          power = 1;
          gsap.set(wordElement, { x: 0, skewX: 0 });
        });
      };

      const onFocus = () => {
        if (section.matches(":focus-visible")) hoverGlitch();
      };

      const onPointerEnter = (event: PointerEvent) => {
        if (event.pointerType === "mouse") hoverGlitch();
      };

      const onKey = (event: KeyboardEvent) => {
        if (event.code !== "Space" && event.code !== "ArrowRight") return;
        event.preventDefault();
        goNext();
      };

      const onVisibility = () => {
        if (document.hidden) {
          killTimers();
          stopAmbient();
          return;
        }
        if (!entering && !nextCall) {
          if (!reduced) buildLayers(lines[index].text);
          settle();
        }
      };

      if (reduced) settle();
      else enter();

      section.addEventListener("click", goNext);
      section.addEventListener("keydown", onKey);
      section.addEventListener("focus", onFocus);
      section.addEventListener("pointerenter", onPointerEnter);
      document.addEventListener("visibilitychange", onVisibility);

      return () => {
        killTimers();
        stopAmbient();
        timeline?.kill();
        section.removeEventListener("click", goNext);
        section.removeEventListener("keydown", onKey);
        section.removeEventListener("focus", onFocus);
        section.removeEventListener("pointerenter", onPointerEnter);
        document.removeEventListener("visibilitychange", onVisibility);
      };
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      tabIndex={0}
      aria-label="Glitch"
      className="relative h-screen w-full cursor-pointer overflow-hidden bg-[var(--glitch-bg-current)] text-[var(--glitch-ink-current)] outline-none select-none [--glitch-accent-current:var(--glitch-accent,#2F43FF)] [--glitch-bg-current:var(--glitch-bg,#EEEEE8)] [--glitch-ink-current:var(--glitch-ink,#0C0C0C)] [--glitch-warm-current:var(--glitch-warm,#D92D20)] dark:[--glitch-accent-current:var(--glitch-accent-dark,#6B78FF)] dark:[--glitch-bg-current:var(--glitch-bg-dark,#0C0C0C)] dark:[--glitch-ink-current:var(--glitch-ink-dark,#F2F2EC)] dark:[--glitch-warm-current:var(--glitch-warm-dark,#F97066)]"
    >
      <div className="absolute inset-x-0 top-0 flex items-center justify-end border-b-2 border-[var(--glitch-ink-current)] px-5 py-4 font-mono text-[11px] tracking-[0.2em] uppercase md:px-8 md:text-xs">
        <span data-counter className="tabular-nums">
          {formatNumber(1)} / {formatNumber(lines.length)}
        </span>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-4 md:gap-12">
        <div
          data-word
          aria-hidden="true"
          className="relative grid w-full justify-items-center text-center text-[44px] leading-[0.9] font-black tracking-[-0.04em] whitespace-nowrap uppercase sm:text-[72px] md:text-[96px] xl:text-[160px]"
        >
          <span data-base style={{ gridArea: "1 / 1" }}>
            {firstLine.text}
          </span>
        </div>
        <span data-announcer aria-live="polite" className="sr-only">
          {firstLine.text}
        </span>

        <p
          data-caption
          className="border-2 border-[var(--glitch-ink-current)] bg-[var(--glitch-lime,#C8F31D)] px-4 py-2 font-mono text-[11px] tracking-[0.16em] text-[#0C0C0C] uppercase md:text-xs"
        >
          {firstLine.caption}
        </p>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t-2 border-[var(--glitch-ink-current)] px-5 py-4 md:px-8">
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase md:text-xs">Hover to glitch</span>
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase md:text-xs">Click for next</span>
      </div>
    </section>
  );
}
