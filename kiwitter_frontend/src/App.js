import React from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme'; // 위에서 생성한 테마를 임포트

// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { UserContextProvider } from './components/UserContext';
import ProtectedRoute from './components/protected-route';
import Register from './pages/register';
import Login from './pages/login';
import Layout from "./components/layout";
import Home from "./components/home";
import Profile from "./components/profile";
import Chat from "./components/chat";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element : <Home />
      },
      // {
      //   path:"/bookmarks",
      //   element: <Bookmarks />
      // },
      {
        path:"/chat",
        element: <Chat />
      },
      {
        path: "/profile",
        element : <Profile userId="2" />
      },
    ],
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path:"/register",
    element: <Register />
  }
]);

function App() {
  return (
    <ThemeProvider theme={theme}> {/* ThemeProvider를 사용하여 테마 적용 */}
      <UserContextProvider>
        <RouterProvider router={router} />
      </UserContextProvider>
    </ThemeProvider>
  );
}

export default App;


