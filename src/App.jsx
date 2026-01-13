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
    "2026-01-14": "Začínáme pomalu, s láskou. Miminko má čas, my taky.",
    "2026-01-15": "Budulínek dneska jen tiše roste a my s ním.",
    "2026-01-16": "Táďa by řekl: hlavně klid a teplo.",
    "2026-01-17": "Dneska bez plánů. Jen my a miláček.",
    "2026-01-18": "Neděle pro pohlazení bříška a úsměv.",
    "2026-01-19": "Nový týden, ale pořád stejná láska.",
    "2026-01-20": "Dnes nás čeká nové ovoce",
    "2026-01-21": "Miminko si jede svoje tempo. My se přidáme.",
    "2026-01-22": "Budulínek má pohodlí, svět může počkat.",
    "2026-01-23": "Dneska stačí být. Nic víc není potřeba.",
    "2026-01-24": "Den na drobné radosti a velké myšlenky.",
    "2026-01-25": "Klidná neděle, Táďa by měl radost.",
    "2026-01-26": "Každý den jsme o kousek blíž k miláčkovi.",
    "2026-01-27": "Dnes nás čeká nové ovoce",
    "2026-01-28": "Budulínek roste, srdce taky.",
    "2026-01-29": "Dneska bez spěchu. Miminko to cítí.",
    "2026-01-30": "Páteční pohoda pro dva… vlastně pro tři.",
    "2026-01-31": "Leden končí, láska zůstává.",
    "2026-02-01": "Únor začíná tiše a něžně.",
    "2026-02-02": "Nový měsíc, stejný klid v bříšku.",
    "2026-02-03": "Dnes nás čeká nové ovoce",
    "2026-02-04": "Budulínek má dneska pohodový den.",
    "2026-02-05": "Každý nádech je malý dárek.",
    "2026-02-06": "Táďa čeká trpělivě. A my s ním.",
    "2026-02-07": "Sobota na zpomalení a pohlazení.",
    "2026-02-08": "Neděle pro miláčka a teplý čaj.",
    "2026-02-09": "Zase o den blíž k setkání.",
    "2026-02-10": "Dnes nás čeká nové ovoce",
    "2026-02-11": "Budulínek dneska jen roste a sní.",
    "2026-02-12": "Klid v duši, klid v bříšku.",
    "2026-02-13": "Pátek třináctého, ale s láskou.",
    "2026-02-14": "Valentýn pro tři. Nejhezčí možný.",
    "2026-02-15": "Dneska si dopřej ticho a pohodu.",
    "2026-02-16": "Miminko ví, že je milované.",
    "2026-02-17": "Dnes nás čeká nové ovoce",
    "2026-02-18": "Budulínek má dneska svůj klid.",
    "2026-02-19": "Každý den je malý zázrak.",
    "2026-02-20": "Pátek na usmání a odpočinek.",
    "2026-02-21": "Den jen pro sebe a miminko.",
    "2026-02-22": "Neděle bez plánů, jen s láskou.",
    "2026-02-23": "Už se to blíží, cítíš to?",
    "2026-02-24": "Dnes nás čeká nové ovoce",
    "2026-02-25": "Budulínek je čím dál větší parťák.",
    "2026-02-26": "Dneska jemně, pomalu, v teple.",
    "2026-02-27": "Poslední únorový pátek s miminkem.",
    "2026-02-28": "Únor se loučí. My zůstáváme spolu.",
    "2026-03-01": "Březen vítáme s otevřeným srdcem.",
    "2026-03-02": "Už jsme skoro tam, miláčku.",
    "2026-03-03": "Dnes nás čeká nové ovoce",
    "2026-03-04": "Budulínek dneska určitě něco chystá.",
    "2026-03-05": "Každý den je teď vzácný.",
    "2026-03-06": "Pátek plný očekávání.",
    "2026-03-07": "Víkend na nadechnutí a klid.",
    "2026-03-08": "Neděle pro lásku, ne pro povinnosti.",
    "2026-03-09": "Poslední krok před velkou změnou.",
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
                                        <div className="day-msg">{day.msg}</div>
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
