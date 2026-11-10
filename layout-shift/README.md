# Layout Shift

A gallery that switches between a photo grid and a numbered list. Click the toggle and every photo flies to its new place in one move (GSAP Flip), the captions fade out and back in, and in list mode rules are drawn between rows. Hover a row and a tilting preview of its photo follows the cursor.

**Live demo:** [fygura.com/components/cards/layout-shift](https://fygura.com/en/components/cards/layout-shift)

## Install

```bash
npm i gsap @gsap/react lucide-react
```

Copy `LayoutShift.tsx` and the `images` folder anywhere in your project, then render it:

```tsx
import LayoutShift from "./components/layout-shift/LayoutShift";

export default function Page() {
  return <LayoutShift />;
}
```

Requires Next.js (App Router) with Tailwind CSS 4. The component fills at least the screen height (`min-h-svh`). `gsap/Flip` is included in the free `gsap` package.

## Your own photos

```tsx
import LayoutShift, { type LayoutShiftContent, type LayoutShiftItem } from "./components/layout-shift/LayoutShift";
import coat from "./images/coat.webp";

const content: LayoutShiftContent = {
  label: "Studio archive",
  years: "2024 — 2026",
  title: "Lookbook",
  countLabel: "looks",
  toggleLabel: "Layout",
};

const items: LayoutShiftItem[] = [
  { id: "coat", size: "large", title: "Coat", category: "Outerwear", year: "2026", alt: "A long coat", image: coat },
  // ...
];

<LayoutShift items={items} content={content} />;
```

`size` is `large` (2×2), `wide` (2×1) or `small` (1×1) in grid mode. Square images work best, a wide one for `wide`. Without props, the demo content is shown.

## Customize

- **Colors:** set CSS variables on any parent: `--ls-bg`, `--ls-ink`, `--ls-muted`, `--ls-muted-ink`, `--ls-ring`. The component is dark by default.
- **Timing and feel:** the `config` object at the top of the file (Flip duration and ease, stagger, caption and rule timing, preview follow and tilt).
- **Font and size:** the display font is inherited; change the size classes at the top of the file.
- **Accessibility:** rows are focusable and react to keyboard focus like hover; `prefers-reduced-motion` switches layouts instantly, and the cursor preview only runs with a mouse.

Images in `images/` are placeholders with the same names and sizes as in the live demo.

## License

See [LICENSE.md](../LICENSE.md).
