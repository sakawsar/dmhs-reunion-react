import React from 'react';
import type { FormData, FormErrors } from '../types';

interface PersonalInfoProps {
    data: FormData;
    errors: FormErrors;
    onChange: (field: keyof FormData, value: string | number) => void;
    animClass: string;
}

const BATCH_YEARS = Array.from({ length: 35 }, (_, i) => 2024 - i).map(y => y.toString());

const PersonalInfo: React.FC<PersonalInfoProps> = ({ data, errors, onChange, animClass }) => {
    return (
        <div className={animClass}>
            <div className="form-title">Personal Information</div>
            <div className="form-subtitle">Tell us about yourself so we can prepare your registration.</div>

            <div className="form-group">
                <label htmlFor="fullName">Full Name <span className="required">*</span></label>
                <input
                    id="fullName"
                    type="text"
                    className={errors.fullName ? 'error' : ''}
                    placeholder="e.g. Md. Rahim Uddin"
                    value={data.fullName}
                    onChange={e => onChange('fullName', e.target.value)}
                />
                {errors.fullName && <div className="error-msg">⚠ {errors.fullName}</div>}
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="batchYear">Batch / Passing Year <span className="required">*</span></label>
                    <select
                        id="batchYear"
                        className={errors.batchYear ? 'error' : ''}
                        value={data.batchYear}
                        onChange={e => onChange('batchYear', e.target.value)}
                    >
                        <option value="">Select Year</option>
                        {BATCH_YEARS.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    {errors.batchYear && <div className="error-msg">⚠ {errors.batchYear}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="section">Section / Group</label>
                    <select
                        id="section"
                        value={data.section}
                        onChange={e => onChange('section', e.target.value)}
                    >
                        <option value="">Select Section</option>
                        <option value="Science">Science</option>
                        <option value="Commerce">Commerce</option>
                        <option value="Arts">Arts</option>
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="phone">Phone Number <span className="required">*</span></label>
                    <input
                        id="phone"
                        type="tel"
                        className={errors.phone ? 'error' : ''}
                        placeholder="e.g. 01XXXXXXXXX"
                        value={data.phone}
                        onChange={e => onChange('phone', e.target.value)}
                    />
                    {errors.phone && <div className="error-msg">⚠ {errors.phone}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        className={errors.email ? 'error' : ''}
                        placeholder="you@email.com"
                        value={data.email}
                        onChange={e => onChange('email', e.target.value)}
                    />
                    {errors.email && <div className="error-msg">⚠ {errors.email}</div>}
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="currentCity">Current City / Country <span className="required">*</span></label>
                <input
                    id="currentCity"
                    type="text"
                    className={errors.currentCity ? 'error' : ''}
                    placeholder="e.g. Dhaka, Bangladesh"
                    value={data.currentCity}
                    onChange={e => onChange('currentCity', e.target.value)}
                />
                {errors.currentCity && <div className="error-msg">⚠ {errors.currentCity}</div>}
            </div>

            <div className="form-group">
                <label htmlFor="profession">Current Profession</label>
                <input
                    id="profession"
                    type="text"
                    placeholder="e.g. Software Engineer, Doctor, Business Owner"
                    value={data.profession}
                    onChange={e => onChange('profession', e.target.value)}
                />
            </div>
        </div>
    );
};

export default PersonalInfo;
