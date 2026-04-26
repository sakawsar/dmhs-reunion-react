import React, { useState } from 'react';
import type { FormData, FormErrors } from '../types';
import { calculateTotal } from '../types';

interface PaymentStepProps {
    data: FormData;
    errors: FormErrors;
    onChange: (field: keyof FormData, value: string | number) => void;
    animClass: string;
}

/* ── Payment method configs ─────────────────────────────────────────── */
const PAYMENT_METHODS = [
    {
        id: 'bkash',
        name: 'বিকাশ',
        nameEn: 'bKash',
        color: '#E2136E',
        bg: 'linear-gradient(135deg, #E2136E 0%, #a30d50 100%)',
        icon: '💳',
        number: '01964-614377',
        dial: '*247#',
        action: 'পেমেন্ট',
    },
    // {
    //     id: 'nagad',
    //     name: 'নগদ',
    //     nameEn: 'Nagad',
    //     color: '#F6921E',
    //     bg: 'linear-gradient(135deg, #F6921E 0%, #d97a0a 100%)',
    //     icon: '📲',
    //     number: '01700-000000',
    //     dial: '*167#',
    //     action: 'সেন্ড মানি',
    // },
    // {
    //     id: 'rocket',
    //     name: 'রকেট',
    //     nameEn: 'Rocket',
    //     color: '#8B2F8B',
    //     bg: 'linear-gradient(135deg, #8B2F8B 0%, #6a1d6a 100%)',
    //     icon: '🚀',
    //     number: '01700-0000000',
    //     dial: '*322#',
    //     action: 'সেন্ড মানি',
    // },
    {
        id: 'bank',
        name: 'ব্যাংক ট্রান্সফার',
        nameEn: 'Bank Transfer',
        color: '#1a6fb5',
        bg: 'linear-gradient(135deg, #1a6fb5 0%, #0d4f80 100%)',
        icon: '🏦',
        number: '',
        dial: '',
        action: '',
    },
];

const BANK_INFO = {
    bankName: 'Sonali Bnk Limited, Mirbagh Branch',
    accountName: 'ধর্ম্মেশ্বর মহেশা দ্বি-মূখী উচ্চ বিদ্যালয় ৮১ বছরপূর্তি উৎসব - ২০২৬',
    accountNumber: '5015302000585',
    routingNumber: '200851062',
};

const PaymentStep: React.FC<PaymentStepProps> = ({ data, errors, onChange, animClass }) => {
    const [copiedNumber, setCopiedNumber] = useState(false);

    const guests = Number(data.guests) || 0;
    const { baseAmount, guestCharge, totalAmount } = calculateTotal(data.batchYear, guests);
    const selectedMethod = PAYMENT_METHODS.find(m => m.id === data.paymentMethod) || PAYMENT_METHODS[0];

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text.replace(/-/g, ''));
        setCopiedNumber(true);
        setTimeout(() => setCopiedNumber(false), 2000);
    };

    return (
        <div className={animClass}>
            <div className="form-title">পেমেন্ট</div>
            <div className="form-subtitle">আপনার পছন্দের মাধ্যমে পেমেন্ট সম্পন্ন করুন এবং তথ্য দিন।</div>

            {/* ── Payment Method Radio Cards ─────────────── */}
            <div className="form-group">
                <label>পেমেন্ট মাধ্যম <span className="required">*</span></label>
                <div className="payment-method-grid">
                    {PAYMENT_METHODS.map(method => (
                        <label
                            key={method.id}
                            className={`payment-method-card ${data.paymentMethod === method.id ? 'selected' : ''}`}
                            style={{
                                '--pm-color': method.color,
                                '--pm-bg': method.bg,
                            } as React.CSSProperties}
                        >
                            <input
                                type="radio"
                                name="paymentMethod"
                                value={method.id}
                                checked={data.paymentMethod === method.id}
                                onChange={() => onChange('paymentMethod', method.id)}
                                className="sr-only"
                            />
                            <span className="payment-method-icon">{method.icon}</span>
                            <span className="payment-method-name">{method.name}</span>
                            <span className="payment-method-name-en">{method.nameEn}</span>
                            {data.paymentMethod === method.id && (
                                <span className="payment-method-check">✓</span>
                            )}
                        </label>
                    ))}
                </div>
                {errors.paymentMethod && <div className="error-msg">⚠ {errors.paymentMethod}</div>}
            </div>

            {/* ── Instructions Card ──────────────────────── */}
            <div className="payment-instruction-card" style={{ '--pm-color': selectedMethod.color } as React.CSSProperties}>
                <div className="payment-instruction-header">
                    <div className="payment-instruction-pill" style={{ background: selectedMethod.bg }}>
                        {selectedMethod.icon} {selectedMethod.name}
                    </div>
                    <div className="payment-instruction-header-text">
                        <h3>পেমেন্ট নির্দেশনা</h3>
                        <p>রেজিস্ট্রেশন সম্পন্ন করতে নীচের ধাপ অনুসরণ করুন</p>
                    </div>
                </div>

                {selectedMethod.id !== 'bank' ? (
                    <ul className="payment-steps-list">
                        <li className="payment-step-item">
                            <span className="payment-step-num" style={{ background: selectedMethod.bg }}>১</span>
                            <span className="payment-step-text">
                                আপনার <strong>{selectedMethod.name} অ্যাপ</strong> খুলুন অথবা ফোন থেকে <strong>{selectedMethod.dial}</strong> ডায়াল করুন।
                            </span>
                        </li>
                        <li className="payment-step-item">
                            <span className="payment-step-num" style={{ background: selectedMethod.bg }}>২</span>
                            <span className="payment-step-text">
                                <strong>"{selectedMethod.action}"</strong> নির্বাচন করুন এবং নম্বর দিন:
                                <div style={{ marginTop: '8px' }}>
                                    <span
                                        className="payment-number-display"
                                        onClick={() => handleCopy(selectedMethod.number)}
                                        title="কপি করতে ক্লিক করুন"
                                        role="button"
                                        aria-label="নম্বর কপি করুন"
                                        style={{ borderColor: `${selectedMethod.color}30`, background: `${selectedMethod.color}08` }}
                                    >
                                        📱 {selectedMethod.number}
                                        <span className="copy-icon">📋</span>
                                        {copiedNumber && <span className="copied-toast" style={{ background: selectedMethod.color }}>কপি হয়েছে!</span>}
                                    </span>
                                </div>
                            </span>
                        </li>
                        <li className="payment-step-item">
                            <span className="payment-step-num" style={{ background: selectedMethod.bg }}>৩</span>
                            <span className="payment-step-text">
                                ঠিক <strong style={{ color: selectedMethod.color, fontSize: '16px' }}>৳{totalAmount.toLocaleString()}</strong> টাকা পাঠান।
                            </span>
                        </li>
                        <li className="payment-step-item">
                            <span className="payment-step-num" style={{ background: selectedMethod.bg }}>৪</span>
                            <span className="payment-step-text">
                                <strong>রেফারেন্স/নোট</strong> হিসেবে লিখুন: <strong style={{ color: selectedMethod.color }}>"{data.batchYear || 'BATCH'}"</strong>
                            </span>
                        </li>
                        <li className="payment-step-item">
                            <span className="payment-step-num" style={{ background: selectedMethod.bg }}>৫</span>
                            <span className="payment-step-text">
                                SMS/অ্যাপ থেকে <strong>ট্রানজেকশন আইডি</strong> কপি করে নীচে দিন।
                            </span>
                        </li>
                    </ul>
                ) : (
                    /* Bank transfer instructions */
                    <div className="bank-info-grid">
                        <div className="bank-info-item">
                            <span className="bank-info-label">ব্যাংকের নাম</span>
                            <span className="bank-info-value">{BANK_INFO.bankName}</span>
                        </div>
                        <div className="bank-info-item">
                            <span className="bank-info-label">অ্যাকাউন্টের নাম</span>
                            <span className="bank-info-value">{BANK_INFO.accountName}</span>
                        </div>
                        <div className="bank-info-item">
                            <span className="bank-info-label">অ্যাকাউন্ট নম্বর</span>
                            <span className="bank-info-value" style={{ fontFamily: 'monospace', letterSpacing: '0.06em' }}>
                                {BANK_INFO.accountNumber}
                                <button
                                    className="copy-btn-inline"
                                    onClick={() => handleCopy(BANK_INFO.accountNumber)}
                                    title="কপি"
                                >📋</button>
                            </span>
                        </div>
                        <div className="bank-info-item">
                            <span className="bank-info-label">রাউটিং নম্বর</span>
                            <span className="bank-info-value" style={{ fontFamily: 'monospace' }}>{BANK_INFO.routingNumber}</span>
                        </div>
                        <div className="bank-info-item" style={{ gridColumn: '1 / -1' }}>
                            <span className="bank-info-label">পরিমাণ</span>
                            <span className="bank-info-value" style={{ color: '#1a6fb5', fontSize: '18px', fontWeight: 800 }}>
                                ৳{totalAmount.toLocaleString()}
                            </span>
                        </div>
                    </div>
                )}

                {/* Amount summary */}
                <div className="payment-amount-display" style={{ borderColor: `${selectedMethod.color}20` }}>
                    <div>
                        <div className="payment-amount-label">মোট পরিশোধযোগ্য টাকা</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            ব্যাচ {data.batchYear}: ৳{baseAmount.toLocaleString()}
                            {guests > 0 && ` + অতিথি ${guests} জন: ৳${guestCharge.toLocaleString()}`}
                        </div>
                    </div>
                    <div className="payment-amount-value" style={{ color: selectedMethod.color }}>
                        ৳{totalAmount.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* ── Transaction ID ──────────────────────────── */}
            <div className="form-group">
                <label htmlFor="paymentTxId">
                    ট্রানজেকশন আইডি (TxID) <span className="required">*</span>
                </label>
                <input
                    id="paymentTxId"
                    type="text"
                    className={errors.paymentTxId ? 'error' : ''}
                    placeholder={selectedMethod.id === 'bank' ? 'ব্যাংক ট্রান্সফার রেফারেন্স নম্বর' : 'যেমন: 8GH9K2L3M1'}
                    value={data.paymentTxId}
                    onChange={e => onChange('paymentTxId', e.target.value.toUpperCase())}
                    style={{ letterSpacing: '0.08em', fontWeight: '600' }}
                />
                {errors.paymentTxId && <div className="error-msg">⚠ {errors.paymentTxId}</div>}
                <div className="text-sm text-muted mt-1">
                    {selectedMethod.id === 'bank'
                        ? 'ব্যাংক ট্রান্সফার স্লিপ বা অনলাইন ব্যাংকিং রেফারেন্স নম্বর দিন।'
                        : `TxID আপনার ${selectedMethod.name} SMS বা অ্যাপের ট্রানজেকশন হিস্ট্রিতে পাবেন।`}
                </div>
            </div>

            {/* ── Sender Phone ────────────────────────────── */}
            <div className="form-group">
                <label htmlFor="paymentSenderPhone">
                    {selectedMethod.id === 'bank' ? 'আপনার ফোন নম্বর' : `আপনার ${selectedMethod.name} / প্রেরকের ফোন নম্বর`} <span className="required">*</span>
                </label>
                <input
                    id="paymentSenderPhone"
                    type="tel"
                    className={errors.paymentSenderPhone ? 'error' : ''}
                    placeholder="০১XXXXXXXXX"
                    value={data.paymentSenderPhone}
                    onChange={e => onChange('paymentSenderPhone', e.target.value)}
                />
                {errors.paymentSenderPhone && <div className="error-msg">⚠ {errors.paymentSenderPhone}</div>}
            </div>

            {/* ── Disclaimer ─────────────────────────────── */}
            <div style={{
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: '10px',
                padding: '14px 16px',
                fontSize: '12.5px',
                color: 'var(--color-gold)',
                lineHeight: '1.6'
            }}>
                ⚠️ <strong>গুরুত্বপূর্ণ:</strong> অনুগ্রহ করে ট্রানজেকশন আইডি পুনরায় যাচাই করুন। ভুল তথ্য আপনার রেজিস্ট্রেশন নিশ্চিতকরণে বিলম্ব ঘটাবে। আয়োজকরা ২৪ ঘণ্টার মধ্যে আপনার পেমেন্ট যাচাই করবেন।
            </div>
        </div>
    );
};

export default PaymentStep;
