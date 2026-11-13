# Kinetic Posters

Four Swiss-style posters in black, cream and orange that shift between two layouts on a loop. On LEGENDARY the word grows tall while the photo folds up and the sun sets behind the car, on AIR a black half crosses the poster under a floating skater, on YES a diamond turns into a circle behind a thumbs up while the word swings from narrow to wide, and on SEND IT the sky folds into a column and the BMX rider jumps out of it. Click anywhere or press Next and the poster on show is thrown aside as the next one slides in.

**Live demo:** [fygura.com/components/text-animations/kinetic-posters](https://fygura.com/en/components/text-animations/kinetic-posters)

## Install

```bash
npm i gsap @gsap/react lucide-react
```

Copy `KineticPosters.tsx` and the `images` folder anywhere in your project, then render it:

```tsx
import KineticPosters from "./components/kinetic-posters/KineticPosters";

export default function Page() {
  return <KineticPosters />;
}
```

Requires Next.js (App Router) with Tailwind CSS 4. The component fills the screen height (`h-svh`) and centres the poster. All sizes inside the poster are container query units, so it scales as one piece.

## Your own posters

```tsx
import KineticPosters, { type KineticPoster } from "./components/kinetic-posters/KineticPosters";
import surfer from "./images/surfer.webp";
import wave from "./images/wave.webp";

const posters: KineticPoster[] = [
  {
    id: "swell",
    layout: "panel",
    word: "Swell",
    caption: "North shore · Winter",
    subject: surfer,
    photo: wave,
    alt: "A surfer on a breaking wave",
  },
  // ...
];

<KineticPosters posters={posters} label="Surf posters" />;
```

There are four layouts, each with its own loop:

- `panel`: a photo panel with a sun behind the subject; the word grows tall as the panel folds away.
- `split`: a black half slides under the subject; the letters hop. Made for a tall cut-out (965x1600).
- `arch`: a diamond in a dark arch turns into a circle; the word swings narrow to wide. Made for a nearly square cut-out (1600x1581).
- `jump`: two lines slide past each other; the photo folds into a column and the subject jumps out. The word splits into two lines at the first space.

`subject` is a transparent cut-out. When a poster has a `photo` too, export both from the same frame and size, so the cut-out lines up with the photo. Without props, the demo posters are shown.

## Customize

- **Colours:** the `colors` object at the top of the file (paper, ink, orange, backdrop).
- **Small print:** `printDetails` (brand and date in the header of every poster); each poster's `caption` goes in the footer.
- **Timing and feel:** the `settings` object (swap duration, morph duration, hold between the two compositions) and the `loops` object, one timeline per layout.
- **Font:** the headlines need a variable font with a `wdth` axis (Archivo, Roboto Flex...); the loops tween `--wdth` between 62 and 125. Labels use your `font-mono`.
- **Accessibility:** the section is `aria-live="polite"` and only the poster on show is exposed to screen readers; `prefers-reduced-motion` keeps the posters still and swaps them instantly.

Images in `images/` are placeholders with the same names and sizes as in the live demo.

## Demo photos

The live demo uses black and white edits of these Unsplash photos (not included):

- `legendary-road.webp`, `legendary-car.webp`: [Ivan Mihajlovic](https://unsplash.com/photos/tS9nhwL_gKA)
- `kickflip.webp`: [Alireza Mirzabegi](https://unsplash.com/photos/gX46M7Ifkak)
- `thumbs-up.webp`: [Anastasiya Badun](https://unsplash.com/photos/DHvKXnq2IfU)
- `send-it-sky.webp`, `send-it-rider.webp`: [Fengyou Wan](https://unsplash.com/photos/UG7QXpz7T7k)

## License

See [LICENSE.md](../LICENSE.md).
