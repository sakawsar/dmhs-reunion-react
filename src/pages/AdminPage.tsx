import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';

// ── types ──────────────────────────────────────────────────────────────
interface Registration {
    id: string;
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
    dietaryPref: string;
    status: string;
    submittedAt: { seconds: number } | null;
}

const ADMIN_PIN = 'dmhs2026'; // change this to whatever you want

function formatDate(ts: { seconds: number } | null) {
    if (!ts) return '—';
    return new Date(ts.seconds * 1000).toLocaleString('en-BD', { dateStyle: 'medium', timeStyle: 'short' });
}

function exportCSV(rows: Registration[]) {
    const headers = ['Ticket ID', 'Name', 'Batch', 'Phone', 'Email', 'City', 'Package', 'Seats', 'Amount (৳)', 'bKash TxID', 'Sender Phone', 'Diet', 'Status', 'Submitted At'];
    const lines = rows.map(r => [
        r.ticketId, r.fullName, r.batchYear, r.phone, r.email ?? '', r.currentCity,
        r.packageName, r.seats, r.totalAmount, r.bkashTxId, r.bkashPhone, r.dietaryPref,
        r.status, formatDate(r.submittedAt),
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `dmhs-registrations-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminPage() {
    // ── Auth gate ──
    const [pin, setPin] = useState('');
    const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_authed') === 'yes');
    const [pinError, setPinError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === ADMIN_PIN) {
            sessionStorage.setItem('admin_authed', 'yes');
            setAuthed(true);
        } else {
            setPinError('Incorrect password. Try again.');
        }
    };

    if (!authed) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6fb', fontFamily: "'Inter', system-ui, sans-serif", padding: 24 }}>
                <div style={{ background: 'white', border: '1.5px solid #e2e8f4', borderRadius: 20, padding: '48px 40px', maxWidth: 380, width: '100%', boxShadow: '0 4px 24px rgba(91,82,232,0.1)', textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>🔐</div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Admin Dashboard</h1>
                    <p style={{ fontSize: 14, color: '#5a6282', marginBottom: 28 }}>DMHS Reunion Registrations</p>
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            placeholder="Enter admin password"
                            value={pin}
                            onChange={e => { setPin(e.target.value); setPinError(''); }}
                            style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: pinError ? '1.5px solid #d93025' : '1.5px solid #e2e8f4', fontSize: 15, outline: 'none', marginBottom: 8, fontFamily: 'inherit', background: '#f4f6fb' }}
                            autoFocus
                        />
                        {pinError && <div style={{ color: '#d93025', fontSize: 12, marginBottom: 10 }}>⚠ {pinError}</div>}
                        <button type="submit" style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg,#5b52e8,#7c74f0)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 14px rgba(91,82,232,0.3)', fontFamily: 'inherit' }}>
                            Login →
                        </button>
                    </form>
                    <div style={{ marginTop: 20 }}><Link to="/" style={{ fontSize: 13, color: '#5b52e8', textDecoration: 'none' }}>← Back to site</Link></div>
                </div>
            </div>
        );
    }

    return <AdminDashboard />;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function AdminDashboard() {
    const [regs, setRegs] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [batchFilter, setBatchFilter] = useState('all');
    const [packageFilter, setPackageFilter] = useState('all');
    const [sortKey, setSortKey] = useState<keyof Registration>('submittedAt');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    // load from Firestore
    useEffect(() => {
        const load = async () => {
            try {
                const q = query(collection(db, 'registrations'), orderBy('submittedAt', 'desc'));
                const snap = await getDocs(q);
                setRegs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Registration)));
            } catch (e: unknown) {
                setError(`Failed to load: ${e instanceof Error ? e.message : String(e)}`);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const markConfirmed = async (id: string) => {
        setUpdatingId(id);
        try {
            await updateDoc(doc(db, 'registrations', id), { status: 'confirmed' });
            setRegs(prev => prev.map(r => r.id === id ? { ...r, status: 'confirmed' } : r));
        } catch {
            alert('Failed to update status.');
        } finally {
            setUpdatingId(null);
        }
    };

    // unique values for filters
    const batches = useMemo(() => [...new Set(regs.map(r => r.batchYear))].sort().reverse(), [regs]);
    const packages = useMemo(() => [...new Set(regs.map(r => r.packageName))].sort(), [regs]);

    const filtered = useMemo(() => {
        let out = [...regs];
        if (search) out = out.filter(r => r.fullName.toLowerCase().includes(search.toLowerCase()) || r.phone.includes(search) || r.ticketId.includes(search.toUpperCase()));
        if (statusFilter !== 'all') out = out.filter(r => r.status === statusFilter);
        if (batchFilter !== 'all') out = out.filter(r => r.batchYear === batchFilter);
        if (packageFilter !== 'all') out = out.filter(r => r.packageName.includes(packageFilter));

        out.sort((a, b) => {
            let av: string | number = a[sortKey] as string | number;
            let bv: string | number = b[sortKey] as string | number;
            if (sortKey === 'submittedAt') {
                av = (a.submittedAt?.seconds ?? 0);
                bv = (b.submittedAt?.seconds ?? 0);
            }
            if (av < bv) return sortDir === 'asc' ? -1 : 1;
            if (av > bv) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return out;
    }, [regs, search, statusFilter, batchFilter, packageFilter, sortKey, sortDir]);

    const stats = useMemo(() => ({
        total: regs.length,
        confirmed: regs.filter(r => r.status === 'confirmed').length,
        pending: regs.filter(r => r.status === 'pending_verification').length,
        revenue: regs.reduce((s, r) => s + (r.totalAmount || 0), 0),
    }), [regs]);

    const toggleSort = (k: keyof Registration) => {
        if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(k); setSortDir('desc'); }
    };

    const S = (k: keyof Registration) => sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

    const logout = () => { sessionStorage.removeItem('admin_authed'); window.location.reload(); };

    const chip = (bg: string, color: string, text: string) => (
        <span style={{ background: bg, color, border: `1px solid ${color}30`, borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{text}</span>
    );

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', background: '#f4f6fb', color: '#1a1f36' }}>
            {/* Top bar */}
            <div style={{ background: 'white', borderBottom: '1px solid #e2e8f4', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link to="/" style={{ fontSize: 13, color: '#5b52e8', textDecoration: 'none', fontWeight: 600 }}>← Site</Link>
                    <span style={{ color: '#e2e8f4' }}>|</span>
                    <span style={{ fontWeight: 800, fontSize: 16 }}>Admin — Registrations</span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => exportCSV(filtered)} style={{ padding: '8px 16px', background: '#f0f2ff', color: '#5b52e8', border: '1.5px solid #d0ccff', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                        ⬇ Export CSV ({filtered.length})
                    </button>
                    <button onClick={logout} style={{ padding: '8px 14px', background: '#fff0f4', color: '#E2136E', border: '1.5px solid #ffcce0', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                        Logout
                    </button>
                </div>
            </div>

            <div style={{ maxWidth: 1300, margin: '0 auto', padding: '28px 20px' }}>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
                    {[
                        { label: 'Total Registered', value: stats.total, color: '#5b52e8', bg: '#f0f2ff' },
                        { label: 'Confirmed', value: stats.confirmed, color: '#15a96a', bg: '#f0fff8' },
                        { label: 'Pending', value: stats.pending, color: '#d97706', bg: '#fffbeb' },
                        { label: 'Total Revenue', value: `৳${stats.revenue.toLocaleString()}`, color: '#E2136E', bg: '#fff0f6' },
                    ].map(s => (
                        <div key={s.label} style={{ background: 'white', border: '1.5px solid #e2e8f4', borderRadius: 14, padding: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9aa3bb' }}>{s.label}</div>
                            <div style={{ fontSize: 28, fontWeight: 900, color: s.color, marginTop: 6 }}>{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{ background: 'white', border: '1.5px solid #e2e8f4', borderRadius: 14, padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                    <input
                        placeholder="🔍 Search name, phone, or ticket ID…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ flex: '1 1 220px', padding: '9px 14px', border: '1.5px solid #e2e8f4', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit', background: '#f4f6fb' }}
                    />
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '9px 14px', border: '1.5px solid #e2e8f4', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#f4f6fb', color: '#1a1f36', cursor: 'pointer' }}>
                        <option value="all">All Statuses</option>
                        <option value="pending_verification">Pending</option>
                        <option value="confirmed">Confirmed</option>
                    </select>
                    <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)} style={{ padding: '9px 14px', border: '1.5px solid #e2e8f4', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#f4f6fb', color: '#1a1f36', cursor: 'pointer' }}>
                        <option value="all">All Batches</option>
                        {batches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <select value={packageFilter} onChange={e => setPackageFilter(e.target.value)} style={{ padding: '9px 14px', border: '1.5px solid #e2e8f4', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#f4f6fb', color: '#1a1f36', cursor: 'pointer' }}>
                        <option value="all">All Packages</option>
                        {packages.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {(search || statusFilter !== 'all' || batchFilter !== 'all' || packageFilter !== 'all') && (
                        <button onClick={() => { setSearch(''); setStatusFilter('all'); setBatchFilter('all'); setPackageFilter('all'); }} style={{ padding: '9px 14px', background: '#fff0f4', color: '#E2136E', border: '1.5px solid #ffcce0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>✕ Clear</button>
                    )}
                </div>

                {/* Table */}
                {loading && <div style={{ textAlign: 'center', padding: 40, color: '#5a6282' }}>⏳ Loading registrations…</div>}
                {error && <div style={{ textAlign: 'center', padding: 40, color: '#d93025' }}>⚠ {error}</div>}
                {!loading && !error && (
                    <div style={{ background: 'white', border: '1.5px solid #e2e8f4', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(91,82,232,0.07)' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <thead>
                                    <tr style={{ background: '#f4f6fb', borderBottom: '1.5px solid #e2e8f4' }}>
                                        {([
                                            ['ticketId', 'Ticket ID'],
                                            ['fullName', 'Name'],
                                            ['batchYear', 'Batch'],
                                            ['phone', 'Phone'],
                                            ['currentCity', 'City'],
                                            ['packageName', 'Package'],
                                            ['seats', 'Seats'],
                                            ['totalAmount', 'Amount'],
                                            ['bkashTxId', 'TxID'],
                                            ['status', 'Status'],
                                            ['submittedAt', 'Submitted'],
                                        ] as [keyof Registration, string][]).map(([k, label]) => (
                                            <th key={k} onClick={() => toggleSort(k)} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#5a6282', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>
                                                {label}{S(k)}
                                            </th>
                                        ))}
                                        <th style={{ padding: '12px 14px', fontWeight: 700, color: '#5a6282', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 && (
                                        <tr><td colSpan={12} style={{ textAlign: 'center', padding: '40px', color: '#9aa3bb' }}>No registrations found</td></tr>
                                    )}
                                    {filtered.map((r, i) => (
                                        <tr key={r.id} style={{ borderBottom: '1px solid #f0f2f8', background: i % 2 === 0 ? 'white' : '#fafbff' }}>
                                            <td style={{ padding: '13px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#5b52e8', whiteSpace: 'nowrap' }}>{r.ticketId}</td>
                                            <td style={{ padding: '13px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.fullName}</td>
                                            <td style={{ padding: '13px 14px', color: '#5a6282' }}>{r.batchYear}</td>
                                            <td style={{ padding: '13px 14px', whiteSpace: 'nowrap' }}>{r.phone}</td>
                                            <td style={{ padding: '13px 14px', color: '#5a6282' }}>{r.currentCity}</td>
                                            <td style={{ padding: '13px 14px', whiteSpace: 'nowrap' }}>{r.packageName}</td>
                                            <td style={{ padding: '13px 14px', textAlign: 'center' }}>{r.seats}</td>
                                            <td style={{ padding: '13px 14px', fontWeight: 700, color: '#E2136E', whiteSpace: 'nowrap' }}>৳{(r.totalAmount || 0).toLocaleString()}</td>
                                            <td style={{ padding: '13px 14px', fontFamily: 'monospace', fontSize: 12 }}>{r.bkashTxId}</td>
                                            <td style={{ padding: '13px 14px' }}>
                                                {r.status === 'confirmed'
                                                    ? chip('#f0fff8', '#15a96a', '✓ Confirmed')
                                                    : chip('#fffbeb', '#d97706', '⏳ Pending')}
                                            </td>
                                            <td style={{ padding: '13px 14px', color: '#9aa3bb', fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(r.submittedAt)}</td>
                                            <td style={{ padding: '13px 14px' }}>
                                                {r.status !== 'confirmed' && (
                                                    <button
                                                        onClick={() => markConfirmed(r.id)}
                                                        disabled={updatingId === r.id}
                                                        style={{ padding: '6px 12px', background: 'linear-gradient(135deg,#15a96a,#0d8a56)', color: 'white', border: 'none', borderRadius: 7, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', opacity: updatingId === r.id ? 0.6 : 1, whiteSpace: 'nowrap' }}
                                                    >
                                                        {updatingId === r.id ? '…' : '✓ Confirm'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f4', fontSize: 12, color: '#9aa3bb' }}>
                            Showing {filtered.length} of {regs.length} registrations
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
