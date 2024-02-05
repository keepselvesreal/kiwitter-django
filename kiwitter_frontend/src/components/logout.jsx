import { useHistory } from 'react-router-dom';

const logout = () => {
  // 로컬 스토리지에서 사용자 정보 및 로그인 상태를 제거합니다.
  localStorage.removeItem('username');
  localStorage.removeItem('id');
  localStorage.removeItem('token');
  localStorage.removeItem('isLoggedIn');

  // React Router의 useHistory 훅을 사용하여 리다이렉트합니다.
  const history = useHistory();
  history.push('/login'); // '/login'은 로그인 페이지의 경로입니다.
};

export default logout;

