import { useMemo, useState } from 'react';
import HeatmapGrid from './HeatmapGrid.jsx';
import { getStreaks } from '../utils/streaks.js';

/**
 * One card per habit: name, icon, current + longest streak, today's check-in
 * button, a delete button (with a confirmation step) and the heatmap.
 *
 * The card owns only UI state (is the delete prompt open? is the pop animation
 * playing?). The data itself lives in App and is changed through onToggle/onDelete.
 */
export default function HabitCard({ habit, today, onToggle, onDelete }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [popping, setPopping] = useState(false);

  const doneToday = habit.completedDates.includes(today);

  // Recalculate only when the dates or the day change, not on every re-render.
  const { current, longest } = useMemo(
    () => getStreaks(habit.completedDates, today),
    [habit.completedDates, today]
  );

  const streakAtRisk = current > 0 && !doneToday;

  function handleToggle() {
    if (!doneToday) setPopping(true); // play the celebration only when marking done
    onToggle(habit.id);
  }

  return (
    <article className="habit-card" style={{ '--habit-color': habit.color }}>
      <header className="habit-head">
        <span className="habit-icon" aria-hidden="true">
          {habit.icon || habit.name.charAt(0).toUpperCase()}
        </span>
        <h2 className="habit-name">{habit.name}</h2>
        <button
          type="button"
          className="icon-btn icon-btn-danger"
          onClick={() => setConfirmingDelete(true)}
          aria-label={`Delete habit ${habit.name}`}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>

      <dl className="habit-stats">
        <div className="habit-stat">
          <dt>Current streak</dt>
          <dd>
            <span aria-hidden="true">🔥</span> {current} {current === 1 ? 'day' : 'days'}
          </dd>
        </div>
        <div className="habit-stat">
          <dt>Longest streak</dt>
          <dd>
            <span aria-hidden="true">🏆</span> {longest} {longest === 1 ? 'day' : 'days'}
          </dd>
        </div>
      </dl>

      {confirmingDelete ? (
        <div className="confirm" role="alertdialog" aria-label={`Confirm deleting ${habit.name}`}>
          <p className="confirm-text">Delete this habit and its history? This can't be undone.</p>
          <div className="confirm-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setConfirmingDelete(false)}>
              Keep habit
            </button>
            <button type="button" className="btn btn-danger" onClick={() => onDelete(habit.id)}>
              Delete habit
            </button>
          </div>
        </div>
      ) : (
        <>
          <button
            type="button"
            className={`check-btn${doneToday ? ' is-done' : ''}${popping ? ' is-popping' : ''}`}
            onClick={handleToggle}
            onAnimationEnd={() => setPopping(false)}
            aria-pressed={doneToday}
          >
            <svg className="check-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12.5l4.5 4.5L19 7.5" pathLength="1" />
            </svg>
            <span>{doneToday ? 'Done today' : 'Mark as done'}</span>
          </button>
          {streakAtRisk && (
            <p className="habit-hint">Check in today to keep your {current}-day streak going.</p>
          )}
        </>
      )}

      <HeatmapGrid completedDates={habit.completedDates} today={today} />
    </article>
  );
}
