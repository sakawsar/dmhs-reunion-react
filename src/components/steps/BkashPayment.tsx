import React, { useState } from 'react';
import type { FormData, FormErrors } from '../types';
import { calculateTotal } from '../types';

interface BkashPaymentProps {
    data: FormData;
    errors: FormErrors;
    onChange: (field: keyof FormData, value: string | number) => void;
    animClass: string;
}

const BKASH_MERCHANT_NUMBER = '01700-000000';

const BkashPayment: React.FC<BkashPaymentProps> = ({ data, errors, onChange, animClass }) => {
    const [copied, setCopied] = useState(false);

    const guests = Number(data.guests) || 0;
    const { baseAmount, guestCharge, totalAmount } = calculateTotal(data.batchYear, guests);

    const handleCopy = () => {
        navigator.clipboard.writeText(BKASH_MERCHANT_NUMBER.replace('-', ''));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const [paymentMethod, setPM] = useState('bkash')
    return (
        <div className={animClass}>
            <div className="form-title">বিকাশ পেমেন্ট</div>
            <div className="form-subtitle">বিকাশে পেমেন্ট সম্পন্ন করুন এবং নীচে ট্রানজেকশন তথ্য দিন।</div>
            <div className="flex row gap-[32px]">
                <label className="">
                    <p>Bkash</p>
                    <input type="radio" checked={paymentMethod == 'bkash'} onChange={(e) => setPM(e.target.value)} name="payment_method" value="bkash" />
                </label>
                <label>
                    <p>Nagad</p>
                    <input type="radio" name="payment_method" value="Nagad" />
                </label>
                <label>
                    <p>Rocket</p>
                    <input type="radio" name="payment_method" value="Rocket" />
                </label>
                <label>
                    <p>Bank account</p>
                    <input type="radio" name="payment_method" value="bank" />
                </label>
            </div>
            {/* bKash Instructions Card */}
            <div className="bkash-card">
                <div className="bkash-header">
                    <div className="bkash-logo-pill">বিকাশ</div>
                    <div className="bkash-header-text">
                        <h3>পেমেন্ট নির্দেশনা</h3>
                        <p>রেজিস্ট্রেশন সম্পন্ন করতে নীচের ধাপগুলো অনুসরণ করুন</p>
                    </div>
                </div>

                <ul className="bkash-steps-list">
                    <li className="bkash-step-item">
                        <span className="bkash-step-num">১</span>
                        <span className="bkash-step-text">
                            আপনার <strong>বিকাশ অ্যাপ</strong> খুলুন অথবা ফোন থেকে <strong>*247#</strong> ডায়াল করুন।
                        </span>
                    </li>
                    <li className="bkash-step-item">
                        <span className="bkash-step-num">২</span>
                        <span className="bkash-step-text">
                            <strong>"সেন্ড মানি"</strong> নির্বাচন করুন এবং মার্চেন্ট নম্বর দিন:
                            <div style={{ marginTop: '8px' }}>
                                <span
                                    className="bkash-number-display"
                                    onClick={handleCopy}
                                    title="কপি করতে ক্লিক করুন"
                                    role="button"
                                    aria-label="বিকাশ নম্বর কপি করুন"
                                >
                                    📱 {BKASH_MERCHANT_NUMBER}
                                    <span className="copy-icon">📋</span>
                                    {copied && <span className="copied-toast">কপি হয়েছে!</span>}
                                </span>
                            </div>
                        </span>
                    </li>
                    <li className="bkash-step-item">
                        <span className="bkash-step-num">৩</span>
                        <span className="bkash-step-text">
                            ঠিক <strong className="text-bkash">৳{totalAmount.toLocaleString()}</strong> টাকা পাঠান।
                        </span>
                    </li>
                    <li className="bkash-step-item">
                        <span className="bkash-step-num">৪</span>
                        <span className="bkash-step-text">
                            <strong>রেফারেন্স/নোট</strong> হিসেবে লিখুন: <strong className="text-accent">"{data.batchYear || 'BATCH'}"</strong>
                        </span>
                    </li>
                    <li className="bkash-step-item">
                        <span className="bkash-step-num">৫</span>
                        <span className="bkash-step-text">
                            SMS/অ্যাপ থেকে <strong>ট্রানজেকশন আইডি</strong> কপি করে নীচে দিন।
                        </span>
                    </li>
                </ul>

                {/* Amount summary */}
                <div className="bkash-amount-display" style={{ marginTop: '20px' }}>
                    <div>
                        <div className="bkash-amount-label">মোট পরিশোধযোগ্য টাকা</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            ব্যাচ {data.batchYear}: ৳{baseAmount.toLocaleString()}
                            {guests > 0 && ` + অতিথি ${guests} জন: ৳${guestCharge.toLocaleString()}`}
                        </div>
                    </div>
                    <div className="bkash-amount-value">৳{totalAmount.toLocaleString()}</div>
                </div>
            </div>

            {/* Transaction ID */}
            <div className="form-group">
                <label htmlFor="bkashTxId">
                    বিকাশ ট্রানজেকশন আইডি (TxID) <span className="required">*</span>
                </label>
                <input
                    id="bkashTxId"
                    type="text"
                    className={errors.bkashTxId ? 'error' : ''}
                    placeholder="যেমন: 8GH9K2L3M1"
                    value={data.bkashTxId}
                    onChange={e => onChange('bkashTxId', e.target.value.toUpperCase())}
                    style={{ letterSpacing: '0.08em', fontWeight: '600' }}
                />
                {errors.bkashTxId && <div className="error-msg">⚠ {errors.bkashTxId}</div>}
                <div className="text-sm text-muted mt-1">
                    TxID আপনার বিকাশ SMS কনফার্মেশন বা অ্যাপের ট্রানজেকশন হিস্ট্রিতে পাবেন।
                </div>
            </div>

            {/* bKash Phone Number */}
            <div className="form-group">
                <label htmlFor="bkashPhone">
                    আপনার বিকাশ / প্রেরকের ফোন নম্বর <span className="required">*</span>
                </label>
                <input
                    id="bkashPhone"
                    type="tel"
                    className={errors.bkashPhone ? 'error' : ''}
                    placeholder="০১XXXXXXXXX"
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
                ⚠️ <strong>গুরুত্বপূর্ণ:</strong> অনুগ্রহ করে আপনার ট্রানজেকশন আইডি পুনরায় যাচাই করুন। ভুল TxID আপনার রেজিস্ট্রেশন নিশ্চিতকরণে বিলম্ব ঘটাবে। আয়োজকরা ২৪ ঘণ্টার মধ্যে আপনার পেমেন্ট যাচাই করবেন।
            </div>
        </div>
    );
};

export default BkashPayment;
