# 🏈 FizzyFest Fantasy Football - Playoff Edition

Welcome to the **FizzyFest Fantasy Football** project. This document serves as a guide for any agent picking up work on this codebase.

## 🏗 Architecture Overview

The application is a **Real-Time Multiplayer Draft Board** designed for NFL Playoff fantasy leagues. It is built with a "Cloud-Synced Local-First" philosophy.

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, and bespoke CSS3.
- **State Management**: A global `state` object in `app.js` that persists to `localStorage`.
- **Real-Time Sync**: Uses **Supabase Realtime**. The entire league state is serialized and pushed to a `play_events` table. Clients subscribe to this table to keep their local state in sync.
- **Data Source**: **ESPN Fantasy API**. Stats are pulled live from the `kona_player_info` endpoint.
- **Aesthetics**: Glassmorphism, modern typography (Outfit), and a high-density "Simple Table" UI for the draft board.

## ✅ Completed Features

### 1. ESPN API Integration (v2.4.0)
- Real-time stat fetching for the 2025 Regular Season.
- Mapping of ESPN Stat IDs to internal player objects.
- Categories: Pass Yds/TD, Rush Yds/TD, Recs/Yds/TD, Ints, Fumbles.

### 2. League & Scoring Settings (v2.5.0)
- customizable scoring multipliers (e.g., 4pt vs 6pt Passing TDs).
- **Admin Only**: Only the league creator (Aaron) can modify settings.
- **Dynamic Recalculation**: Changing a setting instantly updates all player totals and team scores across the league.

### 3. Point Audit Tool (v2.6.0)
- Hover over any player's "POINTS" total on the Draft Board to see a math breakdown of how that score was calculated based on the current league rules.

### 4. Draft Mechanics
- Snake draft generation.
- Position validation (QB, RB1/2, WR1/2, TE, FLEX1/2).
- Live "Recent Picks" feed and "Next Up" queue.

## 🛠 Active Work & Known Issues

### 🔢 2pt Conversion Stats
- **Issue**: Attempting to integrate Stat IDs `19` (Pass 2pt), `37` (Rush 2pt), and `54` (Rec 2pt) from ESPN.
- **Status**: Needs verification to ensure these IDs correctly represent 2pt conversions in the 2025 data set.

### 🔐 Authentication
- Currently uses name-based login (non-secure). "Aaron" is hardcoded as the admin for critical actions (Start Draft, Edit Settings).

### 🔄 Sync Conflicts
- While Supabase handles real-time updates, concurrent edits to the same league (e.g., two people trying to draft at the exact same millisecond) are handled by "last-write-wins".

## 🚀 How to Run
1. Open `index.html` in any modern browser.
2. For local development, use a simple live server (e.g., `npx serve .` or Live Server extension).
3. **Important**: Always do a **Hard Refresh (Cmd + Shift + R)** after changes to ensure the service worker/cache doesn't serve old JS.

## 📂 File Structure
- `index.html`: Main UI structure and view definitions.
- `app.js`: Core logic, API integration, Supabase sync, and rendering.
- `style.css`: All styling, including the custom "Draft Board" table and Glassmorphism effects.
- `CREATE_PLAY_EVENTS_TABLE.sql`: SQL schema for the Supabase backend.

---
*Maintained by Antigravity AI*
