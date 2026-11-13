"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { drawRibbons, Ribbons } from "./RibbonWipe";

// Shorter than the demo, so moving between pages never feels slow.
const timing = { duration: 0.6, stagger: 0.35 };

// Only plain clicks on links to another page of this site get the transition.
// Add data-no-transition to a link to skip it.
function transitionHref(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;

  const link = (event.target as Element).closest("a");
  if (!link || link.hasAttribute("download") || link.hasAttribute("data-no-transition")) return null;
  if (link.target && link.target !== "_self") return null;

  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  if (url.pathname === window.location.pathname) return null;

  return url.pathname + url.search + url.hash;
}

// Put <PageTransition /> once in your root layout (app/layout.tsx), inside <body>.
export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const overlay = useRef<HTMLDivElement>(null);
  const covering = useRef(false);

  useEffect(() => {
    const layer = overlay.current;
    if (!layer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function onClick(event: MouseEvent) {
      const href = transitionHref(event);
      if (!href || covering.current || !layer) return;

      event.preventDefault();
      covering.current = true;
      gsap.set(layer, { autoAlpha: 1 });
      drawRibbons(Array.from(layer.querySelectorAll("[data-ribbon]")), "cover", timing).then(() => router.push(href));
    }

    // Capture phase, so the click is handled before Next's own link navigation starts.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  // The new page has rendered under the ribbons; pull them away.
  useEffect(() => {
    const layer = overlay.current;
    if (!layer || !covering.current) return;

    drawRibbons(Array.from(layer.querySelectorAll("[data-ribbon]")), "reveal", timing).then(() => {
      gsap.set(layer, { autoAlpha: 0 });
      covering.current = false;
    });
  }, [pathname]);

  return (
    <div ref={overlay} aria-hidden className="pointer-events-none invisible fixed inset-0 z-1000">
      <Ribbons className="size-full" />
    </div>
  );
}
