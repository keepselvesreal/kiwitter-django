import React from 'react';
import { Outlet, Link } from 'react-router-dom';

import Profile from './profile';

const Layout = () => {
    return (
        <div>
            {/* 헤더 또는 내비게이션 바 */}
            <header>
                <nav>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/bookmarks">Bookmarks</Link></li>
                        <li><Link to="/chat">Chat</Link></li>
                        <li><Link to="/profile" element={<Profile />}>Profile</Link></li>
                    </ul>
                </nav>
            </header>

            {/* 메인 콘텐츠 영역 */}
            <main>
                <Outlet /> {/* 자식 라우트들이 여기에 렌더링됩니다 */}
            </main>

            {/* 푸터 */}
            <footer>
                <p>© 2024 올해는 나의 것!</p>
            </footer>
        </div>
    );
};

export default Layout;
