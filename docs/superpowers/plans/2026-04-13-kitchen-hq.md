# Kitchen HQ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a touch-optimized kitchen PWA with recipe generation (Claude API), Google Calendar, and a Google Photos screensaver — deployed to GitHub Pages.

**Architecture:** Single-page vanilla HTML/CSS/JS app. Two swipeable full-screen pages (Recipe Generator, Google Calendar) plus a screensaver overlay and settings slide-out panel. No framework, no build step. All state in localStorage/IndexedDB.

**Tech Stack:** HTML5, CSS3 (custom properties, transitions, grid), vanilla JavaScript (ES modules), Anthropic Claude API, Google Identity Services, Google Calendar API, Google Photos Library API, IndexedDB, Service Worker.

**Spec:** `docs/superpowers/specs/2026-04-13-kitchen-hq-design.md`

---

### Task 1: Git Init & Project Scaffold

**Files:**
- Create: `.gitignore`
- Create: `index.html`
- Create: `manifest.json`
- Create: `css/styles.css`
- Create: `js/app.js`
- Create: `js/recipe.js`
- Create: `js/calendar.js`
- Create: `js/screensaver.js`
- Create: `js/settings.js`
- Create: `js/storage.js`
- Create: `assets/icons/` (directory)

- [ ] **Step 1: Initialize git repo**

```bash
cd "/Users/rileylawton/Code_Projects/Kitchen Productivity"
git init
```

- [ ] **Step 2: Create `.gitignore`**

```gitignore
.DS_Store
.superpowers/
node_modules/
```

- [ ] **Step 3: Create `manifest.json`**

```json
{
  "name": "Kitchen HQ",
  "short_name": "Kitchen HQ",
  "description": "Touch-optimized kitchen productivity app",
  "start_url": "/",
  "display": "standalone",
  "orientation": "landscape",
  "background_color": "#0a0a1a",
  "theme_color": "#0a0a1a",
  "icons": [
    {
      "src": "assets/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "assets/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

- [ ] **Step 4: Create `index.html`**

This is the single page for the entire app. It contains: the two swipeable page containers, the screensaver overlay, the settings panel, and persistent UI (clock + gear).

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <title>Kitchen HQ</title>
  <link rel="manifest" href="manifest.json">
  <link rel="apple-touch-icon" href="assets/icons/icon-192.png">
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <!-- Persistent UI -->
  <div id="clock" class="clock"></div>
  <button id="settings-btn" class="settings-btn" aria-label="Settings">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  </button>

  <!-- Swipe Container -->
  <div id="pages" class="pages">
    <!-- Page 1: Recipe Generator -->
    <section id="page-recipe" class="page">
      <div class="page-content">
        <!-- Protein Selection: Tier 1 (Categories) -->
        <div class="section-label">Select Protein</div>
        <div id="protein-categories" class="card-scroll"></div>

        <!-- Protein Selection: Tier 2 (Cuts) -->
        <div id="cuts-label" class="section-label" hidden>Select Cut</div>
        <div id="protein-cuts" class="card-scroll"></div>

        <!-- Selected Proteins Summary -->
        <div id="selected-proteins" class="selected-summary" hidden></div>

        <!-- Extra Instructions -->
        <div class="input-row">
          <input id="extra-instructions" type="text" class="text-input" placeholder="Extra instructions... &quot;use up the leeks&quot; or &quot;under 30 min&quot;">
          <button id="generate-btn" class="btn-primary" disabled>Generate</button>
        </div>

        <!-- Recipe Display -->
        <div id="recipe-display" class="recipe-card" hidden>
          <div class="recipe-header">
            <h2 id="recipe-title" class="recipe-title"></h2>
            <button id="fav-btn" class="fav-btn" aria-label="Save to favorites">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
          </div>
          <div id="recipe-meta" class="recipe-meta"></div>
          <div id="recipe-body" class="recipe-body"></div>
          <div class="recipe-actions">
            <button id="regenerate-btn" class="btn-secondary">Regenerate</button>
          </div>
        </div>

        <!-- History / Favorites Link -->
        <button id="history-toggle" class="link-btn" hidden>View Saved Recipes &amp; History</button>

        <!-- History / Favorites View -->
        <div id="history-view" class="history-view" hidden>
          <div class="history-tabs">
            <button class="history-tab active" data-tab="history">History</button>
            <button class="history-tab" data-tab="favorites">Favorites</button>
          </div>
          <div id="history-list" class="history-list"></div>
          <button id="history-back" class="link-btn">Back to Generator</button>
        </div>
      </div>
    </section>

    <!-- Page 2: Google Calendar -->
    <section id="page-calendar" class="page">
      <div class="page-content">
        <!-- Month View -->
        <div id="calendar-month" class="calendar-month">
          <div class="month-header">
            <button id="month-prev" class="nav-arrow" aria-label="Previous month">&lsaquo;</button>
            <h2 id="month-title" class="month-title"></h2>
            <button id="month-next" class="nav-arrow" aria-label="Next month">&rsaquo;</button>
          </div>
          <div class="day-headers">
            <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
          </div>
          <div id="month-grid" class="month-grid"></div>
        </div>

        <!-- Day View -->
        <div id="calendar-day" class="calendar-day" hidden>
          <div class="day-header">
            <button id="day-back" class="nav-arrow" aria-label="Back to month">&lsaquo;</button>
            <h2 id="day-title" class="day-title"></h2>
            <button id="add-event-btn" class="btn-icon" aria-label="Add event">+</button>
          </div>
          <div id="day-events" class="day-events"></div>
        </div>

        <!-- Event Editor Modal -->
        <div id="event-modal" class="modal" hidden>
          <div class="modal-content">
            <h3 id="event-modal-title">New Event</h3>
            <input id="event-title-input" type="text" class="text-input" placeholder="Event title">
            <input id="event-date-input" type="date" class="text-input">
            <div class="time-row">
              <input id="event-start-input" type="time" class="text-input">
              <span class="time-sep">to</span>
              <input id="event-end-input" type="time" class="text-input">
            </div>
            <select id="event-calendar-input" class="text-input"></select>
            <div class="modal-actions">
              <button id="event-delete-btn" class="btn-danger" hidden>Delete</button>
              <button id="event-cancel-btn" class="btn-secondary">Cancel</button>
              <button id="event-save-btn" class="btn-primary">Save</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- Screensaver Overlay -->
  <div id="screensaver" class="screensaver" hidden>
    <div id="screensaver-photo-a" class="screensaver-photo"></div>
    <div id="screensaver-photo-b" class="screensaver-photo"></div>
  </div>

  <!-- Settings Panel -->
  <div id="settings-backdrop" class="settings-backdrop" hidden></div>
  <aside id="settings-panel" class="settings-panel">
    <h2 class="settings-title">Settings</h2>

    <label class="setting-label">Claude API Key</label>
    <input id="setting-api-key" type="password" class="text-input" placeholder="sk-ant-...">

    <label class="setting-label">Base Kitchen Prompt</label>
    <textarea id="setting-kitchen-prompt" class="text-area" rows="6"></textarea>

    <label class="setting-label">Google Account</label>
    <button id="google-auth-btn" class="btn-secondary">Connect Google Account</button>
    <div id="google-auth-status" class="setting-status"></div>

    <label class="setting-label">Google Photos Album</label>
    <select id="setting-photos-album" class="text-input" disabled>
      <option value="">Connect Google first</option>
    </select>

    <label class="setting-label">Screensaver Timeout</label>
    <div class="slider-row">
      <input id="setting-idle-timeout" type="range" min="1" max="30" value="5" class="slider">
      <span id="idle-timeout-value" class="slider-value">5 min</span>
    </div>

    <label class="setting-label">Photo Transition Interval</label>
    <div class="slider-row">
      <input id="setting-photo-interval" type="range" min="1" max="30" value="5" class="slider">
      <span id="photo-interval-value" class="slider-value">5 min</span>
    </div>

    <button id="settings-close" class="btn-secondary settings-close-btn">Close</button>
  </aside>

  <!-- Scripts -->
  <script src="js/storage.js"></script>
  <script src="js/settings.js"></script>
  <script src="js/recipe.js"></script>
  <script src="js/calendar.js"></script>
  <script src="js/screensaver.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 5: Create empty JS module files**

Create each JS file with a top-level comment and an empty init function. These will be implemented in subsequent tasks.

`js/storage.js`:
```js
// Kitchen HQ — IndexedDB and localStorage helpers
const Storage = {
  DB_NAME: 'kitchen-hq',
  DB_VERSION: 1,
  db: null,

  async init() {
    // Implemented in Task 5
  }
};
```

`js/settings.js`:
```js
// Kitchen HQ — Settings panel
const Settings = {
  init() {
    // Implemented in Task 4
  }
};
```

`js/recipe.js`:
```js
// Kitchen HQ — Recipe Generator
const Recipe = {
  init() {
    // Implemented in Tasks 5–7
  }
};
```

`js/calendar.js`:
```js
// Kitchen HQ — Google Calendar
const Calendar = {
  init() {
    // Implemented in Tasks 9–10
  }
};
```

`js/screensaver.js`:
```js
// Kitchen HQ — Photo Screensaver
const Screensaver = {
  init() {
    // Implemented in Task 11
  }
};
```

`js/app.js`:
```js
// Kitchen HQ — Main app controller
const App = {
  init() {
    // Implemented in Tasks 2–3
  }
};
```

- [ ] **Step 6: Create placeholder PWA icons**

Generate simple 192x192 and 512x512 PNG icons. These are placeholders — can be replaced later with a proper icon.

```bash
# Use a simple canvas-based approach or just create placeholder files
# For now, create the directory
mkdir -p assets/icons
```

Note to implementer: Generate simple solid-color PNG icons with the text "KHQ" using any method available (canvas script, ImageMagick, or manual creation). They must exist for the PWA manifest to be valid.

- [ ] **Step 7: Commit scaffold**

```bash
git add -A
git commit -m "feat: project scaffold with index.html, manifest, and empty JS modules"
```

---

### Task 2: CSS Design System

**Files:**
- Create: `css/styles.css`

This task builds the complete CSS foundation: custom properties, dark theme, layout system, all component styles. The CSS is written once here and referenced by subsequent tasks.

- [ ] **Step 1: Write `css/styles.css`**

```css
/* === Kitchen HQ Design System === */

:root {
  /* Colors */
  --bg-primary: #0a0a1a;
  --bg-secondary: #16213e;
  --bg-tertiary: #0f3460;
  --bg-card: #1a1a2e;
  --accent: #e94560;
  --accent-glow: rgba(233, 69, 96, 0.3);
  --text-primary: #f0f0f0;
  --text-secondary: #a0a0b0;
  --text-muted: #555570;
  --border: #2a2a4a;
  --success: #4caf50;
  --danger: #ef5350;

  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif;
  --font-mono: 'SF Mono', 'Menlo', 'Monaco', monospace;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* Radii */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 500ms ease;
}

/* === Reset & Base === */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

html, body {
  height: 100%;
  overflow: hidden;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -webkit-user-select: none;
  user-select: none;
  touch-action: pan-y;
}

/* === Persistent UI === */
.clock {
  position: fixed;
  top: var(--space-md);
  left: var(--space-lg);
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--text-muted);
  z-index: 100;
  pointer-events: none;
}

.settings-btn {
  position: fixed;
  top: var(--space-md);
  right: var(--space-lg);
  z-index: 100;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast);
}

.settings-btn:active {
  color: var(--text-primary);
}

.screensaver-active .settings-btn {
  display: none;
}

/* === Pages (Swipe Container) === */
.pages {
  display: flex;
  width: 200vw;
  height: 100vh;
  transition: transform var(--transition-normal);
  will-change: transform;
}

.pages.swiping {
  transition: none;
}

.page {
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.page-content {
  padding: var(--space-2xl) var(--space-xl) var(--space-xl);
  max-width: 900px;
  margin: 0 auto;
}

/* === Section Labels === */
.section-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--text-muted);
  margin-bottom: var(--space-md);
}

/* === Card Scroll (Protein Cards) === */
.card-scroll {
  display: flex;
  gap: var(--space-md);
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: var(--space-md);
  margin-bottom: var(--space-lg);
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.card-scroll::-webkit-scrollbar {
  display: none;
}

.protein-card {
  flex-shrink: 0;
  width: 100px;
  height: 110px;
  background: var(--bg-secondary);
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  cursor: pointer;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  scroll-snap-align: start;
}

.protein-card .card-emoji {
  font-size: 32px;
}

.protein-card .card-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.2;
  padding: 0 var(--space-xs);
}

.protein-card.selected {
  border-color: var(--accent);
  box-shadow: 0 0 12px var(--accent-glow);
}

.protein-card.selected .card-label {
  color: var(--text-primary);
}

/* === Selected Summary (chips) === */
.selected-summary {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.selected-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 13px;
  padding: var(--space-xs) var(--space-md);
  border-radius: 20px;
}

.selected-chip .chip-remove {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 16px;
  cursor: pointer;
  padding: 0 0 0 var(--space-xs);
}

/* === Input Row === */
.input-row {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.text-input {
  flex: 1;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 15px;
  padding: var(--space-md) var(--space-lg);
  outline: none;
  transition: border-color var(--transition-fast);
}

.text-input:focus {
  border-color: var(--accent);
}

.text-input::placeholder {
  color: var(--text-muted);
}

.text-area {
  width: 100%;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 14px;
  padding: var(--space-md);
  outline: none;
  resize: vertical;
  transition: border-color var(--transition-fast);
}

.text-area:focus {
  border-color: var(--accent);
}

/* === Buttons === */
.btn-primary {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 600;
  padding: var(--space-md) var(--space-xl);
  cursor: pointer;
  transition: opacity var(--transition-fast);
  white-space: nowrap;
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-primary:active:not(:disabled) {
  opacity: 0.8;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: none;
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  padding: var(--space-sm) var(--space-lg);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.btn-secondary:active {
  color: var(--text-primary);
}

.btn-danger {
  background: var(--danger);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  padding: var(--space-sm) var(--space-lg);
  cursor: pointer;
}

.btn-icon {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.link-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-family: var(--font-sans);
  font-size: 14px;
  cursor: pointer;
  padding: var(--space-md) 0;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* === Recipe Card === */
.recipe-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.recipe-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.recipe-title {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.3;
}

.fav-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  flex-shrink: 0;
  padding: var(--space-xs);
  transition: color var(--transition-fast);
}

.fav-btn.favorited {
  color: var(--accent);
}

.fav-btn.favorited svg {
  fill: var(--accent);
}

.recipe-meta {
  display: flex;
  gap: var(--space-lg);
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: var(--space-lg);
}

.recipe-body {
  font-size: 15px;
  line-height: 1.8;
  color: var(--text-secondary);
}

.recipe-body h3 {
  color: var(--accent);
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: var(--space-lg) 0 var(--space-sm);
}

.recipe-body h3:first-child {
  margin-top: 0;
}

.recipe-body ul {
  list-style: none;
  padding: 0;
}

.recipe-body ul li::before {
  content: '•';
  color: var(--accent);
  margin-right: var(--space-sm);
}

.recipe-body ol {
  padding-left: var(--space-lg);
}

.recipe-body ol li {
  margin-bottom: var(--space-sm);
}

.recipe-actions {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--border);
}

/* === Loading Spinner === */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* === History View === */
.history-view {
  margin-top: var(--space-lg);
}

.history-tabs {
  display: flex;
  gap: var(--space-xs);
  margin-bottom: var(--space-lg);
}

.history-tab {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-family: var(--font-sans);
  font-size: 14px;
  padding: var(--space-sm) var(--space-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.history-tab.active {
  background: var(--bg-tertiary);
  border-color: var(--accent);
  color: var(--text-primary);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.history-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-lg);
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.history-item:active {
  border-color: var(--accent);
}

.history-item-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.history-item-meta {
  font-size: 12px;
  color: var(--text-muted);
}

/* === Calendar === */
.calendar-month {
  padding-top: var(--space-sm);
}

.month-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xl);
  margin-bottom: var(--space-lg);
}

.month-title {
  font-size: 22px;
  font-weight: 700;
  min-width: 200px;
  text-align: center;
}

.nav-arrow {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 28px;
  cursor: pointer;
  padding: var(--space-sm) var(--space-md);
  transition: color var(--transition-fast);
}

.nav-arrow:active {
  color: var(--text-primary);
}

.day-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: var(--space-sm);
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.day-cell {
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  padding: var(--space-sm);
  min-height: 64px;
  cursor: pointer;
  transition: background var(--transition-fast);
  position: relative;
}

.day-cell:active {
  background: var(--bg-tertiary);
}

.day-cell.other-month {
  background: var(--bg-primary);
  color: var(--text-muted);
  opacity: 0.4;
}

.day-cell.today {
  border: 1px solid var(--accent);
  background: var(--bg-card);
}

.day-number {
  font-size: 13px;
  font-weight: 600;
}

.day-dots {
  display: flex;
  gap: 3px;
  margin-top: var(--space-xs);
  flex-wrap: wrap;
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

/* Calendar Day View */
.calendar-day {
  padding-top: var(--space-sm);
}

.day-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.day-title {
  font-size: 22px;
  font-weight: 700;
  flex: 1;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.event-card {
  background: var(--bg-secondary);
  border-left: 4px solid var(--accent);
  border-radius: var(--radius-sm);
  padding: var(--space-md) var(--space-lg);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.event-card:active {
  background: var(--bg-tertiary);
}

.event-card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.event-card-time {
  font-size: 13px;
  color: var(--text-muted);
}

.no-events {
  text-align: center;
  color: var(--text-muted);
  padding: var(--space-2xl);
  font-size: 15px;
}

/* === Modal === */
.modal {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  width: 90%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.modal-content h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: var(--space-sm);
}

.time-row {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.time-sep {
  color: var(--text-muted);
  font-size: 14px;
}

.modal-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: flex-end;
  margin-top: var(--space-md);
}

/* === Settings Panel === */
.settings-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 300;
}

.settings-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 380px;
  max-width: 90vw;
  background: var(--bg-card);
  border-left: 1px solid var(--border);
  padding: var(--space-xl);
  overflow-y: auto;
  z-index: 301;
  transform: translateX(100%);
  transition: transform var(--transition-normal);
}

.settings-panel.open {
  transform: translateX(0);
}

.settings-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: var(--space-xl);
}

.setting-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-top: var(--space-lg);
  margin-bottom: var(--space-sm);
}

.setting-label:first-of-type {
  margin-top: 0;
}

.setting-status {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: var(--space-xs);
}

.slider-row {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: var(--accent);
  border-radius: 50%;
  cursor: pointer;
}

.slider-value {
  font-size: 14px;
  color: var(--text-secondary);
  min-width: 50px;
  text-align: right;
}

.settings-close-btn {
  margin-top: var(--space-xl);
  width: 100%;
}

/* === Screensaver === */
.screensaver {
  position: fixed;
  inset: 0;
  z-index: 250;
  background: #000;
  opacity: 0;
  transition: opacity 1.5s ease;
}

.screensaver.active {
  opacity: 1;
}

.screensaver-photo {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 2s ease;
  will-change: opacity, transform;
}

.screensaver-photo.visible {
  opacity: 1;
}

/* Ken Burns subtle zoom */
@keyframes ken-burns {
  from { transform: scale(1); }
  to   { transform: scale(1.08); }
}

.screensaver-photo.ken-burns {
  animation: ken-burns 30s ease-in-out alternate;
}

/* === Utility === */
[hidden] {
  display: none !important;
}

/* Scrollbar styling for page content */
.page::-webkit-scrollbar {
  width: 4px;
}

.page::-webkit-scrollbar-track {
  background: transparent;
}

.page::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 2px;
}
```

- [ ] **Step 2: Open in browser and verify**

```bash
# Start a simple local server to test
cd "/Users/rileylawton/Code_Projects/Kitchen Productivity"
python3 -m http.server 8080 &
# Open http://localhost:8080 in browser
```

Verify: dark background, clock area top-left, gear icon top-right, two pages exist (empty but scrollable), settings panel hidden.

- [ ] **Step 3: Commit**

```bash
git add css/styles.css
git commit -m "feat: complete CSS design system — dark theme, components, layout"
```

---

### Task 3: Swipe Navigation & Core App Controller

**Files:**
- Modify: `js/app.js`

Implements horizontal swipe between the two pages, idle detection for the screensaver trigger, and the digital clock.

- [ ] **Step 1: Implement `js/app.js`**

```js
// Kitchen HQ — Main app controller
const App = {
  currentPage: 0,
  totalPages: 2,
  touchStartX: 0,
  touchStartY: 0,
  touchDeltaX: 0,
  isSwiping: false,
  idleTimer: null,
  clockInterval: null,

  init() {
    this.pages = document.getElementById('pages');
    this.clockEl = document.getElementById('clock');
    this.settingsBtn = document.getElementById('settings-btn');

    this.setupSwipe();
    this.setupClock();
    this.setupIdleDetection();

    // Init sub-modules
    Settings.init();
    Storage.init().then(() => {
      Recipe.init();
    });
    Calendar.init();
    Screensaver.init();

    this.settingsBtn.addEventListener('click', () => Settings.open());
  },

  // --- Swipe Navigation ---
  setupSwipe() {
    const container = this.pages;

    container.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.touchDeltaX = 0;
      this.isSwiping = false;
      container.classList.add('swiping');
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      const dx = e.touches[0].clientX - this.touchStartX;
      const dy = e.touches[0].clientY - this.touchStartY;

      // Determine if horizontal swipe (only on first significant move)
      if (!this.isSwiping && Math.abs(dx) > 10) {
        // Only capture as swipe if more horizontal than vertical
        if (Math.abs(dx) > Math.abs(dy)) {
          this.isSwiping = true;
        } else {
          return; // Let vertical scroll happen
        }
      }

      if (!this.isSwiping) return;

      this.touchDeltaX = dx;
      const baseOffset = -this.currentPage * 100;
      const dragOffset = (dx / window.innerWidth) * 100;
      container.style.transform = `translateX(${baseOffset + dragOffset}vw)`;
    }, { passive: true });

    container.addEventListener('touchend', () => {
      container.classList.remove('swiping');

      if (this.isSwiping) {
        const threshold = window.innerWidth * 0.2;
        if (this.touchDeltaX < -threshold && this.currentPage < this.totalPages - 1) {
          this.currentPage++;
        } else if (this.touchDeltaX > threshold && this.currentPage > 0) {
          this.currentPage--;
        }
      }

      this.snapToPage();
      this.isSwiping = false;
      this.touchDeltaX = 0;
    }, { passive: true });
  },

  snapToPage() {
    const offset = -this.currentPage * 100;
    this.pages.style.transform = `translateX(${offset}vw)`;
  },

  goToPage(index) {
    if (index >= 0 && index < this.totalPages) {
      this.currentPage = index;
      this.snapToPage();
    }
  },

  // --- Clock ---
  setupClock() {
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
  },

  updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const mins = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    this.clockEl.textContent = `${hours}:${mins} ${ampm}`;
  },

  // --- Idle Detection ---
  setupIdleDetection() {
    const events = ['touchstart', 'touchmove', 'click', 'keydown'];
    const resetIdle = () => this.resetIdleTimer();
    events.forEach(evt => document.addEventListener(evt, resetIdle, { passive: true }));
    this.resetIdleTimer();
  },

  resetIdleTimer() {
    clearTimeout(this.idleTimer);
    const timeoutMin = parseInt(localStorage.getItem('khq-idle-timeout') || '5', 10);
    this.idleTimer = setTimeout(() => {
      Screensaver.activate();
    }, timeoutMin * 60 * 1000);
  }
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
```

- [ ] **Step 2: Test in browser**

Open http://localhost:8080 on iPad or desktop (use Chrome DevTools touch simulation).

Verify:
- Clock shows current time in top-left, updates each minute
- Swiping left shows page 2 (empty calendar area), swiping right goes back
- Swipe snaps to nearest page (no partial positions)
- Vertical scrolling still works within a page
- Settings gear icon visible top-right

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: swipe navigation, digital clock, and idle detection"
```

---

### Task 4: Settings Panel

**Files:**
- Modify: `js/settings.js`

Implements the slide-out settings panel with all form controls, localStorage persistence, and the default kitchen prompt.

- [ ] **Step 1: Implement `js/settings.js`**

```js
// Kitchen HQ — Settings panel
const Settings = {
  panel: null,
  backdrop: null,
  isOpen: false,

  DEFAULT_KITCHEN_PROMPT: `You are a recipe assistant for a well-stocked home kitchen. The kitchen always has:

AROMATICS: onion, garlic, shallots, ginger, green onions
HERBS: cilantro, parsley, thyme, rosemary, basil (dried and often fresh)
SPICE CABINET: salt, black pepper, paprika, smoked paprika, cumin, chili powder, cayenne, oregano, cinnamon, nutmeg, turmeric, coriander, red pepper flakes, bay leaves, Italian seasoning
CONDIMENTS: soy sauce, fish sauce, Worcestershire, hot sauce, Dijon mustard, mayonnaise, ketchup, olive oil, vegetable oil, sesame oil, rice vinegar, balsamic vinegar, white wine vinegar, honey, maple syrup
STAPLES: rice (white and brown), pasta (various shapes), potatoes, flour, sugar, butter, eggs, milk, chicken broth, canned tomatoes, tomato paste, coconut milk, breadcrumbs, panko
OTHER COMMON ITEMS: lemons, limes, anchovies, capers, olives, Parmesan cheese, cream cheese, sour cream

Assume all of the above are available — do NOT list them in the ingredients unless the recipe uses an unusually large amount. Only list ingredients the cook needs to specifically have on hand beyond this base kitchen.

When generating a recipe, format your response EXACTLY as follows:

# [Recipe Title]

**Prep:** [X min] | **Cook:** [Y min] | **Total:** [Z min]

## Ingredients
- [Only non-pantry ingredients, or pantry items used in unusual quantities]

## Instructions
1. [Step 1]
2. [Step 2]
...

Keep recipes practical and achievable for a home cook. Be specific about cuts of meat, temperatures, and timing.`,

  init() {
    this.panel = document.getElementById('settings-panel');
    this.backdrop = document.getElementById('settings-backdrop');

    // Bind controls
    this.apiKeyInput = document.getElementById('setting-api-key');
    this.kitchenPromptInput = document.getElementById('setting-kitchen-prompt');
    this.idleTimeoutSlider = document.getElementById('setting-idle-timeout');
    this.idleTimeoutValue = document.getElementById('idle-timeout-value');
    this.photoIntervalSlider = document.getElementById('setting-photo-interval');
    this.photoIntervalValue = document.getElementById('photo-interval-value');
    this.closeBtn = document.getElementById('settings-close');
    this.googleAuthBtn = document.getElementById('google-auth-btn');
    this.googleAuthStatus = document.getElementById('google-auth-status');
    this.photosAlbumSelect = document.getElementById('setting-photos-album');

    // Load saved values
    this.load();

    // Event listeners
    this.closeBtn.addEventListener('click', () => this.close());
    this.backdrop.addEventListener('click', () => this.close());

    this.apiKeyInput.addEventListener('change', () => this.save());
    this.kitchenPromptInput.addEventListener('change', () => this.save());

    this.idleTimeoutSlider.addEventListener('input', () => {
      this.idleTimeoutValue.textContent = `${this.idleTimeoutSlider.value} min`;
    });
    this.idleTimeoutSlider.addEventListener('change', () => this.save());

    this.photoIntervalSlider.addEventListener('input', () => {
      this.photoIntervalValue.textContent = `${this.photoIntervalSlider.value} min`;
    });
    this.photoIntervalSlider.addEventListener('change', () => this.save());
  },

  load() {
    this.apiKeyInput.value = localStorage.getItem('khq-api-key') || '';
    this.kitchenPromptInput.value = localStorage.getItem('khq-kitchen-prompt') || this.DEFAULT_KITCHEN_PROMPT;

    const idleTimeout = localStorage.getItem('khq-idle-timeout') || '5';
    this.idleTimeoutSlider.value = idleTimeout;
    this.idleTimeoutValue.textContent = `${idleTimeout} min`;

    const photoInterval = localStorage.getItem('khq-photo-interval') || '5';
    this.photoIntervalSlider.value = photoInterval;
    this.photoIntervalValue.textContent = `${photoInterval} min`;
  },

  save() {
    localStorage.setItem('khq-api-key', this.apiKeyInput.value);
    localStorage.setItem('khq-kitchen-prompt', this.kitchenPromptInput.value);
    localStorage.setItem('khq-idle-timeout', this.idleTimeoutSlider.value);
    localStorage.setItem('khq-photo-interval', this.photoIntervalSlider.value);
  },

  getApiKey() {
    return localStorage.getItem('khq-api-key') || '';
  },

  getKitchenPrompt() {
    return localStorage.getItem('khq-kitchen-prompt') || this.DEFAULT_KITCHEN_PROMPT;
  },

  open() {
    this.isOpen = true;
    this.panel.classList.add('open');
    this.backdrop.hidden = false;
  },

  close() {
    this.isOpen = false;
    this.panel.classList.remove('open');
    this.backdrop.hidden = true;
    this.save();
  }
};
```

- [ ] **Step 2: Test in browser**

Verify:
- Tapping gear icon opens settings panel from right
- Tapping backdrop closes it
- Slider values update in real-time
- Values persist after closing and reopening
- Kitchen prompt textarea is pre-populated with default
- Close button works

- [ ] **Step 3: Commit**

```bash
git add js/settings.js
git commit -m "feat: settings panel with localStorage persistence and default kitchen prompt"
```

---

### Task 5: IndexedDB Storage Layer

**Files:**
- Modify: `js/storage.js`

Implements the IndexedDB wrapper for recipe history and favorites.

- [ ] **Step 1: Implement `js/storage.js`**

```js
// Kitchen HQ — IndexedDB and localStorage helpers
const Storage = {
  DB_NAME: 'kitchen-hq',
  DB_VERSION: 1,
  db: null,

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('recipes')) {
          const store = db.createObjectStore('recipes', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('favorited', 'favorited', { unique: false });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve();
      };

      request.onerror = (e) => {
        console.error('IndexedDB error:', e.target.error);
        reject(e.target.error);
      };
    });
  },

  async saveRecipe(recipe) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('recipes', 'readwrite');
      const store = tx.objectStore('recipes');
      const request = store.add({
        title: recipe.title,
        proteins: recipe.proteins,
        body: recipe.body,
        timestamp: Date.now(),
        favorited: false
      });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async toggleFavorite(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('recipes', 'readwrite');
      const store = tx.objectStore('recipes');
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const recipe = getReq.result;
        recipe.favorited = !recipe.favorited;
        const putReq = store.put(recipe);
        putReq.onsuccess = () => resolve(recipe.favorited);
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  },

  async getRecipe(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('recipes', 'readonly');
      const store = tx.objectStore('recipes');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async getAllRecipes() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('recipes', 'readonly');
      const store = tx.objectStore('recipes');
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev'); // newest first
      const results = [];
      request.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  },

  async getFavorites() {
    const all = await this.getAllRecipes();
    return all.filter(r => r.favorited);
  }
};
```

- [ ] **Step 2: Test in browser console**

Open browser console and run:

```js
// After page loads (Storage.init() runs in App.init)
await Storage.saveRecipe({ title: 'Test Recipe', proteins: ['chicken thighs'], body: '# Test\nSome steps' });
const all = await Storage.getAllRecipes();
console.log(all); // Should show the saved recipe
await Storage.toggleFavorite(all[0].id);
const favs = await Storage.getFavorites();
console.log(favs); // Should show 1 favorited recipe
```

- [ ] **Step 3: Commit**

```bash
git add js/storage.js
git commit -m "feat: IndexedDB storage layer for recipe history and favorites"
```

---

### Task 6: Recipe Generator — Protein Selection UI

**Files:**
- Modify: `js/recipe.js`

Implements the two-tier protein card selection with horizontal scroll and multi-select.

- [ ] **Step 1: Implement protein data and card rendering in `js/recipe.js`**

```js
// Kitchen HQ — Recipe Generator
const Recipe = {
  // --- Protein Data ---
  proteins: {
    chicken: {
      emoji: '\u{1F414}',
      label: 'Chicken',
      cuts: [
        { id: 'chicken-thighs-bone-in', label: 'Thighs\n(bone-in)' },
        { id: 'chicken-thighs-boneless', label: 'Thighs\n(boneless)' },
        { id: 'chicken-breasts', label: 'Breasts' },
        { id: 'chicken-whole', label: 'Whole\nChicken' },
        { id: 'chicken-wings', label: 'Wings' },
        { id: 'chicken-drumsticks', label: 'Drumsticks' },
        { id: 'chicken-ground', label: 'Ground\nChicken' },
      ]
    },
    beef: {
      emoji: '\u{1F969}',
      label: 'Beef',
      cuts: [
        { id: 'beef-ribeye', label: 'Ribeye' },
        { id: 'beef-ny-strip', label: 'NY Strip' },
        { id: 'beef-filet', label: 'Filet' },
        { id: 'beef-flank', label: 'Flank' },
        { id: 'beef-stew-meat', label: 'Stew Meat' },
        { id: 'beef-ground', label: 'Ground Beef' },
        { id: 'beef-short-ribs', label: 'Short Ribs' },
        { id: 'beef-brisket', label: 'Brisket' },
      ]
    },
    pork: {
      emoji: '\u{1F416}',
      label: 'Pork',
      cuts: [
        { id: 'pork-chops', label: 'Chops' },
        { id: 'pork-tenderloin', label: 'Tenderloin' },
        { id: 'pork-shoulder', label: 'Shoulder' },
        { id: 'pork-ribs', label: 'Ribs' },
        { id: 'pork-ground', label: 'Ground Pork' },
        { id: 'pork-belly', label: 'Belly' },
        { id: 'pork-sausage', label: 'Sausage' },
      ]
    },
    seafood: {
      emoji: '\u{1F41F}',
      label: 'Seafood',
      cuts: [
        { id: 'seafood-salmon', label: 'Salmon' },
        { id: 'seafood-shrimp', label: 'Shrimp' },
        { id: 'seafood-tuna', label: 'Tuna' },
        { id: 'seafood-cod', label: 'Cod' },
        { id: 'seafood-scallops', label: 'Scallops' },
        { id: 'seafood-mussels', label: 'Mussels' },
        { id: 'seafood-crab', label: 'Crab' },
      ]
    },
    lamb: {
      emoji: '\u{1F411}',
      label: 'Lamb',
      cuts: [
        { id: 'lamb-chops', label: 'Chops' },
        { id: 'lamb-leg', label: 'Leg' },
        { id: 'lamb-shoulder', label: 'Shoulder' },
        { id: 'lamb-ground', label: 'Ground Lamb' },
        { id: 'lamb-rack', label: 'Rack' },
        { id: 'lamb-shanks', label: 'Shanks' },
      ]
    },
    turkey: {
      emoji: '\u{1F983}',
      label: 'Turkey',
      cuts: [
        { id: 'turkey-breast', label: 'Breast' },
        { id: 'turkey-ground', label: 'Ground\nTurkey' },
        { id: 'turkey-thighs', label: 'Thighs' },
        { id: 'turkey-whole', label: 'Whole\nTurkey' },
      ]
    },
    plant: {
      emoji: '\u{1F331}',
      label: 'Plant-Based',
      cuts: [
        { id: 'plant-tofu', label: 'Tofu' },
        { id: 'plant-tempeh', label: 'Tempeh' },
        { id: 'plant-beans', label: 'Beans' },
        { id: 'plant-lentils', label: 'Lentils' },
        { id: 'plant-chickpeas', label: 'Chickpeas' },
      ]
    }
  },

  selectedCategory: null,
  selectedCuts: [],   // Array of { id, label, category }
  conversationHistory: [],
  currentRecipeId: null,
  isGenerating: false,
  showingHistory: false,

  init() {
    this.categoriesEl = document.getElementById('protein-categories');
    this.cutsEl = document.getElementById('protein-cuts');
    this.cutsLabel = document.getElementById('cuts-label');
    this.selectedSummary = document.getElementById('selected-proteins');
    this.extraInput = document.getElementById('extra-instructions');
    this.generateBtn = document.getElementById('generate-btn');
    this.recipeDisplay = document.getElementById('recipe-display');
    this.recipeTitleEl = document.getElementById('recipe-title');
    this.recipeMetaEl = document.getElementById('recipe-meta');
    this.recipeBodyEl = document.getElementById('recipe-body');
    this.favBtn = document.getElementById('fav-btn');
    this.regenerateBtn = document.getElementById('regenerate-btn');
    this.historyToggle = document.getElementById('history-toggle');
    this.historyView = document.getElementById('history-view');
    this.historyList = document.getElementById('history-list');
    this.historyBack = document.getElementById('history-back');

    this.renderCategories();
    this.setupEventListeners();
  },

  renderCategories() {
    this.categoriesEl.innerHTML = '';
    for (const [key, cat] of Object.entries(this.proteins)) {
      const card = document.createElement('div');
      card.className = 'protein-card';
      card.dataset.category = key;
      card.innerHTML = `
        <span class="card-emoji">${cat.emoji}</span>
        <span class="card-label">${cat.label}</span>
      `;
      card.addEventListener('click', () => this.selectCategory(key));
      this.categoriesEl.appendChild(card);
    }
  },

  selectCategory(key) {
    this.selectedCategory = key;

    // Highlight selected category
    this.categoriesEl.querySelectorAll('.protein-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.category === key);
    });

    // Show cuts for this category
    this.renderCuts(key);
  },

  renderCuts(categoryKey) {
    const category = this.proteins[categoryKey];
    this.cutsEl.innerHTML = '';
    this.cutsLabel.hidden = false;

    for (const cut of category.cuts) {
      const card = document.createElement('div');
      card.className = 'protein-card';
      card.dataset.cutId = cut.id;

      // Check if already selected
      if (this.selectedCuts.some(s => s.id === cut.id)) {
        card.classList.add('selected');
      }

      card.innerHTML = `
        <span class="card-emoji">${category.emoji}</span>
        <span class="card-label">${cut.label}</span>
      `;
      card.addEventListener('click', () => this.toggleCut(cut, categoryKey));
      this.cutsEl.appendChild(card);
    }
  },

  toggleCut(cut, categoryKey) {
    const idx = this.selectedCuts.findIndex(s => s.id === cut.id);
    if (idx >= 0) {
      this.selectedCuts.splice(idx, 1);
    } else {
      this.selectedCuts.push({
        id: cut.id,
        label: cut.label.replace('\n', ' '),
        category: this.proteins[categoryKey].label
      });
    }

    // Re-render cuts to update selection state
    this.renderCuts(categoryKey);
    this.renderSelectedSummary();
    this.updateGenerateButton();
  },

  renderSelectedSummary() {
    if (this.selectedCuts.length === 0) {
      this.selectedSummary.hidden = true;
      return;
    }

    this.selectedSummary.hidden = false;
    this.selectedSummary.innerHTML = this.selectedCuts.map(cut => `
      <span class="selected-chip">
        ${cut.category} — ${cut.label}
        <button class="chip-remove" data-cut-id="${cut.id}">&times;</button>
      </span>
    `).join('');

    // Bind remove buttons
    this.selectedSummary.querySelectorAll('.chip-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cutId = btn.dataset.cutId;
        this.selectedCuts = this.selectedCuts.filter(c => c.id !== cutId);
        this.renderSelectedSummary();
        this.updateGenerateButton();
        // Re-render cuts if showing the category that contained this cut
        if (this.selectedCategory) {
          this.renderCuts(this.selectedCategory);
        }
      });
    });
  },

  updateGenerateButton() {
    this.generateBtn.disabled = this.selectedCuts.length === 0 || this.isGenerating;
  },

  setupEventListeners() {
    this.generateBtn.addEventListener('click', () => this.generate());
    this.regenerateBtn.addEventListener('click', () => this.regenerate());
    this.favBtn.addEventListener('click', () => this.toggleFavorite());
    this.historyToggle.addEventListener('click', () => this.showHistory());
    this.historyBack.addEventListener('click', () => this.hideHistory());

    // History tabs
    document.querySelectorAll('.history-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.history-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.loadHistoryTab(tab.dataset.tab);
      });
    });

    // Allow Enter in extra instructions to generate
    this.extraInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !this.generateBtn.disabled) {
        this.generate();
      }
    });
  },

  // --- Generation (implemented in Task 7) ---
  async generate() {
    // Placeholder — implemented in Task 7
  },

  async regenerate() {
    // Placeholder — implemented in Task 7
  },

  async toggleFavorite() {
    // Placeholder — implemented in Task 7
  },

  showHistory() {
    // Placeholder — implemented in Task 7
  },

  hideHistory() {
    // Placeholder — implemented in Task 7
  },

  loadHistoryTab(tab) {
    // Placeholder — implemented in Task 7
  }
};
```

- [ ] **Step 2: Test in browser**

Verify:
- Category cards render in a horizontal scrollable row (Chicken, Beef, Pork, etc.)
- Tapping a category highlights it and shows cut cards below
- Tapping a cut adds it to the selected summary chips
- Tapping the same cut again deselects it
- Selecting cuts across categories works (tap Chicken → Thighs, then tap Beef category → Ribeye)
- Remove chips via the × button
- Generate button enables when at least one cut is selected, disables when none

- [ ] **Step 3: Commit**

```bash
git add js/recipe.js
git commit -m "feat: two-tier protein selection with category and cut cards"
```

---

### Task 7: Recipe Generator — Claude API & History/Favorites

**Files:**
- Modify: `js/recipe.js`

Implements the Claude API call, recipe display, conversation threading, regeneration, and the history/favorites views.

- [ ] **Step 1: Implement generation methods in `js/recipe.js`**

Replace the placeholder methods at the bottom of the `Recipe` object with:

```js
  // --- Generation ---
  async generate() {
    if (this.selectedCuts.length === 0 || this.isGenerating) return;

    const apiKey = Settings.getApiKey();
    if (!apiKey) {
      Settings.open();
      return;
    }

    this.isGenerating = true;
    this.updateGenerateButton();
    this.generateBtn.textContent = 'Generating...';

    const proteinList = this.selectedCuts.map(c => `${c.category} ${c.label}`).join(', ');
    const extraInstructions = this.extraInput.value.trim();

    // Build user message
    let userMessage = `I have: ${proteinList}.`;
    if (extraInstructions) {
      userMessage += ` ${extraInstructions}`;
    }
    userMessage += ' What should I make?';

    // If this is a fresh generation (not a tweak), reset conversation
    if (this.conversationHistory.length === 0) {
      this.conversationHistory = [];
    }

    this.conversationHistory.push({ role: 'user', content: userMessage });

    try {
      const response = await this.callClaude(this.conversationHistory);

      this.conversationHistory.push({ role: 'assistant', content: response });

      // Parse and display
      this.displayRecipe(response, proteinList);

      // Save to history
      const title = this.parseTitle(response);
      const id = await Storage.saveRecipe({
        title: title,
        proteins: this.selectedCuts.map(c => `${c.category} ${c.label}`),
        body: response
      });
      this.currentRecipeId = id;
      this.favBtn.classList.remove('favorited');
      this.historyToggle.hidden = false;

    } catch (err) {
      console.error('Claude API error:', err);
      this.recipeDisplay.hidden = false;
      this.recipeTitleEl.textContent = 'Error';
      this.recipeBodyEl.innerHTML = `<p>Failed to generate recipe. ${err.message || 'Check your API key in Settings.'}</p>`;
      this.recipeMetaEl.textContent = '';
    }

    this.isGenerating = false;
    this.generateBtn.textContent = 'Generate';
    this.updateGenerateButton();
    this.extraInput.value = '';
  },

  async regenerate() {
    // Clear conversation to start fresh, then generate
    this.conversationHistory = [];
    await this.generate();
  },

  async callClaude(messages) {
    const apiKey = Settings.getApiKey();
    const systemPrompt = Settings.getKitchenPrompt();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  },

  parseTitle(markdown) {
    const match = markdown.match(/^#\s+(.+)$/m);
    return match ? match[1] : 'Untitled Recipe';
  },

  displayRecipe(markdown, proteinList) {
    this.recipeDisplay.hidden = false;

    // Parse title
    const title = this.parseTitle(markdown);
    this.recipeTitleEl.textContent = title;

    // Parse meta (prep/cook/total)
    const metaMatch = markdown.match(/\*\*Prep:\*\*\s*(.+?)\s*\|\s*\*\*Cook:\*\*\s*(.+?)\s*\|\s*\*\*Total:\*\*\s*(.+)/);
    if (metaMatch) {
      this.recipeMetaEl.innerHTML = `
        <span>Prep: ${metaMatch[1]}</span>
        <span>Cook: ${metaMatch[2]}</span>
        <span>Total: ${metaMatch[3]}</span>
      `;
    } else {
      this.recipeMetaEl.textContent = proteinList;
    }

    // Convert remaining markdown to HTML (simple conversion)
    let body = markdown;
    // Remove the title line
    body = body.replace(/^#\s+.+$/m, '');
    // Remove the meta line
    body = body.replace(/\*\*Prep:\*\*.+/m, '');

    // Convert ## headings to h3
    body = body.replace(/^##\s+(.+)$/gm, '<h3>$1</h3>');
    // Convert bold
    body = body.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Convert unordered lists
    body = body.replace(/^-\s+(.+)$/gm, '<li>$1</li>');
    body = body.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    // Convert ordered lists
    body = body.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    // Wrap consecutive <li> not in <ul> into <ol>
    body = body.replace(/(?<!<\/ul>\n?)(<li>.*<\/li>\n?)+/g, (match) => {
      if (body.indexOf(match) > body.indexOf('<ul>')) {
        return `<ol>${match}</ol>`;
      }
      return match;
    });
    // Convert line breaks
    body = body.replace(/\n\n/g, '<br>');

    this.recipeBodyEl.innerHTML = body.trim();

    // Scroll recipe into view
    this.recipeDisplay.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  // --- Favorites ---
  async toggleFavorite() {
    if (!this.currentRecipeId) return;
    const isFav = await Storage.toggleFavorite(this.currentRecipeId);
    this.favBtn.classList.toggle('favorited', isFav);
  },

  // --- History / Favorites Views ---
  showHistory() {
    this.showingHistory = true;
    this.historyView.hidden = false;
    // Hide generator UI
    this.categoriesEl.parentElement.querySelector('.section-label').hidden = true;
    this.categoriesEl.hidden = true;
    this.cutsLabel.hidden = true;
    this.cutsEl.hidden = true;
    this.selectedSummary.hidden = true;
    document.querySelector('.input-row').hidden = true;
    this.recipeDisplay.hidden = true;
    this.historyToggle.hidden = true;

    this.loadHistoryTab('history');
  },

  hideHistory() {
    this.showingHistory = false;
    this.historyView.hidden = true;
    // Restore generator UI
    this.categoriesEl.parentElement.querySelector('.section-label').hidden = false;
    this.categoriesEl.hidden = false;
    if (this.selectedCategory) {
      this.cutsLabel.hidden = false;
      this.cutsEl.hidden = false;
    }
    this.renderSelectedSummary();
    document.querySelector('.input-row').hidden = false;
    if (this.currentRecipeId) {
      this.recipeDisplay.hidden = false;
      this.historyToggle.hidden = false;
    }
  },

  async loadHistoryTab(tab) {
    const recipes = tab === 'favorites' ? await Storage.getFavorites() : await Storage.getAllRecipes();

    if (recipes.length === 0) {
      this.historyList.innerHTML = `<p class="no-events">${tab === 'favorites' ? 'No saved favorites yet.' : 'No recipe history yet.'}</p>`;
      return;
    }

    this.historyList.innerHTML = recipes.map(r => `
      <div class="history-item" data-recipe-id="${r.id}">
        <div class="history-item-title">${r.title}</div>
        <div class="history-item-meta">${r.proteins.join(', ')} — ${new Date(r.timestamp).toLocaleDateString()}</div>
      </div>
    `).join('');

    // Bind click to view recipe
    this.historyList.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', async () => {
        const recipe = await Storage.getRecipe(Number(item.dataset.recipeId));
        if (recipe) {
          this.currentRecipeId = recipe.id;
          this.displayRecipe(recipe.body, recipe.proteins.join(', '));
          this.favBtn.classList.toggle('favorited', recipe.favorited);
          this.hideHistory();
          this.recipeDisplay.hidden = false;
          this.historyToggle.hidden = false;
        }
      });
    });
  },
```

- [ ] **Step 2: Test in browser**

1. Open Settings, enter a Claude API key, close Settings
2. Select a protein (e.g., Chicken → Bone-in Thighs)
3. Tap Generate — recipe should appear after a few seconds
4. Type "make it faster" in extra instructions, tap Generate — should get a modified version
5. Tap Regenerate — should get a completely different recipe
6. Tap the heart icon — should toggle favorite state
7. Tap "View Saved Recipes & History" — should show history list
8. Tap a history item — should display that recipe
9. Switch to Favorites tab — should show only favorited recipes
10. Tap "Back to Generator" — returns to generator view

- [ ] **Step 3: Commit**

```bash
git add js/recipe.js
git commit -m "feat: Claude API recipe generation with conversation threading, history, and favorites"
```

---

### Task 8: Google OAuth Setup

**Files:**
- Modify: `index.html` (add GIS script tag)
- Modify: `js/settings.js` (wire up OAuth button)
- Create: `js/google-auth.js`

Implements Google Identity Services OAuth for Calendar + Photos scopes.

- [ ] **Step 1: Add GIS script to `index.html`**

Add this line before the app scripts in `index.html`:

```html
  <script src="https://accounts.google.com/gsi/client" async defer></script>
```

Place it just before `<script src="js/storage.js"></script>`.

- [ ] **Step 2: Create `js/google-auth.js`**

```js
// Kitchen HQ — Google OAuth via Google Identity Services
const GoogleAuth = {
  CLIENT_ID: '', // Set via Settings or hardcode for your project
  SCOPES: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/photoslibrary.readonly',
  tokenClient: null,
  accessToken: null,

  init() {
    this.accessToken = localStorage.getItem('khq-google-token') || null;
    this.tokenExpiry = parseInt(localStorage.getItem('khq-google-token-expiry') || '0', 10);

    // Check if stored token is still valid
    if (this.accessToken && Date.now() > this.tokenExpiry) {
      this.accessToken = null;
      localStorage.removeItem('khq-google-token');
      localStorage.removeItem('khq-google-token-expiry');
    }
  },

  getClientId() {
    return localStorage.getItem('khq-google-client-id') || '';
  },

  isAuthenticated() {
    return !!this.accessToken && Date.now() < this.tokenExpiry;
  },

  async authenticate() {
    const clientId = this.getClientId();
    if (!clientId) {
      throw new Error('Google Client ID not configured. Add it in Settings.');
    }

    return new Promise((resolve, reject) => {
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: this.SCOPES,
        callback: (response) => {
          if (response.error) {
            reject(new Error(response.error));
            return;
          }
          this.accessToken = response.access_token;
          // Token typically valid for 3600 seconds
          this.tokenExpiry = Date.now() + (response.expires_in * 1000);
          localStorage.setItem('khq-google-token', this.accessToken);
          localStorage.setItem('khq-google-token-expiry', String(this.tokenExpiry));
          resolve(response.access_token);
        }
      });
      this.tokenClient.requestAccessToken();
    });
  },

  async getToken() {
    if (this.isAuthenticated()) {
      return this.accessToken;
    }
    return this.authenticate();
  },

  disconnect() {
    if (this.accessToken) {
      google.accounts.oauth2.revoke(this.accessToken);
    }
    this.accessToken = null;
    this.tokenExpiry = 0;
    localStorage.removeItem('khq-google-token');
    localStorage.removeItem('khq-google-token-expiry');
  },

  async fetchJSON(url) {
    const token = await this.getToken();
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.status === 401) {
      // Token expired, try re-auth
      this.accessToken = null;
      const newToken = await this.getToken();
      const retry = await fetch(url, {
        headers: { Authorization: `Bearer ${newToken}` }
      });
      if (!retry.ok) throw new Error(`Google API error: ${retry.status}`);
      return retry.json();
    }
    if (!response.ok) throw new Error(`Google API error: ${response.status}`);
    return response.json();
  },

  async postJSON(url, body) {
    const token = await this.getToken();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`Google API error: ${response.status}`);
    return response.json();
  },

  async putJSON(url, body) {
    const token = await this.getToken();
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`Google API error: ${response.status}`);
    return response.json();
  },

  async deleteRequest(url) {
    const token = await this.getToken();
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`Google API error: ${response.status}`);
  }
};
```

- [ ] **Step 3: Add Google Client ID to Settings panel**

In `index.html`, add before the "Google Account" label in the settings panel:

```html
    <label class="setting-label">Google Client ID</label>
    <input id="setting-google-client-id" type="text" class="text-input" placeholder="your-client-id.apps.googleusercontent.com">
```

- [ ] **Step 4: Wire OAuth into Settings**

Update `js/settings.js` — add to `init()`:

```js
    this.googleClientIdInput = document.getElementById('setting-google-client-id');
    this.googleClientIdInput.value = localStorage.getItem('khq-google-client-id') || '';
    this.googleClientIdInput.addEventListener('change', () => {
      localStorage.setItem('khq-google-client-id', this.googleClientIdInput.value);
    });

    this.googleAuthBtn.addEventListener('click', async () => {
      if (GoogleAuth.isAuthenticated()) {
        GoogleAuth.disconnect();
        this.updateGoogleAuthUI();
      } else {
        try {
          await GoogleAuth.authenticate();
          this.updateGoogleAuthUI();
        } catch (err) {
          this.googleAuthStatus.textContent = `Error: ${err.message}`;
        }
      }
    });

    GoogleAuth.init();
    this.updateGoogleAuthUI();
```

Add the `updateGoogleAuthUI` method to `Settings`:

```js
  updateGoogleAuthUI() {
    if (GoogleAuth.isAuthenticated()) {
      this.googleAuthBtn.textContent = 'Disconnect Google';
      this.googleAuthStatus.textContent = 'Connected';
      this.googleAuthStatus.style.color = 'var(--success)';
      this.photosAlbumSelect.disabled = false;
    } else {
      this.googleAuthBtn.textContent = 'Connect Google Account';
      this.googleAuthStatus.textContent = 'Not connected';
      this.googleAuthStatus.style.color = 'var(--text-muted)';
      this.photosAlbumSelect.disabled = true;
    }
  },
```

- [ ] **Step 5: Add script tag for google-auth.js to `index.html`**

Add before `js/settings.js`:

```html
  <script src="js/google-auth.js"></script>
```

- [ ] **Step 6: Test in browser**

Verify:
- Google Client ID field appears in Settings
- Entering a valid Client ID and clicking "Connect Google Account" triggers Google OAuth popup
- After auth, button changes to "Disconnect Google" and status shows "Connected"
- Disconnect button revokes token

Note: To test this, you need a Google Cloud project with OAuth 2.0 credentials. Instructions:
1. Go to https://console.cloud.google.com
2. Create a project (or use existing)
3. Enable Google Calendar API and Google Photos Library API
4. Create OAuth 2.0 Client ID (Web application type)
5. Add your local URL and GitHub Pages URL as authorized JavaScript origins
6. Copy the Client ID into Settings

- [ ] **Step 7: Commit**

```bash
git add js/google-auth.js js/settings.js index.html
git commit -m "feat: Google OAuth via Identity Services for Calendar and Photos"
```

---

### Task 9: Google Calendar — Month View

**Files:**
- Modify: `js/calendar.js`

Implements the month grid, event fetching, event dots, today highlight, and month navigation.

- [ ] **Step 1: Implement `js/calendar.js`**

```js
// Kitchen HQ — Google Calendar
const Calendar = {
  currentMonth: null, // Date object set to 1st of displayed month
  events: [],         // Cached events for current range
  calendarColors: {}, // Calendar ID → color mapping
  syncInterval: null,
  selectedDay: null,
  editingEvent: null,

  init() {
    this.monthView = document.getElementById('calendar-month');
    this.dayView = document.getElementById('calendar-day');
    this.monthTitle = document.getElementById('month-title');
    this.monthGrid = document.getElementById('month-grid');
    this.prevBtn = document.getElementById('month-prev');
    this.nextBtn = document.getElementById('month-next');
    this.dayTitle = document.getElementById('day-title');
    this.dayEvents = document.getElementById('day-events');
    this.dayBackBtn = document.getElementById('day-back');
    this.addEventBtn = document.getElementById('add-event-btn');
    this.eventModal = document.getElementById('event-modal');
    this.eventModalTitle = document.getElementById('event-modal-title');
    this.eventTitleInput = document.getElementById('event-title-input');
    this.eventDateInput = document.getElementById('event-date-input');
    this.eventStartInput = document.getElementById('event-start-input');
    this.eventEndInput = document.getElementById('event-end-input');
    this.eventCalendarInput = document.getElementById('event-calendar-input');
    this.eventDeleteBtn = document.getElementById('event-delete-btn');
    this.eventCancelBtn = document.getElementById('event-cancel-btn');
    this.eventSaveBtn = document.getElementById('event-save-btn');

    // Set to current month
    const now = new Date();
    this.currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Load cached events
    this.loadCachedEvents();

    // Render
    this.renderMonth();

    // Event listeners
    this.prevBtn.addEventListener('click', () => this.changeMonth(-1));
    this.nextBtn.addEventListener('click', () => this.changeMonth(1));
    this.dayBackBtn.addEventListener('click', () => this.showMonthView());
    this.addEventBtn.addEventListener('click', () => this.openNewEvent());
    this.eventCancelBtn.addEventListener('click', () => this.closeModal());
    this.eventSaveBtn.addEventListener('click', () => this.saveEvent());
    this.eventDeleteBtn.addEventListener('click', () => this.deleteEvent());

    // Start sync if authenticated
    this.startSync();
  },

  // --- Month Rendering ---
  renderMonth() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    this.monthTitle.textContent = `${monthNames[month]} ${year}`;

    // First day of month and total days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    this.monthGrid.innerHTML = '';

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const cell = this.createDayCell(day, true, false);
      this.monthGrid.appendChild(cell);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === today.getDate();
      const date = new Date(year, month, day);
      const cell = this.createDayCell(day, false, isToday);
      this.addEventDots(cell, date);
      cell.addEventListener('click', () => this.showDayView(date));
      this.monthGrid.appendChild(cell);
    }

    // Next month leading days (fill to complete 6 rows)
    const totalCells = this.monthGrid.children.length;
    const remaining = (Math.ceil(totalCells / 7) * 7) - totalCells;
    for (let day = 1; day <= remaining; day++) {
      const cell = this.createDayCell(day, true, false);
      this.monthGrid.appendChild(cell);
    }
  },

  createDayCell(day, isOtherMonth, isToday) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    if (isOtherMonth) cell.classList.add('other-month');
    if (isToday) cell.classList.add('today');
    cell.innerHTML = `<span class="day-number">${day}</span><div class="day-dots"></div>`;
    return cell;
  },

  addEventDots(cell, date) {
    const dateStr = this.toDateString(date);
    const dayEvents = this.events.filter(e => {
      const eventDate = e.start.dateTime ? e.start.dateTime.slice(0, 10) : e.start.date;
      return eventDate === dateStr;
    });

    if (dayEvents.length === 0) return;

    const dotsContainer = cell.querySelector('.day-dots');
    // Show up to 4 dots
    const uniqueColors = [...new Set(dayEvents.map(e => this.getEventColor(e)))];
    uniqueColors.slice(0, 4).forEach(color => {
      const dot = document.createElement('div');
      dot.className = 'event-dot';
      dot.style.backgroundColor = color;
      dotsContainer.appendChild(dot);
    });
  },

  getEventColor(event) {
    // Use calendar-specific color or default to accent
    const calId = event.organizer?.email || 'default';
    return this.calendarColors[calId] || '#e94560';
  },

  changeMonth(delta) {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + delta);
    this.renderMonth();
    this.fetchEvents();
  },

  // --- Day View ---
  showDayView(date) {
    this.selectedDay = date;
    this.monthView.hidden = true;
    this.dayView.hidden = false;

    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    this.dayTitle.textContent = date.toLocaleDateString('en-US', options);

    this.renderDayEvents(date);
  },

  showMonthView() {
    this.dayView.hidden = true;
    this.monthView.hidden = false;
  },

  renderDayEvents(date) {
    const dateStr = this.toDateString(date);
    const dayEvents = this.events
      .filter(e => {
        const eventDate = e.start.dateTime ? e.start.dateTime.slice(0, 10) : e.start.date;
        return eventDate === dateStr;
      })
      .sort((a, b) => {
        const aTime = a.start.dateTime || a.start.date;
        const bTime = b.start.dateTime || b.start.date;
        return aTime.localeCompare(bTime);
      });

    if (dayEvents.length === 0) {
      this.dayEvents.innerHTML = '<p class="no-events">No events this day</p>';
      return;
    }

    this.dayEvents.innerHTML = dayEvents.map(event => {
      const color = this.getEventColor(event);
      const time = event.start.dateTime
        ? `${this.formatTime(event.start.dateTime)} – ${this.formatTime(event.end.dateTime)}`
        : 'All day';
      return `
        <div class="event-card" data-event-id="${event.id}" style="border-left-color: ${color}">
          <div class="event-card-title">${event.summary || '(No title)'}</div>
          <div class="event-card-time">${time}</div>
        </div>
      `;
    }).join('');

    // Bind click to edit
    this.dayEvents.querySelectorAll('.event-card').forEach(card => {
      card.addEventListener('click', () => {
        const event = dayEvents.find(e => e.id === card.dataset.eventId);
        if (event) this.openEditEvent(event);
      });
    });
  },

  // --- Event CRUD ---
  openNewEvent() {
    this.editingEvent = null;
    this.eventModalTitle.textContent = 'New Event';
    this.eventTitleInput.value = '';
    this.eventDateInput.value = this.toDateString(this.selectedDay || new Date());
    this.eventStartInput.value = '09:00';
    this.eventEndInput.value = '10:00';
    this.eventDeleteBtn.hidden = true;
    this.eventModal.hidden = false;
    this.loadCalendarList();
  },

  openEditEvent(event) {
    this.editingEvent = event;
    this.eventModalTitle.textContent = 'Edit Event';
    this.eventTitleInput.value = event.summary || '';
    this.eventDateInput.value = event.start.dateTime ? event.start.dateTime.slice(0, 10) : event.start.date;
    this.eventStartInput.value = event.start.dateTime ? event.start.dateTime.slice(11, 16) : '';
    this.eventEndInput.value = event.end.dateTime ? event.end.dateTime.slice(11, 16) : '';
    this.eventDeleteBtn.hidden = false;
    this.eventModal.hidden = false;
    this.loadCalendarList();
  },

  closeModal() {
    this.eventModal.hidden = true;
    this.editingEvent = null;
  },

  async loadCalendarList() {
    try {
      const data = await GoogleAuth.fetchJSON('https://www.googleapis.com/calendar/v3/users/me/calendarList');
      this.eventCalendarInput.innerHTML = data.items
        .filter(c => c.accessRole === 'owner' || c.accessRole === 'writer')
        .map(c => {
          this.calendarColors[c.id] = c.backgroundColor;
          return `<option value="${c.id}">${c.summary}</option>`;
        }).join('');

      // Pre-select the editing event's calendar
      if (this.editingEvent) {
        this.eventCalendarInput.value = this.editingEvent.organizer?.email || '';
      }
    } catch (err) {
      console.error('Failed to load calendar list:', err);
    }
  },

  async saveEvent() {
    const calendarId = this.eventCalendarInput.value || 'primary';
    const date = this.eventDateInput.value;
    const body = {
      summary: this.eventTitleInput.value,
      start: {
        dateTime: `${date}T${this.eventStartInput.value}:00`,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: `${date}T${this.eventEndInput.value}:00`,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    try {
      if (this.editingEvent) {
        await GoogleAuth.putJSON(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${this.editingEvent.id}`,
          body
        );
      } else {
        await GoogleAuth.postJSON(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
          body
        );
      }
      this.closeModal();
      await this.fetchEvents();
      if (this.selectedDay) this.renderDayEvents(this.selectedDay);
      this.renderMonth();
    } catch (err) {
      console.error('Failed to save event:', err);
    }
  },

  async deleteEvent() {
    if (!this.editingEvent) return;
    const calendarId = this.editingEvent.organizer?.email || 'primary';
    try {
      await GoogleAuth.deleteRequest(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${this.editingEvent.id}`
      );
      this.closeModal();
      await this.fetchEvents();
      if (this.selectedDay) this.renderDayEvents(this.selectedDay);
      this.renderMonth();
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  },

  // --- Data Sync ---
  async fetchEvents() {
    if (!GoogleAuth.isAuthenticated()) return;

    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    // Fetch 6 weeks around the displayed month
    const timeMin = new Date(year, month - 1, 1).toISOString();
    const timeMax = new Date(year, month + 2, 0).toISOString();

    try {
      // Get calendar list for colors
      const calList = await GoogleAuth.fetchJSON('https://www.googleapis.com/calendar/v3/users/me/calendarList');
      calList.items.forEach(c => {
        this.calendarColors[c.id] = c.backgroundColor;
      });

      // Fetch events from primary calendar and all visible calendars
      const allEvents = [];
      for (const cal of calList.items) {
        try {
          const data = await GoogleAuth.fetchJSON(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal.id)}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&maxResults=250`
          );
          if (data.items) {
            data.items.forEach(e => {
              e._calendarId = cal.id;
              e._calendarColor = cal.backgroundColor;
            });
            allEvents.push(...data.items);
          }
        } catch (e) {
          // Skip calendars we can't read
        }
      }

      this.events = allEvents;
      this.cacheEvents();
      this.renderMonth();
      if (this.selectedDay && !this.dayView.hidden) {
        this.renderDayEvents(this.selectedDay);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  },

  startSync() {
    // Initial fetch
    if (GoogleAuth.isAuthenticated()) {
      this.fetchEvents();
    }
    // Periodic sync every 5 minutes
    this.syncInterval = setInterval(() => {
      if (GoogleAuth.isAuthenticated()) {
        this.fetchEvents();
      }
    }, 5 * 60 * 1000);
  },

  cacheEvents() {
    try {
      localStorage.setItem('khq-calendar-events', JSON.stringify(this.events));
    } catch (e) {
      // localStorage might be full — ignore
    }
  },

  loadCachedEvents() {
    try {
      const cached = localStorage.getItem('khq-calendar-events');
      if (cached) this.events = JSON.parse(cached);
    } catch (e) {
      this.events = [];
    }
  },

  // --- Helpers ---
  toDateString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  formatTime(isoString) {
    const date = new Date(isoString);
    let hours = date.getHours();
    const mins = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${mins} ${ampm}`;
  }
};
```

- [ ] **Step 2: Test in browser**

Verify:
- Month grid renders with correct days, today highlighted
- Previous/next month arrows work
- If Google is connected: events appear as colored dots on days
- Tapping a day shows the day view with event cards
- Tapping "+" opens the new event modal
- Creating an event and saving writes to Google Calendar
- Tapping an event opens edit modal, can update or delete
- Back button returns to month view
- Without Google auth: empty calendar renders correctly with cached data

- [ ] **Step 3: Commit**

```bash
git add js/calendar.js
git commit -m "feat: Google Calendar with month/day views and event CRUD"
```

---

### Task 9b: Google Calendar — Week View

**Files:**
- Modify: `js/calendar.js`
- Modify: `index.html` (add week view HTML)
- Modify: `css/styles.css` (add week view styles)

Adds a week view accessible from the month view header, showing a 7-day columnar layout with time slots and events as colored blocks.

- [ ] **Step 1: Add week view HTML to `index.html`**

Inside `#page-calendar > .page-content`, after the `#calendar-day` div, add:

```html
        <!-- Week View -->
        <div id="calendar-week" class="calendar-week" hidden>
          <div class="week-header">
            <button id="week-back" class="nav-arrow" aria-label="Back to month">&lsaquo;</button>
            <h2 id="week-title" class="month-title"></h2>
            <div class="week-nav">
              <button id="week-prev" class="nav-arrow" aria-label="Previous week">&lsaquo;</button>
              <button id="week-next" class="nav-arrow" aria-label="Next week">&rsaquo;</button>
            </div>
          </div>
          <div class="week-grid-container">
            <div class="week-day-headers" id="week-day-headers"></div>
            <div class="week-grid" id="week-grid"></div>
          </div>
        </div>
```

Also add a "Week" toggle button inside `#calendar-month > .month-header`, after the next arrow:

```html
            <button id="week-view-btn" class="btn-secondary" style="margin-left: var(--space-lg);">Week</button>
```

- [ ] **Step 2: Add week view CSS to `css/styles.css`**

```css
/* Calendar Week View */
.calendar-week {
  padding-top: var(--space-sm);
}

.week-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.week-nav {
  display: flex;
  gap: var(--space-xs);
  margin-left: auto;
}

.week-grid-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px);
  overflow: hidden;
}

.week-day-headers {
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr);
  gap: 1px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--space-sm);
}

.week-day-header {
  padding: var(--space-sm);
}

.week-day-header.today {
  color: var(--accent);
}

.week-grid {
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr);
  grid-template-rows: repeat(24, 48px);
  gap: 1px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
}

.week-time-label {
  font-size: 11px;
  color: var(--text-muted);
  text-align: right;
  padding-right: var(--space-sm);
  padding-top: 2px;
}

.week-cell {
  background: var(--bg-secondary);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
}

.week-cell:active {
  background: var(--bg-tertiary);
}

.week-event {
  position: absolute;
  left: 2px;
  right: 2px;
  border-radius: 4px;
  padding: 2px var(--space-xs);
  font-size: 11px;
  font-weight: 500;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  z-index: 1;
}
```

- [ ] **Step 3: Add week view methods to `js/calendar.js`**

Add these properties to the Calendar object's `init()`:

```js
    this.weekView = document.getElementById('calendar-week');
    this.weekTitle = document.getElementById('week-title');
    this.weekDayHeaders = document.getElementById('week-day-headers');
    this.weekGrid = document.getElementById('week-grid');
    this.weekViewBtn = document.getElementById('week-view-btn');
    this.weekBackBtn = document.getElementById('week-back');
    this.weekPrevBtn = document.getElementById('week-prev');
    this.weekNextBtn = document.getElementById('week-next');
    this.currentWeekStart = null;

    this.weekViewBtn.addEventListener('click', () => this.showWeekView());
    this.weekBackBtn.addEventListener('click', () => this.showMonthView());
    this.weekPrevBtn.addEventListener('click', () => this.changeWeek(-1));
    this.weekNextBtn.addEventListener('click', () => this.changeWeek(1));
```

Add these methods to the Calendar object:

```js
  showWeekView(startDate) {
    // Default to current week
    if (!startDate) {
      const today = new Date();
      const day = today.getDay();
      startDate = new Date(today);
      startDate.setDate(today.getDate() - day); // Start on Sunday
    }
    this.currentWeekStart = startDate;
    this.monthView.hidden = true;
    this.dayView.hidden = true;
    this.weekView.hidden = false;
    this.renderWeek();
  },

  changeWeek(delta) {
    const newStart = new Date(this.currentWeekStart);
    newStart.setDate(newStart.getDate() + (delta * 7));
    this.currentWeekStart = newStart;
    this.renderWeek();
  },

  renderWeek() {
    const start = this.currentWeekStart;
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const startMonth = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    this.weekTitle.textContent = `${startMonth} – ${endMonth}`;

    const today = new Date();
    const todayStr = this.toDateString(today);

    // Day headers
    this.weekDayHeaders.innerHTML = '<div></div>'; // Empty cell for time column
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const isToday = this.toDateString(date) === todayStr;
      this.weekDayHeaders.innerHTML += `
        <div class="week-day-header ${isToday ? 'today' : ''}">${dayNames[i]}<br>${date.getDate()}</div>
      `;
    }

    // Grid: time labels + cells
    this.weekGrid.innerHTML = '';
    for (let hour = 0; hour < 24; hour++) {
      // Time label
      const label = document.createElement('div');
      label.className = 'week-time-label';
      label.style.gridRow = `${hour + 1}`;
      label.style.gridColumn = '1';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      label.textContent = `${displayHour} ${ampm}`;
      this.weekGrid.appendChild(label);

      // Day cells
      for (let day = 0; day < 7; day++) {
        const cell = document.createElement('div');
        cell.className = 'week-cell';
        cell.style.gridRow = `${hour + 1}`;
        cell.style.gridColumn = `${day + 2}`;
        const cellDate = new Date(start);
        cellDate.setDate(cellDate.getDate() + day);
        cell.addEventListener('click', () => {
          this.selectedDay = cellDate;
          this.eventStartInput.value = `${String(hour).padStart(2, '0')}:00`;
          this.eventEndInput.value = `${String(hour + 1).padStart(2, '0')}:00`;
          this.openNewEvent();
        });
        this.weekGrid.appendChild(cell);
      }
    }

    // Overlay events
    for (let day = 0; day < 7; day++) {
      const date = new Date(start);
      date.setDate(date.getDate() + day);
      const dateStr = this.toDateString(date);
      const dayEvents = this.events.filter(e => {
        const eventDate = e.start.dateTime ? e.start.dateTime.slice(0, 10) : e.start.date;
        return eventDate === dateStr;
      });

      for (const event of dayEvents) {
        if (!event.start.dateTime) continue; // Skip all-day events in grid
        const startHour = parseInt(event.start.dateTime.slice(11, 13));
        const startMin = parseInt(event.start.dateTime.slice(14, 16));
        const endHour = parseInt(event.end.dateTime.slice(11, 13));
        const endMin = parseInt(event.end.dateTime.slice(14, 16));

        const topOffset = (startMin / 60) * 48;
        const duration = ((endHour - startHour) * 60 + (endMin - startMin)) / 60 * 48;

        const el = document.createElement('div');
        el.className = 'week-event';
        el.style.gridColumn = `${day + 2}`;
        el.style.gridRow = `${startHour + 1}`;
        el.style.top = `${topOffset}px`;
        el.style.height = `${Math.max(duration, 20)}px`;
        el.style.backgroundColor = this.getEventColor(event);
        el.textContent = event.summary || '(No title)';
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openEditEvent(event);
        });
        this.weekGrid.appendChild(el);
      }
    }

    // Scroll to 8 AM by default
    this.weekGrid.scrollTop = 8 * 48;
  },
```

Update `showMonthView()` to also hide the week view:

```js
  showMonthView() {
    this.dayView.hidden = true;
    this.weekView.hidden = true;
    this.monthView.hidden = false;
  },
```

- [ ] **Step 4: Test in browser**

Verify:
- "Week" button appears in month header
- Tapping it shows the week view with 7 columns + time slots
- Events render as colored blocks at the correct time positions
- Previous/next week arrows navigate
- Tapping a cell opens the event creation modal with pre-filled time
- Back button returns to month view
- Today's column header is highlighted

- [ ] **Step 5: Commit**

```bash
git add js/calendar.js index.html css/styles.css
git commit -m "feat: calendar week view with time grid and event blocks"
```

---

### Task 10: Photo Screensaver

**Files:**
- Modify: `js/screensaver.js`

Implements the fullscreen photo overlay with Google Photos album integration, crossfade transitions, and Ken Burns effect.

- [ ] **Step 1: Implement `js/screensaver.js`**

```js
// Kitchen HQ — Photo Screensaver
const Screensaver = {
  photos: [],
  currentIndex: 0,
  activeSlot: 'a', // alternates between 'a' and 'b' for crossfade
  cycleTimer: null,
  refreshTimer: null,
  isActive: false,

  init() {
    this.overlay = document.getElementById('screensaver');
    this.photoA = document.getElementById('screensaver-photo-a');
    this.photoB = document.getElementById('screensaver-photo-b');

    // Tap to dismiss
    this.overlay.addEventListener('click', () => this.deactivate());

    // Load cached photos
    this.loadCachedPhotos();
  },

  async activate() {
    if (this.isActive) return;
    if (this.photos.length === 0) {
      await this.fetchPhotos();
      if (this.photos.length === 0) return; // No photos available
    }

    this.isActive = true;
    document.body.classList.add('screensaver-active');
    this.overlay.hidden = false;

    // Show first photo immediately
    this.currentIndex = 0;
    this.showPhoto(this.photos[0]);

    // Fade in
    requestAnimationFrame(() => {
      this.overlay.classList.add('active');
    });

    // Start cycling
    const intervalMin = parseInt(localStorage.getItem('khq-photo-interval') || '5', 10);
    this.cycleTimer = setInterval(() => this.nextPhoto(), intervalMin * 60 * 1000);

    // Refresh URLs every 45 minutes (they expire after ~60 min)
    this.refreshTimer = setInterval(() => this.fetchPhotos(), 45 * 60 * 1000);
  },

  deactivate() {
    if (!this.isActive) return;
    this.isActive = false;

    this.overlay.classList.remove('active');
    document.body.classList.remove('screensaver-active');

    // After fade-out transition, hide
    setTimeout(() => {
      this.overlay.hidden = true;
      this.photoA.classList.remove('visible', 'ken-burns');
      this.photoB.classList.remove('visible', 'ken-burns');
      this.photoA.style.backgroundImage = '';
      this.photoB.style.backgroundImage = '';
    }, 1500);

    clearInterval(this.cycleTimer);
    clearInterval(this.refreshTimer);
    this.cycleTimer = null;
    this.refreshTimer = null;

    // Reset idle timer
    App.resetIdleTimer();
  },

  showPhoto(photo) {
    const slot = this.activeSlot === 'a' ? this.photoA : this.photoB;
    const otherSlot = this.activeSlot === 'a' ? this.photoB : this.photoA;

    // Set new photo with sizing params
    const url = `${photo.baseUrl}=w2048-h1536`;
    slot.style.backgroundImage = `url(${url})`;

    // Ken Burns: randomize direction
    slot.style.transformOrigin = this.randomOrigin();
    slot.classList.remove('ken-burns');
    void slot.offsetWidth; // force reflow
    slot.classList.add('ken-burns');

    // Crossfade
    slot.classList.add('visible');
    otherSlot.classList.remove('visible');

    // Alternate slot for next photo
    this.activeSlot = this.activeSlot === 'a' ? 'b' : 'a';
  },

  nextPhoto() {
    if (this.photos.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.photos.length;
    this.showPhoto(this.photos[this.currentIndex]);
  },

  randomOrigin() {
    const positions = ['center', 'top left', 'top right', 'bottom left', 'bottom right', 'center top', 'center bottom'];
    return positions[Math.floor(Math.random() * positions.length)];
  },

  // --- Google Photos Integration ---
  async fetchPhotos() {
    if (!GoogleAuth.isAuthenticated()) return;

    const albumName = localStorage.getItem('khq-photos-album') || '';
    if (!albumName) return;

    try {
      // Find the album
      const albums = await GoogleAuth.fetchJSON('https://photoslibrary.googleapis.com/v1/albums?pageSize=50');
      const album = albums.albums?.find(a => a.title === albumName);
      if (!album) {
        console.warn(`Album "${albumName}" not found`);
        return;
      }

      // Fetch media items from the album
      const token = await GoogleAuth.getToken();
      const response = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems:search', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          albumId: album.id,
          pageSize: 100
        })
      });

      if (!response.ok) throw new Error(`Photos API error: ${response.status}`);
      const data = await response.json();

      if (data.mediaItems) {
        // Only include photos (not videos)
        this.photos = data.mediaItems.filter(item =>
          item.mimeType && item.mimeType.startsWith('image/')
        );
        this.cachePhotos();

        // Shuffle for variety
        this.shufflePhotos();
      }
    } catch (err) {
      console.error('Failed to fetch photos:', err);
    }
  },

  shufflePhotos() {
    for (let i = this.photos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.photos[i], this.photos[j]] = [this.photos[j], this.photos[i]];
    }
  },

  cachePhotos() {
    try {
      // Only cache baseUrls and IDs (URLs expire, but useful for initial render)
      const minimal = this.photos.map(p => ({ id: p.id, baseUrl: p.baseUrl, mimeType: p.mimeType }));
      localStorage.setItem('khq-photos-cache', JSON.stringify(minimal));
    } catch (e) {
      // Ignore storage errors
    }
  },

  loadCachedPhotos() {
    try {
      const cached = localStorage.getItem('khq-photos-cache');
      if (cached) this.photos = JSON.parse(cached);
    } catch (e) {
      this.photos = [];
    }
  }
};
```

- [ ] **Step 2: Wire album selection in Settings**

Update `js/settings.js` — add to the Google auth section in `init()`:

```js
    this.photosAlbumSelect.addEventListener('change', () => {
      localStorage.setItem('khq-photos-album', this.photosAlbumSelect.value);
    });
```

Add a method to Settings to populate the album dropdown after Google auth:

```js
  async loadPhotoAlbums() {
    if (!GoogleAuth.isAuthenticated()) return;
    try {
      const data = await GoogleAuth.fetchJSON('https://photoslibrary.googleapis.com/v1/albums?pageSize=50');
      const saved = localStorage.getItem('khq-photos-album') || '';
      this.photosAlbumSelect.innerHTML = '<option value="">Select album...</option>' +
        (data.albums || []).map(a =>
          `<option value="${a.title}" ${a.title === saved ? 'selected' : ''}>${a.title}</option>`
        ).join('');
      this.photosAlbumSelect.disabled = false;
    } catch (err) {
      console.error('Failed to load albums:', err);
    }
  },
```

Call `this.loadPhotoAlbums()` inside `updateGoogleAuthUI` when authenticated.

- [ ] **Step 3: Test in browser**

Verify:
- After Google auth, album dropdown populates with user's Google Photos albums
- Selecting an album saves the choice
- After idle timeout (set to 1 min in Settings for testing), screensaver fades in
- Photos display full-screen with cover scaling
- Ken Burns subtle zoom effect visible
- Crossfade transition between photos
- Tapping anywhere dismisses screensaver, returns to last page
- Clock remains visible during screensaver

- [ ] **Step 4: Commit**

```bash
git add js/screensaver.js js/settings.js
git commit -m "feat: photo screensaver with Google Photos, crossfade, and Ken Burns effect"
```

---

### Task 11: Service Worker & PWA Offline

**Files:**
- Create: `sw.js`

Implements cache-first service worker for offline capability and PWA installability.

- [ ] **Step 1: Create `sw.js`**

```js
const CACHE_NAME = 'kitchen-hq-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/styles.css',
  '/js/app.js',
  '/js/storage.js',
  '/js/settings.js',
  '/js/recipe.js',
  '/js/calendar.js',
  '/js/screensaver.js',
  '/js/google-auth.js',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png'
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for static assets, network-first for API calls
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Don't cache API calls or Google auth
  if (url.hostname === 'api.anthropic.com' ||
      url.hostname === 'www.googleapis.com' ||
      url.hostname === 'photoslibrary.googleapis.com' ||
      url.hostname === 'accounts.google.com') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache successful GET responses for same-origin
        if (response.ok && event.request.method === 'GET' && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
```

- [ ] **Step 2: Register the service worker in `js/app.js`**

Add to the top of `App.init()`:

```js
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.warn('SW registration failed:', err);
      });
    }
```

- [ ] **Step 3: Test in browser**

Verify:
- Open Chrome DevTools → Application → Service Workers: shows "kitchen-hq" registered
- Application → Cache Storage: shows cached assets
- Toggle offline in DevTools → Network: app still loads (recipe generation and calendar won't work, but UI renders)
- On iPad: "Add to Home Screen" from Safari creates a standalone fullscreen app

- [ ] **Step 4: Commit**

```bash
git add sw.js js/app.js
git commit -m "feat: service worker for offline caching and PWA installability"
```

---

### Task 12: GitHub Pages Deployment

**Files:**
- No new files — this task is about repository setup and first deploy

- [ ] **Step 1: Create GitHub repository**

```bash
cd "/Users/rileylawton/Code_Projects/Kitchen Productivity"
gh repo create kitchen-hq --public --source=. --remote=origin
```

(If you prefer private, use `--private` instead of `--public`.)

- [ ] **Step 2: Push to GitHub**

```bash
git push -u origin main
```

- [ ] **Step 3: Enable GitHub Pages**

```bash
gh api repos/{owner}/kitchen-hq/pages -X POST -f source.branch=main -f source.path="/"
```

Or manually: Repository Settings → Pages → Source: Deploy from branch → `main` / `/ (root)`.

- [ ] **Step 4: Verify deployment**

Wait 1-2 minutes, then open `https://<username>.github.io/kitchen-hq/`.

Verify the app loads, dark theme renders, swipe works, clock shows.

- [ ] **Step 5: Update OAuth origins**

In Google Cloud Console → Credentials → OAuth 2.0 Client ID, add the GitHub Pages URL as an authorized JavaScript origin:
- `https://<username>.github.io`

- [ ] **Step 6: Update service worker paths if needed**

If the app is hosted at a subpath (`/kitchen-hq/`), update the service worker cache paths and manifest `start_url`:

In `manifest.json`, change `"start_url": "/"` to `"start_url": "/kitchen-hq/"`.

In `sw.js`, prefix all `STATIC_ASSETS` paths with `/kitchen-hq`.

- [ ] **Step 7: Commit path fixes if needed**

```bash
git add manifest.json sw.js
git commit -m "fix: update paths for GitHub Pages subpath deployment"
git push
```

---

### Task 13: Visual Polish & Final Testing

**Files:**
- Potentially modify: `css/styles.css`, any JS file

This is a manual testing and polish pass on the actual target device (iPad Pro, landscape).

- [ ] **Step 1: Test on iPad Pro**

Install the PWA on the iPad (Safari → Share → Add to Home Screen). Test each flow:

1. **Swipe navigation** — smooth horizontal swipe between Recipe and Calendar pages, correct snap behavior, no jank
2. **Recipe Generator** — select proteins, generate recipe, tweak, regenerate, save favorite, view history
3. **Calendar** — month view renders, navigate months, tap day for day view, create/edit/delete events
4. **Screensaver** — activates after idle timeout, photos crossfade, tap to dismiss
5. **Settings** — gear icon opens panel, all controls work, values persist
6. **Clock** — visible on all pages, correct time

- [ ] **Step 2: Fix any touch target issues**

Ensure all interactive elements are at least 44x44px. Common fixes:
- Increase padding on nav arrows
- Increase size of protein cards if too small on iPad
- Ensure modal inputs are large enough

- [ ] **Step 3: Fix any visual issues**

Common fixes:
- Adjust font sizes for iPad landscape readability
- Ensure recipe text is large enough to read from arm's length
- Check that the calendar grid fills the screen well
- Verify screensaver photos scale to cover without distortion

- [ ] **Step 4: Commit polish fixes**

```bash
git add -A
git commit -m "fix: visual polish and touch target improvements from iPad testing"
git push
```
