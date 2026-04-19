import { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface TrackResult {
    ticketId: string;
    fullName: string;
    batchYear: string;
    phone: string;
    email: string | null;
    currentCity: string;
    packageName: string;
    seats: number;
    totalAmount: number;
    bkashTxId: string;
    bkashPhone: string;
    status: string;
    submittedAt: { seconds: number } | null;
}

function formatDate(ts: { seconds: number } | null) {
    if (!ts) return '—';
    return new Date(ts.seconds * 1000).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function TrackPage() {
    const [phone, setPhone] = useState('');
    const [results, setResults] = useState<TrackResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanPhone = phone.replace(/[\s-]/g, '');
        if (!cleanPhone || cleanPhone.length < 11) {
            setError('অনুগ্রহ করে একটি সঠিক ফোন নম্বর দিন');
            return;
        }
        setError('');
        setLoading(true);
        setSearched(true);
        try {
            const q = query(collection(db, 'registrations'), where('phone', '==', cleanPhone));
            const snap = await getDocs(q);
            setResults(snap.docs.map(d => {
                const data = d.data();
                return {
                    ticketId: data.ticketId || '',
                    fullName: data.fullName || '',
                    batchYear: data.batchYear || '',
                    phone: data.phone || '',
                    email: data.email || null,
                    currentCity: data.currentCity || '',
                    packageName: data.packageName || '',
                    seats: data.seats || 1,
                    totalAmount: data.totalAmount || 0,
                    bkashTxId: data.bkashTxId || '',
                    bkashPhone: data.bkashPhone || '',
                    status: data.status || '',
                    submittedAt: data.submittedAt || null,
                };
            }));
        } catch {
            setError('তথ্য লোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
        } finally {
            setLoading(false);
        }
    };

    const chip = (bg: string, color: string, text: string) => (
        <span style={{ background: bg, color, border: `1px solid ${color}30`, borderRadius: 999, padding: '4px 14px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>{text}</span>
    );

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', background: '#f4f6fb', color: '#1a1f36' }}>
            {/* Nav */}
            <div style={{ background: 'white', borderBottom: '1px solid #e2e8f4', padding: '12px 24px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: '#5b52e8', textDecoration: 'none' }}>
                    ← মূল পেজে ফিরে যান
                </Link>
                <Link to="/register" style={{ fontSize: 14, fontWeight: 600, color: '#E2136E', textDecoration: 'none' }}>
                    নতুন রেজিস্ট্রেশন →
                </Link>
            </div>

            <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 8px' }}>
                        আপনার{' '}
                        <span style={{ background: 'linear-gradient(90deg, #E2136E, #5b52e8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                            রেজিস্ট্রেশন ট্র্যাক
                        </span>
                        {' '}করুন
                    </h1>
                    <p style={{ fontSize: 15, color: '#5a6282', lineHeight: 1.7 }}>
                        আপনার ফোন নম্বর দিয়ে রেজিস্ট্রেশনের অবস্থা দেখুন।<br />কোনো তথ্য পরিবর্তন করা যাবে না — শুধুমাত্র দেখার জন্য।
                    </p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch} style={{ background: 'white', border: '1.5px solid #e2e8f4', borderRadius: 18, padding: '28px 24px', boxShadow: '0 4px 20px rgba(91,82,232,0.08)', marginBottom: 32 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#5a6282', display: 'block', marginBottom: 8 }}>
                        📱 আপনার ফোন নম্বর
                    </label>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <input
                            type="tel"
                            placeholder="০১XXXXXXXXX"
                            value={phone}
                            onChange={e => { setPhone(e.target.value); setError(''); }}
                            style={{ flex: 1, padding: '13px 16px', borderRadius: 10, border: error ? '1.5px solid #d93025' : '1.5px solid #e2e8f4', fontSize: 16, outline: 'none', fontFamily: 'inherit', background: '#f4f6fb', letterSpacing: '0.04em' }}
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            style={{ padding: '13px 24px', background: 'linear-gradient(135deg,#5b52e8,#7c74f0)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(91,82,232,0.3)', opacity: loading ? 0.7 : 1, whiteSpace: 'nowrap' }}
                        >
                            {loading ? '⏳ খুঁজছি…' : '🔍 খুঁজুন'}
                        </button>
                    </div>
                    {error && <div style={{ color: '#d93025', fontSize: 12, marginTop: 8 }}>⚠ {error}</div>}
                </form>

                {/* Results */}
                {searched && !loading && results.length === 0 && (
                    <div style={{ background: 'white', border: '1.5px solid #e2e8f4', borderRadius: 16, padding: '40px 24px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>😔</div>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>কোনো রেজিস্ট্রেশন পাওয়া যায়নি</div>
                        <div style={{ fontSize: 14, color: '#5a6282', lineHeight: 1.7 }}>
                            এই ফোন নম্বরে কোনো রেজিস্ট্রেশন রেকর্ড নেই।<br />
                            নম্বর সঠিক কিনা যাচাই করুন অথবা{' '}
                            <Link to="/register" style={{ color: '#5b52e8', fontWeight: 600, textDecoration: 'none' }}>নতুন রেজিস্ট্রেশন করুন</Link>।
                        </div>
                    </div>
                )}

                {results.map((r, idx) => (
                    <div key={idx} style={{ background: 'white', border: '1.5px solid #e2e8f4', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 20px rgba(91,82,232,0.08)', marginBottom: 20 }}>
                        {/* Card Header */}
                        <div style={{ background: 'linear-gradient(135deg,#f0f2ff,#fff5fa)', padding: '20px 24px', borderBottom: '1.5px solid #e2e8f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: 18 }}>{r.fullName}</div>
                                <div style={{ fontSize: 13, color: '#5a6282', marginTop: 2 }}>ব্যাচ: {r.batchYear} · টিকেট: <span style={{ fontFamily: 'monospace', color: '#5b52e8', fontWeight: 700 }}>{r.ticketId}</span></div>
                            </div>
                            {r.status === 'confirmed'
                                ? chip('#f0fff8', '#15a96a', '✓ নিশ্চিত')
                                : chip('#fffbeb', '#d97706', '⏳ যাচাই অপেক্ষায়')
                            }
                        </div>

                        {/* Card Body */}
                        <div style={{ padding: '20px 24px' }}>
                            {[
                                { label: 'ফোন', value: r.phone },
                                { label: 'ইমেইল', value: r.email || '—' },
                                { label: 'ঠিকানা', value: r.currentCity },
                                { label: 'প্যাকেজ', value: r.packageName },
                                { label: 'আসন সংখ্যা', value: String(r.seats) },
                                { label: 'মোট পরিশোধ', value: `৳${r.totalAmount.toLocaleString()}`, highlight: true },
                                { label: 'বিকাশ TxID', value: r.bkashTxId },
                                { label: 'প্রেরকের নম্বর', value: r.bkashPhone },
                                { label: 'জমার তারিখ', value: formatDate(r.submittedAt) },
                            ].map((row, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 8 ? '1px solid #f0f2f8' : 'none', fontSize: 14 }}>
                                    <span style={{ color: '#5a6282', fontWeight: 500 }}>{row.label}</span>
                                    <span style={{ fontWeight: row.highlight ? 800 : 600, color: row.highlight ? '#E2136E' : '#1a1f36', textAlign: 'right' }}>{row.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Footer note */}
                        <div style={{ background: '#f4f6fb', padding: '14px 24px', fontSize: 12, color: '#9aa3bb', borderTop: '1px solid #e2e8f4' }}>
                            🔒 এই তথ্য শুধুমাত্র পড়ার জন্য — কোনো পরিবর্তন করা যাবে না
                        </div>
                    </div>
                ))}

                {/* Help section */}
                <div style={{ textAlign: 'center', marginTop: 32, fontSize: 13, color: '#9aa3bb', lineHeight: 1.8 }}>
                    সমস্যা? যোগাযোগ করুন{' '}
                    <a href="tel:01964614377" style={{ color: '#5b52e8', textDecoration: 'none' }}>০১৭০০-০০০০০০</a>
                    {' '}· <a href="mailto:reunion@dmhs.edu.bd" style={{ color: '#5b52e8', textDecoration: 'none' }}>reunion@dmhs.edu.bd</a>
                </div>
            </div>
        </div>
    );
}
