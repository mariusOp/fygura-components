# Counter Curtain

A preloader that counts from 000 to 100 while a window cycles through words. The counter and progress line fill, the window turns accent-colored and expands to the full screen, then the screen splits into columns that slide up to reveal the page headline, line by line. A Replay button runs it again.

**Live demo:** [fygura.com/components/preloaders/counter-curtain](https://fygura.com/en/components/preloaders/counter-curtain)

## Install

```bash
npm i gsap @gsap/react
```

Copy `CounterCurtain.tsx` anywhere in your project, then render it:

```tsx
import CounterCurtain from "./components/counter-curtain/CounterCurtain";

export default function Page() {
  return <CounterCurtain />;
}
```

Requires React 19 with Tailwind CSS 4. The component fills the screen (`h-screen`) and plays once on load. The headline it reveals is the page behind the curtain: replace it with your own hero, or place your page content in the same spot.

If your project switches dark mode with a `.dark` class, add this once to your CSS so the `dark:` variant follows it:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

## Your own words

```tsx
import CounterCurtain, { type CounterCurtainHero } from "./components/counter-curtain/CounterCurtain";

const words = ["Design", "Build", "Ship"];

const hero: CounterCurtainHero = {
  words: ["Your", "headline", "here"],
  line: "A short supporting line",
  columns: 6,
};

<CounterCurtain words={words} hero={hero} />;
```

`words` are cycled in the window while the counter runs; the last one stays on the accent color. `hero.columns` is the number of curtain columns. Without props, the demo content is shown.

## Customize

- **Colors:** set CSS variables on any parent: `--cc-bg`, `--cc-ink`, `--cc-lime`, `--cc-lime-ink`, `--cc-night`, `--cc-surface`, `--cc-paper`, plus `--cc-bg-dark` and `--cc-ink-dark` for dark mode. The curtain itself is always dark; `--cc-lime` is the accent.
- **Timing and feel:** the `config` object at the top of the file (window size, count steps and pauses, expand and column durations, stagger, overlaps).
- **Font and size:** the display font is inherited; change the classes on the headline and `wordSizeClass`.
- **Accessibility:** the animated counter and word reel are hidden from screen readers, and `prefers-reduced-motion` skips the animation and fades the curtain out.

## License

See [LICENSE.md](../LICENSE.md).
