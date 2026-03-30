import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="site-header">
            <div className="header-logo">🏫</div>
            <div className="header-text">
                <div className="header-school">Dharmeswar Mohesha B/L High School</div>
                <div className="header-event">Grand Reunion 2026</div>
                <div className="header-date">📅 28 May 2026 · School field</div>
            </div>
        </header>
    );
};

export default Header;
