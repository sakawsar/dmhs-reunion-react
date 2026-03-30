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
            <div className="form-title">Attendance & Package</div>
            <div className="form-subtitle">Choose your package and tell us how many will join you.</div>

            <div className="form-group">
                <label>Select Your Package <span className="required">*</span></label>
                <div className="package-grid">
                    {packages.map(pkg => (
                        <div
                            key={pkg.id}
                            className={`package-card ${data.packageId === pkg.id ? 'selected' : ''}`}
                            onClick={() => onChange('packageId', pkg.id)}
                            role="button"
                            aria-pressed={data.packageId === pkg.id}
                        >
                            {pkg.popular && <span className="package-badge">⭐ Popular</span>}
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
                <label htmlFor="seats">Number of Seats <span className="required">*</span></label>
                <select
                    id="seats"
                    value={data.seats}
                    className={errors.seats ? 'error' : ''}
                    onChange={e => onChange('seats', parseInt(e.target.value))}
                >
                    {Array.from({ length: 5 }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'seat' : 'seats'}</option>
                    ))}
                </select>
                {errors.seats && <div className="error-msg">⚠ {errors.seats}</div>}
                <div className="text-sm text-muted mt-1">
                    Total: <strong className="text-bkash">
                        ৳{(packages.find(p => p.id === data.packageId)?.price ?? 0) * (Number(data.seats) || 1)}
                    </strong>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="guestNames">Guest / Companion Names</label>
                <textarea
                    id="guestNames"
                    placeholder="List names of guests you're bringing (optional)"
                    value={data.guestNames}
                    onChange={e => onChange('guestNames', e.target.value)}
                />
            </div>

            <div className="form-group">
                <label htmlFor="dietaryPref">Dietary Preference</label>
                <select
                    id="dietaryPref"
                    value={data.dietaryPref}
                    onChange={e => onChange('dietaryPref', e.target.value)}
                >
                    <option value="no-preference">No Preference</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="non-vegetarian">Non-Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="halal-only">Halal Only</option>
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="specialRequests">Special Requests or Notes</label>
                <textarea
                    id="specialRequests"
                    placeholder="Any accessibility needs, allergies, or messages for organizers…"
                    value={data.specialRequests}
                    onChange={e => onChange('specialRequests', e.target.value)}
                />
            </div>
        </div>
    );
};

export default AttendanceDetails;
