import { useMemo, useRef, useState } from 'react';
import { countries, normalizeSearchText } from '../data/isoCountries.js';

export default function CountrySelect({ value, onChange, error, id = 'country' }) {
  const selected = countries.find((country) => country.code === value);
  const [query, setQuery] = useState(selected?.name || '');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);

  const matches = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query.trim());
    if (!normalizedQuery) return countries;
    return countries.filter(({ code, name }) => (
      normalizeSearchText(name).includes(normalizedQuery)
      || code.toLowerCase().includes(normalizedQuery)
    ));
  }, [query]);

  function selectCountry(country) {
    onChange(country.code);
    setQuery(country.name);
    setOpen(false);
  }

  function handleChange(event) {
    setQuery(event.target.value);
    setOpen(true);
    setActiveIndex(0);
    if (value) onChange('');
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, matches.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter' && open && matches[activeIndex]) {
      event.preventDefault();
      selectCountry(matches[activeIndex]);
    } else if (event.key === 'Escape') {
      setOpen(false);
      setQuery(selected?.name || '');
    }
  }

  return (
    <div className="country-picker">
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-required="true"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-activedescendant={open && matches[activeIndex] ? `${id}-option-${matches[activeIndex].code}` : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        autoComplete="off"
        placeholder="Search countries and territories"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {open && (
        <ul id={`${id}-options`} className="country-options" role="listbox" aria-label="Countries and territories">
          {matches.length ? matches.map((country, index) => (
            <li key={country.code} role="presentation">
              <button
                id={`${id}-option-${country.code}`}
                type="button"
                role="option"
                aria-selected={country.code === value}
                className={index === activeIndex ? 'country-option highlighted' : 'country-option'}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectCountry(country)}
              >
                <span aria-hidden="true">{country.flag}</span>
                <span>{country.name}</span>
                <small>{country.code}</small>
              </button>
            </li>
          )) : (
            <li className="country-empty" role="presentation">No matching country found.</li>
          )}
        </ul>
      )}
      {error && <span className="field-error" id={`${id}-error`}>{error}</span>}
    </div>
  );
}
