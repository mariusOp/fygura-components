# Frame Escape

An endless row of numbered gallery frames above a red carpet. Hover the middle frame and the paper fades, the neighbours step aside and the picture behind it appears on the wall at its natural size.

**Live demo:** [fygura.com/components/sliders/frame-escape](https://fygura.com/en/components/sliders/frame-escape)

## Install

```bash
npm i gsap @gsap/react lucide-react
```

Copy the `src` folder into your project (same paths), then render it on a page:

```tsx
import FrameEscape from "@/widgets/slider/frame-escape/ui/frame-escape";

export default function Page() {
  return <FrameEscape />;
}
```

## Files

| File | What it does |
|---|---|
| `src/widgets/slider/frame-escape/ui/frame-escape.tsx` | Markup (server component): background, carpet, cards, captions, buttons |
| `src/widgets/slider/frame-escape/ui/frame-escape-motion.tsx` | Motion (client): wrap, smooth scroll and drag, hover reveal timeline |
| `src/widgets/slider/frame-escape/model/frames.ts` | Texts of the frames and the image pool |
| `src/shared/lib/gsap.ts` | Registers GSAP plugins once |
| `src/shared/assets/images/frame-escape/` | Placeholder images, same names and sizes as the demo |

## Customize

- **Frames:** edit `texts` in `model/frames.ts`; images rotate from `imagePool`. Transparent PNG/WebP images with the subject in the middle work best.
- **Timing and feel:** the `config` object at the top of `frame-escape-motion.tsx` (smoothing, wheel and drag sensitivity, spread, close speed).
- **Accessibility:** arrow keys, buttons, drag and wheel all move the row; `prefers-reduced-motion` jumps straight to each state.

## License

See [LICENSE.md](../LICENSE.md).
