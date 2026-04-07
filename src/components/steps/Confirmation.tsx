import React from 'react';
import type { FormData, Package } from '../types';

interface ConfirmationProps {
    data: FormData;
    packages: Package[];
    ticketId: string;
    firestoreDocId?: string | null;
    animClass: string;
}

const Confirmation: React.FC<ConfirmationProps> = ({ data, packages, ticketId, firestoreDocId, animClass }) => {
    const selectedPackage = packages.find(p => p.id === data.packageId);
    const totalAmount = (selectedPackage?.price ?? 0) * (Number(data.seats) || 1);

    const rows = [
        { key: 'পূর্ণ নাম', val: data.fullName },
        { key: 'ব্যাচ', val: data.batchYear },
        { key: 'ফোন', val: data.phone },
        { key: 'ইমেইল', val: data.email || '—' },
        { key: 'ঠিকানা', val: data.currentCity },
        { key: 'প্যাকেজ', val: selectedPackage ? `${selectedPackage.icon} ${selectedPackage.name}` : '—' },
        { key: 'আসন সংখ্যা', val: `${data.seats}` },
        { key: 'খাবারের পছন্দ', val: data.dietaryPref || 'কোনো পছন্দ নেই' },
        { key: 'বিকাশ TxID', val: data.bkashTxId },
        { key: 'মোট পরিশোধ', val: `৳${totalAmount.toLocaleString()}`, highlight: true },
    ];

    return (
        <div className={animClass}>
            <div className="confirm-icon">✅</div>
            <div className="confirm-title">রেজিস্ট্রেশন জমা হয়েছে!</div>
            <div className="confirm-subtitle">
                ধন্যবাদ, <strong>{data.fullName.split(' ')[0]}</strong>! আপনার রেজিস্ট্রেশন পর্যালোচনাধীন আছে।<br />
                পেমেন্ট যাচাইয়ের পর <strong>২৪ ঘণ্টার</strong> মধ্যে SMS/ইমেইলে নিশ্চিতকরণ পাবেন।
            </div>

            <div className="confirm-details">
                {rows.map((row, i) => (
                    <div key={i} className="confirm-row">
                        <span className="confirm-row-key">{row.key}</span>
                        <span className={`confirm-row-val ${row.highlight ? 'highlight' : ''}`}>{row.val}</span>
                    </div>
                ))}
            </div>

            <div className="ticket-id-box">
                <div className="ticket-id-label">আপনার টিকেট রেফারেন্স আইডি</div>
                <div className="ticket-id-value">{ticketId}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                    এই আইডি সংরক্ষণ করুন — অনুষ্ঠানের প্রবেশদ্বারে এটি প্রয়োজন হতে পারে
                </div>
                {firestoreDocId && (
                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '8px', letterSpacing: '0.04em' }}>
                        📄 রেজিস্ট্রেশন আইডি: <span style={{ fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>{firestoreDocId}</span>
                    </div>
                )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '28px' }}>
                <button
                    className="btn-secondary"
                    onClick={() => window.print()}
                    style={{ margin: '0 auto' }}
                >
                    🖨 প্রিন্ট / PDF সংরক্ষণ
                </button>
            </div>

            <div style={{
                textAlign: 'center',
                marginTop: '20px',
                fontSize: '13px',
                color: 'var(--color-text-muted)',
                lineHeight: '1.7'
            }}>
                প্রশ্ন? যোগাযোগ করুন{' '}
                <a href="tel:01700000000" style={{ color: 'var(--color-accent)' }}>০১৭০০-০০০০০০</a>
                {' '}অথবা{' '}
                <a href="mailto:reunion@dmhs.edu.bd" style={{ color: 'var(--color-accent)' }}>reunion@dmhs.edu.bd</a>
            </div>
        </div>
    );
};

export default Confirmation;
