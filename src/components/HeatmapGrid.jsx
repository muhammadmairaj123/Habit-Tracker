import { useMemo } from 'react';
import { addDays, formatDateKey, parseDateKey } from '../utils/dates.js';

/**
 * GitHub-style contribution graph for one habit, built with plain CSS grid.
 *
 * Layout idea: the grid has 7 rows (Sunday to Saturday) and fills column by
 * column, so each column is one calendar week and time flows left -> right.
 * (This is `grid-auto-flow: column` in index.css.)
 *
 * The first column is usually partial. If our 90-day window starts on a
 * Wednesday, we add 3 invisible "padding" cells (Sun, Mon, Tue) so that
 * Wednesday lands on the correct row.
 */
export default function HeatmapGrid({ completedDates, today, days = 90 }) {
  const { cells, doneCount } = useMemo(() => {
    const done = new Set(completedDates);
    const startKey = addDays(today, -(days - 1));

    // getDay(): 0 = Sunday ... 6 = Saturday, i.e. how many padding cells we need.
    const paddingCount = parseDateKey(startKey).getDay();

    const list = [];
    for (let i = 0; i < paddingCount; i += 1) {
      list.push({ key: `pad-${i}`, isPadding: true });
    }

    let count = 0;
    for (let i = 0; i < days; i += 1) {
      const key = addDays(startKey, i);
      const isDone = done.has(key);
      if (isDone) count += 1;
      list.push({ key, isDone, isToday: key === today });
    }
    return { cells: list, doneCount: count };
  }, [completedDates, today, days]);

  return (
    <figure className="heatmap-figure">
      <div className="heatmap-scroll">
        <div
          className="heatmap"
          role="img"
          aria-label={`Last ${days} days: completed on ${doneCount} of ${days} days`}
        >
          {cells.map((cell) => {
            if (cell.isPadding) {
              return <span key={cell.key} className="heatmap-cell is-padding" aria-hidden="true" />;
            }
            const status = cell.isDone ? 'done' : 'not done';
            const classes = ['heatmap-cell'];
            if (cell.isDone) classes.push('is-done');
            if (cell.isToday) classes.push('is-today');
            return (
              <span
                key={cell.key}
                className={classes.join(' ')}
                title={`${formatDateKey(cell.key)}: ${status}`}
              />
            );
          })}
        </div>
      </div>
      <figcaption className="heatmap-caption">
        Done on {doneCount} of the last {days} days
      </figcaption>
    </figure>
  );
}
