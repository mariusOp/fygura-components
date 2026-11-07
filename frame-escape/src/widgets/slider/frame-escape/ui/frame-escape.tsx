import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import frames from "@/widgets/slider/frame-escape/model/frames";
import carpetImage from "@/shared/assets/images/frame-escape/carpet-floor.webp";
import FrameEscapeMotion from "./frame-escape-motion";

const cards = [...frames, ...frames];
const VISIBLE_RANGE = 3;

function startOffset(index: number) {
  return index < cards.length / 2 ? index : index - cards.length;
}

const ink = "text-[#2b2b2b]";
const imageClass = "pointer-events-none absolute -bottom-[40%] left-1/2 w-[240%] max-w-none -translate-x-1/2";
const navButtonClass =
  "flex size-10 items-center justify-center rounded-full bg-white/80 text-[#2b2b2b] shadow-[0_6px_20px_rgba(0,0,0,0.08)] backdrop-blur transition-transform hover:scale-105";

export default function FrameEscape() {
  return (
    <FrameEscapeMotion>
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
              visibility: Math.abs(startOffset(index)) > VISIBLE_RANGE ? "hidden" : undefined,
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
                  {frame.number} / {String(frames.length).padStart(2, "0")}
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
    </FrameEscapeMotion>
  );
}
