import React from 'react';
import type { FormData, FormErrors, Package } from '../types';

interface AttendanceDetailsProps {
    data: FormData;
    errors: FormErrors;
    onChange: (field: keyof FormData, value: string | number) => void;
    packages: Package[];
    animClass: string;
}

const AttendanceDetails: React.FC<AttendanceDetailsProps> = ({
    data, errors, onChange, packages, animClass
}) => {
    return (
        <div className={animClass}>
            <div className="form-title">উপস্থিতি ও প্যাকেজ</div>
            <div className="form-subtitle">আপনার প্যাকেজ নির্বাচন করুন এবং কতজন আসবেন জানান।</div>

            <div className="form-group">
                <label>প্যাকেজ নির্বাচন করুন <span className="required">*</span></label>
                <div className="package-grid">
                    {packages.map(pkg => (
                        <div
                            key={pkg.id}
                            className={`package-card ${data.packageId === pkg.id ? 'selected' : ''}`}
                            onClick={() => onChange('packageId', pkg.id)}
                            role="button"
                            aria-pressed={data.packageId === pkg.id}
                        >
                            {pkg.popular && <span className="package-badge">⭐ জনপ্রিয়</span>}
                            <div className="package-icon">{pkg.icon}</div>
                            <div className="package-name">{pkg.name}</div>
                            <div className="package-price">৳{pkg.price.toLocaleString()}</div>
                            <div className="package-desc">{pkg.description}</div>
                        </div>
                    ))}
                </div>
                {errors.packageId && <div className="error-msg">⚠ {errors.packageId}</div>}
            </div>

            <div className="divider" />

            <div className="form-group">
                <label htmlFor="seats">আসন সংখ্যা <span className="required">*</span></label>
                <select
                    id="seats"
                    value={data.seats}
                    className={errors.seats ? 'error' : ''}
                    onChange={e => onChange('seats', parseInt(e.target.value))}
                >
                    {Array.from({ length: 5 }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'আসন' : 'আসন'}</option>
                    ))}
                </select>
                {errors.seats && <div className="error-msg">⚠ {errors.seats}</div>}
                <div className="text-sm text-muted mt-1">
                    মোট: <strong className="text-bkash">
                        ৳{(packages.find(p => p.id === data.packageId)?.price ?? 0) * (Number(data.seats) || 1)}
                    </strong>
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
