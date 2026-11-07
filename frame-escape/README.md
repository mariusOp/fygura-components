# Frame Escape

An endless row of numbered gallery frames above a red carpet. Hover the middle frame and the paper fades, the neighbours step aside and the picture behind it appears on the wall at its natural size.

**Live demo:** [fygura.com/components/sliders/frame-escape](https://fygura.com/en/components/sliders/frame-escape)

## Install

```bash
npm i gsap @gsap/react lucide-react
```

Copy `FrameEscape.tsx` and the `images` folder anywhere in your project, then render it:

```tsx
import FrameEscape from "./components/frame-escape/FrameEscape";

export default function Page() {
  return <FrameEscape />;
}
```

Requires Next.js (App Router) with Tailwind CSS 4. The component fills the screen (`h-screen`).

## Your own frames

```tsx
import FrameEscape, { type Frame } from "./components/frame-escape/FrameEscape";
import lake from "./images/lake.png";

const frames: Frame[] = [
  { title: "Still Water", category: "Travel", description: "Morning on the lake.", image: lake },
  // ...
];

<FrameEscape frames={frames} />;
```

Transparent PNG or WebP images with the subject in the middle work best. Without `frames`, the demo frames are shown.

## Customize

- **Timing and feel:** the `config` object at the top of the file (smoothing, wheel and drag sensitivity, spread, close speed).
- **Colors:** the background gradient, `ink` (text) and the red line are Tailwind classes in the markup.
- **Accessibility:** arrow keys, buttons, drag and wheel all move the row; `prefers-reduced-motion` jumps straight to each state.

Images in `images/` are placeholders with the same names and sizes as in the live demo.

## License

See [LICENSE.md](../LICENSE.md).
