import React from 'react';
import type { FormData, FormErrors } from '../types';
import { calculateTotal } from '../types';

interface AttendanceDetailsProps {
    data: FormData;
    errors: FormErrors;
    onChange: (field: keyof FormData, value: string | number) => void;
    animClass: string;
}

const AttendanceDetails: React.FC<AttendanceDetailsProps> = ({
    data, errors, onChange, animClass
}) => {
    const guests = Number(data.guests) || 0;
    const { baseAmount, guestCharge, totalAmount } = calculateTotal(data.batchYear, guests);
    const batchYear = parseInt(data.batchYear, 10);
    const isJunior = !isNaN(batchYear) && batchYear >= 2018 && batchYear <= 2025;

    return (
        <div className={animClass}>
            <div className="form-title">উপস্থিতি ও চার্জ</div>
            <div className="form-subtitle">আপনার সাথে কতজন অতিথি আসবেন জানান।</div>

            {/* Pricing info box */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(91,82,232,0.06) 0%, rgba(226,19,110,0.04) 100%)',
                border: '1.5px solid rgba(91,82,232,0.15)',
                borderRadius: '14px',
                padding: '18px 20px',
                marginBottom: '20px'
            }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#5b52e8', marginBottom: '10px' }}>
                    💰 চার্জের বিবরণ
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                    <span style={{ color: '#5a6282' }}>
                        আপনার চার্জ (ব্যাচ {data.batchYear || '—'}{isJunior ? ', ২০১৮-২০২৫' : ''})
                    </span>
                    <strong style={{ color: '#1a1f36' }}>৳{baseAmount.toLocaleString()}</strong>
                </div>
                {guests > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                        <span style={{ color: '#5a6282' }}>অতিথি ({guests} জন × ৳৫০০)</span>
                        <strong style={{ color: '#1a1f36' }}>৳{guestCharge.toLocaleString()}</strong>
                    </div>
                )}
                <div style={{ borderTop: '1px solid rgba(91,82,232,0.15)', paddingTop: '8px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                    <strong style={{ color: '#1a1f36' }}>মোট</strong>
                    <strong style={{ color: '#E2136E', fontSize: '18px' }}>৳{totalAmount.toLocaleString()}</strong>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="guests">অতিথি সংখ্যা</label>
                <input
                    id="guests"
                    type="number"
                    min="0"
                    max="20"
                    placeholder="০ (আপনি একা আসলে ০ রাখুন)"
                    value={data.guests === 0 ? '' : data.guests}
                    onChange={e => onChange('guests', parseInt(e.target.value) || 0)}
                />
                <div className="text-sm text-muted mt-1">
                    প্রতি অতিথির জন্য অতিরিক্ত ৳৫০০ চার্জ যোগ হবে।
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="guestNames">অতিথি / সঙ্গীর নাম</label>
                <textarea
                    id="guestNames"
                    placeholder="আপনার সাথে যারা আসবেন তাদের নাম লিখুন (ঐচ্ছিক)"
                    value={data.guestNames}
                    onChange={e => onChange('guestNames', e.target.value)}
                />
            </div>

            <div className="form-group">
                <label htmlFor="dietaryPref">খাবারের পছন্দ</label>
                <select
                    id="dietaryPref"
                    value={data.dietaryPref}
                    onChange={e => onChange('dietaryPref', e.target.value)}
                >
                    <option value="no-preference">কোনো পছন্দ নেই</option>
                    <option value="vegetarian">নিরামিষ</option>
                    <option value="non-vegetarian">আমিষ</option>
                    <option value="vegan">ভেগান</option>
                    <option value="halal-only">শুধুমাত্র হালাল</option>
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="specialRequests">বিশেষ অনুরোধ বা মন্তব্য</label>
                <textarea
                    id="specialRequests"
                    placeholder="কোনো বিশেষ প্রয়োজন, অ্যালার্জি, বা আয়োজকদের জন্য বার্তা…"
                    value={data.specialRequests}
                    onChange={e => onChange('specialRequests', e.target.value)}
                />
            </div>
        </div>
    );
};

export default AttendanceDetails;
