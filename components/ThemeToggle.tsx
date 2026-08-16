"use client";

import { useRef, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

// The DOM `data-theme` attribute is the source of truth (set before paint by
// the inline script in layout.tsx). We subscribe to it instead of holding our
// own state, so the icon always reflects the real theme without a flash.
function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  window.addEventListener("storage", callback);
  return () => {
    observer.disconnect();
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

export function ThemeToggle({
  className = "",
  light = false,
}: {
  className?: string;
  /* render light (for sitting over the dark hero image) */
  light?: boolean;
}) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const isDark = theme === "dark";

  function applyTheme(next: Theme) {
    // Mutating the attribute notifies the MutationObserver above, which
    // re-renders this component with the new theme.
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* storage unavailable, ignore */
    }
  }

  function toggle() {
    const next: Theme = isDark ? "light" : "dark";

    const prefersReduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reduced-motion / no VT support → instant swap.
    if (prefersReduced || typeof document.startViewTransition !== "function") {
      applyTheme(next);
      return;
    }

    // Origin: centre of the toggle button in viewport coordinates.
    const rect = btnRef.current?.getBoundingClientRect();
    const x = Math.round(rect ? rect.left + rect.width / 2 : window.innerWidth - 40);
    const y = Math.round(rect ? rect.top + rect.height / 2 : 40);

    // Radius large enough to reach every corner of the viewport from (x, y).
    const endRadius = Math.ceil(
      Math.max(
        Math.hypot(x,                     window.innerHeight - y), // bottom-left
        Math.hypot(window.innerWidth - x, window.innerHeight - y), // bottom-right
        Math.hypot(window.innerWidth - x, y),                      // top-right
        Math.hypot(x,                     y),                      // top-left
      )
    );

    // Inject a unique @keyframes rule for this specific transition so the
    // clip-path origin is baked into the CSS (not the Web Animations API
    // pseudoElement path, which has unreliable coordinate mapping).
    const uid = `tw-${Date.now()}`;
    const style = document.createElement("style");
    style.textContent = `
      @keyframes ${uid} {
        from { clip-path: circle(0px at ${x}px ${y}px); }
        to   { clip-path: circle(${endRadius}px at ${x}px ${y}px); }
      }
      ::view-transition-old(root) {
        animation: none;
        z-index: 1;
      }
      ::view-transition-new(root) {
        animation: ${uid} 650ms cubic-bezier(0.4, 0, 0.2, 1) both;
        z-index: 9999;
      }
    `;
    document.head.appendChild(style);

    // Pause all running CSS animations before the VT old-state snapshot.
    // Pages with marquee / waveform animations create many GPU compositor
    // layers; the snapshot readback of those layers causes the stutter on
    // the home and agents pages. Pausing them collapses the layers so the
    // snapshot is captured instantly. The attribute is removed inside the
    // callback so the new-state renders with animations already running.
    const ROOT = document.documentElement;
    ROOT.setAttribute("data-vt-snap", "");

    // The View Transitions API captures real screenshots of old & new state
    // so the actual page content, not a solid colour, is revealed.
    const cleanup = () => {
      style.remove();
      ROOT.removeAttribute("data-vt-snap");
    };

    // One rAF gives the browser a full frame to process the data-vt-snap
    // style changes before VT takes its old-state snapshot. Framer Motion
    // (used by Agents.tsx) sets will-change:transform,opacity as inline
    // styles on every animated element, promoting each to its own GPU layer.
    // The CSS [data-vt-snap] will-change:auto rule overrides those inline
    // styles (!important wins over inline in the cascade), but the compositor
    // needs one paint tick to actually de-promote the layers. Without this
    // rAF, the snapshot fires before de-promotion completes → GPU readback
    // of dozens of layers → jank on the agents page.
    requestAnimationFrame(() => {
      document
        .startViewTransition(() => {
          // Apply theme BEFORE removing data-vt-snap so CSS transitions are
          // still disabled when the colour variables change. Every element
          // snaps to its final colour instantly, giving the VT new-state
          // snapshot a fully-themed frame. If we re-enable transitions first,
          // elements with transition-colors animate independently mid-wipe,
          // making the background appear to change before the containers.
          applyTheme(next);
          ROOT.removeAttribute("data-vt-snap"); // re-enable transitions after colours are set
        })
        .finished
        .then(cleanup)
        .catch(cleanup);
    });
  }

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`grid size-9 place-items-center rounded-full border transition-colors ${
        light
          ? "border-white/40 text-white hover:border-white"
          : "border-line-bright text-cream hover:border-cream"
      } ${className}`}
    >
      {isDark ? (
        // sun
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        // moon
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
        </svg>
      )}
    </button>
  );
}
