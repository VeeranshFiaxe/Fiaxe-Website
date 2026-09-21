<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes: APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Performance rules

- Components are server components by default. Add `"use client"` only for state, effects, or event handlers, and keep that part small.
- Animate with CSS. Use `Reveal` (fade in on scroll, or `onLoad` for above-the-fold content) and `Waveform` from `components/primitives.tsx`. Don't add animation libraries.
- Scroll reveal, tilt, magnetic and off-screen animation pausing all run from the one `components/site/SiteFx.tsx`; opt in with data attributes. Put reusable client hooks in `components/client.tsx` (`useInView`, `CountUp`, `useCarousel`). Every listener, timer, and observer must be cleaned up on unmount.
- Keep data (agents, logos) in `lib/`, not inside components.
- Media: audio as MP3, images as WebP at no more than 2x their display size, and no file in `public/` over 500KB.
- Before shipping, run `npm run perf`. It fails if any page ships more than 175KB of gzipped JS.
