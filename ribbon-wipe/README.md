# Ribbon Wipe

A page transition made of thick rainbow ribbons. They draw in from the bottom right until the screen is covered, the page changes underneath, and they run on and pull away to the left, so the new page appears stripe by stripe. Built with GSAP DrawSVG.

**Live demo:** [fygura.com/components/page-transitions/ribbon-wipe](https://fygura.com/en/components/page-transitions/ribbon-wipe). Every page change on fygura.com uses it too.

## Install

```bash
npm i gsap @gsap/react
```

`DrawSVGPlugin` ships in the free `gsap` package. Requires Next.js (App Router) with Tailwind CSS 4.

## Two ways to use it

**1. As the transition between the pages of your site.** Copy both files, then add `PageTransition` once to your root layout:

```tsx
// app/layout.tsx
import PageTransition from "./components/ribbon-wipe/PageTransition";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <PageTransition />
      </body>
    </html>
  );
}
```

Every plain click on a link to another page of your site draws the ribbons in, calls `router.push`, and pulls them away once the new page has rendered. Links to other sites, links that open a new tab, clicks with a modifier key and links to the current page are left alone; add `data-no-transition` to any link to skip it.

**2. As a self-contained demo**, switching between sections of one page:

```tsx
import RibbonWipe from "./components/ribbon-wipe/RibbonWipe";

export default function Page() {
  return <RibbonWipe />;
}
```

Pass your own `pages` (id, label, title, text, background and ink colour) to change the content.

## Customize

- **Colours, thickness, count:** `ribbonSettings` at the top of `RibbonWipe.tsx` (`palette`, `width`, `step`, `firstCopy`, `lastCopy`).
- **Shape:** `curve`, one SVG path in a 1600x900 view; keep both ends outside the view so empty ribbons never show a dot.
- **Speed:** `timing` in each file (duration of one ribbon and the spread of their start times).
- **Accessibility:** the ribbons are hidden from screen readers; with `prefers-reduced-motion` the site transition is skipped and the demo switches pages instantly.

## License

See [LICENSE.md](../LICENSE.md).
