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
        { key: 'Full Name', val: data.fullName },
        { key: 'Batch Year', val: data.batchYear },
        { key: 'Phone', val: data.phone },
        { key: 'Email', val: data.email || '—' },
        { key: 'City', val: data.currentCity },
        { key: 'Package', val: selectedPackage ? `${selectedPackage.icon} ${selectedPackage.name}` : '—' },
        { key: 'Seats', val: `${data.seats}` },
        { key: 'Dietary Pref', val: data.dietaryPref || 'No Preference' },
        { key: 'bKash TxID', val: data.bkashTxId },
        { key: 'Total Paid', val: `৳${totalAmount.toLocaleString()}`, highlight: true },
    ];

    return (
        <div className={animClass}>
            <div className="confirm-icon">✅</div>
            <div className="confirm-title">Registration Submitted!</div>
            <div className="confirm-subtitle">
                Thank you, <strong>{data.fullName.split(' ')[0]}</strong>! Your registration is under review.<br />
                We'll confirm via SMS/email within <strong>24 hours</strong> after verifying your payment.
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
                <div className="ticket-id-label">Your Ticket Reference ID</div>
                <div className="ticket-id-value">{ticketId}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                    Save this ID — you may need it at the event entrance
                </div>
                {firestoreDocId && (
                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '8px', letterSpacing: '0.04em' }}>
                        📄 Registration ID: <span style={{ fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>{firestoreDocId}</span>
                    </div>
                )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '28px' }}>
                <button
                    className="btn-secondary"
                    onClick={() => window.print()}
                    style={{ margin: '0 auto' }}
                >
                    🖨 Print / Save as PDF
                </button>
            </div>

            <div style={{
                textAlign: 'center',
                marginTop: '20px',
                fontSize: '13px',
                color: 'var(--color-text-muted)',
                lineHeight: '1.7'
            }}>
                Questions? Contact us at{' '}
                <a href="tel:01700000000" style={{ color: 'var(--color-accent)' }}>01700-000000</a>
                {' '}or{' '}
                <a href="mailto:reunion@dmhs.edu.bd" style={{ color: 'var(--color-accent)' }}>reunion@dmhs.edu.bd</a>
            </div>
        </div>
    );
};

export default Confirmation;
