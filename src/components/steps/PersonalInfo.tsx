import React from 'react';
import type { FormData, FormErrors } from '../types';

interface PersonalInfoProps {
    data: FormData;
    errors: FormErrors;
    onChange: (field: keyof FormData, value: string | number) => void;
    animClass: string;
}

const BATCH_YEARS = Array.from({ length: 35 }, (_, i) => 2025 - i).map(y => y.toString());

const PersonalInfo: React.FC<PersonalInfoProps> = ({ data, errors, onChange, animClass }) => {
    return (
        <div className={animClass}>
            <div className="form-title">ব্যক্তিগত তথ্য</div>
            <div className="form-subtitle">আপনার রেজিস্ট্রেশন প্রস্তুত করতে আপনার সম্পর্কে জানান।</div>

            <div className="form-group">
                <label htmlFor="fullName">পূর্ণ নাম <span className="required">*</span></label>
                <input
                    id="fullName"
                    type="text"
                    className={errors.fullName ? 'error' : ''}
                    placeholder="যেমন: মো. রহিম উদ্দিন"
                    value={data.fullName}
                    onChange={e => onChange('fullName', e.target.value)}
                />
                {errors.fullName && <div className="error-msg">⚠ {errors.fullName}</div>}
            </div>

            <div className="form-group">
                <label htmlFor="fatherName">পিতার নাম <span className="required">*</span></label>
                <input
                    id="fatherName"
                    type="text"
                    className={errors.fatherName ? 'error' : ''}
                    placeholder="যেমন: মো. করিম উদ্দিন"
                    value={data.fatherName}
                    onChange={e => onChange('fatherName', e.target.value)}
                />
                {errors.fatherName && <div className="error-msg">⚠ {errors.fatherName}</div>}
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="batchYear">ব্যাচ / পাশের সাল <span className="required">*</span></label>
                    <select
                        id="batchYear"
                        className={errors.batchYear ? 'error' : ''}
                        value={data.batchYear}
                        onChange={e => onChange('batchYear', e.target.value)}
                    >
                        <option value="">সাল নির্বাচন করুন</option>
                        {BATCH_YEARS.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    {errors.batchYear && <div className="error-msg">⚠ {errors.batchYear}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="section">শাখা / বিভাগ</label>
                    <select
                        id="section"
                        value={data.section}
                        onChange={e => onChange('section', e.target.value)}
                    >
                        <option value="">শাখা নির্বাচন করুন</option>
                        <option value="Science">বিজ্ঞান</option>
                        {/* <option value="Commerce">বাণিজ্য</option> */}
                        <option value="Arts">মানবিক</option>
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="phone">ফোন নম্বর <span className="required">*</span></label>
                    <input
                        id="phone"
                        type="tel"
                        className={errors.phone ? 'error' : ''}
                        placeholder="যেমন: ০১XXXXXXXXX"
                        value={data.phone}
                        onChange={e => onChange('phone', e.target.value)}
                    />
                    {errors.phone && <div className="error-msg">⚠ {errors.phone}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="email">ইমেইল ঠিকানা</label>
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
                <label htmlFor="currentCity">বর্তমান ঠিকানা <span className="required">*</span></label>
                <input
                    id="currentCity"
                    type="text"
                    className={errors.currentCity ? 'error' : ''}
                    placeholder="যেমন: ঢাকা, বাংলাদেশ"
                    value={data.currentCity}
                    onChange={e => onChange('currentCity', e.target.value)}
                />
                {errors.currentCity && <div className="error-msg">⚠ {errors.currentCity}</div>}
            </div>

            <div className="form-group">
                <label htmlFor="profession">বর্তমান পেশা</label>
                <input
                    id="profession"
                    type="text"
                    placeholder="যেমন: সফটওয়্যার ইঞ্জিনিয়ার, ডাক্তার, ব্যবসায়ী"
                    value={data.profession}
                    onChange={e => onChange('profession', e.target.value)}
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="bloodGroup">রক্তের গ্রুপ</label>
                    <input
                        id="bloodGroup"
                        type="text"
                        placeholder="যেমন: B+, O-"
                        value={data.bloodGroup || ''}
                        onChange={e => onChange('bloodGroup', e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="tshirtSize">টি-শার্ট সাইজ <span className="required">*</span></label>
                    <select
                        id="tshirtSize"
                        className={errors.tshirtSize ? 'error' : ''}
                        value={data.tshirtSize}
                        onChange={e => onChange('tshirtSize', e.target.value)}
                    >
                        <option value="">সাইজ নির্বাচন করুন</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                        <option value="XXXL">XXXL</option>
                    </select>
                    {errors.tshirtSize && <div className="error-msg">⚠ {errors.tshirtSize}</div>}
                </div>
            </div>
        </div>
    );
};

export default PersonalInfo;
