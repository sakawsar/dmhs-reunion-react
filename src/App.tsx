import { useState, useCallback } from 'react';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import PersonalInfo from './components/steps/PersonalInfo';
import AttendanceDetails from './components/steps/AttendanceDetails';
import BkashPayment from './components/steps/BkashPayment';
import Confirmation from './components/steps/Confirmation';
import type { FormData, FormErrors, Package } from './components/types';
import { saveRegistration, resolvePackage } from './lib/registrationService';

const PACKAGES: Package[] = [
  {
    id: 'single',
    name: 'Individual',
    price: 800,
    description: '1 person · Dinner & Program',
    icon: '🧑',
  },
  {
    id: 'couple',
    name: 'Couple',
    price: 1400,
    description: '2 persons · Dinner & Program',
    icon: '👫',
    popular: true,
  },
  {
    id: 'family',
    name: 'Family',
    price: 2200,
    description: 'Up to 4 persons · Full package',
    icon: '👨‍👩‍👧‍👦',
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 3500,
    description: '1 person · VIP lounge + gifts',
    icon: '👑',
  },
];

const STEPS = [
  { label: 'Personal', icon: '1' },
  { label: 'Attendance', icon: '2' },
  { label: 'Payment', icon: '3' },
  { label: 'Confirm', icon: '4' },
];

const INITIAL_FORM: FormData = {
  fullName: '',
  batchYear: '',
  section: '',
  phone: '',
  email: '',
  currentCity: '',
  profession: '',
  packageId: 'couple',
  seats: 1,
  guestNames: '',
  dietaryPref: 'no-preference',
  specialRequests: '',
  bkashTxId: '',
  bkashPhone: '',
};

function generateTicketId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'DMHS-';
  for (let i = 0; i < 8; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

function App() {
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
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.batchYear) newErrors.batchYear = 'Please select your batch year';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      else if (!/^01[3-9]\d{8}$/.test(formData.phone.replace(/\s|-/g, '')))
        newErrors.phone = 'Enter a valid Bangladeshi phone number';
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = 'Please enter a valid email address';
      if (!formData.currentCity.trim()) newErrors.currentCity = 'Current city is required';
    }

    if (currentStep === 1) {
      if (!formData.packageId) newErrors.packageId = 'Please select a package';
    }

    if (currentStep === 2) {
      if (!formData.bkashTxId.trim()) newErrors.bkashTxId = 'Transaction ID is required';
      else if (formData.bkashTxId.trim().length < 6)
        newErrors.bkashTxId = 'Transaction ID seems too short';
      if (!formData.bkashPhone.trim()) newErrors.bkashPhone = 'Sender phone number is required';
      else if (!/^01[3-9]\d{8}$/.test(formData.bkashPhone.replace(/\s|-/g, '')))
        newErrors.bkashPhone = 'Enter a valid bKash sender number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    setDirection('forward');
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  // Called specifically on the final step (step 2 → submit)
  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const { packageName, totalAmount } = resolvePackage(
        formData.packageId,
        PACKAGES,
        Number(formData.seats),
      );
      const docId = await saveRegistration({ formData, ticketId, packageName, totalAmount });
      setFirestoreDocId(docId);
      setDirection('forward');
      setStep(s => Math.min(s + 1, STEPS.length - 1));
    } catch (err) {
      console.error('Firestore save error:', err);
      setSubmitError('Failed to submit registration. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setDirection('back');
    setErrors({});
    setStep(s => Math.max(s - 1, 0));
  };

  const animClass = direction === 'forward' ? 'step-enter' : 'step-enter-back';

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <PersonalInfo
            data={formData}
            errors={errors}
            onChange={handleChange}
            animClass={animClass}
          />
        );
      case 1:
        return (
          <AttendanceDetails
            data={formData}
            errors={errors}
            onChange={handleChange}
            packages={PACKAGES}
            animClass={animClass}
          />
        );
      case 2:
        return (
          <BkashPayment
            data={formData}
            errors={errors}
            onChange={handleChange}
            packages={PACKAGES}
            animClass={animClass}
          />
        );
      case 3:
        return (
          <Confirmation
            data={formData}
            packages={PACKAGES}
            ticketId={ticketId}
            firestoreDocId={firestoreDocId}
            animClass={animClass}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <Header />

      {/* Hero Banner */}
      <div style={{ width: '100%', maxWidth: '680px', marginTop: '28px', borderRadius: '24px', overflow: 'hidden', background: 'linear-gradient(135deg, #f0f2ff 0%, #fff5fa 50%, #f0f9ff 100%)', border: '1.5px solid #e2e8f4', padding: '36px 40px', position: 'relative', boxShadow: '0 2px 16px rgba(91,82,232,0.08)' }}>
        <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '320px', height: '320px', background: 'radial-gradient(circle, rgba(226,19,110,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '280px', height: '280px', background: 'radial-gradient(circle, rgba(91,82,232,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <h1 style={{ fontSize: '30px', fontWeight: 800, lineHeight: 1.2, color: '#1a1f36', position: 'relative', zIndex: 1 }}>
          Welcome Back,{' '}
          <span style={{ background: 'linear-gradient(90deg, #E2136E, #5b52e8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            DMHS Alumni!
          </span>
        </h1>
        <p style={{ marginTop: '10px', fontSize: '15px', color: '#5a6282', position: 'relative', zIndex: 1 }}>
          Join us for an unforgettable evening of memories, laughter, and reconnection with your classmates.
        </p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          {[
            { cls: 'gold', text: '📅 28 May 2026' },
            { cls: 'pink', text: '📍 School field' },
            { cls: 'purple', text: '🎓 All Batches Welcome' },
          ].map(b => (
            <span key={b.text} className={`hero-badge ${b.cls}`}>{b.text}</span>
          ))}
        </div>
      </div>


      {/* Form */}
      <div className="form-wrapper">
        <div className="glass-card">
          <ProgressBar currentStep={step} steps={STEPS} direction={direction} />

          {renderStep()}

          {/* Submit error banner */}
          {submitError && (
            <div style={{
              margin: '16px 0 0',
              padding: '12px 16px',
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: '10px',
              fontSize: '13px',
              color: 'var(--color-error)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              ⚠️ {submitError}
            </div>
          )}

          {/* Navigation Buttons */}
          {step < STEPS.length - 1 && (
            <div className="btn-group">
              {step > 0 ? (
                <button
                  className="btn-secondary"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  style={{ opacity: isSubmitting ? 0.5 : 1 }}
                >
                  ← Back
                </button>
              ) : (
                <span />
              )}
              <button
                className={`btn-primary ${step === 2 ? 'btn-bkash' : ''}`}
                onClick={step === 2 ? handleSubmit : handleNext}
                disabled={isSubmitting}
                style={{ opacity: isSubmitting ? 0.85 : 1, minWidth: '180px' }}
              >
                {step === 2
                  ? isSubmitting
                    ? '⏳ Saving…'
                    : '✓ Submit Registration'
                  : 'Continue →'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.8' }}>
        <div>🏫 Dharmeswar Mohesha B/L High School Alumni Association</div>
        <div>
          For help, call{' '}
          <a href="tel:01700000000" style={{ color: 'var(--color-accent)' }}>01700-000000</a>
          {' '}· reunion@dmhs.edu.bd
        </div>
      </div>
    </div>
  );
}

export default App;
