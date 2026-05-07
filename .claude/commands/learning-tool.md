# Learning Tool Builder

Build a new interactive learning tool for this repo, following the established patterns exactly.
Takes a topic as argument: `/learning-tool <topic>`

**CRITICAL RULE: Never write any code until the user has approved the plan. Always plan first, ask questions, wait.**

---

## Phase 1 — Research (do silently, no output yet)

Run all of the following before presenting anything:

1. **Read the repo** for style and pattern context:
   - Read `index.html` — understand accent colors already used and card structure
   - Read one existing tool HTML file (e.g. `redis-cluster-explainer.html` or `spring-mvc-vs-webflux.html`) — absorb layout, CSS variable names, JS simulation patterns
   - Check `git branch --show-current` — you will commit to this branch

2. **Web search the topic** to ensure technical accuracy:
   - Search for how the concept actually works (not just your training knowledge)
   - Search for common production pitfalls and failure scenarios
   - Search for any version-specific details — flag uncertainty clearly if found
   - Aim for 2–3 searches covering: core mechanics, failure cases, real-world context

3. **Identify before planning:**
   - **The aha moment** — the one thing a user sees in motion that text alone cannot convey
   - **The failure scenario** — the edge case or pitfall that reveals *why* this concept matters in production
   - **The right simulation type(s)** from the decision table:

| Concept type | Simulation type |
|---|---|
| Concurrency, thread pools, queues, workers | State machine tick loop · grid of colored cells per entity |
| Two approaches compared (A vs B) | Side-by-side panels fed identical input simultaneously |
| Request / query / packet flow through layers | Step-by-step node highlight with animated packet element |
| Time-based concepts (TTL, expiry, retry, backoff) | Timeline sim with speed-multiplier slider |
| Sequential protocol steps / operations | Terminal-style output — lines appear one by one with latency |
| Data routing, partitioning, hashing, sharding | Hash computation visualization with animated slot routing |

Multiple simulation types can and often should be combined in one tool.

---

## Phase 2 — Present plan and ask questions (then STOP)

Output the plan in exactly this format:

---
**Tool:** `<kebab-case-filename>.html`
**Accent color:** `#xxxxxx` — pick one not already used:
  - Already taken: `#00d4aa` (Kafka) · `#ffb74d` (Rate limit) · `#ff4c4c` (Redis) · `#6db33f` (Spring) · `#48dbfb` (DNS)

**Aha moment:** [one sentence — what the user sees move/change that makes the concept click]

**Failure scenario:** [one sentence — the preset that shows what breaks and why it matters]

**Sections:**
1. **[Name]** — [what the user controls, what they observe, what interactions exist]
2. **[Name]** — ...
3. ...
*(include at minimum: one main interactive simulator, one comparison or flow, one reference panel)*

**Scenario presets:**
- Normal / happy path: ...
- Failure / pitfall (required): ...
- [optional third]: ...

**Questions:**
1. **Scope** — [offer 3–4 concrete options for what to include or cut — make it easy to choose]
2. **Depth** — [ask how detailed the animations or explanations should be — give options]
3. **[Topic-specific]** — [pick the single most important open question for this specific topic that would change the implementation significantly]

---

After outputting the plan, write one line: *"Waiting for your approval before I write any code."*

Then stop. Do not proceed to Phase 3 until the user explicitly approves.

---

## Phase 3 — Build (only after user approves)

Execute in this order:

1. **Create `<filename>.html`** — follow all conventions in the section below
2. **Update `index.html`** — add card and matching CSS (see card template)
3. **Commit** with a descriptive multi-line message summarizing what was built
4. **Push** to the current branch with `git push -u origin <branch>`

---

## Repo conventions — must follow exactly

### Visual style
- `body` background: `#1a1a2e` · panel background: `#16213e` · borders: `#2a3a5e`
- Top bar: `<div class="top-bar"><a href="index.html" class="back">← Back</a></div>`
- `h1` colored with the tool's accent color
- Section titles use a `.badge` chip for the interaction type (e.g. `interactive`, `step-by-step`, `live sim`)
- Zero external CSS/JS dependencies — fully self-contained single HTML file
- Buttons: `padding: 7-8px 14px`, `border-radius: 6px`, `font-weight: 600`
- Monospace font for all values, IPs, keys, latency numbers: `font-family: monospace`

### Standard button classes to define per tool
```css
.btn-primary { background: <accent>; color: #1a1a2e; }
.btn-danger  { background: #ff4c4c; color: #fff; }
.btn-reset   { background: #333; color: #aaa; border: 1px solid #555; }
button:disabled { opacity: 0.4; cursor: not-allowed; }
```

### Simulation tick loop (use for any real-time simulation)
```js
function tick() {
  if (!state.running) return;
  const now = performance.now();
  const dt = Math.min((now - state.lastT) / 1000, 0.1) * state.speed;
  state.lastT = now;
  // update state here
  renderState();
  requestAnimationFrame(tick);
}
```

### Arrival accumulator (prevents burst bias at high rates)
```js
state.acc += rate * dt;
while (state.acc >= 1) { processOne(now); state.acc -= 1; }
```

### Flying packet animation (request/query moving between nodes)
```js
async function flyPacket(fromEl, toEl, label, cssClass) {
  const from = fromEl.getBoundingClientRect();
  const to   = toEl.getBoundingClientRect();
  const p = document.createElement('div');
  p.className = `packet ${cssClass}`;
  p.textContent = label;
  p.style.cssText = `position:fixed;left:${from.left+from.width/2}px;top:${from.top+from.height/2}px;transition:all .65s ease;z-index:1000;pointer-events:none;`;
  document.body.appendChild(p);
  requestAnimationFrame(() => {
    p.style.left = (to.left + to.width/2) + 'px';
    p.style.top  = (to.top  + to.height/2) + 'px';
  });
  await new Promise(r => setTimeout(r, 700));
  p.remove();
}
```

### Terminal output (sequential lines appearing with delay)
```js
async function termLine(termId, html, delayBefore = 0) {
  if (delayBefore) await sleep(delayBefore);
  const d = document.createElement('div');
  d.className = 'term-line';
  d.innerHTML = html;
  document.getElementById(termId).appendChild(d);
  document.getElementById(termId).scrollTop = 9999;
}
```

### Event log (newest entry at top)
```js
function logEvent(msg, cssClass = 'l-info') {
  const el = document.getElementById('log');
  const d  = document.createElement('div');
  d.className = cssClass;
  d.textContent = msg;
  el.insertBefore(d, el.firstChild);
  while (el.children.length > 80) el.removeChild(el.lastChild);
}
```

### Stats panel pattern
```html
<div class="stats">  <!-- 3-column grid -->
  <div class="stat">
    <div class="stat-label">Throughput</div>
    <div class="stat-value good" id="statRps">0</div>
    <div class="stat-sub">req/s</div>
  </div>
  ...
</div>
```
Color classes: `.good` = accent green · `.warn` = `#ffb74d` · `.bad` = `#ff4c4c`

### Node state machine pattern
```css
.node         { background: #1a2a4a; border: 2px solid #2a4a6e; }
.node.active  { border-color: <accent>; }
.node.blocked { background: #3a1a0a; border-color: #ffb74d; animation: pulse .8s infinite; }
.node.dead    { opacity: 0.4; border-color: #444; }
```

### Non-negotiable rules
- **Always include a failure/pitfall preset** — the "happy path" alone teaches nothing memorable
- **Always show contrast** — never explain A without showing B alongside it
- **Sliders need a speed multiplier** whenever the real-world timescale is > 5 seconds
- **Reference section** at the bottom using `<details>` + `<summary>` — collapsible, covers: when to use, common pitfalls, config snippets
- **Scenario preset buttons** row above the main controls

### index.html card template

Add CSS before the closing `</style>`:
```css
.card-<name>::before { background: linear-gradient(90deg, <accent>, <secondary>); }
.card-<name>:hover   { border-color: <accent>; }
```

Add card inside `.cards` div:
```html
<a href="<filename>.html" class="card card-<name>">
  <span class="card-arrow">&rarr;</span>
  <span class="card-icon">[emoji]</span>
  <h2>[Title]</h2>
  <p>[2-sentence description — what the user will see and learn]</p>
  <div class="card-tags">
    <span class="tag">[Tag]</span>
    <span class="tag">[Tag]</span>
    <span class="tag">[Tag]</span>
  </div>
</a>
```

---

## Quality checklist (verify before committing)

- [ ] Accent color is unique — not used by any existing tool
- [ ] Back link points to `index.html`
- [ ] At least one failure/pitfall scenario preset exists
- [ ] At least one comparison (side-by-side or before/after) exists
- [ ] Speed multiplier present if any simulation runs > 5s real-time
- [ ] Reference section at bottom with `<details>` blocks
- [ ] `index.html` updated with card and CSS
- [ ] Zero external dependencies (no CDN links, no `<script src="...">`)
- [ ] Committed and pushed to current branch
