import { Link } from 'react-router-dom';
import ReunionForm from '../ReunionForm';

export default function RegisterPage() {
    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', background: '#f4f6fb' }}>
            {/* Back to landing nav */}
            <div style={{ background: 'white', borderBottom: '1px solid #e2e8f4', padding: '12px 24px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: '#5b52e8', textDecoration: 'none' }}>
                    ← ইভেন্ট পেজে ফিরে যান
                </Link>
            </div>
            <ReunionForm />
        </div>
    );
}
