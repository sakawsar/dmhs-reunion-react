import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Countdown to 28 May 2026 at 18:00 BDT (UTC+6)
const EVENT_DATE = new Date('2026-05-28T18:00:00+06:00');

function useCountdown(target: Date) {
    const calc = () => {
        const diff = target.getTime() - Date.now();
        if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        return {
            days: Math.floor(diff / 86400000),
            hours: Math.floor((diff % 86400000) / 3600000),
            minutes: Math.floor((diff % 3600000) / 60000),
            seconds: Math.floor((diff % 60000) / 1000),
        };
    };
    const [time, setTime] = useState(calc);
    useEffect(() => {
        const id = setInterval(() => setTime(calc()), 1000);
        return () => clearInterval(id);
    }, []);
    return time;
}

const SCHEDULE = [
    { time: '04:00 PM', title: 'Gates Open', desc: 'Registration & welcome desk opens. Collect your name badge.' },
    { time: '05:00 PM', title: 'Inauguration Program', desc: 'Welcome speech by the principal & chief guest.' },
    { time: '05:45 PM', title: 'Cultural Performance', desc: 'Music, poetry, and performances by former students.' },
    { time: '07:00 PM', title: 'Grand Dinner', desc: 'Buffet dinner for all registered alumni and guests.' },
    { time: '08:30 PM', title: 'Golden Memories Segment', desc: 'Photo slideshow, batch-wise shoutouts & reminiscing.' },
    { time: '09:30 PM', title: 'Prize Giving & Closing', desc: 'Awards for special contributions & closing ceremony.' },
];

const PACKAGES_INFO = [
    { icon: '🧑', name: 'Individual', price: '৳800', desc: '1 person · Dinner + full program', color: '#5b52e8' },
    { icon: '👫', name: 'Couple', price: '৳1,400', desc: '2 persons · Dinner + full program', color: '#E2136E', popular: true },
    { icon: '👨‍👩‍👧‍👦', name: 'Family', price: '৳2,200', desc: 'Up to 4 persons · Full package', color: '#15a96a' },
    { icon: '👑', name: 'VIP', price: '৳3,500', desc: '1 person · Lounge access + gifts', color: '#d97706' },
];

const FAQ = [
    { q: 'How do I register?', a: 'Click the "Register Now" button, fill in your details across 4 steps, and complete the bKash payment.' },
    { q: 'When will I get confirmation?', a: 'Within 24 hours of your bKash payment being verified by our team.' },
    { q: 'Can I bring my family?', a: 'Yes! Choose the Couple or Family package during registration.' },
    { q: 'What if I pay but don\'t receive confirmation?', a: 'Contact us at 01700-000000 with your bKash Transaction ID.' },
    { q: 'Is there parking available?', a: 'Yes, parking is available at the school field premises.' },
];

export default function LandingPage() {
    const { days, hours, minutes, seconds } = useCountdown(EVENT_DATE);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: '#1a1f36', background: '#f4f6fb', minHeight: '100vh' }}>

            {/* ── NAV ────────────────────────────────────── */}
            <nav style={{ background: 'white', borderBottom: '1px solid #e2e8f4', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#5b52e8,#E2136E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 4px 12px rgba(91,82,232,0.3)' }}>🏫</div>
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9aa3bb' }}>Dharmeswar Mohesha B/L High School</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#1a1f36', lineHeight: 1.2 }}>Grand Reunion 2026</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <a href="#about" style={{ fontSize: 14, fontWeight: 500, color: '#5a6282', textDecoration: 'none' }}>About</a>
                    <a href="#schedule" style={{ fontSize: 14, fontWeight: 500, color: '#5a6282', textDecoration: 'none' }}>Schedule</a>
                    <a href="#packages" style={{ fontSize: 14, fontWeight: 500, color: '#5a6282', textDecoration: 'none' }}>Packages</a>
                    <a href="#faq" style={{ fontSize: 14, fontWeight: 500, color: '#5a6282', textDecoration: 'none' }}>FAQ</a>
                    <Link to="/register" style={{ background: 'linear-gradient(135deg,#5b52e8,#7c74f0)', color: 'white', padding: '9px 20px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 14px rgba(91,82,232,0.3)' }}>
                        Register Now →
                    </Link>
                </div>
            </nav>

            {/* ── HERO ───────────────────────────────────── */}
            <section style={{ background: 'linear-gradient(135deg,#f0f2ff 0%,#fff5fa 50%,#f0fff8 100%)', padding: '80px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-60px', left: '-60px', width: 300, height: 300, borderRadius: '50%', background: 'rgba(91,82,232,0.06)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-80px', right: '-60px', width: 350, height: 350, borderRadius: '50%', background: 'rgba(226,19,110,0.05)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(91,82,232,0.08)', border: '1px solid rgba(91,82,232,0.2)', borderRadius: 999, padding: '5px 16px', fontSize: 12, fontWeight: 600, color: '#5b52e8', marginBottom: 24 }}>
                        🎓 Alumni Reunion · All Batches Welcome
                    </div>
                    <h1 style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.1, margin: '0 0 16px' }}>
                        Welcome Back,{' '}
                        <span style={{ background: 'linear-gradient(90deg,#E2136E,#5b52e8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                            DMHS Alumni!
                        </span>
                    </h1>
                    <p style={{ fontSize: 18, color: '#5a6282', lineHeight: 1.7, margin: '0 0 32px' }}>
                        After years apart, it's time to reconnect, reminisce, and celebrate together.<br />
                        Join us for an unforgettable evening of culture, dinner, and memories.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
                        {[{ icon: '📅', label: '28 May 2026', color: '#d97706' }, { icon: '📍', label: 'School Field, DMHS', color: '#E2136E' }, { icon: '🕔', label: '4:00 PM Onwards', color: '#5b52e8' }].map(b => (
                            <span key={b.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'white', border: '1.5px solid #e2e8f4', borderRadius: 999, padding: '7px 16px', fontSize: 13, fontWeight: 600, color: b.color, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                                {b.icon} {b.label}
                            </span>
                        ))}
                    </div>
                    <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#5b52e8,#7c74f0)', color: 'white', padding: '16px 40px', borderRadius: 14, fontWeight: 800, fontSize: 17, textDecoration: 'none', boxShadow: '0 8px 28px rgba(91,82,232,0.35)', transition: 'transform 0.2s' }}>
                        Register Today · bKash Payment ✓
                    </Link>
                    <div style={{ marginTop: 12, fontSize: 13, color: '#9aa3bb' }}>Quick · Secure · Instant confirmation</div>
                </div>
            </section>

            {/* ── COUNTDOWN ─────────────────────────────── */}
            <section style={{ background: 'linear-gradient(135deg,#5b52e8,#E2136E)', padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 20 }}>Event Starts In</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                    {[{ v: days, l: 'Days' }, { v: hours, l: 'Hours' }, { v: minutes, l: 'Minutes' }, { v: seconds, l: 'Seconds' }].map(({ v, l }) => (
                        <div key={l} style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: 16, padding: '20px 28px', minWidth: 90, border: '1px solid rgba(255,255,255,0.2)' }}>
                            <div style={{ fontSize: 42, fontWeight: 900, color: 'white', lineHeight: 1 }}>{String(v).padStart(2, '0')}</div>
                            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.7)', marginTop: 6, textTransform: 'uppercase' }}>{l}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── ABOUT ─────────────────────────────────── */}
            <section id="about" style={{ maxWidth: 800, margin: '0 auto', padding: '72px 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5b52e8', marginBottom: 10 }}>About The Event</div>
                    <h2 style={{ fontSize: 34, fontWeight: 900, margin: 0 }}>A Night to Remember</h2>
                    <p style={{ fontSize: 16, color: '#5a6282', marginTop: 12, lineHeight: 1.8 }}>
                        Dharmeswar Mohesha B/L High School Grand Reunion 2026 brings together alumni from all batches for a grand evening of culture, dinner, and reunion. Whether you graduated in the 1990s or 2020s — everyone is welcome.
                    </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                    {[
                        { icon: '🎤', title: 'Cultural Program', desc: 'Songs, poetry & performances by your fellow alumni' },
                        { icon: '🍽️', title: 'Grand Dinner', desc: 'Full buffet dinner for all registered guests' },
                        { icon: '📸', title: 'Memory Lane', desc: 'Slideshow of school days, yearbook moments & more' },
                        { icon: '🏆', title: 'Awards Night', desc: 'Recognition for outstanding alumni contributions' },
                    ].map(c => (
                        <div key={c.title} style={{ background: 'white', border: '1.5px solid #e2e8f4', borderRadius: 16, padding: '24px 20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(91,82,232,0.06)' }}>
                            <div style={{ fontSize: 32, marginBottom: 12 }}>{c.icon}</div>
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{c.title}</div>
                            <div style={{ fontSize: 13, color: '#5a6282', lineHeight: 1.6 }}>{c.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── SCHEDULE ──────────────────────────────── */}
            <section id="schedule" style={{ background: 'white', padding: '72px 24px' }}>
                <div style={{ maxWidth: 700, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#E2136E', marginBottom: 10 }}>28 May 2026</div>
                        <h2 style={{ fontSize: 34, fontWeight: 900, margin: 0 }}>Event Schedule</h2>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: 68, top: 0, bottom: 0, width: 2, background: '#e2e8f4' }} />
                        {SCHEDULE.map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: 20, marginBottom: 28, alignItems: 'flex-start' }}>
                                <div style={{ minWidth: 60, textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#5b52e8', paddingTop: 14, flexShrink: 0 }}>{item.time}</div>
                                <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'linear-gradient(135deg,#5b52e8,#E2136E)', border: '2px solid white', boxShadow: '0 0 0 3px rgba(91,82,232,0.15)', flexShrink: 0, marginTop: 12, position: 'relative', zIndex: 1 }} />
                                <div style={{ background: '#f4f6fb', border: '1.5px solid #e2e8f4', borderRadius: 12, padding: '14px 18px', flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{item.title}</div>
                                    <div style={{ fontSize: 13, color: '#5a6282', lineHeight: 1.6 }}>{item.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PACKAGES ──────────────────────────────── */}
            <section id="packages" style={{ padding: '72px 24px' }}>
                <div style={{ maxWidth: 860, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5b52e8', marginBottom: 10 }}>Ticket Packages</div>
                        <h2 style={{ fontSize: 34, fontWeight: 900, margin: 0 }}>Choose Your Package</h2>
                        <p style={{ fontSize: 15, color: '#5a6282', marginTop: 10 }}>Pay easily via bKash after completing your registration</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
                        {PACKAGES_INFO.map(pkg => (
                            <div key={pkg.name} style={{ background: 'white', border: pkg.popular ? `2px solid ${pkg.color}` : '1.5px solid #e2e8f4', borderRadius: 18, padding: '28px 20px', textAlign: 'center', boxShadow: pkg.popular ? `0 4px 20px ${pkg.color}25` : '0 2px 12px rgba(0,0,0,0.06)', position: 'relative' }}>
                                {pkg.popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: pkg.color, color: 'white', fontSize: 10, fontWeight: 800, padding: '3px 12px', borderRadius: 999 }}>⭐ Most Popular</div>}
                                <div style={{ fontSize: 36, marginBottom: 12 }}>{pkg.icon}</div>
                                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>{pkg.name}</div>
                                <div style={{ fontSize: 28, fontWeight: 900, color: pkg.color, marginBottom: 8 }}>{pkg.price}</div>
                                <div style={{ fontSize: 12, color: '#5a6282' }}>{pkg.desc}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 40 }}>
                        <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#E2136E,#c9005a)', color: 'white', padding: '14px 36px', borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: 'none', boxShadow: '0 6px 20px rgba(226,19,110,0.3)' }}>
                            Register & Pay via bKash →
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── FAQ ───────────────────────────────────── */}
            <section id="faq" style={{ background: 'white', padding: '72px 24px' }}>
                <div style={{ maxWidth: 680, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5b52e8', marginBottom: 10 }}>FAQ</div>
                        <h2 style={{ fontSize: 34, fontWeight: 900, margin: 0 }}>Frequently Asked Questions</h2>
                    </div>
                    {FAQ.map((item, i) => (
                        <div key={i} style={{ border: '1.5px solid #e2e8f4', borderRadius: 14, marginBottom: 12, overflow: 'hidden' }}>
                            <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                                <span style={{ fontWeight: 700, fontSize: 15, color: '#1a1f36' }}>{item.q}</span>
                                <span style={{ fontSize: 20, color: '#5b52e8', transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none', flexShrink: 0 }}>+</span>
                            </button>
                            {openFaq === i && (
                                <div style={{ padding: '0 20px 16px', fontSize: 14, color: '#5a6282', lineHeight: 1.7 }}>{item.a}</div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FOOTER ────────────────────────────────── */}
            <footer style={{ background: '#1a1f36', color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '40px 24px' }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>🏫</div>
                <div style={{ fontWeight: 700, color: 'white', fontSize: 15, marginBottom: 4 }}>Dharmeswar Mohesha B/L High School Alumni Association</div>
                <div style={{ fontSize: 13, marginBottom: 16 }}>Grand Reunion 2026 · 28 May · School Field</div>
                <div style={{ fontSize: 13 }}>
                    📞 <a href="tel:01700000000" style={{ color: '#a5a0ff', textDecoration: 'none' }}>01700-000000</a>
                    {' '} · {' '}
                    ✉️ <a href="mailto:reunion@dmhs.edu.bd" style={{ color: '#a5a0ff', textDecoration: 'none' }}>reunion@dmhs.edu.bd</a>
                </div>
                <div style={{ marginTop: 20, fontSize: 11, color: 'rgba(255,255,255,0.3)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
                    <Link to="/admin" style={{ color: 'rgba(255,255,255,0.25)', textDecoration: 'none', fontSize: 11 }}>Admin</Link>
                </div>
            </footer>

        </div>
    );
}
