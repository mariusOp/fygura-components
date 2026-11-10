"use client";

import { useRef } from "react";
import Image, { type StaticImageData } from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { LayoutGrid, Rows3 } from "lucide-react";
import blackDress from "./images/black-dress.webp";
import blackHat from "./images/black-hat.webp";
import camelCoat from "./images/camel-coat.webp";
import crouch from "./images/crouch.webp";
import pinstripeSuit from "./images/pinstripe-suit.webp";
import raisedArm from "./images/raised-arm.webp";
import redBackdrop from "./images/red-backdrop.webp";
import whiteShirt from "./images/white-shirt.webp";

gsap.registerPlugin(useGSAP, Flip);

export type LayoutShiftSize = "large" | "wide" | "small";

export type LayoutShiftItem = {
  id: string;
  size: LayoutShiftSize;
  title: string;
  category: string;
  year: string;
  alt: string;
  image: StaticImageData;
};

export type LayoutShiftContent = {
  label: string;
  years: string;
  title: string;
  countLabel: string;
  toggleLabel: string;
};

type Props = {
  items?: LayoutShiftItem[];
  content?: LayoutShiftContent;
};

const demoContent: LayoutShiftContent = {
  label: "Studio archive",
  years: "2024 — 2026",
  title: "Lookbook",
  countLabel: "looks",
  toggleLabel: "Layout",
};

const demoItems: LayoutShiftItem[] = [
  {
    id: "white-shirt",
    size: "large",
    title: "White shirt",
    category: "Editorial",
    year: "2026",
    alt: "Model in an oversized white shirt sitting on a wooden stool in a grey studio",
    image: whiteShirt,
  },
  {
    id: "raised-arm",
    size: "small",
    title: "Raised arm",
    category: "Movement",
    year: "2026",
    alt: "Model in black lifting one arm above her head against a dark backdrop",
    image: raisedArm,
  },
  {
    id: "camel-coat",
    size: "small",
    title: "Camel coat",
    category: "Outerwear",
    year: "2026",
    alt: "Model in a long camel coat posing against a pale studio wall",
    image: camelCoat,
  },
  {
    id: "black-dress",
    size: "small",
    title: "Black dress",
    category: "Portrait",
    year: "2025",
    alt: "Young woman in a short black dress posing against a white background",
    image: blackDress,
  },
  {
    id: "pinstripe-suit",
    size: "small",
    title: "Pinstripe",
    category: "Tailoring",
    year: "2025",
    alt: "Person in a pinstripe suit and sunglasses sitting in a chair",
    image: pinstripeSuit,
  },
  {
    id: "crouch",
    size: "small",
    title: "Crouch",
    category: "Movement",
    year: "2025",
    alt: "Man in a white t-shirt crouching barefoot in a grey studio",
    image: crouch,
  },
  {
    id: "black-hat",
    size: "small",
    title: "Black hat",
    category: "Portrait",
    year: "2024",
    alt: "Woman in a wide black hat in a black and white portrait",
    image: blackHat,
  },
  {
    id: "red-backdrop",
    size: "wide",
    title: "Red room",
    category: "Campaign",
    year: "2024",
    alt: "Four models in dark tailoring standing in front of a deep red backdrop",
    image: redBackdrop,
  },
];

const layouts = [
  { id: "grid", label: "Grid", icon: LayoutGrid },
  { id: "list", label: "List", icon: Rows3 },
];

const config = {
  fadeOutDuration: 0.3,
  flipDuration: 1.2,
  flipEase: "expo.inOut",
  stagger: 0.04,
  captionDuration: 0.8,
  captionDelay: 0.75,
  captionOffset: 24,
  ruleDuration: 1.1,
  ruleDelay: 0.35,
  previewFollow: 0.9,
  previewDuration: 0.9,
  previewStartScale: 0.85,
  previewTilt: 0.4,
  previewMaxTilt: 12,
};

const labelClass = "font-mono text-[11px] leading-none tracking-[0.06em] uppercase md:text-xs";

const displayClass =
  "text-[56px] leading-[0.9] font-extrabold tracking-[-0.03em] uppercase md:text-[104px] xl:text-[150px]";

const toggleButtonClass = `${labelClass} flex cursor-pointer items-center gap-2 border-2 border-[var(--ls-ink-current)] px-4 py-3 transition-colors first:border-r-0 hover:bg-[var(--ls-muted-current)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ls-ring-current)] aria-pressed:bg-[var(--ls-ink-current)] aria-pressed:text-[var(--ls-bg-current)] aria-pressed:hover:bg-[var(--ls-ink-current)]`;

const galleryClass =
  "grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3 group-data-[layout=list]/gallery:grid-cols-1 group-data-[layout=list]/gallery:gap-0";

const sizeClass: Record<LayoutShiftSize, string> = {
  large:
    "group-data-[layout=grid]/gallery:col-span-2 group-data-[layout=grid]/gallery:row-span-2 group-data-[layout=grid]/gallery:aspect-square",
  wide: "group-data-[layout=grid]/gallery:col-span-2 group-data-[layout=grid]/gallery:aspect-[2/1] md:group-data-[layout=grid]/gallery:aspect-auto",
  small: "group-data-[layout=grid]/gallery:aspect-square",
};

const itemClass =
  "group/item relative isolate outline-none transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ls-ring-current)] group-data-[layout=list]/gallery:flex group-data-[layout=list]/gallery:items-center group-data-[layout=list]/gallery:gap-3 group-data-[layout=list]/gallery:px-2 group-data-[layout=list]/gallery:py-4 md:group-data-[layout=list]/gallery:gap-8 md:group-data-[layout=list]/gallery:px-4 md:group-data-[layout=list]/gallery:py-5 group-data-[layout=list]/gallery:hover:text-[var(--ls-bg-current)] group-data-[layout=list]/gallery:focus-visible:text-[var(--ls-bg-current)]";

const fillClass =
  "pointer-events-none absolute inset-0 -z-10 hidden origin-bottom scale-y-0 bg-[var(--ls-ink-current)] transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] group-data-[layout=list]/gallery:block group-hover/item:scale-y-100 group-focus-visible/item:scale-y-100";

const ruleClass =
  "pointer-events-none absolute inset-x-0 top-0 hidden h-0.5 origin-left bg-[var(--ls-ink-current)] group-data-[layout=list]/gallery:block";

const bottomRuleClass =
  "pointer-events-none relative hidden h-0.5 origin-left bg-[var(--ls-ink-current)] group-data-[layout=list]/gallery:block";

const photoClass =
  "overflow-hidden bg-[var(--ls-muted-current)] group-data-[layout=grid]/gallery:absolute group-data-[layout=grid]/gallery:inset-0 group-data-[layout=list]/gallery:relative group-data-[layout=list]/gallery:order-last group-data-[layout=list]/gallery:aspect-square group-data-[layout=list]/gallery:w-14 group-data-[layout=list]/gallery:shrink-0 md:group-data-[layout=list]/gallery:w-20";

const imageClass =
  "size-full object-cover grayscale transition-[filter,scale] duration-[1600ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover/item:scale-[1.03] group-hover/item:grayscale-0 group-focus-visible/item:scale-[1.03] group-focus-visible/item:grayscale-0";

const overlayClass =
  "group-data-[layout=grid]/gallery:pointer-events-none group-data-[layout=grid]/gallery:absolute group-data-[layout=grid]/gallery:bg-[var(--ls-bg-current)] group-data-[layout=grid]/gallery:px-2 group-data-[layout=grid]/gallery:py-1";

const indexClass = `${overlayClass} ${labelClass} group-data-[layout=grid]/gallery:top-3 group-data-[layout=grid]/gallery:left-3 group-data-[layout=list]/gallery:w-6 group-data-[layout=list]/gallery:shrink-0 md:group-data-[layout=list]/gallery:w-16`;

const titleClass = `${overlayClass} group-data-[layout=grid]/gallery:bottom-3 group-data-[layout=grid]/gallery:left-3 group-data-[layout=list]/gallery:min-w-0 group-data-[layout=list]/gallery:flex-1`;

const gridTitleClass =
  "text-[22px] leading-[1.05] font-bold tracking-[-0.01em] uppercase max-md:hidden md:text-[26px] xl:text-[28px] group-data-[layout=list]/gallery:hidden";

const phoneGridTitleClass = `${labelClass} md:hidden group-data-[layout=list]/gallery:hidden`;

const listTitleClass =
  "hidden text-[56px] leading-[0.95] font-extrabold tracking-[-0.02em] uppercase xl:text-[72px] md:group-data-[layout=list]/gallery:block";

const phoneListTitleClass =
  "hidden text-[18px] leading-[0.95] font-extrabold tracking-[-0.02em] uppercase max-md:group-data-[layout=list]/gallery:block";

const metaClass = `${overlayClass} ${labelClass} flex flex-col items-end max-md:group-data-[layout=grid]/gallery:hidden group-data-[layout=grid]/gallery:top-3 group-data-[layout=grid]/gallery:right-3 group-data-[layout=grid]/gallery:flex-row group-data-[layout=grid]/gallery:gap-3 group-data-[layout=list]/gallery:hidden md:group-data-[layout=list]/gallery:flex md:group-data-[layout=list]/gallery:min-w-32`;

const previewClass =
  "pointer-events-none fixed top-0 left-0 z-50 hidden aspect-[4/5] w-64 overflow-hidden bg-[var(--ls-muted-current)] xl:w-80 pointer-fine:group-data-[layout=list]/gallery:block";

function formatIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

export default function LayoutShift(props: Props) {
  const items = props.items ?? demoItems;
  const content = props.content ?? demoContent;
  const itemCount = String(items.length).padStart(2, "0");
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;

      const select = gsap.utils.selector(section);
      const photos = select("[data-photo]");
      const captions = select("[data-caption]");
      const rules = select("[data-rule]");
      const buttons = select("[data-layout-button]");
      const gallery = select("[data-gallery]")[0] as HTMLElement;
      const preview = select("[data-preview]")[0];
      const previewImages = select("[data-preview-image]");
      const motionQuery = gsap.matchMedia();

      motionQuery.add(
        {
          isReduced: "(prefers-reduced-motion: reduce)",
          canHover: "(hover: hover) and (pointer: fine)",
        },
        (context) => {
          const isReduced = Boolean(context.conditions?.isReduced);
          const canHover = Boolean(context.conditions?.canHover);
          const usePreview = canHover && !isReduced;
          let fadeOut: gsap.core.Tween | null = null;
          let lastX = 0;

          gsap.set(preview, { xPercent: -50, yPercent: -50, autoAlpha: 0, scale: config.previewStartScale });
          const moveX = gsap.quickTo(preview, "x", { duration: config.previewFollow, ease: "power3" });
          const moveY = gsap.quickTo(preview, "y", { duration: config.previewFollow, ease: "power3" });
          const tilt = gsap.quickTo(preview, "rotation", { duration: config.previewFollow, ease: "power3" });

          const showPreview = (id: string) => {
            previewImages.forEach((image) => {
              const isActive = image.dataset.previewImage === id;
              gsap.to(image, { autoAlpha: isActive ? 1 : 0, duration: config.previewDuration });
            });
            gsap.to(preview, { autoAlpha: 1, scale: 1, duration: config.previewDuration, ease: "power2.out" });
          };

          const hidePreview = () => {
            gsap.to(preview, { autoAlpha: 0, scale: config.previewStartScale, duration: config.previewDuration, ease: "power2.out" });
          };

          const onPointerMove = (event: PointerEvent) => {
            const speed = (event.clientX - lastX) * config.previewTilt;
            lastX = event.clientX;
            moveX(event.clientX);
            moveY(event.clientY);
            tilt(gsap.utils.clamp(-config.previewMaxTilt, config.previewMaxTilt, speed));
          };

          const onPointerOver = (event: PointerEvent) => {
            if (section.dataset.layout !== "list") return;
            const item = (event.target as HTMLElement).closest<HTMLElement>("[data-item]");
            if (item?.dataset.item) showPreview(item.dataset.item);
          };

          const stopAnimations = () => {
            fadeOut?.kill();
            Flip.killFlipsOf(photos);
            gsap.killTweensOf([...captions, ...rules]);
          };

          const drawRules = () => {
            gsap.fromTo(
              rules,
              { scaleX: 0 },
              {
                scaleX: 1,
                duration: config.ruleDuration,
                delay: config.ruleDelay,
                ease: "expo.inOut",
                stagger: config.stagger,
              },
            );
          };

          const revealCaptions = () => {
            gsap.fromTo(
              captions,
              { autoAlpha: 0, y: config.captionOffset },
              {
                autoAlpha: 1,
                y: 0,
                duration: config.captionDuration,
                delay: config.captionDelay,
                ease: "power3.out",
                stagger: config.stagger / 2,
              },
            );
          };

          const switchLayout = (layout: string) => {
            const state = Flip.getState(photos);
            section.dataset.layout = layout;

            Flip.from(state, {
              scale: true,
              zIndex: 20,
              duration: config.flipDuration,
              ease: config.flipEase,
              stagger: { each: config.stagger, from: layout === "list" ? "start" : "end" },
            });

            if (layout === "list") drawRules();
            revealCaptions();
          };

          const applyLayout = (layout: string) => {
            if (section.dataset.layout === layout) return;

            buttons.forEach((button) => {
              button.setAttribute("aria-pressed", String(button.dataset.layoutButton === layout));
            });
            hidePreview();

            if (isReduced) {
              section.dataset.layout = layout;
              return;
            }

            stopAnimations();
            fadeOut = gsap.to(captions, {
              autoAlpha: 0,
              duration: config.fadeOutDuration,
              ease: "power1.in",
              onComplete: () => switchLayout(layout),
            });
          };

          const onClick = (event: Event) => {
            const button = (event.target as HTMLElement).closest<HTMLElement>("[data-layout-button]");
            if (button?.dataset.layoutButton) applyLayout(button.dataset.layoutButton);
          };

          section.addEventListener("click", onClick);
          if (usePreview) {
            window.addEventListener("pointermove", onPointerMove);
            gallery.addEventListener("pointerover", onPointerOver);
            gallery.addEventListener("pointerleave", hidePreview);
          }

          return () => {
            section.removeEventListener("click", onClick);
            window.removeEventListener("pointermove", onPointerMove);
            gallery.removeEventListener("pointerover", onPointerOver);
            gallery.removeEventListener("pointerleave", hidePreview);
            stopAnimations();
            gsap.killTweensOf([preview, ...previewImages]);
            gsap.set([...captions, ...rules], { clearProps: "all" });
            gsap.set(previewImages, { clearProps: "opacity,visibility" });
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
      data-layout="grid"
      aria-label="Layout Shift"
      className="group/gallery min-h-svh bg-[var(--ls-bg-current)] px-4 pt-16 pb-16 text-[var(--ls-ink-current)] [--ls-bg-current:var(--ls-bg,#0C0C0C)] [--ls-ink-current:var(--ls-ink,#F2F2EC)] [--ls-muted-current:var(--ls-muted,#232322)] [--ls-muted-ink-current:var(--ls-muted-ink,#9C9C95)] [--ls-ring-current:var(--ls-ring,#C8F31D)] md:px-8 md:pt-20"
    >
      <header className="flex flex-col gap-6 pb-8 md:gap-10 md:pb-12">
        <div className={`${labelClass} flex justify-between text-[var(--ls-muted-ink-current)]`}>
          <span>{content.label}</span>
          <span>{content.years}</span>
        </div>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className={displayClass}>{content.title}</h2>
          <div className="flex items-center justify-between gap-6 md:flex-col md:items-end">
            <p className={labelClass}>
              {itemCount} {content.countLabel}
            </p>
            <div role="group" aria-label={content.toggleLabel} className="flex">
              {layouts.map((layout) => (
                <button
                  key={layout.id}
                  type="button"
                  data-layout-button={layout.id}
                  aria-pressed={layout.id === "grid"}
                  className={toggleButtonClass}
                >
                  <layout.icon aria-hidden className="size-4" />
                  {layout.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <ul data-gallery className={galleryClass}>
        {items.map((item, index) => (
          <li key={item.id} data-item={item.id} tabIndex={0} className={`${itemClass} ${sizeClass[item.size]}`}>
            <span data-rule aria-hidden className={ruleClass} />
            <span aria-hidden className={fillClass} />
            <div data-photo className={photoClass}>
              <Image src={item.image} alt={item.alt} sizes="(min-width: 768px) 50vw, 100vw" className={imageClass} />
            </div>
            <span data-caption className={indexClass}>
              {formatIndex(index)}
            </span>
            <h3 data-caption className={titleClass}>
              <span className={gridTitleClass}>{item.title}</span>
              <span className={phoneGridTitleClass}>{item.title}</span>
              <span className={listTitleClass}>{item.title}</span>
              <span className={phoneListTitleClass}>{item.title}</span>
            </h3>
            <p data-caption className={metaClass}>
              <span>{item.category}</span>
              <span>{item.year}</span>
            </p>
          </li>
        ))}
      </ul>
      <span data-rule aria-hidden className={bottomRuleClass} />

      <div data-preview aria-hidden className={previewClass}>
        {items.map((item) => (
          <Image
            key={item.id}
            data-preview-image={item.id}
            src={item.image}
            alt=""
            sizes="320px"
            className="absolute inset-0 size-full object-cover opacity-0"
          />
        ))}
      </div>
    </section>
  );
}
