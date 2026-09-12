**Evidence**

- Source visual truth: `/workspace/scratch/18da33be9e77/upload/image-edit-target-b05a3de80a9021f8.png`
- Browser-rendered implementation: `/workspace/scratch/18da33be9e77/gr0ss-web-redesign/qa-home-desktop.jpg`
- Focused desktop capture: `/workspace/scratch/18da33be9e77/gr0ss-web-redesign/qa-home-hero.jpg`
- Responsive capture: `/workspace/scratch/18da33be9e77/gr0ss-web-redesign/qa-home-mobile.jpg`
- Full comparison input: `/workspace/scratch/18da33be9e77/gr0ss-web-redesign/qa-compare-full.png`
- Hero comparison input: `/workspace/scratch/18da33be9e77/gr0ss-web-redesign/qa-compare-hero.png`
- Outfit comparison input: `/workspace/scratch/18da33be9e77/gr0ss-web-redesign/qa-compare-outfits.png`
- Source pixels: 1024 × 1536 at 1×.
- Desktop CSS viewport: 1363 × 936 at `devicePixelRatio: 1`; captured page pixels: 1348 × 6463 after accounting for the browser scrollbar.
- Comparison normalization: the first 2022 pixels of the browser capture were resized proportionally to 1024 × 1536 and placed beside the 1024 × 1536 source. The hero and outfit regions were separately cropped and normalized to equal pixel dimensions before comparison.
- Responsive frame: 388 × 842 CSS pixels inside a 390 × 844 capture at 1×.
- State: Poison Hotdogs homepage, dark theme, supplied game assets loaded, carousel autoplay active for the baseline capture.

**Findings**

- No actionable P0, P1, or P2 findings remain.
- Fonts and typography: the heavy white-and-neon display hierarchy, compact uppercase mono labels, and quieter body copy preserve the selected concept's arcade character. Headline wrapping remains intentional at desktop and mobile widths.
- Spacing and layout rhythm: the implementation keeps the concept's full-bleed opening, peeking screenshot carousel, collection-first outfit section, rounded neon frames, and alternating dark/purple sections. The production page is intentionally longer than the concept board because it includes all requested modes, bosses, grown-up information, and origin story.
- Colors and visual tokens: navy, slime green, cyan, and purple map cleanly to the visual target. Active controls and focus states retain enough contrast against the dark surfaces.
- Image quality and asset fidelity: the implementation deliberately replaces the concept's invented platformer frame and invented costumes with literal game screenshots and crops of the actual 15 outfit cards. The logo and poison-hotdog accents use supplied game artwork; no substitute emoji, inline SVG art, or fake gameplay imagery remains.
- Copy and content: age-based marketing copy is absent. “Made by gr0ss tech,” “Earn coins. Unlock ridiculous outfits,” ten playable friends, fifteen Rexy outfits, five modes, both bosses, and the Hero Squad contents are represented accurately.
- Accessibility: one H1, no duplicate IDs, all images have alt attributes, all buttons have accessible names, primary controls are semantic buttons/tabs, reduced motion disables automatic motion, and neither tested viewport has horizontal page overflow.

**Full-view comparison evidence**

- `qa-compare-full.png` shows that both designs lead with the real Poison Hotdogs world, a high-contrast slime-green headline, two primary actions, a dark arcade background, and a large centered gameplay showcase.
- The implementation is less illustration-dense than the concept board by design: its supporting sections use authentic screenshots and outfit cards instead of AI-invented gameplay or costume art.

**Focused-region comparison evidence**

- `qa-compare-hero.png` confirms matching above-the-fold hierarchy, palette, glass-panel treatment, brand placement, game art, and CTA grouping.
- `qa-compare-outfits.png` confirms the same collection-first story and horizontal selection rhythm while correcting the visual source with actual in-game outfit cards and the real Rexy artwork.

**Primary interactions tested**

- Hero “See the game” link moved to `#gameplay`, landing the section 80 CSS pixels below the sticky header.
- Carousel advanced from 3 / 7 to 4 / 7 after 6.1 seconds without input.
- One Next click changed the carousel to `Manual control`; the slide remained unchanged through another 6.1-second interval. Previous moved back one slide and autoplay stayed off.
- The same manual-stop behavior passed in the 388-pixel mobile frame through a 5.9-second interval.
- Selecting Ninja updated the spotlight to Ninja, 13 / 15, and `outfit-13-ninja.png`.
- Selecting ABC's updated the active tab, title, and description.
- All homepage and support-page images loaded successfully after their lazy-load regions entered the viewport.

**Console and build checks**

- No errors or warnings originated from the site. The browser reported only unrelated metadata errors from its own `chrome-extension://` content script.
- `npm run build` and `npm run check` completed with 0 errors. The sole expected warning is that the Google Play URL remains empty, so the CTA honestly renders “Coming soon.”

**Comparison history**

- Iteration 1 — P2: initial reveal styling left off-screen sections transparent in full-page captures and made anchor verification unreliable. Fix: reveal targets now remain visible by default and animate only when intersecting. Post-fix evidence: 0 hidden reveal elements, working anchor position, and complete browser-rendered page capture.
- Iteration 2 — P2: the 388-pixel mobile header clipped part of “Support.” Fix: centered the mobile navigation and tightened its gap, padding, and responsive font size. Post-fix evidence: navigation `clientWidth` and `scrollWidth` both measure 349 pixels; all four links fit, and `qa-home-mobile.jpg` shows the corrected state.

**Open Questions**

- The actual Pick a Game screenshot still contains the currently shipped ABC/123 artwork. If the game adopts the newer B/C block direction, replace this capture only after those assets are implemented in the game so the website stays truthful.

**Implementation Checklist**

- [x] Preserve the selected neon arcade art direction.
- [x] Use only real gameplay screenshots and actual outfit-card artwork.
- [x] Add permanent manual-stop carousel behavior.
- [x] Add working outfit selection and mode tabs.
- [x] Verify desktop and 388-pixel responsive layouts in the cloud browser.
- [x] Verify internal privacy and support pages.
- [x] Pass build, link, accessibility, image-load, interaction, and console checks.

**Follow-up Polish**

- P3: swap in a fresh Pick a Game capture after the ABC/123 block redesign ships in the game.
- P3: add more isolated official hotdog art later if source assets become available; avoid repeating the same cutout or inventing substitutes.

final result: passed
