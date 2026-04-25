import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Countdown to 28 May 2026 at 18:00 BDT (UTC+6)
const EVENT_DATE = new Date('2026-05-30T18:00:00+06:00');

interface RegSummary {
    fullName: string;
    batchYear: string;
    currentCity: string;
    packageName: string;
    seats: number;
    status: string;
    submittedAt: { seconds: number } | null;
}

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
    { time: '০৪:০০ PM', title: 'গেইট খোলা', desc: 'রেজিস্ট্রেশন ও স্বাগত ডেস্ক খোলা হবে। আপনার নেইম ব্যাজ সংগ্রহ করুন।' },
    { time: '০৫:০০ PM', title: 'উদ্বোধনী অনুষ্ঠান', desc: 'প্রধান শিক্ষক ও প্রধান অতিথির স্বাগত ভাষণ।' },
    { time: '০৫:৪৫ PM', title: 'সাংস্কৃতিক অনুষ্ঠান', desc: 'প্রাক্তন ছাত্রদের গান, কবিতা ও পরিবেশনা।' },
    { time: '০৭:০০ PM', title: 'গ্র্যান্ড লাঞ্চ', desc: 'সকল নিবন্ধিত প্রাক্তন ছাত্র ও অতিথিদের জন্য বুফে লাঞ্চ।' },
    { time: '০৮:৩০ PM', title: 'স্মৃতিচারণ', desc: 'ফটো স্লাইডশো, ব্যাচভিত্তিক শুভেচ্ছা ও স্মৃতিচারণ।' },
    { time: '০৯:৩০ PM', title: 'পুরস্কার বিতরণ ও সমাপনী', desc: 'বিশেষ অবদানের জন্য পুরস্কার ও সমাপনী অনুষ্ঠান।' },
];

const PACKAGES_INFO = [
    { icon: '🎓', name: 'ব্যাচ ২০১৮–২০২৫', price: '৳৭০০', desc: '১ জন · লাঞ্চ + সম্পূর্ণ অনুষ্ঠান', color: '#5b52e8', popular: true },
    { icon: '🏫', name: 'ব্যাচ ১৯৪৫–২০১৭', price: '৳১,০০০', desc: '১ জন · লাঞ্চ + সম্পূর্ণ অনুষ্ঠান', color: '#E2136E' },
    { icon: '📖', name: 'ছাত্র ছিলাম', price: '৳১,০০০', desc: '১ জন · প্রাক্তন ছাত্র · লাঞ্চ + অনুষ্ঠান', color: '#d97706' },
    { icon: '👥', name: 'অতিরিক্ত অতিথি', price: '৳৫০০', desc: 'প্রতিজন · যেকোনো ব্যাচের সাথে যোগ করুন', color: '#15a96a' },
];

const FAQ = [
    { q: 'কিভাবে রেজিস্ট্রেশন করবো?', a: '"এখনই রেজিস্ট্রেশন করুন" বাটনে ক্লিক করুন, ৪টি ধাপে আপনার তথ্য পূরণ করুন এবং বিকাশে পেমেন্ট সম্পন্ন করুন।' },
    { q: 'কনফার্মেশন কখন পাবো?', a: 'আপনার বিকাশ পেমেন্ট যাচাই করার ২৪ ঘণ্টার মধ্যে।' },
    { q: 'পরিবার নিয়ে আসতে পারবো?', a: 'হ্যাঁ! রেজিস্ট্রেশনের সময় দম্পতি বা পরিবার প্যাকেজ বেছে নিন।' },
    { q: 'পেমেন্ট করেছি কিন্তু কনফার্মেশন পাইনি?', a: 'আপনার বিকাশ ট্রানজেকশন আইডি সহ 01964-614377 নম্বরে যোগাযোগ করুন।' },
    { q: 'পার্কিং সুবিধা আছে?', a: 'হ্যাঁ, স্কুল মাঠ প্রাঙ্গণে পার্কিং সুবিধা আছে।' },
];

export default function LandingPage() {
    const { days, hours, minutes, seconds } = useCountdown(EVENT_DATE);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    // Registration data for overview
    const [regs, setRegs] = useState<RegSummary[]>([]);
    const [regsLoading, setRegsLoading] = useState(true);
    const [regSearch, setRegSearch] = useState('');
    const [regBatchFilter, setRegBatchFilter] = useState('all');
    const [regSortKey, setRegSortKey] = useState<'fullName' | 'batchYear' | 'submittedAt'>('submittedAt');
    const [regSortDir, setRegSortDir] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        const load = async () => {
            try {
                const q = query(collection(db, 'registrations'), orderBy('submittedAt', 'desc'));
                const snap = await getDocs(q);
                setRegs(snap.docs.map(d => {
                    const data = d.data();
                    return {
                        fullName: data.fullName || '',
                        batchYear: data.batchYear || '',
                        currentCity: data.currentCity || '',
                        packageName: data.packageName || '',
                        seats: data.seats || 1,
                        status: data.status || '',
                        submittedAt: data.submittedAt || null,
                    };
                }));
            } catch {
                // silently fail for public page
            } finally {
                setRegsLoading(false);
            }
        };
        load();
    }, []);

    const batches = useMemo(() => [...new Set(regs.map(r => r.batchYear))].sort().reverse(), [regs]);

    const stats = useMemo(() => ({
        total: regs.length,
        confirmed: regs.filter(r => r.status === 'confirmed').length,
        pending: regs.filter(r => r.status === 'pending_verification').length,
        totalSeats: regs.reduce((s, r) => s + (r.seats || 1), 0),
    }), [regs]);

    const filteredRegs = useMemo(() => {
        let out = [...regs];
        if (regSearch) out = out.filter(r => r.fullName.toLowerCase().includes(regSearch.toLowerCase()) || r.batchYear.includes(regSearch));
        if (regBatchFilter !== 'all') out = out.filter(r => r.batchYear === regBatchFilter);
        out.sort((a, b) => {
            let av: string | number = a[regSortKey] as string | number;
            let bv: string | number = b[regSortKey] as string | number;
            if (regSortKey === 'submittedAt') {
                av = (a.submittedAt?.seconds ?? 0);
                bv = (b.submittedAt?.seconds ?? 0);
            }
            if (av < bv) return regSortDir === 'asc' ? -1 : 1;
            if (av > bv) return regSortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return out;
    }, [regs, regSearch, regBatchFilter, regSortKey, regSortDir]);

    const toggleRegSort = (k: 'fullName' | 'batchYear' | 'submittedAt') => {
        if (regSortKey === k) setRegSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setRegSortKey(k); setRegSortDir('desc'); }
    };

    const sortIcon = (k: string) => regSortKey === k ? (regSortDir === 'asc' ? ' ↑' : ' ↓') : '';

    return (
        <div style={{ color: '#1a1f36', background: '#f4f6fb', minHeight: '100vh' }}>

            {/* ── BISMILLAH + NAV (sticky together) ────── */}
            <div style={{ position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="bismillah-bar">বিসমিল্লাহির রহমানির রহিম</div>
                <nav className="landing-nav">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#5b52e8,#E2136E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 4px 12px rgba(91,82,232,0.3)' }}>🏫</div>
                        <div>
                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9aa3bb' }}>ধর্ম্মেশ্বর মহেশা দ্বি-মূখী উচ্চ বিদ্যালয়</div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: '#1a1f36', lineHeight: 1.2 }}>৮১ বছরপূর্তি উৎসব - ২০২৬</div>
                        </div>
                    </div>

                    {/* Desktop links */}
                    <div className="nav-links-desktop">
                        <a href="#about">পরিচিতি</a>
                        <a href="#schedule">সূচি</a>
                        <a href="#packages">প্যাকেজ</a>
                        <a href="#registrations">নিবন্ধন</a>
                        <a href="#faq">জিজ্ঞাসা</a>
                        <Link to="/track" style={{ color: '#5b52e8' }}>🔍 ট্র্যাক</Link>
                        <Link to="/register" className="nav-register-btn">এখনই রেজিস্ট্রেশন করুন →</Link>
                    </div>

                    {/* Hamburger button (mobile) */}
                    <button className="nav-hamburger" onClick={() => setMobileNavOpen(prev => !prev)} aria-label="মেনু">
                        {mobileNavOpen ? '✕' : '☰'}
                    </button>
                </nav>

                {/* Mobile drawer */}
                {mobileNavOpen && (
                    <div className="nav-mobile-drawer">
                        <a href="#about" onClick={() => setMobileNavOpen(false)}>পরিচিতি</a>
                        <a href="#schedule" onClick={() => setMobileNavOpen(false)}>সূচি</a>
                        <a href="#packages" onClick={() => setMobileNavOpen(false)}>প্যাকেজ</a>
                        <a href="#registrations" onClick={() => setMobileNavOpen(false)}>নিবন্ধন</a>
                        <a href="#faq" onClick={() => setMobileNavOpen(false)}>জিজ্ঞাসা</a>
                        <Link to="/track" onClick={() => setMobileNavOpen(false)} style={{ color: '#5b52e8' }}>🔍 ট্র্যাক</Link>
                        <Link to="/register" onClick={() => setMobileNavOpen(false)} className="nav-register-btn" style={{ textAlign: 'center' }}>এখনই রেজিস্ট্রেশন করুন →</Link>
                    </div>
                )}
            </div>

            {/* ── HERO ───────────────────────────────────── */}
            <section style={{ background: 'linear-gradient(135deg,#f0f2ff 0%,#fff5fa 50%,#f0fff8 100%)', padding: '80px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-60px', left: '-60px', width: 300, height: 300, borderRadius: '50%', background: 'rgba(91,82,232,0.06)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-80px', right: '-60px', width: 350, height: 350, borderRadius: '50%', background: 'rgba(226,19,110,0.05)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
                    {/* <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(91,82,232,0.08)', border: '1px solid rgba(91,82,232,0.2)', borderRadius: 999, padding: '5px 16px', fontSize: 12, fontWeight: 600, color: '#5b52e8', marginBottom: 24 }}>
                        🎓 প্রাক্তন ছাত্র পুনর্মিলনী · সকল ব্যাচ স্বাগত
                    </div> */}
                    <h1 style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.1, margin: '0 0 16px' }}>
                        {/* স্বাগতম,{' '} */}
                        <span style={{ background: 'linear-gradient(90deg,#ff0000,#00ff00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                            ধর্ম্মেশ্বর মহেশা দ্বি-মূখী উচ্চ বিদ্যালয়
                        </span>
                    </h1>
                    <p style={{ fontSize: 28, color: '#5a6282', margin: '0 0 32px' }}>
                        আমাদের প্রাণের ঠিকানা
                    </p>
                    <p style={{ fontSize: 24, color: '#5a6282', margin: '0 0 32px' }}>
                        যেখানে তোমার আমার শৈশব, কৈশোর ও যৌবনের শ্রেষ্ঠ সময়ের স্মৃতি এখনো খেলা করে।
                    </p>
                    {/* <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
                        {[{ icon: '📅', label: '৩১ মে ২০২৬', color: '#d97706' }, { icon: '📍', label: 'স্কুল মাঠ, DMHS', color: '#E2136E' }, { icon: '🕔', label: 'বিকাল ৪:০০ থেকে', color: '#5b52e8' }].map(b => (
                            <span key={b.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'white', border: '1.5px solid #e2e8f4', borderRadius: 999, padding: '7px 16px', fontSize: 13, fontWeight: 600, color: b.color, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                                {b.icon} {b.label}
                            </span>
                        ))}
                    </div> */}
                    <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#5b52e8,#7c74f0)', color: 'white', padding: '16px 40px', borderRadius: 14, fontWeight: 800, fontSize: 17, textDecoration: 'none', boxShadow: '0 8px 28px rgba(91,82,232,0.35)', transition: 'transform 0.2s' }}>
                        আজই রেজিস্ট্রেশন করুন
                    </Link>
                    <div style={{ marginTop: 12, fontSize: 13, color: '#9aa3bb' }}>দ্রুত · নিরাপদ · তাৎক্ষণিক নিশ্চিতকরণ</div>
                </div>
            </section>

            {/* ── COUNTDOWN ─────────────────────────────── */}
            <section style={{ background: 'linear-gradient(135deg,#5b52e8,#E2136E)', padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 20 }}>অনুষ্ঠান শুরু হতে বাকি</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                    {[{ v: days, l: 'দিন' }, { v: hours, l: 'ঘণ্টা' }, { v: minutes, l: 'মিনিট' }, { v: seconds, l: 'সেকেন্ড' }].map(({ v, l }) => (
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
                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5b52e8', marginBottom: 10 }}>অনুষ্ঠান সম্পর্কে</div>
                    <h2 style={{ fontSize: 34, fontWeight: 900, margin: 0 }}>একটি স্মরণীয় দিন</h2>
                    <p style={{ fontSize: 16, color: '#5a6282', marginTop: 12, lineHeight: 1.8 }}>
                        প্রিয় প্রাক্তন শিক্ষার্থী, আপনাদের জন্য অপেক্ষা করছে এক আনন্দঘন পুনর্মিলনের দিন! সকল ব্যাচের শিক্ষার্থীদের নিয়ে থাকছে মনোমুগ্ধকর সাংস্কৃতিক অনুষ্ঠান, উষ্ণ অভ্যর্থনার ওয়েলকাম ড্রিংকস, সুস্বাদু দুপুরের খাবার, মুখরোচক স্ন্যাক্স—আর সবচেয়ে বড় কথা, পুরোনো স্মৃতি রোমন্থনের এক অসাধারণ সুযোগ। আসুন, আবার একসাথে ফিরে যাই সেই সোনালি দিনে—বন্ধুত্ব, হাসি আর স্মৃতির টানে।
                    </p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#5a6282', marginTop: 12, lineHeight: 1.8 }}>
                        ধর্ম্মেশ্বর মহেশা দ্বি-মূখী উচ্চ বিদ্যালয়ের গর্বিত শিক্ষার্থী হিসেবে আপনাকে স্বাগতম। 💙
                    </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                    {[
                        { icon: '🎤', title: 'সাংস্কৃতিক অনুষ্ঠান', desc: 'প্রাক্তন ছাত্রদের গান, কবিতা ও পরিবেশনা' },
                        { icon: '🍽️', title: 'দুপুরের খাবার', desc: 'সকল নিবন্ধিত অতিথিদের জন্য দুপুরের খাবার' },
                        { icon: '📸', title: 'স্মৃতির গ্যালারী', desc: 'যেখানে ছবির ফ্রেমে জীবন্ত হয়ে ওঠে আমাদের সেই সোনালি দিনগুলোর অমূল্য মুহূর্ত' },
                        { icon: '🏆', title: 'পুরস্কার বিতরণ', desc: 'বিশেষ অবদানকারী প্রাক্তন ছাত্রদের সম্মাননা' },
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
            <section id="schedule" style={{ display: "none", background: 'white', padding: '72px 24px' }}>
                <div style={{ maxWidth: 700, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#E2136E', marginBottom: 10 }}>৩১ মে ২০২৬</div>
                        <h2 style={{ fontSize: 34, fontWeight: 900, margin: 0 }}>অনুষ্ঠানসূচি</h2>
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
                        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5b52e8', marginBottom: 10 }}>টিকেট প্যাকেজ</div>
                        <h2 style={{ fontSize: 34, fontWeight: 900, margin: 0 }}>আপনার প্যাকেজ বেছে নিন</h2>
                        <p style={{ fontSize: 15, color: '#5a6282', marginTop: 10 }}>রেজিস্ট্রেশন সম্পন্ন করার পর বিকাশে সহজে পেমেন্ট করুন</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
                        {PACKAGES_INFO.map(pkg => (
                            <div key={pkg.name} style={{ background: 'white', border: pkg.popular ? `2px solid ${pkg.color}` : '1.5px solid #e2e8f4', borderRadius: 18, padding: '28px 20px', textAlign: 'center', boxShadow: pkg.popular ? `0 4px 20px ${pkg.color}25` : '0 2px 12px rgba(0,0,0,0.06)', position: 'relative' }}>
                                {pkg.popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: pkg.color, color: 'white', fontSize: 10, fontWeight: 800, padding: '3px 12px', borderRadius: 999 }}>⭐ সবচেয়ে জনপ্রিয়</div>}
                                <div style={{ fontSize: 36, marginBottom: 12 }}>{pkg.icon}</div>
                                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>{pkg.name}</div>
                                <div style={{ fontSize: 28, fontWeight: 900, color: pkg.color, marginBottom: 8 }}>{pkg.price}</div>
                                <div style={{ fontSize: 12, color: '#5a6282' }}>{pkg.desc}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 40 }}>
                        <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#E2136E,#c9005a)', color: 'white', padding: '14px 36px', borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: 'none', boxShadow: '0 6px 20px rgba(226,19,110,0.3)' }}>
                            রেজিস্ট্রেশন করুন ও বিকাশে পেমেন্ট করুন →
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── REGISTRATION OVERVIEW ────────────────── */}
            <section id="registrations" style={{ background: 'white', padding: '72px 24px' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#15a96a', marginBottom: 10 }}>নিবন্ধন তথ্য</div>
                        <h2 style={{ fontSize: 34, fontWeight: 900, margin: 0 }}>রেজিস্ট্রেশন সারসংক্ষেপ</h2>
                        <p style={{ fontSize: 15, color: '#5a6282', marginTop: 10 }}>এখন পর্যন্ত কতজন নিবন্ধন করেছেন দেখুন</p>
                    </div>

                    {/* Stats Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 32 }}>
                        {[
                            { label: 'মোট নিবন্ধন', value: stats.total, color: '#5b52e8', icon: '📋' },
                            { label: 'নিশ্চিত', value: stats.confirmed, color: '#15a96a', icon: '✅' },
                            { label: 'যাচাই অপেক্ষায়', value: stats.pending, color: '#d97706', icon: '⏳' },
                            { label: 'মোট আসন', value: stats.totalSeats, color: '#E2136E', icon: '💺' },
                        ].map(s => (
                            <div key={s.label} style={{ background: '#f4f6fb', border: '1.5px solid #e2e8f4', borderRadius: 14, padding: '20px', textAlign: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                                <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
                                <div style={{ fontSize: 32, fontWeight: 900, color: s.color }}>{regsLoading ? '…' : s.value}</div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#9aa3bb', marginTop: 4 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
                        <input
                            placeholder="🔍 নাম বা ব্যাচ দিয়ে খুঁজুন…"
                            value={regSearch}
                            onChange={e => setRegSearch(e.target.value)}
                            style={{ flex: '1 1 200px', padding: '9px 14px', border: '1.5px solid #e2e8f4', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit', background: '#f4f6fb' }}
                        />
                        <select value={regBatchFilter} onChange={e => setRegBatchFilter(e.target.value)} style={{ padding: '9px 14px', border: '1.5px solid #e2e8f4', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#f4f6fb', cursor: 'pointer' }}>
                            <option value="all">সকল ব্যাচ</option>
                            {batches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        {(regSearch || regBatchFilter !== 'all') && (
                            <button onClick={() => { setRegSearch(''); setRegBatchFilter('all'); }} style={{ padding: '9px 14px', background: '#fff0f4', color: '#E2136E', border: '1.5px solid #ffcce0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>✕ রিসেট</button>
                        )}
                    </div>

                    {/* Table */}
                    {regsLoading ? (
                        <div style={{ textAlign: 'center', padding: 40, color: '#5a6282' }}>⏳ তথ্য লোড হচ্ছে…</div>
                    ) : regs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40, color: '#9aa3bb' }}>এখনও কোনো নিবন্ধন হয়নি</div>
                    ) : (
                        <div style={{ background: '#f4f6fb', border: '1.5px solid #e2e8f4', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(91,82,232,0.05)' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                    <thead>
                                        <tr style={{ background: 'white', borderBottom: '1.5px solid #e2e8f4' }}>
                                            <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#5a6282', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>#</th>
                                            <th onClick={() => toggleRegSort('fullName')} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#5a6282', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}>
                                                নাম{sortIcon('fullName')}
                                            </th>
                                            <th onClick={() => toggleRegSort('batchYear')} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#5a6282', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}>
                                                ব্যাচ{sortIcon('batchYear')}
                                            </th>
                                            <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#5a6282', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>এলাকা</th>
                                            <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#5a6282', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>প্যাকেজ</th>
                                            <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: '#5a6282', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>আসন</th>
                                            <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#5a6282', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>অবস্থা</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRegs.length === 0 && (
                                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9aa3bb' }}>কোনো ফলাফল পাওয়া যায়নি</td></tr>
                                        )}
                                        {filteredRegs.map((r, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #e8eaf2', background: i % 2 === 0 ? 'white' : '#fafbff' }}>
                                                <td style={{ padding: '12px 14px', color: '#9aa3bb', fontSize: 12 }}>{i + 1}</td>
                                                <td style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.fullName}</td>
                                                <td style={{ padding: '12px 14px', color: '#5a6282' }}>{r.batchYear}</td>
                                                <td style={{ padding: '12px 14px', color: '#5a6282' }}>{r.currentCity}</td>
                                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>{r.packageName}</td>
                                                <td style={{ padding: '12px 14px', textAlign: 'center' }}>{r.seats}</td>
                                                <td style={{ padding: '12px 14px' }}>
                                                    {r.status === 'confirmed'
                                                        ? <span style={{ background: '#f0fff8', color: '#15a96a', border: '1px solid #15a96a30', borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>✓ নিশ্চিত</span>
                                                        : <span style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #d9770630', borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>⏳ যাচাই অপেক্ষায়</span>
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f4', fontSize: 12, color: '#9aa3bb', background: 'white' }}>
                                মোট {regs.length} জনের মধ্যে {filteredRegs.length} জন দেখানো হচ্ছে
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ── FAQ ───────────────────────────────────── */}
            <section id="faq" style={{ padding: '72px 24px' }}>
                <div style={{ maxWidth: 680, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5b52e8', marginBottom: 10 }}>জিজ্ঞাসা</div>
                        <h2 style={{ fontSize: 34, fontWeight: 900, margin: 0 }}>সচরাচর জিজ্ঞাসা</h2>
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
                <div style={{ fontWeight: 700, color: 'white', fontSize: 15, marginBottom: 4 }}>ধর্ম্মেশ্বর মহেশা দ্বি-মূখী উচ্চ বিদ্যালয় প্রাক্তন ছাত্র সমিতি</div>
                <div style={{ fontSize: 13, marginBottom: 16 }}>৮১ বছরপূর্তি উৎসব - ২০২৬ · ৩০ মে · স্কুল মাঠ</div>
                <div style={{ fontSize: 13, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/track" style={{ color: '#a5a0ff', textDecoration: 'none' }}>🔍 রেজিস্ট্রেশন ট্র্যাক</Link>
                    <span>·</span>
                    <span>📞 <a href="tel:01964614377" style={{ color: '#a5a0ff', textDecoration: 'none' }}>01964-614377</a></span>
                    <span>·</span>
                    <span>✉️ <a href="mailto:reunion@dmhs.edu.bd" style={{ color: '#a5a0ff', textDecoration: 'none' }}>reunion@dmhs.edu.bd</a></span>
                </div>
                <div style={{ marginTop: 20, fontSize: 11, color: 'rgba(255,255,255,0.3)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
                    <Link to="/admin" style={{ color: 'rgba(255,255,255,0.25)', textDecoration: 'none', fontSize: 11 }}>Admin</Link>
                </div>
            </footer>

        </div>
    );
}
