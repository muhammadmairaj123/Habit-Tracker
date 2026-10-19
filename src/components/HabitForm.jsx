import { useEffect, useRef, useState } from 'react';

// Preset colors. The first one is the app's accent color and the default.
const COLORS = [
  { name: 'Teal', value: '#0f8f78' },
  { name: 'Coral', value: '#e5484d' },
  { name: 'Amber', value: '#c96f00' },
  { name: 'Blue', value: '#2f6fed' },
  { name: 'Violet', value: '#7c4dcc' },
  { name: 'Pink', value: '#d6409f' },
];

// Quick-pick emojis. Users can also type or paste any emoji they like.
const EMOJIS = ['💧', '🏃', '📚', '🧘', '✍️', '🛌', '🥗', '🎸'];

const MAX_NAME_LENGTH = 40;

/**
 * Form for adding a habit. It only collects and validates input; App decides
 * what to do with the finished habit (via onAdd).
 *
 * `existingNames` lets us block duplicates such as "Read" and "read".
 */
export default function HabitForm({ existingNames, onAdd, onCancel }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState(COLORS[0].value);
  const [error, setError] = useState('');
  const nameInputRef = useRef(null);

  // Put the cursor in the name field as soon as the form opens.
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError('Give your habit a name, for example "Drink water".');
      nameInputRef.current?.focus();
      return;
    }
    if (existingNames.some((existing) => existing.toLowerCase() === trimmed.toLowerCase())) {
      setError(`You already have a habit called "${trimmed}".`);
      nameInputRef.current?.focus();
      return;
    }

    onAdd({ name: trimmed, icon: icon.trim(), color });
  }

  return (
    <form className="panel habit-form" onSubmit={handleSubmit} noValidate>
      <h2 className="panel-title">Add a habit</h2>

      <div className="field">
        <label htmlFor="habit-name">Habit name</label>
        <input
          id="habit-name"
          ref={nameInputRef}
          type="text"
          value={name}
          maxLength={MAX_NAME_LENGTH}
          placeholder="Drink 2 litres of water"
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'habit-name-error' : undefined}
        />
        {error && (
          <p id="habit-name-error" className="field-error" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="habit-icon">Emoji (optional)</label>
        <div className="emoji-row">
          <input
            id="habit-icon"
            className="emoji-input"
            type="text"
            value={icon}
            maxLength={8}
            placeholder="🙂"
            onChange={(e) => setIcon(e.target.value)}
          />
          <div className="chip-row">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={`chip${icon === emoji ? ' is-selected' : ''}`}
                onClick={() => setIcon(icon === emoji ? '' : emoji)}
                aria-pressed={icon === emoji}
                aria-label={`Use emoji ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="field">
        <span className="field-label" id="color-label">
          Color (optional)
        </span>
        <div className="swatch-row" role="group" aria-labelledby="color-label">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              className={`swatch${color === c.value ? ' is-selected' : ''}`}
              style={{ backgroundColor: c.value }}
              onClick={() => setColor(c.value)}
              aria-pressed={color === c.value}
              aria-label={c.name}
              title={c.name}
            />
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Add habit
        </button>
      </div>
    </form>
  );
}
