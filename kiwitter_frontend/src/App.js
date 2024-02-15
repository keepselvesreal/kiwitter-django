import React from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme'; // 위에서 생성한 테마를 임포트

// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { UserContextProvider } from './components/UserContext';
// import { AuthServiceProvider } from './components/AuthContext';
import ProtectedRoute from './components/protected-route';
import SignUpForm from './components/SignUpForm';
import Login from './pages/login';
import Layout from "./components/layout";
import Home from "./components/home";
import Bookmarks from "./components/bookmarks";
import Profile from "./components/profile";
import Chat from "./components/chat";
import HashtagPage from './components/hashtag-page'; // Import the HashtagPage component
import DalleMoodPainter from './components/DalleMoodPainter';
import MyVibe from './components/myVibe';

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
      {
        path:"/bookmarks",
        element: <Bookmarks />
      },
      {
        path:"/chat",
        element: <Chat />
      },
      {
        path: "/profile",
        element: <Profile />
      },
      {
        path: "/mood-painter",
        element: <DalleMoodPainter />
      },
      {
        path: "/my-vibe",
        element: <MyVibe />
      },
    ],
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path:"/register",
    element: <SignUpForm />
  },
  { 
    path: "/hashtags/:hashtag", 
    element: <HashtagPage /> 
  },
]);

function App() {
  return (
    <ThemeProvider theme={theme}> {/* ThemeProvider를 사용하여 테마 적용 */}
      <UserContextProvider>
      {/* <AuthServiceProvider> */}
        <RouterProvider router={router} />
      </UserContextProvider>
      {/* </AuthServiceProvider> */}
    </ThemeProvider>
  );
}

export default App;


