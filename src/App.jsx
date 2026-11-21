import { useRef, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Compass,
  Hotel,
  Map,
  MapPin,
  Shirt,
  ShoppingBag,
  Sparkles,
  Sun,
  Utensils,
  Wallet,
} from 'lucide-react';
import CountrySelect from './components/CountrySelect.jsx';
import { countries, currencies } from './data/isoCountries.js';

const destinationIdeas = [
  { city: 'Paris', country: 'France', countryCode: 'FR', days: '4 days', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80', tag: 'Culture · Fashion · Food' },
  { city: 'Milan', country: 'Italy', countryCode: 'IT', days: '3 days', img: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=1000&q=80', tag: 'Fashion · Shopping' },
  { city: 'Lisbon', country: 'Portugal', countryCode: 'PT', days: '5 days', img: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1000&q=80', tag: 'Food · Culture · Relax' },
];

const interestOptions = [
  'Culture', 'Food', 'Shopping', 'Fashion', 'Nightlife', 'Nature', 'Adventure',
  'Relaxation', 'History', 'Architecture', 'Museums', 'Beaches', 'Family activities', 'Luxury experiences',
];

const travelStyles = ['Balanced', 'Relaxed pace', 'Full days', 'Budget-conscious', 'Luxury'];
const tabs = ['Overview', 'Itinerary', 'Stay', 'Food', 'Style', 'Shopping', 'Explore'];

const initialForm = {
  countryCode: '',
  destination: '',
  startDate: '',
  endDate: '',
  budget: '1200',
  currency: 'GBP',
  travellerCount: '1',
  travelStyle: 'Balanced',
  interests: ['Fashion', 'Food', 'Culture'],
};

function makeTripId() {
  return globalThis.crypto?.randomUUID?.() || `trip-${Date.now()}`;
}

function daysBetween(startDate, endDate) {
  const start = Date.parse(`${startDate}T12:00:00Z`);
  const end = Date.parse(`${endDate}T12:00:00Z`);
  return Math.round((end - start) / 86_400_000) + 1;
}

function formatTripDate(date) {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`));
}

function formatBudget(amount, currency) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency', currency, maximumFractionDigits: 2,
  }).format(amount);
}

export default function App() {
  const [view, setView] = useState('home');
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [trip, setTrip] = useState(null);
  const plannerRef = useRef(null);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function toggleInterest(interest) {
    setForm((current) => ({
      ...current,
      interests: current.interests.includes(interest)
        ? current.interests.filter((item) => item !== interest)
        : [...current.interests, interest],
    }));
  }

  function createTrip(event) {
    event.preventDefault();
    const nextErrors = {};
    const country = countries.find((item) => item.code === form.countryCode);
    const destination = form.destination.trim();
    const budget = Number(form.budget);
    const travellerCount = Number(form.travellerCount);

    if (!country) nextErrors.countryCode = 'Choose a country or territory.';
    if (!destination) nextErrors.destination = 'Enter a city or destination.';
    if (!form.startDate) nextErrors.startDate = 'Choose your trip start date.';
    if (!form.endDate) nextErrors.endDate = 'Choose your trip end date.';
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      nextErrors.endDate = 'Your end date must be on or after your start date.';
    }
    if (!Number.isFinite(budget) || budget <= 0) nextErrors.budget = 'Enter a budget greater than zero.';
    if (!Number.isInteger(travellerCount) || travellerCount < 1) {
      nextErrors.travellerCount = 'Enter a whole number of travellers, at least 1.';
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      requestAnimationFrame(() => {
        document.getElementById(Object.keys(nextErrors)[0])?.focus();
      });
      return;
    }

    setTrip({
      id: makeTripId(),
      country: country.name,
      countryCode: country.code,
      countryFlag: country.flag,
      destination,
      startDate: form.startDate,
      endDate: form.endDate,
      durationDays: daysBetween(form.startDate, form.endDate),
      budget,
      budgetCurrency: form.currency,
      travellerCount,
      interests: [...form.interests],
      travelStyle: form.travelStyle,
      createdAt: new Date().toISOString(),
    });
    setView('trip');
  }

  function goToPlanner() {
    setView('home');
    requestAnimationFrame(() => plannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }

  return (
    <div className="app">
      <header>
        <button className="brand brand-button" type="button" onClick={() => setView('home')} aria-label="StyleTrip home">
          <span className="brandmark"><Compass size={20} /></span>
          <span>STYLE<span className="accent">TRIP</span></span>
        </button>
        <nav aria-label="Main navigation">
          <button type="button" onClick={() => setView('home')}>Explore</button>
          <button type="button" onClick={trip ? () => setView('trip') : goToPlanner}>
            {trip ? 'My trip' : 'Plan a trip'}
          </button>
        </nav>
        <span className="header-tagline">Travel smarter. Dress better.</span>
      </header>

      {view === 'home' ? (
        <>
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow"><Sparkles size={15} /> PERSONALIZED TRAVEL, MADE SIMPLE</div>
              <h1>Your next trip,<br /><em>perfectly planned.</em></h1>
              <p>Start with the destination, dates and details that matter to you. Build a trip that feels like yours.</p>
              <form className="planner trip-form" id="trip-form" ref={plannerRef} onSubmit={createTrip} noValidate>
                <div className="form-heading">
                  <h2>Start planning</h2>
                  <p>Choose any country or territory, then enter your destination.</p>
                </div>

                <FormField label="COUNTRY OR TERRITORY" id="countryCode" error={errors.countryCode}>
                  <CountrySelect
                    id="countryCode"
                    value={form.countryCode}
                    error={errors.countryCode}
                    onChange={(value) => updateField('countryCode', value)}
                  />
                </FormField>

                <FormField label="CITY OR DESTINATION" id="destination" error={errors.destination} hint="Enter a city, town, region or destination. Live place suggestions are not connected yet.">
                  <input
                    id="destination"
                    type="search"
                    autoComplete="off"
                    placeholder="e.g. Kyoto, the Amalfi Coast, or your own destination"
                    value={form.destination}
                    aria-invalid={Boolean(errors.destination)}
                    aria-describedby={errors.destination ? 'destination-error' : 'destination-hint'}
                    onChange={(event) => updateField('destination', event.target.value)}
                  />
                </FormField>

                <div className="form-grid">
                  <FormField label="START DATE" id="startDate" error={errors.startDate}>
                    <input id="startDate" type="date" value={form.startDate} aria-invalid={Boolean(errors.startDate)} aria-describedby={errors.startDate ? 'startDate-error' : undefined} onChange={(event) => updateField('startDate', event.target.value)} />
                  </FormField>
                  <FormField label="END DATE" id="endDate" error={errors.endDate}>
                    <input id="endDate" type="date" min={form.startDate || undefined} value={form.endDate} aria-invalid={Boolean(errors.endDate)} aria-describedby={errors.endDate ? 'endDate-error' : undefined} onChange={(event) => updateField('endDate', event.target.value)} />
                  </FormField>
                  <FormField label="TRIP BUDGET" id="budget" error={errors.budget}>
                    <div className="input-with-select">
                      <input id="budget" type="number" min="0.01" step="0.01" inputMode="decimal" value={form.budget} aria-invalid={Boolean(errors.budget)} aria-describedby={errors.budget ? 'budget-error' : undefined} onChange={(event) => updateField('budget', event.target.value)} />
                      <select aria-label="Budget currency" value={form.currency} onChange={(event) => updateField('currency', event.target.value)}>
                        {currencies.map(({ code, name }) => <option key={code} value={code}>{code} · {name}</option>)}
                      </select>
                    </div>
                  </FormField>
                  <FormField label="TRAVELLERS" id="travellerCount" error={errors.travellerCount}>
                    <input id="travellerCount" type="number" min="1" step="1" inputMode="numeric" value={form.travellerCount} aria-invalid={Boolean(errors.travellerCount)} aria-describedby={errors.travellerCount ? 'travellerCount-error' : undefined} onChange={(event) => updateField('travellerCount', event.target.value)} />
                  </FormField>
                </div>

                <FormField label="TRAVEL STYLE" id="travelStyle">
                  <select id="travelStyle" value={form.travelStyle} onChange={(event) => updateField('travelStyle', event.target.value)}>
                    {travelStyles.map((style) => <option key={style} value={style}>{style}</option>)}
                  </select>
                </FormField>

                <fieldset className="interest-fieldset">
                  <legend>WHAT ARE YOU INTO?</legend>
                  <p>Choose any interests that should shape your trip.</p>
                  <div className="chips">
                    {interestOptions.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        className={form.interests.includes(interest) ? 'chip active' : 'chip'}
                        aria-pressed={form.interests.includes(interest)}
                        onClick={() => toggleInterest(interest)}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </fieldset>

                {Object.keys(errors).length > 0 && (
                  <p className="form-summary-error" role="alert">Please check the highlighted fields before creating your trip.</p>
                )}
                <button className="primary wide" type="submit">Create my trip <ArrowRight size={18} /></button>
                <p className="form-footnote">Your trip is held in this browser session. Account-based saving is not connected yet.</p>
              </form>
            </div>
            <div className="hero-image">
              <img src="https://images.unsplash.com/photo-1495344517868-8ebafc5e6f3b?auto=format&fit=crop&w=1400&q=85" alt="Travellers exploring a destination" />
              <div className="image-caption"><span>GO BEYOND THE GUIDEBOOK</span><b>Find your kind of somewhere.</b></div>
            </div>
          </section>

          <section className="section">
            <div className="section-head">
              <div><div className="eyebrow">A LITTLE INSPIRATION</div><h2>Where will you go?</h2></div>
              <button className="text-btn" type="button" onClick={goToPlanner}>Create a trip <ArrowRight size={16} /></button>
            </div>
            <div className="destinations">
              {destinationIdeas.map((idea) => (
                <article className="destination" key={idea.city}>
                  <img src={idea.img} alt={`A view of ${idea.city}`} loading="lazy" />
                  <div className="dest-info"><span className="dest-tag">{idea.tag}</span><h3>{idea.city}</h3><p>{idea.country} · {idea.days}</p></div>
                </article>
              ))}
            </div>
            <p className="inspiration-note">These examples are for inspiration; they are not a destination catalogue.</p>
          </section>

          <section className="features">
            <div className="section-head"><div><div className="eyebrow">ONE APP. YOUR WHOLE TRIP.</div><h2>Travel, thoughtfully.</h2></div></div>
            <div className="feature-grid">
              {[[Shirt, 'Style & packing', 'Outfits for the forecast, itinerary and occasion.'], [Utensils, 'Food & dining', 'Local favourites for your taste and budget.'], [Hotel, 'Where to stay', 'Stay options matched to your style and budget.'], [ShoppingBag, 'Shopping', 'Boutiques, outlets, markets and shopping routes.'], [Compass, 'Experiences', 'Discover attractions, culture and local activities.'], [Map, 'Your itinerary', 'A practical day-by-day plan, mapped out.']].map(([Icon, title, description]) => (
                <div className="feature" key={title}><Icon /><h3>{title}</h3><p>{description}</p></div>
              ))}
            </div>
          </section>
          <footer><div className="brand"><span className="brandmark"><Compass size={20} /></span>STYLE<span className="accent">TRIP</span></div><span>Travel smarter. Dress better. Experience more.</span><small>© 2026 StyleTrip</small></footer>
        </>
      ) : trip ? (
        <TripView trip={trip} setView={setView} />
      ) : (
        <main className="trip-page"><h1>No trip yet</h1><p>Create a trip to open your workspace.</p><button className="primary" type="button" onClick={goToPlanner}>Start planning <ArrowRight size={18} /></button></main>
      )}
    </div>
  );
}

function FormField({ label, id, error, hint, children }) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && <span className="field-hint" id={`${id}-hint`}>{hint}</span>}
      {error && id !== 'countryCode' && <span className="field-error" id={`${id}-error`}>{error}</span>}
    </div>
  );
}

function TripView({ trip, setView }) {
  const [active, setActive] = useState('Overview');
  const dateRange = `${formatTripDate(trip.startDate)} – ${formatTripDate(trip.endDate)}`;

  return (
    <main className="trip-page">
      <button className="back" type="button" onClick={() => setView('home')}>← Back to Explore</button>
      <section className="trip-hero">
        <div className="trip-overlay">
          <span className="eyebrow">YOUR STYLETRIP · {trip.countryFlag} {trip.country}</span>
          <h1>{trip.destination}</h1>
          <p>{dateRange} · {trip.durationDays} {trip.durationDays === 1 ? 'day' : 'days'}</p>
          <span className="trip-session-note">Created in this browser session</span>
        </div>
      </section>

      <section className="trip-summary" aria-label="Trip details">
        <TripSummary label="YOUR BUDGET" value={formatBudget(trip.budget, trip.budgetCurrency)} />
        <TripSummary label="TRAVELLERS" value={`${trip.travellerCount} ${trip.travellerCount === 1 ? 'traveller' : 'travellers'}`} />
        <TripSummary label="TRAVEL STYLE" value={trip.travelStyle} />
        <TripSummary label="YOUR INTERESTS" value={trip.interests.length ? trip.interests.join(' · ') : 'None selected'} />
      </section>

      <div className="tabs" role="tablist" aria-label="Trip workspace sections">
        {tabs.map((tab) => (
          <button key={tab} type="button" role="tab" aria-selected={active === tab} className={active === tab ? 'tab active-tab' : 'tab'} onClick={() => setActive(tab)}>{tab}</button>
        ))}
      </div>

      {active === 'Overview' ? (
        <section className="workspace-placeholder" role="tabpanel">
          <div className="workspace-heading"><span className="eyebrow">TRIP OVERVIEW</span><h2>Your trip, at a glance</h2><p>{trip.destination}, {trip.country} · {dateRange}</p></div>
          <div className="overview-grid">
            <div className="panel"><h3><CalendarDays /> Trip details</h3><dl className="trip-details-list"><Detail label="Destination" value={`${trip.destination}, ${trip.country}`} /><Detail label="Dates" value={dateRange} /><Detail label="Duration" value={`${trip.durationDays} ${trip.durationDays === 1 ? 'day' : 'days'}`} /><Detail label="Travellers" value={String(trip.travellerCount)} /><Detail label="Budget" value={formatBudget(trip.budget, trip.budgetCurrency)} /></dl></div>
            <div className="panel"><h3><Sun /> Planning tools</h3><p>Weather, places and itinerary recommendations are not connected yet. Your selected dates and destination are ready for those features in a later milestone.</p><p className="data-status">Destination entered by you · Not verified against a live location source</p></div>
          </div>
          <p className="workspace-note">No itinerary or place recommendations have been generated for this trip yet.</p>
        </section>
      ) : active === 'Itinerary' ? (
        <PlaceholderPanel title="Itinerary" destination={trip.destination}>
          Your dates are set. A day-by-day itinerary has not been generated yet.
        </PlaceholderPanel>
      ) : (
        <PlaceholderPanel title={active} destination={trip.destination}>
          {active} recommendations for this destination are not connected yet.
        </PlaceholderPanel>
      )}
    </main>
  );
}

function TripSummary({ label, value }) {
  return <div><small>{label}</small><b>{value}</b></div>;
}

function Detail({ label, value }) {
  return <div className="trip-detail-row"><dt>{label}</dt><dd>{value}</dd></div>;
}

function PlaceholderPanel({ title, destination, children }) {
  return (
    <section className="panel workspace-placeholder" role="tabpanel">
      <Sparkles className="placeholder-icon" aria-hidden="true" />
      <span className="eyebrow">COMING LATER</span>
      <h2>{title}</h2>
      <p>{children}</p>
      <p className="data-status">{destination} · No live recommendations connected</p>
    </section>
  );
}
