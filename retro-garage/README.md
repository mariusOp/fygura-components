# Retro Garage

A vintage car showroom on a single card. Three classic cars stand one at a time in front of a huge condensed title; click a stop on the dotted timeline, drag, swipe or use the arrow keys and the row glides on, the card blends into the next colour and the car tips back and settles with a small bounce. Discover more wipes a white sheet across the card with the car, its story and its specs.

**Live demo:** [fygura.com/components/sliders/retro-garage](https://fygura.com/en/components/sliders/retro-garage)

## Install

```bash
npm i gsap @gsap/react lucide-react
```

Copy `RetroGarage.tsx` and the `images` folder anywhere in your project, then render it:

```tsx
import RetroGarage from "./components/retro-garage/RetroGarage";

export default function Page() {
  return <RetroGarage />;
}
```

Requires Next.js (App Router) with Tailwind CSS 4. The component fills the screen height (`h-svh`) and centres the card; on phones the card turns portrait. All sizes inside the card are container query units, so it scales as one piece.

## Your own cars

```tsx
import RetroGarage, { type RetroGarageCar } from "./components/retro-garage/RetroGarage";
import mini from "./images/mini.webp";

const cars: RetroGarageCar[] = [
  {
    id: "mini",
    name: "Mini",
    origin: "United Kingdom",
    years: "1959–2000",
    summary: "One short line under the car.",
    story: "A longer paragraph for the detail sheet.",
    specs: [{ label: "Length", value: "3,054 mm" }],
    color: "#7A7591",
    image: mini,
    lengthMm: 3054,
    credit: "Photo: your name",
  },
  // ...
];

<RetroGarage cars={cars} label="My garage" />;
```

Use transparent side views (PNG or WebP) with the car facing left. `lengthMm` keeps the cars to scale against each other. Without props, the demo content is shown.

## Customize

- **Colours:** each car's `color`, plus the `colors` object at the top of the file (table, text, detail sheet).
- **Timing and feel:** the `settings` object (spacing between cars, title parallax, slide duration, lean angle).
- **Title font:** `titleFontClass` uses a variable font's `wdth` axis (Archivo, Roboto Flex); with another font, swap it for any condensed family.
- **Accessibility:** the stops and the buttons work from the keyboard, the arrow keys change cars, Escape closes the sheet and focus returns to the button; `prefers-reduced-motion` switches cars and opens the sheet instantly.

Images in `images/` are placeholders with the same names and sizes as in the live demo.

## License

See [LICENSE.md](../LICENSE.md).
