"use client";

import { useRef } from "react";
import Image, { type StaticImageData } from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { XIcon } from "lucide-react";
import beetle from "./images/beetle.webp";
import citroen2cv from "./images/citroen-2cv.webp";
import fiat600 from "./images/fiat-600.webp";

gsap.registerPlugin(useGSAP);

export type RetroGarageCar = {
  id: string;
  name: string;
  origin: string;
  years: string;
  summary: string;
  story: string;
  specs: { label: string; value: string }[];
  // Card colour behind this car; keep it dusty so the cream text stays readable.
  color: string;
  // A transparent side view of the car, facing left.
  image: StaticImageData;
  // Real body length; the cars are drawn to scale against each other.
  lengthMm: number;
  credit?: string;
};

type Props = {
  cars?: RetroGarageCar[];
  label?: string;
};

const settings = {
  // Distance between two cars, as a share of the card width.
  carSpacingDesktop: 0.62,
  carSpacingMobile: 0.96,
  // The title travels this share of the car's distance, so it lags behind.
  titleParallax: 0.3,
  slideDuration: 1.1,
  // How far the car tips back when it pulls away, in degrees.
  lean: 4,
};

// Change the colours here.
const colors = { table: "#F1E8DB", ink: "#F6EEE2", sheet: "#FBF8F3", sheetInk: "#2A2622" };

// The title needs a variable font with a "wdth" axis (Archivo, Roboto Flex...); otherwise use any condensed font.
const titleFontClass = "font-normal uppercase [font-variation-settings:'wdth'_62]";
const labelClass = "font-mono text-[max(9px,1.6cqw)] tracking-[0.22em] uppercase md:text-[max(10px,0.9cqw)]";

const demoCars: RetroGarageCar[] = [
  {
    id: "fiat-600",
    name: "Fiat 600",
    origin: "Italy",
    years: "1955–1969",
    summary: "Four real seats, a water-cooled four in the back and the car that took Spain on holiday.",
    story:
      "Dante Giacosa fitted four people into 3.2 metres by putting the engine behind the rear axle. Licensed versions were built in Spain, Yugoslavia and Argentina for decades after Turin stopped.",
    specs: [
      { label: "Engine", value: "633–767 cc four" },
      { label: "Length", value: "3,215 mm" },
      { label: "Built", value: "about 2.7 million" },
    ],
    color: "#97805F",
    image: fiat600,
    lengthMm: 3215,
  },
  {
    id: "citroen-2cv",
    name: "Citroën 2CV",
    origin: "France",
    years: "1948–1990",
    summary: "An umbrella on four wheels, built to cross a ploughed field without breaking a basket of eggs.",
    story:
      "Soft long-travel suspension, a roll-back canvas roof and an air-cooled twin. The two-tone Charleston was one of its last and most loved versions.",
    specs: [
      { label: "Engine", value: "375–602 cc twin" },
      { label: "Length", value: "3,860 mm" },
      { label: "Built", value: "about 3.9 million" },
    ],
    color: "#7A7591",
    image: citroen2cv,
    lengthMm: 3860,
  },
  {
    id: "beetle",
    name: "VW Beetle",
    origin: "Germany",
    years: "1938–2003",
    summary: "A round shape, an air-cooled flat four in the back and a production run of sixty-five years.",
    story:
      "The Type 1 outlived every car of its time. When the last one left the line in Mexico in 2003, more than 21 million had been built.",
    specs: [
      { label: "Engine", value: "1.2–1.6 L flat four" },
      { label: "Length", value: "4,079 mm" },
      { label: "Built", value: "21.5 million" },
    ],
    color: "#6C8370",
    image: beetle,
    lengthMm: 4079,
  },
];

export default function RetroGarage(props: Props) {
  const cars = props.cars ?? demoCars;
  const label = props.label ?? "Retro Garage";
  const root = useRef<HTMLElement>(null);
  const longestCar = Math.max(...cars.map((car) => car.lengthMm));

  // Shorter cars are drawn a little smaller, so the row reads to scale.
  const carScale = (lengthMm: number) => Math.pow(lengthMm / longestCar, 0.6);
  const stopPosition = (index: number) => (cars.length === 1 ? 50 : (index / (cars.length - 1)) * 100);

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;

      const find = gsap.utils.selector(section);
      const card = find("[data-card]")[0] as HTMLElement;
      const slides = find("[data-slide]") as HTMLElement[];
      const stops = find("[data-stop]") as HTMLElement[];
      const details = find("[data-detail]") as HTMLElement[];
      const counter = find("[data-counter]")[0] as HTMLElement;
      const openButton = find("[data-open]")[0] as HTMLElement;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const seconds = (value: number) => (reduceMotion ? 0 : value);

      // The cars loop, so the position can grow past the last car; these keep it in range.
      const offsetFromCenter = gsap.utils.wrap(-slides.length / 2, slides.length / 2);
      const carIndex = gsap.utils.wrap(0, slides.length);

      // "position" is the car in the middle; 1.5 means halfway between the second and the third.
      const slider = { position: 0, lean: 0 };
      let targetPosition = 0;
      let slideTimeline: gsap.core.Timeline | null = null;
      let detailTimeline: gsap.core.Timeline | null = null;

      function carSpacing() {
        const spacing = window.innerWidth >= 768 ? settings.carSpacingDesktop : settings.carSpacingMobile;
        return card.clientWidth * spacing;
      }

      function cardColor() {
        const from = Math.floor(slider.position);
        const progress = slider.position - from;
        return gsap.utils.interpolate(cars[carIndex(from)].color, cars[carIndex(from + 1)].color, progress);
      }

      function showActive(index: number) {
        counter.textContent = String(index + 1).padStart(2, "0");
        stops.forEach((stop, stopIndex) => {
          stop.dataset.active = String(stopIndex === index);
        });
        slides.forEach((slide, slideIndex) => {
          slide.setAttribute("aria-hidden", String(slideIndex !== index));
        });
      }

      // Places every car, title and summary from the current position.
      function render() {
        const spacing = carSpacing();
        card.style.backgroundColor = cardColor();

        slides.forEach((slide, index) => {
          const offset = offsetFromCenter(index - slider.position);
          const visibility = gsap.utils.clamp(0, 1, 1 - Math.abs(offset) * 2.2);

          gsap.set(slide, { zIndex: 10 - Math.round(Math.abs(offset)), autoAlpha: Math.abs(offset) > 1.6 ? 0 : 1 });
          gsap.set(slide.querySelector("[data-car]"), { x: offset * spacing, rotation: slider.lean });
          gsap.set(slide.querySelector("[data-title]"), { x: offset * spacing * settings.titleParallax, autoAlpha: visibility });
          gsap.set(slide.querySelector("[data-summary]"), { y: Math.abs(offset) * 24, autoAlpha: visibility });
        });

        showActive(carIndex(Math.round(slider.position)));
      }

      // The row glides to the new position while the cars tip back and settle with a small bounce.
      function slideTo(position: number) {
        if (detailTimeline) return;
        const direction = Math.sign(position - slider.position);
        targetPosition = position;

        slideTimeline?.kill();
        slideTimeline = gsap
          .timeline({ onUpdate: render })
          .to(slider, { position, duration: seconds(settings.slideDuration), ease: "power3.inOut" }, 0)
          .to(slider, { lean: direction * settings.lean, duration: seconds(0.35), ease: "power2.out" }, 0)
          .to(slider, { lean: 0, duration: seconds(0.9), ease: "elastic.out(1, 0.5)" }, seconds(0.5));
      }

      // Goes the short way round the loop.
      function slideToCar(index: number) {
        const current = carIndex(targetPosition);
        slideTo(targetPosition + offsetFromCenter(index - current));
      }

      function openDetail() {
        if (detailTimeline) return;
        const detail = details[carIndex(targetPosition)];

        detailTimeline = gsap
          .timeline()
          .set(detail, { autoAlpha: 1 })
          .fromTo(
            detail,
            { clipPath: "inset(0% 100% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: seconds(0.8), ease: "power4.inOut" },
          )
          .fromTo(
            detail.querySelector("[data-detail-media]"),
            { clipPath: "inset(0% 100% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: seconds(0.8), ease: "power4.inOut" },
            seconds(0.25),
          )
          .fromTo(
            detail.querySelector("[data-detail-car]"),
            { xPercent: -30, autoAlpha: 0 },
            { xPercent: 0, autoAlpha: 1, duration: seconds(1), ease: "expo.out" },
            seconds(0.6),
          )
          .fromTo(
            detail.querySelectorAll("[data-detail-item]"),
            { y: 20, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: seconds(0.6), stagger: seconds(0.07), ease: "power3.out" },
            seconds(0.55),
          );

        openButton.setAttribute("aria-expanded", "true");
        detail.querySelector<HTMLElement>("[data-close]")?.focus({ preventScroll: true });
      }

      // Plays the opening backwards, a little faster.
      function closeDetail() {
        if (!detailTimeline) return;
        detailTimeline
          .timeScale(1.6)
          .reverse()
          .eventCallback("onReverseComplete", () => {
            detailTimeline?.kill();
            detailTimeline = null;
            gsap.set(details, { autoAlpha: 0 });
            openButton.setAttribute("aria-expanded", "false");
            openButton.focus({ preventScroll: true });
          });
      }

      // Dragging moves the row with the pointer; letting go glides to the nearest car.
      const drag = { active: false, startX: 0, startPosition: 0 };

      function startDrag(event: PointerEvent) {
        const target = event.target as HTMLElement;
        if (detailTimeline || target.closest("button")) return;
        slideTimeline?.kill();
        drag.active = true;
        drag.startX = event.clientX;
        drag.startPosition = slider.position;
      }

      function moveDrag(event: PointerEvent) {
        if (!drag.active) return;
        slider.position = drag.startPosition - (event.clientX - drag.startX) / carSpacing();
        render();
      }

      function endDrag() {
        if (!drag.active) return;
        drag.active = false;
        slideTo(Math.round(slider.position));
      }

      function onKeyDown(event: KeyboardEvent) {
        if (event.key === "ArrowLeft") slideTo(targetPosition - 1);
        if (event.key === "ArrowRight") slideTo(targetPosition + 1);
        if (event.key === "Escape") closeDetail();
      }

      // Every listener is added through here, so the cleanup can remove them all.
      const removeListeners: (() => void)[] = [];
      function listen<EventType extends Event>(target: EventTarget, type: string, handler: (event: EventType) => void) {
        target.addEventListener(type, handler as EventListener);
        removeListeners.push(() => target.removeEventListener(type, handler as EventListener));
      }

      stops.forEach((stop, index) => listen(stop, "click", () => slideToCar(index)));
      find("[data-close]").forEach((button) => listen(button, "click", closeDetail));
      listen(openButton, "click", openDetail);
      listen(card, "pointerdown", startDrag);
      listen(window, "pointermove", moveDrag);
      listen(window, "pointerup", endDrag);
      listen(section, "keydown", onKeyDown);
      listen(window, "resize", render);

      gsap.set(details, { autoAlpha: 0 });
      openButton.setAttribute("aria-expanded", "false");
      render();

      return () => removeListeners.forEach((remove) => remove());
    },
    { scope: root, dependencies: [cars] },
  );

  return (
    <section
      ref={root}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label={label}
      className="relative flex h-svh w-full items-center justify-center overflow-clip outline-none select-none"
      style={{ backgroundColor: colors.table }}
    >
      <div className="relative w-[min(92vw,1180px,calc((100svh-140px)*1.6))] max-md:w-[min(92vw,calc((100svh-120px)*0.75))]">
        <span aria-hidden className="absolute inset-x-[6%] bottom-[-5%] h-[14%] rounded-[50%] bg-black/20 blur-2xl" />

        <div
          data-card
          className="@container relative aspect-16/10 touch-pan-y overflow-clip max-md:aspect-3/4"
          style={{ backgroundColor: cars[0].color, color: colors.ink }}
        >
          <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-center px-[4cqw] pt-[4cqw] md:pt-[2.6cqw]">
            <p className={`${labelClass} flex items-center gap-[1.4cqw] opacity-85`}>
              <span aria-hidden className="h-px w-[6cqw] bg-current" />
              {label}
              <span aria-hidden className="h-px w-[6cqw] bg-current" />
            </p>
            <p className={`${labelClass} absolute right-[4cqw] tabular-nums md:right-[3cqw]`}>
              <span data-counter>01</span> / {String(cars.length).padStart(2, "0")}
            </p>
          </header>

          <div className="absolute inset-0 isolate [--car-max:84cqw] md:[--car-max:44cqw]">
            {cars.map((car, index) => (
              <article
                key={car.id}
                data-slide
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${cars.length}: ${car.name}`}
                className={index === 0 ? "absolute inset-0" : "invisible absolute inset-0"}
              >
                <div data-title className="absolute inset-x-0 top-[19%] z-0 text-center md:top-[21%]">
                  <div className={`${labelClass} mx-auto flex w-[84cqw] justify-between opacity-85 md:w-[56cqw]`}>
                    <span>{car.origin}</span>
                    <span className="tabular-nums">{car.years}</span>
                  </div>
                  <h2 className={`${titleFontClass} mt-[1cqw] text-[19cqw] leading-[0.82] whitespace-nowrap md:text-[13cqw]`}>
                    {car.name}
                  </h2>
                </div>

                <div
                  data-car
                  className="absolute bottom-[42%] z-10 origin-bottom md:bottom-[37%]"
                  style={{
                    width: `calc(var(--car-max) * ${carScale(car.lengthMm)})`,
                    left: `calc(50% - var(--car-max) * ${carScale(car.lengthMm) / 2})`,
                  }}
                >
                  <span aria-hidden className="absolute inset-x-[4%] bottom-[-4%] h-[12%] rounded-[50%] bg-black/30 blur-md" />
                  <Image
                    src={car.image}
                    alt={`${car.name}, side view`}
                    priority={index === 0}
                    sizes="(min-width: 768px) 46vw, 88vw"
                    className="relative w-full select-none"
                    draggable={false}
                  />
                </div>

                <p
                  data-summary
                  className="absolute inset-x-[8cqw] bottom-[17%] mx-auto max-w-[60cqw] text-center text-[max(12px,3.2cqw)] leading-snug opacity-90 max-md:max-w-none md:bottom-[15%] md:text-[max(12px,1.2cqw)]"
                >
                  {car.summary}
                </p>
              </article>
            ))}
          </div>

          <nav
            aria-label="Choose a car"
            className="absolute bottom-[33%] left-1/2 z-20 w-[56cqw] -translate-x-1/2 md:bottom-[26%] md:w-[30cqw]"
          >
            <span aria-hidden className="absolute inset-x-0 top-1/2 border-t border-dashed border-current opacity-60" />
            {cars.map((car, index) => (
              <button
                key={car.id}
                type="button"
                data-stop
                aria-label={car.name}
                className="group absolute top-1/2 flex size-7 -translate-1/2 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-current"
                style={{ left: `${stopPosition(index)}%` }}
              >
                <span className="size-1.5 rounded-full bg-current transition-transform group-hover:scale-150" />
                <span
                  aria-hidden
                  className="absolute inset-0.5 scale-50 rounded-full border border-current opacity-0 transition duration-500 group-data-[active=true]:scale-100 group-data-[active=true]:opacity-100"
                />
              </button>
            ))}
          </nav>

          <button
            type="button"
            data-open
            aria-haspopup="dialog"
            className={`${labelClass} absolute bottom-[6%] left-1/2 z-20 -translate-x-1/2 rounded-full px-[3.4cqw] py-[1.6cqw] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current md:bottom-[5%] md:px-[2.2cqw] md:py-[0.9cqw]`}
            style={{ backgroundColor: colors.ink, color: colors.sheetInk }}
          >
            Discover more
          </button>

          {cars.map((car) => (
            <div
              key={car.id}
              data-detail
              role="dialog"
              aria-modal="true"
              aria-label={car.name}
              className="invisible absolute inset-[2.4cqw] z-40 overflow-y-auto shadow-[0_24px_60px_-30px_rgb(0_0_0/0.5)] md:inset-[2cqw] md:overflow-hidden"
              style={{ backgroundColor: colors.sheet, color: colors.sheetInk }}
            >
              <div className="grid min-h-full gap-[3cqw] p-[4cqw] md:h-full md:grid-cols-[1.15fr_1fr] md:p-[3.2cqw]">
                <div
                  data-detail-media
                  className="relative flex aspect-4/3 items-center justify-center overflow-hidden bg-linear-to-b from-[#E9E5DE] to-[#D9D3C9] md:aspect-auto"
                >
                  <div data-detail-car className="relative w-[86%]">
                    <span aria-hidden className="absolute inset-x-[4%] bottom-[-4%] h-[12%] rounded-[50%] bg-black/25 blur-md" />
                    <Image src={car.image} alt="" sizes="(min-width: 768px) 46vw, 90vw" className="relative w-full" draggable={false} />
                  </div>
                  {car.credit ? <span className={`${labelClass} absolute bottom-[4%] left-[5%] opacity-50`}>{car.credit}</span> : null}
                </div>

                <div className="flex flex-col justify-center gap-[2.4cqw] pb-[2cqw] md:gap-[1.6cqw] md:pb-0">
                  <h3 data-detail-item className={`${titleFontClass} pr-10 text-[16cqw] leading-[0.85] md:text-[6.4cqw]`}>
                    {car.name}
                  </h3>
                  <p data-detail-item className={`${labelClass} flex justify-between opacity-60`}>
                    <span>{car.origin}</span>
                    <span className="tabular-nums">{car.years}</span>
                  </p>
                  <p data-detail-item className="text-[max(13px,3.4cqw)] leading-relaxed opacity-80 md:text-[max(12px,1.15cqw)]">
                    {car.story}
                  </p>
                  <dl data-detail-item className="border-t border-current/15">
                    {car.specs.map((spec) => (
                      <div key={spec.label} className="flex justify-between gap-4 border-b border-current/15 py-[1.6cqw] md:py-[0.8cqw]">
                        <dt className={`${labelClass} opacity-55`}>{spec.label}</dt>
                        <dd className="text-right text-[max(12px,3.2cqw)] tabular-nums md:text-[max(12px,1.05cqw)]">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              <button
                type="button"
                data-close
                aria-label="Close"
                className="absolute top-[2cqw] right-[2cqw] flex size-10 items-center justify-center rounded-full transition-transform hover:rotate-90 focus-visible:outline-2 focus-visible:outline-current"
              >
                <XIcon className="size-5" strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
