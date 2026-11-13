# Hill Road

A retro printed poster of cut-paper hills. Scroll and the poster stays pinned while the scene builds: the hills rise into place in layers, each at its own speed, the title climbs out from behind them and a 1950s coach drives in along the road and stops in its place. Scroll back and it all plays in reverse. Built with GSAP ScrollTrigger.

**Live demo:** [fygura.com/components/parallax/hill-road](https://fygura.com/en/components/parallax/hill-road)

## Install

```bash
npm i gsap @gsap/react
```

`ScrollTrigger` ships in the free `gsap` package. Copy `HillRoad.tsx` and the `images` folder anywhere in your project, then render it:

```tsx
import HillRoad from "./components/hill-road/HillRoad";

export default function Page() {
  return (
    <main>
      <HillRoad />
      {/* the rest of your page */}
    </main>
  );
}
```

Requires Next.js (App Router) with Tailwind CSS 4. The component fills the screen height (`h-svh`) and stays pinned for four more screens of scroll, so give it room on a page that scrolls. All sizes inside the poster are container query units, so it scales as one piece.

## Your own poster

```tsx
import HillRoad, { type HillRoadPoster } from "./components/hill-road/HillRoad";
import van from "./images/van.webp";

const poster: HillRoadPoster = {
  title: "summer",
  number: "001",
  headline: "Leave early",
  meta: [
    { label: "Title", value: "Summer" },
    { label: "Route", value: "Coast road" },
  ],
  vehicle: { image: van, alt: "A camper van on a country road" },
};

<HillRoad poster={poster} label="Summer poster" />;
```

Use a transparent side view (PNG or WebP) for the vehicle. Without props, the demo poster is shown.

## Customize

- **Colours:** the `colors` object at the top of the file (paper, ink, title, backdrop); each hill has its own `light` and `shade`.
- **Landscape:** `hills` (behind the road), `road` and `ground` (in front) are SVG paths in a 968 x 962 box. `speed` is how far a layer rises while you scroll; `stripes` adds mowing lines. `vehiclePlace` sets where the wheels touch the road.
- **Timing and feel:** the `settings` object (pin length, scrub smoothing, how far the title rises, where the vehicle starts and stops).
- **Textures:** `grass.webp` is blended over every hill (overlay) and `print-texture.webp` over the whole poster (multiply). The placeholders are neutral for those blend modes, so the poster looks clean until you add your own.
- **Accessibility:** the poster is already in its finished state without JavaScript; `prefers-reduced-motion` skips the pin and the motion and shows the finished poster.

Images in `images/` are placeholders with the same names and sizes as in the live demo.

## Demo images

The live demo uses these images (not included):

- `coach.webp`: [Emslichter on Pixabay](https://pixabay.com/photos/bus-antique-car-model-1205025/), cut out and recoloured
- `grass.webp`: [ye xin on Unsplash](https://unsplash.com/photos/xL7KOCNI6uk), black and white detail
- `print-texture.webp`: combined from three Unsplash photos: [recycled paper](https://unsplash.com/photos/k4Lt0CjUnb0) by João Vítor Duarte, [film grain](https://unsplash.com/photos/xdnMgGsf71A) by Illia Horokhovsky and [dust](https://unsplash.com/photos/TfD8K-fChbA) by Linus Belanger

## License

See [LICENSE.md](../LICENSE.md).
