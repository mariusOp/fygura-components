# Glitch

A headline that glitches on purpose. Each line slides in as five stacked slices with a two-color fringe, then runs a constant, strong glitch: accent-colored ghost copies with random stripe clip-paths, flickering opacity, weight and blur jumps, a band glitch and a top and bottom third tear every second. Hover or focus makes it even stronger for about a second. Click, Space or ArrowRight switch to the next line.

**Live demo:** [fygura.com/components/text-animations/glitch](https://fygura.com/en/components/text-animations/glitch)

## Install

```bash
npm i gsap @gsap/react
```

Copy `Glitch.tsx` anywhere in your project, then render it:

```tsx
import Glitch from "./components/glitch/Glitch";

export default function Page() {
  return <Glitch />;
}
```

Requires React 19 with Tailwind CSS 4. The component fills the screen (`h-screen`) and advances on its own.

If your project switches dark mode with a `.dark` class, add this once to your CSS so the `dark:` variant follows it:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

## Your own lines

```tsx
import Glitch, { type GlitchLine } from "./components/glitch/Glitch";

const lines: GlitchLine[] = [
  { text: "HELLO", caption: "First contact" },
  { text: "ERROR", caption: "Something broke" },
];

<Glitch lines={lines} />;
```

Keep lines short and uppercase. Without `lines`, the demo list is shown.

## Customize

- **Colors:** set CSS variables on any parent: `--glitch-bg`, `--glitch-ink`, `--glitch-accent`, `--glitch-warm`, `--glitch-lime`, plus `--glitch-bg-dark`, `--glitch-ink-dark`, `--glitch-accent-dark` and `--glitch-warm-dark` for dark mode.
- **Intensity and timing:** the `config` object at the top of the file (ghost offsets and step speed, blur, jumps, weights, hover power, line duration).
- **Font and size:** the display font is inherited; change the classes on the `data-word` element. Font-weight jumps need a variable font to be visible.
- **Accessibility:** the current line is announced to screen readers, the hidden tab pauses everything, and `prefers-reduced-motion` turns the glitching off and fades between lines.

## License

See [LICENSE.md](../LICENSE.md).
