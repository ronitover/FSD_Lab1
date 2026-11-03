import { useEffect, useEffectEvent, useState } from 'react';
import { inputClasses } from './styles.ts';

interface SearchBarProps {
  label: string;
  value: string;
  /** Called once typing pauses, so each keystroke doesn't start a request. */
  onSearch: (value: string) => void;
  placeholder?: string;
  delayMs?: number;
}

export function SearchBar({ label, value, onSearch, placeholder, delayMs = 300 }: SearchBarProps) {
  const [text, setText] = useState(value);
  const search = useEffectEvent((next: string) => onSearch(next));

  // Follow outside changes, e.g. the back button restoring an earlier search.
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setText(value);
  }

  useEffect(() => {
    if (text.trim() === value.trim()) return;
    const timer = setTimeout(() => search(text.trim()), delayMs);
    return () => clearTimeout(timer);
  }, [text, value, delayMs]);

  return (
    <div className="relative">
      <svg
        viewBox="0 0 24 24"
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-forest/45"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        className={`${inputClasses} pl-10`}
        value={text}
        maxLength={100}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onSearch(text.trim());
        }}
      />
    </div>
  );
}
