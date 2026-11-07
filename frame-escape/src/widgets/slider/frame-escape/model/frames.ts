import type { StaticImageData } from "next/image";
import mountains from "@/shared/assets/images/frame-escape/mountains.png";
import sakura from "@/shared/assets/images/frame-escape/sakura.webp";
import smoke from "@/shared/assets/images/frame-escape/smoke.webp";

export type Frame = {
  number: string;
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

const frames: Frame[] = texts.map((text, index) => ({
  ...text,
  number: String(index + 1).padStart(2, "0"),
  image: imagePool[index % imagePool.length],
}));

export default frames;
