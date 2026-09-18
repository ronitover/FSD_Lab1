For something to actually read as "glass" rather than just a semi-transparent box, it needs several properties working together. A single blurred background isn't enough; here's the full checklist for both buttons and cards:
1. Translucent fill (not solid, not fully transparent)
css
```css
background: rgba(255, 255, 255, 0.14–0.22);
```
Too transparent (below ~10%) and it disappears; too opaque (above ~30%) and it just looks like a flat colored box with no glass quality. This range is the sweet spot.
2. Backdrop blur — the core requirement
css
```css
backdrop-filter: blur(12–28px) saturate(140–160%);
-webkit-backdrop-filter: blur(12–28px) saturate(140–160%);
```
This is non-negotiable — it's what actually makes it "glass" rather than just a semi-transparent overlay. The saturate() boost is what gives Apple's glass its slightly vivid, lit-from-within look; without it, blurred backgrounds look muddy/gray.
- Small elements (buttons, pills): 10–14px blur
- Cards/panels: 18–24px
- Glass sitting over busy photography (like your hero caption card): needs more, 24–28px, or text underneath gets hard to read
3. A visible edge (border)
css
```css
border: 1px solid rgba(255, 255, 255, 0.3–0.4);
```
Real glass has an edge where light catches it. Without a border, backdrop-blur elements often look like a smudge rather than a distinct object.
4. Inner highlight (specular light) — this is the detail most people skip
css
```css
box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5–0.55);
```
A thin bright line along the top inner edge simulates light hitting the top of a curved glass surface. This one property is responsible for a huge amount of the "expensive Apple glass" feel — flat glassmorphism without it looks cheap.
5. Cast shadow (depth/elevation)
css
```css
box-shadow: 0 8px 20px rgba(20, 41, 31, 0.15–0.2);
```
Glass should look like it's floating above the layer behind it, not stuck flush to it.
6. Something behind it worth blurring
 This is the one people miss most. If the background behind a glass element is flat/empty, backdrop-filter has nothing to refract and the effect is wasted — it just looks like a border-radius box. This is exactly why I specced the green blurred blobs in both docs: the blobs exist specifically to give the glass something to distort. Glass over a plain cream background will always look weaker than glass over gradient/photo/blob content.
7. Rounded corners, generally soft
 Glass rarely has hard corners in Apple's system — border-radius in the 16–24px range for cards, fully pill-shaped (999px) for buttons.
8. State changes on interaction
 Real glass responds to input. On hover/press:
css
```css
/* increase fill opacity + blur slightly, shift highlight */
background: rgba(255,255,255,0.22); /* was 0.14 */
backdrop-filter: blur(16px); /* was 12px */
transform: translateY(-1px);
```
Static-only glass (no hover state) feels inert; Apple's glass elements always subtly react to touch/cursor.
Minimum bar to call something "glassmorphic": translucent fill + backdrop-filter blur + border + something visually interesting behind it. Skip any one of those four and it reads as a flat design trend from 2019, not liquid glass. Items 4–8 are what push it from "looks okay" to "looks like Apple built it."
One practical note: backdrop-filter can be GPU-expensive with many stacked glass elements — since you're already running OpenGL for the blobs, keep an eye on combined layer count so scroll performance doesn't suffer.