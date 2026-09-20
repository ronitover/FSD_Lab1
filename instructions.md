Fix: Hero Background Blobs Rendering as a Solid White Wash
File to edit: how-glass.js Root cause: in the hero branch of the fragment shader, the three decorative blobs are sized and positioned so they overlap almost completely, merging into one pale, low-saturation wash instead of three distinct green accent shapes.

Do these edits in order. Test after each one — don't batch all four before checking, since radius, spread, color, and alpha interact.

Step 1 — Shrink the hero blob radius
Find this line inside the fragment shader string (fragmentSource) in how-glass.js:

radius = mix(radius, vec2(0.22, 0.31), hero);
Replace it with:

radius = mix(radius, vec2(0.13, 0.19), hero);
Why: each blob's visible edge extends to 1.25 × radius (set by smoothstep(0.3, 1.25, edge) a few lines below). At the original (0.22, 0.31), each blob reaches roughly 0.27–0.39 in normalized canvas units — larger than the gaps between blob centers, so they fully overlap. Shrinking the radius reduces each blob's reach so they stay visually separate.

Step 2 — Spread the hero blob centers further apart
Find these three lines, just above the radius line:

a = mix(a, vec2(0.59, 0.53), hero);
b = mix(b, vec2(0.87, 0.2), hero);
c = mix(c, vec2(0.22, 0.38), hero);
Replace with:

a = mix(a, vec2(0.62, 0.58), hero);
b = mix(b, vec2(0.9, 0.15), hero);
c = mix(c, vec2(0.15, 0.35), hero);
Why: this increases the distance between blob centers so that even with the new smaller radius, there's clear negative space between each blob — three separate floating shapes rather than one continuous field.

Step 3 — Fix the color balance
Find this line:

vec3 color = (sage * first + green * second + sage * third) / max(first + second + third, 0.001);
Replace with:

vec3 color = (sage * first + green * second * 1.4 + sage * third) / max(first + second * 1.4 + third, 0.001);
Why: two of the three blobs (first, third) are weighted toward sage (a pale near-white green: vec3(0.66, 0.76, 0.67)). When blobs overlapped, this pale color dominated the blend, which is a large part of why the result reads as "white," not green. Boosting the green blob's weight (vec3(0.29, 0.48, 0.36)) rebalances the mix so the combined color skews more visibly green even where blobs still touch slightly.

Step 4 — Re-check alpha once blobs are separated
Find this line:

float alpha = min(0.36, first * 0.28 + second * 0.23 + third * 0.28);
Leave this as-is initially and test the render first — with Steps 1–3 applied, the blobs should already look like distinct soft green shapes rather than a wash. If they still look too faint/pale after separating them, raise the multipliers slightly (e.g., 0.28 → 0.34, 0.23 → 0.28), but do this only after confirming Steps 1–3 fixed the shape/color issue, not before — raising alpha on overlapping pale blobs would just produce a darker white wash, not a fix.

Step 5 — Verify against dependent elements
Once the blobs render as separated shapes:

Reload the hero section and confirm you can see three distinct soft green forms rather than one large pale shape.
Check the caption card ("Together, we can / feed more, waste less") — since it sits over the photo, not directly over the blob layer, it shouldn't be affected, but confirm visually.
Check .hero-btn-secondary ("Find Food") — this button relies on the blob layer behind it to justify its glass treatment (per the tier system: light glass needs some visual activity behind it). Once blobs are properly separated and positioned, confirm at least one blob passes near/behind this button area — if not, nudge blob center a or c slightly toward the left column in Step 2.
Check contrast on any text sitting where a blob now passes behind it — a more saturated, properly-separated green blob could reduce legibility in a way the old pale wash didn't. Darken the underlying text color locally if needed, per the contrast guidance in the earlier hero spec (Section 6).
Reference: values before vs. after
Property	Before (bug)	After (fix)
Hero radius	vec2(0.22, 0.31)	vec2(0.13, 0.19)
Center a	vec2(0.59, 0.53)	vec2(0.62, 0.58)
Center b	vec2(0.87, 0.2)	vec2(0.9, 0.15)
Center c	vec2(0.22, 0.38)	vec2(0.15, 0.35)
Color mix weight (green blob)	1×	1.4×
Alpha multipliers	0.28 / 0.23 / 0.28	unchanged unless Step 4 needed
No changes are needed in styles.css, journey.js, or index.html — the glass CSS on the nav, buttons, icon tiles, and caption card is already correct and will look right once this shader change makes the background blobs behave as intended.