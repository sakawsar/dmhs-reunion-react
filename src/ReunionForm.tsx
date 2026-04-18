import { useState, useCallback } from 'react';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import PersonalInfo from './components/steps/PersonalInfo';
import AttendanceDetails from './components/steps/AttendanceDetails';
import BkashPayment from './components/steps/BkashPayment';
import Confirmation from './components/steps/Confirmation';
import type { FormData, FormErrors } from './components/types';
import { calculateTotal } from './components/types';
import { saveRegistration } from './lib/registrationService';

const STEPS = [
    { label: 'ব্যক্তিগত', icon: '1' },
    { label: 'উপস্থিতি', icon: '2' },
    { label: 'পেমেন্ট', icon: '3' },
    { label: 'নিশ্চিত', icon: '4' },
];

const INITIAL_FORM: FormData = {
    fullName: '', fatherName: '', batchYear: '', section: '', phone: '', email: '',
    currentCity: '', profession: '', bloodGroup: '', tshirtSize: '', guests: 0,
    guestNames: '', dietaryPref: 'no-preference', specialRequests: '',
    paymentMethod: 'bkash', paymentTxId: '', paymentSenderPhone: '',
};

function generateTicketId(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = 'DMHS-';
    for (let i = 0; i < 8; i++) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

export default function ReunionForm() {
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState<'forward' | 'back'>('forward');
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
    const [errors, setErrors] = useState<FormErrors>({});
    const [ticketId] = useState(generateTicketId);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [firestoreDocId, setFirestoreDocId] = useState<string | null>(null);

    const handleChange = useCallback((field: keyof FormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    }, []);

    const validateStep = (currentStep: number): boolean => {
        const newErrors: FormErrors = {};
        if (currentStep === 0) {
            if (!formData.fullName.trim()) newErrors.fullName = 'পূর্ণ নাম আবশ্যক';
            if (!formData.fatherName.trim()) newErrors.fatherName = 'পিতার নাম আবশ্যক';
            if (!formData.batchYear) newErrors.batchYear = 'অনুগ্রহ করে ব্যাচ সাল নির্বাচন করুন';
            if (!formData.phone.trim()) newErrors.phone = 'ফোন নম্বর আবশ্যক';
            else if (!/^01[3-9]\d{8}$/.test(formData.phone.replace(/\s|-/g, '')))
                newErrors.phone = 'একটি সঠিক বাংলাদেশি ফোন নম্বর দিন';
            if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
                newErrors.email = 'একটি সঠিক ইমেইল ঠিকানা দিন';
            if (!formData.currentCity.trim()) newErrors.currentCity = 'বর্তমান ঠিকানা আবশ্যক';
            if (!formData.tshirtSize) newErrors.tshirtSize = 'অনুগ্রহ করে টি-শার্ট সাইজ নির্বাচন করুন';
        }
        if (currentStep === 1) {
            // no package validation needed anymore
        }
        if (currentStep === 2) {
            if (!formData.paymentMethod) newErrors.paymentMethod = 'পেমেন্ট মাধ্যম নির্বাচন করুন';
            if (!formData.paymentTxId.trim()) newErrors.paymentTxId = 'ট্রানজেকশন আইডি আবশ্যক';
            else if (formData.paymentTxId.trim().length < 6) newErrors.paymentTxId = 'ট্রানজেকশন আইডি খুব ছোট মনে হচ্ছে';
            if (!formData.paymentSenderPhone.trim()) newErrors.paymentSenderPhone = 'প্রেরকের ফোন নম্বর আবশ্যক';
            else if (!/^01[3-9]\d{8}$/.test(formData.paymentSenderPhone.replace(/\s|-/g, '')))
                newErrors.paymentSenderPhone = 'একটি সঠিক প্রেরকের নম্বর দিন';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (!validateStep(step)) return;
        setDirection('forward');
        setStep(s => Math.min(s + 1, STEPS.length - 1));
    };

    const handleSubmit = async () => {
        if (!validateStep(step)) return;
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            const { totalAmount } = calculateTotal(formData.batchYear, Number(formData.guests) || 0);
            const docId = await saveRegistration({ formData, ticketId, packageName: `ব্যাচ ${formData.batchYear}`, totalAmount });
            setFirestoreDocId(docId);
            setDirection('forward');
            setStep(s => Math.min(s + 1, STEPS.length - 1));
        } catch (err) {
            console.error('Firestore save error:', err);
            setSubmitError('রেজিস্ট্রেশন জমা দিতে ব্যর্থ হয়েছে। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => { setDirection('back'); setErrors({}); setStep(s => Math.max(s - 1, 0)); };
    const animClass = direction === 'forward' ? 'step-enter' : 'step-enter-back';

    const renderStep = () => {
        switch (step) {
            case 0: return <PersonalInfo data={formData} errors={errors} onChange={handleChange} animClass={animClass} />;
            case 1: return <AttendanceDetails data={formData} errors={errors} onChange={handleChange} animClass={animClass} />;
            case 2: return <BkashPayment data={formData} errors={errors} onChange={handleChange} animClass={animClass} />;
            case 3: return <Confirmation data={formData} ticketId={ticketId} firestoreDocId={firestoreDocId} animClass={animClass} />;
            default: return null;
        }
    };

    return (
        <div className="app-container">
            <Header />

            {/* Mini Hero Banner */}
            <div style={{ width: '100%', maxWidth: '680px', marginTop: '28px', borderRadius: '24px', overflow: 'hidden', background: 'linear-gradient(135deg, #f0f2ff 0%, #fff5fa 50%, #f0f9ff 100%)', border: '1.5px solid #e2e8f4', padding: '28px 36px', position: 'relative', boxShadow: '0 2px 16px rgba(91,82,232,0.08)' }}>
                <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '260px', height: '260px', background: 'radial-gradient(circle, rgba(226,19,110,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1a1f36', margin: 0, position: 'relative', zIndex: 1 }}>
                    আপনার{' '}
                    <span style={{ background: 'linear-gradient(90deg, #E2136E, #5b52e8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        রেজিস্ট্রেশন
                    </span>
                    {' '}সম্পন্ন করুন
                </h1>
                <p style={{ marginTop: '6px', fontSize: '13px', color: '#5a6282', position: 'relative', zIndex: 1 }}>
                    📅 ৩০ মে, ২০২৬ · 📍 স্কুল মাঠ · বিকাশে নিরাপদ পেমেন্ট
                </p>
            </div>

            {/* Form */}
            <div className="form-wrapper">
                <div className="glass-card">
                    <ProgressBar currentStep={step} steps={STEPS} direction={direction} />
                    {renderStep()}

                    {submitError && (
                        <div style={{ margin: '16px 0 0', padding: '12px 16px', background: 'rgba(217,48,37,0.08)', border: '1px solid rgba(217,48,37,0.2)', borderRadius: '10px', fontSize: '13px', color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            ⚠️ {submitError}
                        </div>
                    )}

                    {step < STEPS.length - 1 && (
                        <div className="btn-group">
                            {step > 0 ? (
                                <button className="btn-secondary" onClick={handleBack} disabled={isSubmitting} style={{ opacity: isSubmitting ? 0.5 : 1 }}>← পিছনে</button>
                            ) : <span />}
                            <button
                                className={`btn-primary ${step === 2 ? 'btn-bkash' : ''}`}
                                onClick={step === 2 ? handleSubmit : handleNext}
                                disabled={isSubmitting}
                                style={{ opacity: isSubmitting ? 0.85 : 1, minWidth: '180px' }}
                            >
                                {step === 2 ? (isSubmitting ? '⏳ সেভ হচ্ছে…' : '✓ রেজিস্ট্রেশন জমা দিন') : 'পরবর্তী →'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.8' }}>
                <div>🏫 ধর্মেশ্বর মহেশা বি/এল হাই স্কুল প্রাক্তন ছাত্র সমিতি</div>
                <div>সাহায্যের জন্য কল করুন <a href="tel:01700000000" style={{ color: 'var(--color-accent)' }}>০১৭০০-০০০০০০</a> · reunion@dmhs.edu.bd</div>
            </div>
        </div>
    );
}
