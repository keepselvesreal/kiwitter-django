import { Navigate } from "react-router-dom";

export default function ProtectedRoute({children}) {
    // 로컬 스토리지에서 사용자 정보 가져오기
    // const user = JSON.parse(localStorage.getItem('user'));
    
    const isLoggedIn = localStorage.getItem('isLoggedIn')

    // 로그인되지 않았다면 로그인 페이지로 리디렉션
    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }

    // 로그인된 경우, 자식 컴포넌트 렌더링
    return children;
}
