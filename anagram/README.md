# Anagram

A word rearranges into its anagram: the shared letters fly along curved paths, tilt, blur and flash the accent color, extra letters break into fragments and fall, and new letters rise in through a mask. A caption, counter and underline follow each change.

**Live demo:** [fygura.com/components/text-animations/anagram](https://fygura.com/en/components/text-animations/anagram)

## Install

```bash
npm i gsap @gsap/react
```

Copy `Anagram.tsx` anywhere in your project, then render it:

```tsx
import Anagram from "./components/anagram/Anagram";

export default function Page() {
  return <Anagram />;
}
```

Requires React 19 with Tailwind CSS 4. The component fills the screen (`h-screen`). It advances on its own; click, Space or ArrowRight move to the next word.

If your project switches dark mode with a `.dark` class, add this once to your CSS so the `dark:` variant follows it:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

## Your own words

```tsx
import Anagram, { type AnagramWord } from "./components/anagram/Anagram";

const words: AnagramWord[] = [
  { word: "STOP", caption: "Halt" },
  { word: "POTS", caption: "Kitchen items" },
  { word: "TOPS", caption: "The best" },
];

<Anagram words={words} />;
```

Use uppercase words that are anagrams of each other so the letters can move between them. Without `words`, the demo list is shown.

## Customize

- **Colors:** set CSS variables on any parent: `--anagram-bg`, `--anagram-ink`, `--anagram-accent`, `--anagram-lime`, plus `--anagram-bg-dark`, `--anagram-ink-dark` and `--anagram-accent-dark` for dark mode. Dark mode uses Tailwind's `dark:` variant.
- **Timing and feel:** the `config` object at the top of the file (duration, pause between words, stagger, arc height, perspective, fragment count).
- **Font and size:** the display font is inherited; change the classes on the `data-word` element.
- **Accessibility:** the current word is announced to screen readers, the hidden tab pauses autoplay, and `prefers-reduced-motion` switches to a simple crossfade.

## License

See [LICENSE.md](../LICENSE.md).
