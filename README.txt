# Sorting Visualizer — Embeddable Widget

An interactive sorting-algorithm visualizer for course pages, blog posts, and lecture
slides. One script tag, zero dependencies, zero build step.

---

## Quick start

Add a marker `<div>` with the `data-sorting-visualizer` attribute anywhere on your page,
then load the script. That's it — it finds the div and mounts itself automatically.

```html
<div data-sorting-visualizer></div>
<script src="sorting-visualizer.js"></script>
```

You can embed as many of these as you like on one page — each is fully independent
(separate state, separate playback, separate settings).

---

## Configuring a widget

Every setting is optional and has a sensible default. Set them as `data-*` attributes
on the marker div:

```html
<div data-sorting-visualizer
     data-size="30"
     data-algo="merge"
     data-speed="100"
     data-algos="merge,quick"
     data-direction="desc"
     data-array="42,7,19,3,88,15,56,2,31,64"
     data-accent="#ff9d3d"></div>
```

| Attribute | Default | What it does |
|---|---|---|
| `data-size` | `20` | Number of bars when randomizing (5–100). Ignored if `data-array` is set — the array's own length is used instead. |
| `data-algo` | `bubble` | Which algorithm is active on load. One of: `bubble`, `insertion`, `selection`, `merge`, `quick`. |
| `data-speed` | `150` | Delay between animation steps, in milliseconds (10–500). Lower = faster. |
| `data-algos` | *(all five)* | Comma-separated list restricting which algorithm tabs are shown, in the order given — e.g. `data-algos="merge"` for a single-algorithm lesson with no tab bar at all, or `data-algos="quick,merge"` to compare just two, quicksort first. |
| `data-direction` | `asc` | Sort toward `asc` (ascending) or `desc` (descending). There's also an on-widget ⇡/⇣ button so viewers can flip it themselves. |
| `data-array` | *(random)* | Comma-separated starting values, e.g. `data-array="5,3,8,1,9"`, for demonstrating a specific dataset (a homework example, a worst-case input, etc). The "new array" button still randomizes normally after that. |
| `data-accent` | `#89b4fa` (blue) | A single hex color to retint tabs, the play button, and bars — for matching your course branding. A matching darker shade is derived automatically. |
| `data-min-value` / `data-max-value` | `5` / `100` | Range used when randomizing bar values. |

### Keyboard shortcuts

While hovering a widget: **Space** toggles play/pause, **←/→** steps back/forward.
Shortcuts are scoped per-widget (like a video player) — hovering one widget never
affects another one elsewhere on the page.

---

## Mounting from your own JavaScript

For more control (dynamic pages, single-page apps, or if you want to drive the widget
from your own buttons), skip the `data-sorting-visualizer` marker and mount manually:

```html
<div id="my-widget"></div>
<script src="sorting-visualizer.js"></script>
<script>
  const instance = SortingVisualizer.mount('#my-widget', {
    size: 25,
    algo: 'selection',
    speed: 120,
    algos: ['bubble', 'insertion', 'selection'],
    direction: 'asc',
    array: [8, 3, 9, 1, 6],       // optional, overrides `size`
    accent: '#a6e3a1'
  });
</script>
```

`mount()` accepts either a CSS selector string or a DOM element as its first argument,
and returns a handle for controlling that specific instance:

```js
instance.setAlgorithm('quick');   // switch algorithm (any key from `algos`, or all five by default)
instance.newArray(15);            // generate a new random array of the given size
instance.setSpeed(80);            // change playback delay in ms
instance.play();
instance.pause();
instance.reset();                 // jump back to the start
instance.destroy();               // tear down and remove the widget entirely
```

This is the same handle used internally by the widget's own buttons, so anything the
UI can do, your own code can do too — e.g. auto-advancing through algorithms as a
reader scrolls, or wiring `instance.play()` to a "watch it sort" link elsewhere on
the page.

---

## Notes

- **No external requests.** The widget uses a system monospace font stack by default.
  If you want the exact JetBrains Mono look from the demo page, load it yourself:
  `<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">`
  — the widget will pick it up automatically if present, and falls back gracefully if not.
- **Responsive.** Widgets adapt down to narrow embeds (e.g. a blog sidebar column);
  the algorithm tab bar gains scroll arrows automatically if it doesn't fit.
- **Multiple instances are fully independent** — different settings, different
  playback state, no shared globals.
- Browser support: current Chrome, Firefox, and Safari.

---

## License

See `LICENSE.txt`. Personal-use only for this version — see that file for details.