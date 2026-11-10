# Cube Loader

A preloader built on a rotating 3D cube. Each face runs its own small loader (bars, hop, goo, infinity) while the counter climbs from 000 to 100 in four turns. Then the cube scales up to fill the screen, the overlay fades out and the page headline rises in, word by word. A Replay button runs it again.

**Live demo:** [fygura.com/components/preloaders/cube-loader](https://fygura.com/en/components/preloaders/cube-loader)

## Install

```bash
npm i gsap @gsap/react lucide-react
```

Copy `CubeLoader.tsx` anywhere in your project, then render it:

```tsx
import CubeLoader from "./components/cube-loader/CubeLoader";

export default function Page() {
  return <CubeLoader />;
}
```

Requires React 19 with Tailwind CSS 4. The component fills the screen (`h-screen`) and plays once on load. The headline it reveals is the page behind the loader: replace it with your own hero, or place your page content in the same spot.

If your project switches dark mode with a `.dark` class, add this once to your CSS so the `dark:` variant follows it:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

## Your own words

```tsx
import CubeLoader, { type CubeLoaderHero } from "./components/cube-loader/CubeLoader";

const hero: CubeLoaderHero = {
  words: ["Your", "headline", "here"],
  line: "A short supporting line",
};

<CubeLoader hero={hero} />;
```

Without props, the demo content is shown.

## Customize

- **Colors:** set CSS variables on any parent: `--cl-bg`, `--cl-ink`, `--cl-lime`, `--cl-lime-ink`, `--cl-night`, `--cl-surface`, `--cl-paper`, plus `--cl-bg-dark` and `--cl-ink-dark` for dark mode. The loader overlay and cube are always dark; `--cl-lime` is the Replay button color.
- **Timing and feel:** the `config` object at the top of the file (number of turns, turn and hold durations, final scale, reveal and word timing). Cube size is `cubeSize`.
- **Face loaders:** the animations live in the `play*` functions; the markup is in `FaceLoader`.
- **Font and size:** the display font is inherited; change the classes on the headline.
- **Accessibility:** the counter is hidden from screen readers, and `prefers-reduced-motion` skips the animation and fades the overlay out.

## License

See [LICENSE.md](../LICENSE.md).
