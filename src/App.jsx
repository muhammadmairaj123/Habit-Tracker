import { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard.jsx';
import HabitForm from './components/HabitForm.jsx';
import HabitCard from './components/HabitCard.jsx';
import useLocalStorage from './hooks/useLocalStorage.js';
import useToday from './hooks/useToday.js';
import { formatDateKey } from './utils/dates.js';

// Data shape saved in localStorage under HABITS_KEY:
//   [{ id, name, icon, color, createdAt, completedDates: ["2025-06-02", ...] }, ...]
// Every habit has its own unique id, so habits can never overwrite each other.
const HABITS_KEY = 'habit-tracker:habits';
const THEME_KEY = 'habit-tracker:theme';

// Short unique id. (crypto.randomUUID is not available on plain-http pages,
// so we avoid depending on it.)
const createId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const getInitialTheme = () =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export default function App() {
  const [storedHabits, setHabits] = useLocalStorage(HABITS_KEY, []);
  const [theme, setTheme] = useLocalStorage(THEME_KEY, getInitialTheme);
  const [showForm, setShowForm] = useState(false);
  const today = useToday();

  // Guard against hand-edited or corrupted storage: anything that isn't an array becomes [].
  const habits = Array.isArray(storedHabits) ? storedHabits : [];

  // Mirror the theme onto <html> so the CSS variables in index.css switch.
  useEffect(() => {
    document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light';
  }, [theme]);

  // All changes go through this helper. It uses the "functional update" form of
  // setState, so each change starts from the latest saved list rather than from
  // a possibly stale copy captured when this component last rendered.
  function updateHabits(change) {
    setHabits((previous) => change(Array.isArray(previous) ? previous : []));
  }

  function addHabit({ name, icon, color }) {
    const habit = {
      id: createId(),
      name,
      icon,
      color,
      createdAt: today,
      completedDates: [],
    };
    updateHabits((list) => [...list, habit]);
    setShowForm(false);
  }

  // Only ever toggles TODAY. There is deliberately no way to pass in another date
  // (see "Trade-off" in the README).
  function toggleToday(id) {
    updateHabits((list) =>
      list.map((habit) => {
        if (habit.id !== id) return habit;
        const isDone = habit.completedDates.includes(today);
        return {
          ...habit,
          completedDates: isDone
            ? habit.completedDates.filter((date) => date !== today) // un-mark
            : [...habit.completedDates, today], // mark done
        };
      })
    );
  }

  function deleteHabit(id) {
    updateHabits((list) => list.filter((habit) => habit.id !== id));
  }

  const isDark = theme === 'dark';

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1 className="app-title">Habit Tracker</h1>
          <p className="app-date">
            {formatDateKey(today, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path
                  d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path
                  d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          {!showForm && (
            <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
              New habit
            </button>
          )}
        </div>
      </header>

      <main>
        <Dashboard habits={habits} today={today} />

        {showForm && (
          <HabitForm
            existingNames={habits.map((h) => h.name)}
            onAdd={addHabit}
            onCancel={() => setShowForm(false)}
          />
        )}

        {habits.length === 0 && !showForm && (
          <section className="empty-state">
            <span className="empty-emoji" aria-hidden="true">
              🌱
            </span>
            <h2>Start with one small habit</h2>
            <p>
              Pick something you can do in a couple of minutes, like a glass of water or ten pages
              of a book. Check in each day and watch your streak grow.
            </p>
            <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
              Add your first habit
            </button>
          </section>
        )}

        {habits.length > 0 && (
          <section className="habit-list" aria-label="Your habits">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                today={today}
                onToggle={toggleToday}
                onDelete={deleteHabit}
              />
            ))}
          </section>
        )}
      </main>

      <footer className="app-footer">
        Your data stays in this browser. Nothing is sent anywhere.
      </footer>
    </div>
  );
}
