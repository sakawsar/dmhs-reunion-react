import React, { useState } from 'react';
import type { FormData, FormErrors, Package } from '../types';

interface BkashPaymentProps {
    data: FormData;
    errors: FormErrors;
    onChange: (field: keyof FormData, value: string | number) => void;
    packages: Package[];
    animClass: string;
}

const BKASH_MERCHANT_NUMBER = '01700-000000';

const BkashPayment: React.FC<BkashPaymentProps> = ({ data, errors, onChange, packages, animClass }) => {
    const [copied, setCopied] = useState(false);

    const selectedPackage = packages.find(p => p.id === data.packageId);
    const totalAmount = (selectedPackage?.price ?? 0) * (Number(data.seats) || 1);

    const handleCopy = () => {
        navigator.clipboard.writeText(BKASH_MERCHANT_NUMBER.replace('-', ''));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={animClass}>
            <div className="form-title">bKash Payment</div>
            <div className="form-subtitle">Complete your payment via bKash and enter the transaction details below.</div>

            {/* bKash Instructions Card */}
            <div className="bkash-card">
                <div className="bkash-header">
                    <div className="bkash-logo-pill">bKash</div>
                    <div className="bkash-header-text">
                        <h3>Payment Instructions</h3>
                        <p>Follow the steps carefully to complete your registration</p>
                    </div>
                </div>

                <ul className="bkash-steps-list">
                    <li className="bkash-step-item">
                        <span className="bkash-step-num">1</span>
                        <span className="bkash-step-text">
                            Open your <strong>bKash app</strong> or dial <strong>*247#</strong> from your phone.
                        </span>
                    </li>
                    <li className="bkash-step-item">
                        <span className="bkash-step-num">2</span>
                        <span className="bkash-step-text">
                            Select <strong>"Send Money"</strong> and enter the merchant number:
                            <div style={{ marginTop: '8px' }}>
                                <span
                                    className="bkash-number-display"
                                    onClick={handleCopy}
                                    title="Click to copy"
                                    role="button"
                                    aria-label="Copy bKash number"
                                >
                                    📱 {BKASH_MERCHANT_NUMBER}
                                    <span className="copy-icon">📋</span>
                                    {copied && <span className="copied-toast">Copied!</span>}
                                </span>
                            </div>
                        </span>
                    </li>
                    <li className="bkash-step-item">
                        <span className="bkash-step-num">3</span>
                        <span className="bkash-step-text">
                            Send exactly <strong className="text-bkash">৳{totalAmount.toLocaleString()}</strong> as the amount.
                        </span>
                    </li>
                    <li className="bkash-step-item">
                        <span className="bkash-step-num">4</span>
                        <span className="bkash-step-text">
                            Use your <strong>reference/note</strong>: <strong className="text-accent">"DMHS26-{data.batchYear || 'BATCH'}"</strong>
                        </span>
                    </li>
                    <li className="bkash-step-item">
                        <span className="bkash-step-num">5</span>
                        <span className="bkash-step-text">
                            Copy the <strong>Transaction ID</strong> from the SMS/app and paste it below.
                        </span>
                    </li>
                </ul>

                {/* Amount summary */}
                <div className="bkash-amount-display" style={{ marginTop: '20px' }}>
                    <div>
                        <div className="bkash-amount-label">Total Amount to Send</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            {selectedPackage?.name} × {data.seats} seat{Number(data.seats) > 1 ? 's' : ''}
                        </div>
                    </div>
                    <div className="bkash-amount-value">৳{totalAmount.toLocaleString()}</div>
                </div>
            </div>

            {/* Transaction ID */}
            <div className="form-group">
                <label htmlFor="bkashTxId">
                    bKash Transaction ID (TxID) <span className="required">*</span>
                </label>
                <input
                    id="bkashTxId"
                    type="text"
                    className={errors.bkashTxId ? 'error' : ''}
                    placeholder="e.g. 8GH9K2L3M1"
                    value={data.bkashTxId}
                    onChange={e => onChange('bkashTxId', e.target.value.toUpperCase())}
                    style={{ letterSpacing: '0.08em', fontWeight: '600' }}
                />
                {errors.bkashTxId && <div className="error-msg">⚠ {errors.bkashTxId}</div>}
                <div className="text-sm text-muted mt-1">
                    You can find the TxID in your bKash SMS confirmation or the app's transaction history.
                </div>
            </div>

            {/* bKash Phone Number */}
            <div className="form-group">
                <label htmlFor="bkashPhone">
                    Your bKash / Sender Phone Number <span className="required">*</span>
                </label>
                <input
                    id="bkashPhone"
                    type="tel"
                    className={errors.bkashPhone ? 'error' : ''}
                    placeholder="01XXXXXXXXX"
                    value={data.bkashPhone}
                    onChange={e => onChange('bkashPhone', e.target.value)}
                />
                {errors.bkashPhone && <div className="error-msg">⚠ {errors.bkashPhone}</div>}
            </div>

            {/* Disclaimer */}
            <div style={{
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: '10px',
                padding: '14px 16px',
                fontSize: '12.5px',
                color: 'var(--color-gold)',
                lineHeight: '1.6'
            }}>
                ⚠️ <strong>Important:</strong> Please double-check your Transaction ID. Incorrect TxIDs will delay your registration confirmation. The organizers will verify your payment within 24 hours.
            </div>
        </div>
    );
};

export default BkashPayment;
