import React from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ProtectedRoute from './components/protected-route';
import Register from './pages/register';
import Login from './pages/login';
import Layout from "./components/layout";
import Home from "./components/home";
import Profile from "./components/profile";

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
      // {
      //   path:"/chat",
      //   element: <Chat />
      // },
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
    <RouterProvider router={router} />
  );
}

export default App;


