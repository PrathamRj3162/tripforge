import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/custom/Layout'
import NotFound from './components/custom/NotFound'
import RequireAuth from './components/custom/RequireAuth'
import App from './App.jsx'
import CreateTrip from './create-trip'
import MyTrips from './my-trips'
import ViewTrip from './view-trip/[tripId]'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <App /> },
      {
        // Pages that need a login. The server and firestore.rules enforce it again; this is only the friendly layer.
        element: <RequireAuth />,
        children: [
          { path: '/create-trip', element: <CreateTrip /> },
          { path: '/view-trip/:tripId', element: <ViewTrip /> },
          { path: '/my-trips', element: <MyTrips /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)
