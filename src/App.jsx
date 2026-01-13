import React, { useState, useEffect, useMemo } from 'react';

// KONSTRUKČNÍ POŽADAVKY: 2026-01-13 do 2026-03-10
const START_DATE = "2026-01-13";
const END_DATE = "2026-03-10";
const STORAGE_KEY = "maternity_countdown_v1";

// Helper: Format Date to YYYY-MM-DD using local time parts
const formatToISO = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

// Helper: Parse ISO date string to local Midnight Date object
const parseLocalDate = (isoStr) => {
    const [y, m, d] = isoStr.split('-').map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0);
};

// USER PROVIDED MESSAGES
const FIXED_MESSAGES = {
    "2026-01-13": "Dnes nás čeká nové ovoce",
    "2026-01-14": "Středa. Nic se nehrotí, všechno počká.",
    "2026-01-15": "Čtvrtek. Práce může jet, ty ne.",
    "2026-01-16": "Pátek. Stres má dneska dovolenou.",
    "2026-01-17": "Sobota. Oficiálně povoleno nic neřešit.",
    "2026-01-18": "Neděle. Svět se bez tebe chvíli obejde.",
    "2026-01-19": "Pondělí. Klid, nikam neutíkáme.",
    "2026-01-20": "Dnes nás čeká nové ovoce",
    "2026-01-21": "Středa. Budulínek roste, ty zpomal.",
    "2026-01-22": "Čtvrtek. Dneska fakt nemusíš nic dokazovat.",
    "2026-01-23": "Pátek. Hotovo je lepší než dokonalé.",
    "2026-01-24": "Sobota bez programu je pořád program.",
    "2026-01-25": "Neděle. Klidný den bez výčitek.",
    "2026-01-26": "Pondělí. Žádný stres, jede se normál.",
    "2026-01-27": "Dnes nás čeká nové ovoce",
    "2026-01-28": "Středa. Neřeš detaily, miminko jo.",
    "2026-01-29": "Čtvrtek. Stačí tempo „v pohodě“.",
    "2026-01-30": "Pátek. Zase jeden týden zvládnutý.",
    "2026-01-31": "Leden končí. My nikam nespěcháme.",
    "2026-02-01": "Únor. Pomalu, v klidu, bez tlaku.",
    "2026-02-02": "Pondělí. Dneska žádné hrdinství.",
    "2026-02-03": "Dnes nás čeká nové ovoce",
    "2026-02-04": "Středa. Klid v hlavě je priorita.",
    "2026-02-05": "Čtvrtek. Práce počká, stres ne.",
    "2026-02-06": "Pátek. Všechno důležité je hotovo.",
    "2026-02-07": "Sobota. Režim „nic nemusím“.",
    "2026-02-08": "Neděle. Ideální den zpomalit.",
    "2026-02-09": "Pondělí. Bez tlaku, jede se dál.",
    "2026-02-10": "Dnes nás čeká nové ovoce",
    "2026-02-11": "Středa. Budulínek maká, ty šetři síly.",
    "2026-02-12": "Čtvrtek. Klidně vypni hlavu.",
    "2026-02-13": "Pátek. Nic zásadního se dnes neřeší.",
    "2026-02-14": "Valentýn. V pohodě, bez velkých gest.",
    "2026-02-15": "Neděle. Pohoda bez očekávání.",
    "2026-02-16": "Pondělí. Stres dnes nemá vstup.",
    "2026-02-17": "Dnes nás čeká nové ovoce",
    "2026-02-18": "Středa. Tempo dolů, klid nahoru.",
    "2026-02-19": "Čtvrtek. Neřeš, co není nutné.",
    "2026-02-20": "Pátek. Týden uzavíráme bez dramatu.",
    "2026-02-21": "Sobota. Povolený režim „nic neřeším“.",
    "2026-02-22": "Neděle. Zítra se uvidí.",
    "2026-02-23": "Pondělí. Už it chce jen klid.",
    "2026-02-24": "Dnes nás čeká nové ovoce",
    "2026-02-25": "Středa. Budulínek má plán, ty klid.",
    "2026-02-26": "Čtvrtek. Dneska fakt zpomal.",
    "2026-02-27": "Pátek. Únor splněn.",
    "2026-02-28": "Únor hotovo. Check.",
    "2026-03-01": "Březen. Už skoro cíl.",
    "2026-03-02": "Pondělí. Teď už hlavně klid.",
    "2026-03-03": "Dnes nás čeká nové ovoce",
    "2026-03-04": "Středa. Nic netlač, všechno je v plánu.",
    "2026-03-05": "Čtvrtek. Dneska žádný stres, fakt žádný.",
    "2026-03-06": "Pátek. Jeden z posledních v tomhle módu.",
    "2026-03-07": "Sobota. Pomalu ladíme hlavu.",
    "2026-03-08": "Neděle. Klid před změnou.",
    "2026-03-09": "Pondělí. Už jen nadechnout.",
    "2026-03-10": "Dnes nás čeká nové ovoce",
};

function App() {
    const [completedDays, setCompletedDays] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : {};
    });
    const [showList, setShowList] = useState(false);

    // Persistence
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(completedDays));
    }, [completedDays]);

    // Generate range (inclusive)
    const allDays = useMemo(() => {
        const days = [];
        let current = parseLocalDate(START_DATE);
        const end = parseLocalDate(END_DATE);

        while (current <= end) {
            const id = formatToISO(current);
            days.push({
                id,
                date: new Date(current),
                label: current.toLocaleDateString('cs-CZ', { weekday: 'short', day: 'numeric', month: 'numeric' }),
                fullLabel: current.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' }),
                msg: FIXED_MESSAGES[id] || "Dnes je krásný den!"
            });
            current.setDate(current.getDate() + 1);
        }
        return days;
    }, []);

    // Time Logic
    const getTodayISO = () => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const todayISO = getTodayISO();
    const todayIndex = allDays.findIndex(d => d.id === todayISO);
    const isOutOfRange = todayIndex === -1 && (todayISO < START_DATE || todayISO > END_DATE);
    const todayData = allDays[todayIndex];

    // KPI Calculations
    const totalDaysCount = allDays.length;
    const doneCount = Object.values(completedDays).filter(Boolean).length;
    const remainingCount = totalDaysCount - doneCount;
    const progressPercent = Math.round((doneCount / totalDaysCount) * 100);

    // Handlers
    const toggleToday = () => {
        if (!todayData) return;
        setCompletedDays(prev => ({
            ...prev,
            [todayISO]: !prev[todayISO]
        }));
    };

    const handleReset = () => {
        if (window.confirm("Opravdu vymazat celý postup?")) {
            setCompletedDays({});
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    // Calendar logic
    const calendarMonths = useMemo(() => {
        const months = {};
        allDays.forEach(day => {
            const key = day.date.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' });
            if (!months[key]) months[key] = [];
            months[key].push(day);
        });
        return months;
    }, [allDays]);

    const renderCalendar = () => {
        return Object.entries(calendarMonths).map(([monthName, monthDays]) => {
            const firstDayOfWeek = (monthDays[0].date.getDay() + 6) % 7; // Monday = 0
            const pads = Array.from({ length: firstDayOfWeek });
            const dayHeads = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
            const monthIndex = monthDays[0].date.getMonth() + 1;
            const year = monthDays[0].date.getFullYear();
            const monthLabel = monthDays[0].date.toLocaleDateString('cs-CZ', { month: 'long' });

            return (
                <div key={monthName} className="calendar-month">
                    <div className="calendar-month-header">
                        <span className="calendar-month-code">{String(monthIndex).padStart(2, '0')}</span>
                        <div className="calendar-month-title">
                            <span>{monthLabel}</span>
                        </div>
                        <span className="calendar-month-year">{year}</span>
                    </div>
                    <div className="calendar-grid">
                        {dayHeads.map(h => <div key={h} className="calendar-day-head">{h}</div>)}
                        {pads.map((_, i) => <div key={`pad-${i}`} className="calendar-cell empty" />)}
                        {monthDays.map(day => {
                            const checked = !!completedDays[day.id];
                            const isToday = day.id === todayISO;
                            return (
                                <div
                                    key={day.id}
                                    className={`calendar-cell ${checked ? 'checked' : ''} ${isToday ? 'today' : ''}`}
                                >
                                    <span className="calendar-date">{day.date.getDate()}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="container">
            {/* HERO SECTION */}
            <section className="hero">
                <div className="hero-date">{todayData ? todayData.fullLabel : "Dnes"}</div>
                <div className="hero-quote">
                    {todayData ? todayData.msg : (todayISO < START_DATE ? "Těšíme se na začátek odpočtu!" : "Odpočet dokončen! Užij si mateřskou!")}
                </div>

                {todayData ? (
                    <button
                        className={`btn-cta ${completedDays[todayISO] ? 'btn-done' : ''}`}
                        onClick={toggleToday}
                    >
                        {completedDays[todayISO] ? "Hotovo. Táďa to viděl. ❤️" : "Odškrtnout dnešek"}
                    </button>
                ) : (
                    <div className="out-of-range">
                        <h2>{todayISO < START_DATE ? "Ještě nezačínáme" : "Cesta u konce!"}</h2>
                        <p>{todayISO < START_DATE ? `Odpočet startuje 13. 1. 2026` : `Gratulujeme k odchodu na mateřskou!`}</p>
                    </div>
                )}
            </section>

            {/* KPI GRID */}
            <section className="kpi-grid">
                <div className="kpi-card">
                    <span className="kpi-value">{remainingCount}</span>
                    <span className="kpi-label">Dní do cíle</span>
                </div>
                <div className="kpi-card">
                    <span className="kpi-value">{doneCount} / {totalDaysCount}</span>
                    <span className="kpi-label">Splněno</span>
                </div>
                <div className="kpi-card">
                    <span className="kpi-value">{progressPercent}%</span>
                    <span className="kpi-label">Hotovo</span>
                </div>
            </section>

            {/* PROGRESS BAR & TIMELINE */}
            <section className="progress-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#2D3436' }}>Poslední dny v práci</h3>
                    <div style={{ background: 'white', padding: '4px 8px', borderRadius: '8px', border: '1px solid #eee' }}>
                        <img
                            src="https://cdn.alza.cz/images/web-static/eshop-logos/alza_cz.svg"
                            alt="Alza Logo"
                            style={{ width: '70px', height: 'auto', display: 'block' }}
                        />
                    </div>
                </div>

                <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <div className="timeline">
                    <div className="timeline-dot" style={{ left: `${progressPercent}%` }}></div>
                </div>
                <div className="timeline-labels">
                    <span>Start (13.1.)</span>
                    <span>Mateřská (10.3.)</span>
                </div>
            </section>

            {/* CALENDAR SECTION */}
            <section className="calendar-section">
                <h3 className="calendar-section-title">Náhledový kalendář</h3>
                {renderCalendar()}
            </section>

            {/* DAYS LIST */}
            <section>
                <div className="list-header">
                    <h3>Přehled dní</h3>
                    <button className="list-toggle" onClick={() => setShowList(!showList)}>
                        {showList ? "Skrýt" : "Zobrazit dny"}
                    </button>
                </div>

                {showList && (
                    <div className="days-list" style={{ marginTop: '16px' }}>
                        {allDays.map((day) => {
                            const checked = !!completedDays[day.id];
                            const isToday = day.id === todayISO;
                            const isLocked = !isToday;

                            return (
                                <div key={day.id} className={`day-card ${isLocked ? 'locked' : ''} ${isToday ? 'today' : ''}`}>
                                    <div className={`day-check ${checked ? 'checked' : ''}`}>
                                        {checked && "❤"}
                                    </div>
                                    <div className="day-info">
                                        <div className="day-date">{day.label}</div>
                                        {/* <div className="day-msg">{day.msg}</div> */} {/* hidden as per user request */}
                                    </div>
                                    {isToday && <span className="status-badge today">DNES</span>}
                                    {checked && !isToday && <span className="status-badge">SPLNĚNO</span>}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* FOOTER */}
            <footer className="footer">
                <button className="btn-reset" onClick={handleReset}>Resetovat veškerý postup</button>
                <p style={{ color: '#ccc', fontSize: '0.65rem', marginTop: '16px', fontWeight: 600 }}>Pro naši nejmilejší maminku ✨</p>
            </footer>
        </div>
    );
}

export default App;
