import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="site-header">
            <div className="header-logo">🏫</div>
            <div className="header-text">
                <div className="header-school">ধর্ম্মেশ্বর মহেশা দ্বি-মূখী উচ্চ বিদ্যালয়</div>
                <div className="header-event">৮১ বছরপূর্তি উৎসব - ২০২৬</div>
                <div className="header-date">📅 ৩১ মে ২০২৬ · স্কুল মাঠ</div>
            </div>
        </header>
    );
};

export default Header;
