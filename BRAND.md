# Fiaxe : Site Strategy & Brand Reference

Fiaxe builds **fully custom AI voice agents** for businesses (India-first). Not templates,
not a DIY builder, not a developer platform : a premium, done-for-you partner that handles
discovery → build → testing → deployment → support. **Primary goal of the site: get the
visitor to book a discovery call.**

This file is the strategy reference. The copy blocks (item 7) and careers form (item 8) are
implemented directly in the site : see the file pointers below.

---

## 1. Sitemap

```
/                 Long-scroll landing page (the story, end to end)
/agents           AI agent types + agent library      (separate page)
/pricing          Plans + custom-quote, lead to call  (separate page)
/careers          Roles + application form            (separate page)
/contact          Contact form + preferred channel    (separate page)
/book-demo        Discovery-call booking form          (separate page · primary CTA target)
```

Top nav: Home · What We Build · How It Works · Industries · Integrations · Results · FAQ ·
Pricing · Agents · Careers · Contact · **Book Demo** (button).
The middle six are in-page anchors (`/#…`); the rest are routes. Below `xl` the nav collapses
to a drawer. Implemented in `components/Nav.tsx`.

## 2. Homepage section order

1. Hero : `components/Hero.tsx`
2. Trust bar (metrics) : `components/TrustBar.tsx` + client logos `components/Customers.tsx`
3. What We Build : `components/WhatWeBuild.tsx` (`#what-we-build`)
4. What the AI Can Do : `components/Capabilities.tsx`
5. How It Works : `components/Process.tsx` (`#how-it-works`)
6. Live Demo : `components/LiveDemo.tsx` (`#live-demo`)
7. Why Businesses Choose Fiaxe : `components/WhyFiaxe.tsx`
8. Industries : `components/IndustriesGrid.tsx` (`#industries`)
9. CRM : `components/CrmShowcase.tsx`
10. Integrations : `components/Integrations.tsx` (`#integrations`)
11. Results / Proof : `components/Results.tsx` (`#results`)
12. Testimonials : `components/Testimonials.tsx`
13. FAQ : `components/FAQ.tsx` (`#faq`)
14. Final CTA : `components/Cta.tsx`

## 3. Page-by-page purpose

- **Home** : Tell the whole story in one scroll and lead to a discovery call. Instantly say
  what Fiaxe does, that it's custom-built and done-for-you, make the business value obvious,
  build trust, and convert.
- **Agents** : Show the *kinds* of agents Fiaxe builds (receptionist, lead-qual, booking,
  support, follow-up, outbound) while reinforcing that every one is custom-built.
- **Pricing** : Simple, transparent, lead toward a call; custom volumes handled via "Book a call."
- **Careers** : Professional, easy-to-apply page with a full application form.
- **Contact** : Low-friction, conversion-focused contact with a preferred-channel option.
- **Book Demo** : The conversion endpoint: "what to expect" + a booking form.

## 4. Homepage copy direction

Clear, confident, business-first. No heavy jargon, no "developer platform" framing, no generic
AI buzzwords. The visitor should immediately grasp: (1) what Fiaxe does, (2) why it matters,
(3) why to trust it, (4) why to book a call. Lead with outcomes ("never miss a call," "leads
qualified," "appointments booked"), not technology.

## 5. CTA recommendations

- **Primary everywhere:** "Book a Discovery Call" / "Book Demo" → `/book-demo`.
- **Secondary on hero:** "Hear the AI in Action" → scrolls to the live demo (`#live-demo`).
- Repeat the primary CTA at the end of every page (final CTA band) and on pricing/industry cards.
- Keep CTAs verb-first and specific; avoid weak labels like "Learn more."

## 6. Brand voice guide

Clear · concise · premium · trustworthy · modern · powerful · approachable · reliable ·
business-first.

- **Do:** short confident sentences; outcome-led; warm but precise; "we build / we handle / we run."
- **Don't:** buzzwords, corporate fluff, vague promises, developer/platform speak on the homepage.
- **Voice test:** would a busy business owner instantly understand it and feel they're in good hands?

## 7. Copy blocks

Implemented as real content in the components listed in §2 and the page files under `app/`.

## 8. Careers form structure

Implemented in `components/CareersForm.tsx`: role (select) · full name · email · phone ·
current role · current company · current CTC · expected CTC · notice period · resume upload ·
additional notes. Submits via `mailto:careers@fiaxe.com` (static site : no backend).
