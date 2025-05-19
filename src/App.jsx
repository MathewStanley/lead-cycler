import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LiveLeads from './pages/LiveLeads';
import AgedLeads from './pages/AgedLeads';
import Campaigns from './pages/Campaigns';
import Inventory from './pages/Inventory';
import SellLeads from './pages/SellLeads';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import EditProfile from './pages/EditProfile';
import BuyCoins from './pages/BuyCoins'; // ✅ New import
import ProtectedRoute from './components/ProtectedRoute';
import AuthRedirect from './components/AuthRedirect';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/signin"
              element={
                <AuthRedirect>
                  <SignIn />
                </AuthRedirect>
              }
            />
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/live-leads"
              element={
                <ProtectedRoute>
                  <LiveLeads />
                </ProtectedRoute>
              }
            />
            <Route
              path="/aged-leads"
              element={
                <ProtectedRoute>
                  <AgedLeads />
                </ProtectedRoute>
              }
            />
            <Route
              path="/campaigns"
              element={
                <ProtectedRoute>
                  <Campaigns />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sell-leads"
              element={
                <ProtectedRoute>
                  <SellLeads />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-profile"
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buy-coins"
              element={
                <ProtectedRoute>
                  <BuyCoins />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}
