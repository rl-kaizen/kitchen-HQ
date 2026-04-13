# Kitchen HQ — Design Spec

**Date:** 2026-04-13
**Status:** Approved
**Platform:** iPad Pro (landscape, wall-mounted), touch-optimized PWA
**Hosting:** GitHub Pages (static)
**Tech stack:** Vanilla HTML, CSS, JavaScript — no framework, no build step

---

## 1. Overview

Kitchen HQ is a fullscreen, touch-optimized PWA for an iPad Pro mounted in the kitchen. It has two core modules (Recipe Generator, Google Calendar) accessible via horizontal swipe, a photo screensaver overlay that activates on idle, and a settings panel.

The app should feel production-quality — clean, polished, and visually impressive. It is currently single-user but may be extended for multi-user in the future.

## 2. Architecture

### 2.1 File Structure

```
kitchen-hq/
  index.html            — single page, all modules
  manifest.json         — PWA manifest (fullscreen, standalone)
  sw.js                 — service worker for offline caching
  css/
    styles.css          — global styles, CSS custom properties
  js/
    app.js              — swipe navigation, idle detection, init
    recipe.js           — Claude API integration, history, favorites
    calendar.js         — Google Calendar OAuth + API
    screensaver.js      — Google Photos integration + overlay
    settings.js         — settings panel, API keys, config
  assets/
    icons/              — PWA icons
```

### 2.2 PWA Requirements

- `manifest.json` configured for fullscreen standalone mode, landscape orientation
- Service worker caches static assets and last-fetched calendar/recipe data for offline access
- Installable to iPad home screen

### 2.3 Storage

| Data | Store | Rationale |
|------|-------|-----------|
| Recipe history + favorites | IndexedDB | Structured data, potentially many entries |
| Settings (timeout, intervals) | localStorage | Simple key-value pairs |
| Claude API key | localStorage | Single string, user-entered |
| Google OAuth tokens | localStorage | Token strings |
| Cached calendar events | localStorage | JSON blob, refreshed periodically |

## 3. Navigation & Layout

### 3.1 Swipe Navigation

- Two full-screen pages positioned side by side
- Horizontal swipe (touch events) transitions between pages via CSS `transform: translateX()`
- No visible navigation chrome — no tab bar, no dot indicators
- Content is self-identifying (recipe UI vs calendar grid)

### 3.2 Page Order

1. Recipe Generator (default/home)
2. Google Calendar

### 3.3 Persistent UI Elements

- **Digital clock** — top-left corner, small and unobtrusive, visible on all pages including screensaver
- **Settings gear icon** — top-right corner, visible on all pages (hidden during screensaver), opens settings panel

## 4. Module: Recipe Generator

### 4.1 Protein Selection (Two-Tier)

**Tier 1 — Category cards:** A horizontally scrollable row of image cards representing protein categories. Examples: Chicken, Beef, Pork, Seafood, Lamb, Turkey, Tofu/Plant-Based. Tap to select, which reveals the cuts row.

**Tier 2 — Cut cards:** A second horizontally scrollable row showing specific cuts within the selected category. Examples:
- Chicken: Thighs (bone-in skin-on), Thighs (boneless skinless), Breasts, Whole Chicken, Wings, Drumsticks, Ground Chicken
- Beef: Ribeye, NY Strip, Filet, Stew Meat, Ground Beef, Short Ribs, Flank, Brisket
- Pork: Chops, Tenderloin, Shoulder/Butt, Ribs, Ground Pork, Belly, Sausage
- Seafood: Salmon, Shrimp, Tuna, Cod, Scallops, Mussels
- (Additional categories/cuts to be populated)

**Multi-select:** Users can select cuts across multiple categories (e.g., Chicken Thighs + Shrimp for surf-and-turf).

Both rows scroll horizontally to avoid overwhelming the screen. The specific cut name is sent to Claude for accurate recipe generation.

### 4.2 Extra Instructions Field

A single text input field below the protein selection that serves dual purpose:

- **Pre-generation:** Additional context like "we also have leeks and mushrooms to use up" or "under 30 minutes" or "something light"
- **Post-generation:** Tweaks like "make it simpler" or "swap the broccoli, we don't have any"

Each message appends to the conversation thread with Claude, maintaining context across iterations.

### 4.3 Recipe Generation

- **Generate button:** Sends selected protein(s) + extra instructions to Claude API
- **System prompt:** Encodes the user's well-stocked kitchen — full aromatics (onion, garlic, shallot, ginger), complete spice cabinet, most condiments, common staples (rice, pasta, potatoes, herbs like cilantro and parsley, anchovies, etc.). Editable in Settings.
- **System prompt instructs Claude to:** Return a consistently formatted recipe with title, prep time, cook time, ingredients list (only non-pantry items highlighted), and numbered steps
- **Regenerate button:** Starts a fresh generation with the same protein selection (new conversation thread)
- **Tweak:** Uses the extra instructions field post-generation, continues the existing conversation thread

### 4.4 Recipe Display

- Title, brief description
- Prep time, cook time, total time
- Ingredients list (items beyond the base kitchen called out)
- Numbered steps — large, readable text for following while cooking
- Save/favorite icon (heart/bookmark)
- Regenerate button

### 4.5 History & Favorites

- Toggle/link below the recipe display: "View Saved Recipes & History"
- **History:** Auto-saved list of all generated recipes, ordered by date, scrollable
- **Favorites:** Explicitly saved recipes, quick access
- Each entry: title, protein, date, tappable to view full recipe
- Stored in IndexedDB with fields: title, protein input, full recipe text, timestamp, favorited flag

### 4.6 Claude API Integration

- API key stored in localStorage, entered via Settings
- Calls made client-side directly to Anthropic API
- Conversation history maintained per session for tweak continuity
- Regenerate starts a fresh conversation

## 5. Module: Google Calendar

### 5.1 Month View (Default)

- Full month grid, 7 columns (Sun–Sat)
- Today's date visually highlighted (border/background accent)
- Days with events show colored dots corresponding to calendar color
- Multiple dots for multiple events/calendars on the same day
- Previous/next month navigation arrows
- Tap any day to drill into day view

### 5.2 Day View

- Shows selected day's events in chronological detail
- Event cards with: title, time, calendar color
- Tap event to view details, edit, or delete
- Back navigation to return to month view

### 5.3 Week View

- Accessible from month view (navigation option)
- 7-day columnar view with time slots
- Events displayed as colored blocks

### 5.4 Event Creation & Editing

- Tap a time slot or "+" to create a new event
- Simple editor: title, date, start time, end time, calendar picker
- No attendees, recurrence, or location management (handle from phone)
- Tap existing event to edit or delete
- Writes go directly to Google Calendar API (no local queue)

### 5.5 Data Sync

- Fetches events from Google Calendar API on page load and every 5 minutes
- Caches last-fetched events in localStorage for offline display
- Color-coded by calendar if the account has multiple calendars

## 6. Photo Screensaver

### 6.1 Behavior

- Activates after configurable idle timeout (default: 5 minutes)
- Idle = no touch or swipe interaction
- Overlay layer (high z-index) fades in over the current page
- Tap anywhere to dismiss — returns to the module that was active underneath
- Any touch/swipe resets the idle timer

### 6.2 Photo Display

- Full-screen, edge-to-edge
- Photos scaled to cover (no black bars)
- Crossfade transition between photos
- Transition interval: configurable (default: 5 minutes per photo)
- Ken Burns-style subtle zoom/pan for visual polish — include in v1 if straightforward, defer if complex
- Digital clock remains visible in top-left corner

### 6.3 Google Photos Integration

- Uses Google Photos API with `photoslibrary.readonly` scope
- User designates an album name in Settings (e.g., "Kitchen Display")
- App fetches album photo URLs on load and caches them
- Photos cycle in sequential or random order
- Media URLs expire after ~1 hour — app periodically re-fetches URLs in the background to keep slideshow running

## 7. Settings Panel

### 7.1 Access

- Gear icon in top-right corner (visible on all pages, hidden during screensaver)
- Opens a slide-out panel from the right edge

### 7.2 Settings

| Setting | Control | Default |
|---------|---------|---------|
| Claude API Key | Masked text input | (empty) |
| Base Kitchen Prompt | Editable text area | Pre-populated with well-stocked kitchen description |
| Google Account | OAuth connect/disconnect button | (disconnected) |
| Google Photos Album | Dropdown or text field | (none selected) |
| Screensaver Timeout | Slider (1–30 min) | 5 minutes |
| Photo Transition Interval | Slider | 5 minutes |

### 7.3 Google OAuth

- Uses Google Identity Services (GIS) library
- Single OAuth consent flow requesting both scopes:
  - `https://www.googleapis.com/auth/calendar.events` (read-write)
  - `https://www.googleapis.com/auth/photoslibrary.readonly`
- Refresh token stored in localStorage
- Requires a Google Cloud project with OAuth credentials configured

## 8. Visual Design Direction

- Dark theme (dark backgrounds, light text) — works well in kitchen lighting and looks modern
- Touch targets minimum 44x44px (Apple HIG)
- Accent color for interactive elements and highlights
- Clean typography, generous spacing
- Smooth CSS transitions for swipe, screensaver fade, settings panel slide
- The app should elicit a "wow" reaction — polished, not DIY-looking

## 9. Technical Considerations

### 9.1 Google Photos URL Expiration

Google Photos API media item base URLs expire after approximately 60 minutes. The screensaver must periodically re-fetch URLs from the API to maintain the slideshow. Implementation: refresh the URL cache every 45 minutes while the screensaver is active.

### 9.2 iPad Landscape Optimization

- All layouts designed for landscape orientation (2048x1536 or 2388x1668 depending on iPad Pro model)
- CSS media queries not strictly necessary (single target device) but good practice
- Touch event handling must account for swipe vs tap distinction

### 9.3 Offline Behavior

- Service worker caches all static assets
- Cached calendar events display when offline
- Saved recipes accessible offline from IndexedDB
- Recipe generation requires internet (Claude API)
- Screensaver works with cached photo URLs until they expire

## 10. Deferred / Roadmap

- Shopping / Notes module — scrapped for v1, revisit when better scoped
- Additional searchable protein/ingredient cards beyond initial set
- Multi-user support via Supabase (auth + shared database)
- Gmail integration — explicitly scrapped
