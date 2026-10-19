import { useMemo } from 'react';
import { calculateCurrentStreak } from '../utils/streaks.js';

/**
 * Summary strip at the top: total habits, how many are done today, and the
 * best current streak across all habits.
 *
 * These numbers are DERIVED from `habits` and `today`, so we compute them
 * during render instead of storing them in state. Storing derived data means
 * two sources of truth that can drift out of sync. useMemo just avoids
 * recalculating when nothing relevant changed.
 */
export default function Dashboard({ habits, today }) {
  const { total, doneToday, bestStreak } = useMemo(() => {
    const streaks = habits.map((h) => calculateCurrentStreak(h.completedDates, today));
    return {
      total: habits.length,
      doneToday: habits.filter((h) => h.completedDates.includes(today)).length,
      bestStreak: streaks.length ? Math.max(...streaks) : 0,
    };
  }, [habits, today]);

  const percent = total === 0 ? 0 : Math.round((doneToday / total) * 100);
  const allDone = total > 0 && doneToday === total;

  return (
    <section className="dashboard" aria-label="Summary">
      <div className="stat-tile">
        <span className="stat-value">{total}</span>
        <span className="stat-label">{total === 1 ? 'Habit' : 'Habits'}</span>
      </div>

      <div className="stat-tile">
        <span className="stat-value">
          {doneToday}
          <span className="stat-of"> / {total}</span>
        </span>
        <span className="stat-label">Done today</span>
      </div>

      <div className="stat-tile">
        <span className="stat-value">
          {bestStreak}
          <span className="stat-of"> {bestStreak === 1 ? 'day' : 'days'}</span>
        </span>
        <span className="stat-label">Best current streak</span>
      </div>

      {total > 0 && (
        <div className="progress-wrap">
          <div
            className="progress"
            role="progressbar"
            aria-label="Habits completed today"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <div className="progress-fill" style={{ width: `${percent}%` }} />
          </div>
          <p className="progress-text">
            {allDone ? 'All done for today. Nice work.' : `${percent}% of today's habits complete`}
          </p>
        </div>
      )}
    </section>
  );
}
