// theme.js
import { createTheme } from '@mui/material/styles';

// 기본 테마 생성
const theme = createTheme({
  // 여기에 테마 설정을 정의할 수 있습니다. 아래는 기본 설정의 예시입니다.
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: '#ff0000',
    },
    background: {
      default: '#fff',
    },
  },
});

export default theme;
