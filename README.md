# Habit Tracker

A free, fast, no-signup habit tracker that shows your consistency as a GitHub-style heatmap.

## Problem statement

People want to build small daily habits (drink water, exercise, read, study), but most habit apps are either bloated or paid. This app does one job: check in once a day, see your streak, and see your last 90 days at a glance. There is no account, no backend and no tracking. Everything is saved in your browser.

## Features

- Add a habit with a name, an optional emoji and an optional color
- One-tap daily check-in (tap again to undo)
- Current streak and longest streak for every habit
- 90-day heatmap per habit, built with plain CSS grid (no chart library)
- Dashboard: total habits, done today, best current streak
- Delete with a confirmation step
- Dark mode, remembered between visits
- Friendly empty state, duplicate-name check, and safe handling of corrupted saved data

## Tech used

- React 18 with Vite, using functional components and hooks only (`useState`, `useEffect`, `useMemo`)
- Plain CSS with CSS variables for theming (no Tailwind, no UI library)
- `localStorage` for persistence (no backend)
- Node's built-in test runner for the streak logic (no extra test dependencies)

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm test         # run the streak unit tests
npm run build    # production build into dist/
```

Requires Node 18 or newer.

## Project structure

```
src/
  App.jsx                  owns all state and the add/toggle/delete actions
  components/
    Dashboard.jsx          summary numbers at the top
    HabitForm.jsx          add-habit form with validation
    HabitCard.jsx          one habit: streaks, check-in button, delete, heatmap
    HeatmapGrid.jsx        the 90-day CSS grid
  hooks/
    useLocalStorage.js     useState that saves to and restores from localStorage
    useToday.js            keeps "today" correct if the tab stays open past midnight
  utils/
    streaks.js             the streak logic (pure functions, heavily commented)
    streaks.test.js        unit tests for the streak logic
    dates.js               local-date helpers
```

Data is saved under the key `habit-tracker:habits` as an array. Each habit has a unique `id` and its own `completedDates` list (for example `["2025-06-02", "2025-06-03"]`), so habits never overwrite each other.

## How the streak logic works

Each habit stores the list of dates it was completed. The **longest streak** sorts those dates and scans them once, growing a run while each date is exactly one day after the previous one and restarting at 1 after any gap. The **current streak** starts from today (or from yesterday if today isn't done yet, because you still have until midnight to check in) and walks backwards one day at a time until it hits a day that wasn't done. If neither today nor yesterday is done, a full day was missed and the current streak is 0. For example, done Mon, Tue, missed Wed, done Thu gives a current streak of 1 and a longest streak of 2 (this exact case is in the tests).

## Trade-off: only "today" can be checked in

You can't mark a past date as done. I chose this to keep the scope small and the data honest: the streak is a record of what you actually did each day, and it removes a whole class of complexity (a date picker, backfilling, and streaks that change retroactively). The cost is that if you forget to check in and remember the next morning, that day stays empty. A future version could allow editing yesterday only, which would be a small change because the streak functions already accept any list of dates.
