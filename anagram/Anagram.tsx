"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

gsap.registerPlugin(useGSAP);

export type AnagramWord = {
  word: string;
  caption: string;
};

type Props = {
  words?: AnagramWord[];
};

const demoWords: AnagramWord[] = [
  { word: "LISTEN", caption: "Pay attention" },
  { word: "SILENT", caption: "Not a sound" },
  { word: "ENLIST", caption: "Sign up for the cause" },
  { word: "TINSEL", caption: "Shine on a tree" },
  { word: "INLETS", caption: "Small bays on a coast" },
];

const config = {
  duration: 1.35,
  pause: 1.6,
  stagger: 0.07,
  arcRatio: 0.35,
  minArc: 18,
  maxArc: 110,
  perspective: 800,
  fragments: 3,
};

function createLetter(character: string) {
  const letter = document.createElement("span");
  letter.dataset.letter = "";
  letter.dataset.char = character;
  letter.className = "inline-block will-change-transform";
  letter.textContent = character;
  return letter;
}

function formatNumber(value: number) {
  return String(value).padStart(2, "0");
}

export default function Anagram(props: Props) {
  const words = props.words ?? demoWords;
  const firstWord = words[0];
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;

      const wordElement = section.querySelector<HTMLElement>("[data-word]");
      const captionElement = section.querySelector<HTMLElement>("[data-caption]");
      const counterElement = section.querySelector<HTMLElement>("[data-counter]");
      const announcerElement = section.querySelector<HTMLElement>("[data-announcer]");
      const dots = Array.from(section.querySelectorAll<HTMLElement>("[data-dot]"));
      if (!wordElement || !captionElement || !counterElement || !announcerElement) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let letters = Array.from(wordElement.querySelectorAll<HTMLElement>("[data-letter]"));
      let index = 0;
      let timeline: gsap.core.Timeline | null = null;
      let autoplay: gsap.core.Tween | null = null;
      let queued = false;
      let breathing: gsap.core.Tween | null = null;
      const underlineElement = section.querySelector<HTMLElement>("[data-underline]");

      const showProgress = () => {
        const { word } = words[index];
        const number = String(index + 1).padStart(2, "0");
        const total = String(words.length).padStart(2, "0");
        counterElement.textContent = `${number} / ${total}`;
        announcerElement.textContent = word;
        dots.forEach((dot, dotIndex) => {
          dot.dataset.active = String(dotIndex === index);
        });
      };

      const swapCaption = () => {
        captionElement.textContent = words[index].caption;
      };

      const matchLetters = (nextWord: string) => {
        const available = [...letters];
        const matched = nextWord.split("").map((character) => {
          const position = available.findIndex((letter) => letter.dataset.char === character);
          if (position === -1) return null;
          return available.splice(position, 1)[0];
        });
        return { matched, leaving: available };
      };

      const detachLeavingLetters = (leaving: HTMLElement[]) => {
        const wordBox = wordElement.getBoundingClientRect();
        const boxes = leaving.map((letter) => letter.getBoundingClientRect());
        leaving.forEach((letter, position) => {
          const box = boxes[position];
          gsap.set(letter, {
            position: "absolute",
            left: box.left - wordBox.left,
            top: box.top - wordBox.top,
          });
        });
      };

      const readColors = () => ({
        text: getComputedStyle(wordElement).color,
        accent: getComputedStyle(section).getPropertyValue("--anagram-accent-current").trim(),
      });

      const travel = (letter: HTMLElement, distance: number, rank: number, side: number, tl: gsap.core.Timeline) => {
        const colors = readColors();
        const arc = gsap.utils.clamp(config.minArc, config.maxArc, Math.abs(distance) * config.arcRatio) * side;
        const direction = distance > 0 ? 1 : -1;
        gsap.set(letter, { x: distance, transformPerspective: config.perspective, color: colors.text });
        tl.to(
          letter,
          {
            x: 0,
            duration: config.duration,
            ease: "power3.inOut",
            keyframes: {
              y: [0, arc, 5, 0],
              rotation: [0, 10 * direction * side, -2, 0],
              rotationX: [0, 16 * side, -3, 0],
              rotationY: [0, -22 * direction, 4, 0],
              scale: [1, 1.1, 0.97, 1],
              filter: ["blur(0px)", "blur(4px)", "blur(0px)", "blur(0px)"],
              color: [colors.text, colors.accent, colors.accent, colors.text],
              easeEach: "sine.inOut",
            },
            onComplete: () => {
              gsap.set(letter, { clearProps: "transform,filter,color" });
            },
          },
          rank * config.stagger,
        );
      };

      const breakApart = (letter: HTMLElement, order: number, tl: gsap.core.Timeline) => {
        const sliceSize = 100 / config.fragments;
        for (let slice = 0; slice < config.fragments; slice += 1) {
          const fragment = letter.cloneNode(true) as HTMLElement;
          const top = slice * sliceSize;
          const bottom = 100 - (slice + 1) * sliceSize;
          fragment.style.clipPath = `inset(${top}% -5% ${bottom}% -5%)`;
          wordElement.append(fragment);
          tl.to(
            fragment,
            {
              x: gsap.utils.random(-36, 36),
              y: gsap.utils.random(110, 190),
              rotation: gsap.utils.random(-50, 50),
              opacity: 0,
              filter: "blur(6px)",
              duration: gsap.utils.random(0.8, 1.1),
              ease: "power2.in",
              onComplete: () => fragment.remove(),
            },
            order * 0.04 + slice * 0.05,
          );
        }
        letter.remove();
      };

      const riseIn = (letter: HTMLElement, order: number, tl: gsap.core.Timeline) => {
        gsap.set(letter, { y: 90, opacity: 0, clipPath: "inset(100% -10% -10% -10%)" });
        tl.to(
          letter,
          {
            y: 0,
            opacity: 1,
            clipPath: "inset(0% -10% -10% -10%)",
            duration: 1,
            ease: "power3.out",
            onComplete: () => {
              gsap.set(letter, { clearProps: "clipPath,opacity,transform" });
            },
          },
          0.5 + order * config.stagger,
        );
      };

      const rearrange = (tl: gsap.core.Timeline) => {
        const nextWord = words[index].word;
        const firstBoxes = new Map(letters.map((letter) => [letter, letter.getBoundingClientRect()]));
        const { matched, leaving } = matchLetters(nextWord);

        detachLeavingLetters(leaving);
        const nextLetters = matched.map((letter, position) => letter ?? createLetter(nextWord[position]));
        wordElement.append(...nextLetters);

        const travellers: { letter: HTMLElement; distance: number; side: number }[] = [];
        nextLetters.forEach((letter, position) => {
          const firstBox = firstBoxes.get(letter);
          if (!firstBox) {
            riseIn(letter, position, tl);
            return;
          }
          const distance = firstBox.left - letter.getBoundingClientRect().left;
          travellers.push({ letter, distance, side: position % 2 === 0 ? -1 : 1 });
        });
        travellers.sort((first, second) => Math.abs(first.distance) - Math.abs(second.distance));
        travellers.forEach((traveller, rank) => travel(traveller.letter, traveller.distance, rank, traveller.side, tl));
        leaving.forEach((letter, position) => breakApart(letter, position, tl));
        letters = nextLetters;
      };

      const crossfade = (tl: gsap.core.Timeline) => {
        tl.to(wordElement, { opacity: 0, duration: 0.2 }).call(() => {
          wordElement.replaceChildren(...words[index].word.split("").map(createLetter));
          letters = Array.from(wordElement.querySelectorAll<HTMLElement>("[data-letter]"));
        });
        tl.to(wordElement, { opacity: 1, duration: 0.2 });
      };

      const scheduleNext = () => {
        autoplay?.kill();
        autoplay = gsap.delayedCall(config.pause, goNext);
      };

      const startBreathing = () => {
        if (reduced) return;
        breathing = gsap.to(wordElement, { y: -2, duration: 1.4, ease: "sine.inOut", repeat: -1, yoyo: true });
      };

      const stopBreathing = () => {
        breathing?.kill();
        breathing = null;
        gsap.set(wordElement, { y: 0 });
      };

      const finish = () => {
        timeline = null;
        startBreathing();
        if (queued) {
          queued = false;
          goNext();
          return;
        }
        if (!document.hidden) scheduleNext();
      };

      function goNext() {
        autoplay?.kill();
        autoplay = null;
        if (timeline) {
          queued = true;
          return;
        }
        index = (index + 1) % words.length;
        stopBreathing();
        showProgress();

        timeline = gsap.timeline({ onComplete: finish });
        if (reduced) crossfade(timeline);
        else rearrange(timeline);
        if (!reduced && underlineElement) {
          timeline.fromTo(
            underlineElement,
            { scaleX: 0, transformOrigin: "left center" },
            { scaleX: 1, duration: 1, ease: "power3.inOut" },
            0.4,
          );
        }
        timeline.to(captionElement, { opacity: 0, duration: 0.2 }, 0);
        timeline.call(swapCaption, undefined, 0.2);
        timeline.to(captionElement, { opacity: 1, duration: 0.3 }, 0.25);
      }

      const onKey = (event: KeyboardEvent) => {
        if (event.code !== "Space" && event.code !== "ArrowRight") return;
        event.preventDefault();
        goNext();
      };

      const onVisibility = () => {
        if (document.hidden) {
          autoplay?.kill();
          autoplay = null;
          return;
        }
        if (!timeline && !autoplay) scheduleNext();
      };

      startBreathing();
      scheduleNext();
      section.addEventListener("click", goNext);
      section.addEventListener("keydown", onKey);
      document.addEventListener("visibilitychange", onVisibility);

      return () => {
        autoplay?.kill();
        breathing?.kill();
        timeline?.kill();
        section.removeEventListener("click", goNext);
        section.removeEventListener("keydown", onKey);
        document.removeEventListener("visibilitychange", onVisibility);
      };
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      tabIndex={0}
      aria-label="Anagram"
      className="relative h-screen w-full cursor-pointer overflow-hidden bg-[var(--anagram-bg-current)] text-[var(--anagram-ink-current)] outline-none select-none [--anagram-accent-current:var(--anagram-accent,#2F43FF)] [--anagram-bg-current:var(--anagram-bg,#EEEEE8)] [--anagram-ink-current:var(--anagram-ink,#0C0C0C)] dark:[--anagram-accent-current:var(--anagram-accent-dark,#6B78FF)] dark:[--anagram-bg-current:var(--anagram-bg-dark,#0C0C0C)] dark:[--anagram-ink-current:var(--anagram-ink-dark,#F2F2EC)]"
    >
      <div className="absolute inset-x-0 top-0 flex items-center justify-end border-b-2 border-[var(--anagram-ink-current)] px-5 py-4 font-mono text-[11px] tracking-[0.2em] uppercase md:px-8 md:text-xs">
        <span data-counter className="tabular-nums">
          {formatNumber(1)} / {formatNumber(words.length)}
        </span>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-4 md:gap-12">
        <div
          data-word
          aria-hidden="true"
          className="relative flex w-full justify-center text-[80px] leading-[0.9] font-black tracking-[-0.04em] whitespace-nowrap uppercase md:text-[120px] xl:text-[170px]"
        >
          {firstWord.word.split("").map((character, index) => (
            <span key={index} data-letter data-char={character} className="inline-block will-change-transform">
              {character}
            </span>
          ))}
        </div>
        <span data-announcer aria-live="polite" className="sr-only">
          {firstWord.word}
        </span>

        <div data-underline className="h-0.5 w-32 bg-[var(--anagram-accent-current)] md:w-56" aria-hidden="true" />

        <p
          data-caption
          className="border-2 border-[var(--anagram-ink-current)] bg-[var(--anagram-lime,#C8F31D)] px-4 py-2 font-mono text-[11px] tracking-[0.16em] text-[#0C0C0C] uppercase md:text-xs"
        >
          {firstWord.caption}
        </p>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t-2 border-[var(--anagram-ink-current)] px-5 py-4 md:px-8">
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase md:text-xs">Click to shuffle</span>
        <ul className="flex gap-2" aria-hidden="true">
          {words.map((item, index) => (
            <li
              key={item.word}
              data-dot
              data-active={index === 0}
              className="size-3 border-2 border-[var(--anagram-ink-current)] bg-transparent data-[active=true]:bg-[var(--anagram-ink-current)]"
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
