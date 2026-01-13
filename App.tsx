
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import ListenEarn from './pages/ListenEarn';
import Withdraw from './pages/Withdraw';
import AdminPanel from './pages/AdminPanel';
import Navbar from './components/Navbar';
import { User, AppSettings, Transaction, AccountStatus } from './types';
import { stateStore } from './store';
import { ADMIN_EMAIL } from './constants';

const App: React.FC = () => {
  const [state, setState] = useState(stateStore.get());

  useEffect(() => {
    stateStore.save(state);
  }, [state]);

  const login = (email: string) => {
    const user = state.users.find(u => u.email === email);
    if (user) {
      setState(prev => ({ ...prev, currentUser: user }));
      return true;
    }
    return false;
  };

  const register = (username: string, email: string) => {
    // Correctly initialize status using the enum and clean up the registration logic
    const finalStatus = email === ADMIN_EMAIL ? AccountStatus.ACTIVATED : AccountStatus.NOT_ACTIVATED;
    
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      email,
      balanceUSD: 0,
      totalSongs: 0,
      dailyEarnings: 0,
      status: finalStatus,
      referralCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
    };

    setState(prev => ({
      ...prev,
      users: [...prev.users, newUser],
      currentUser: newUser
    }));
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
  };

  const updateBalance = (amount: number) => {
    if (!state.currentUser) return;
    const updatedUser = {
      ...state.currentUser,
      balanceUSD: state.currentUser.balanceUSD + amount,
      totalSongs: state.currentUser.totalSongs + 1,
      dailyEarnings: state.currentUser.dailyEarnings + amount
    };
    setState(prev => ({
      ...prev,
      currentUser: updatedUser,
      users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u)
    }));
  };

  const addTransaction = (txn: Transaction) => {
    setState(prev => ({
      ...prev,
      transactions: [txn, ...prev.transactions]
    }));
  };

  const updateSettings = (newSettings: AppSettings) => {
    setState(prev => ({ ...prev, settings: newSettings }));
  };

  // Fixed: Made children optional in the type to resolve TypeScript error 'Property children is missing'
  const ProtectedRoute = ({ children, adminOnly = false }: { children?: React.ReactNode, adminOnly?: boolean }) => {
    if (!state.currentUser) return <Navigate to="/" />;
    if (adminOnly && state.currentUser.email !== ADMIN_EMAIL) return <Navigate to="/dashboard" />;
    return <>{children}</>;
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {state.currentUser && <Navbar user={state.currentUser} onLogout={logout} />}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Welcome onLogin={login} onRegister={register} />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard user={state.currentUser!} settings={state.settings} transactions={state.transactions} />
              </ProtectedRoute>
            } />
            <Route path="/listen" element={
              <ProtectedRoute>
                <ListenEarn onReward={updateBalance} settings={state.settings} user={state.currentUser!} />
              </ProtectedRoute>
            } />
            <Route path="/withdraw" element={
              <ProtectedRoute>
                <Withdraw 
                  user={state.currentUser!} 
                  settings={state.settings} 
                  onTransaction={addTransaction}
                  setState={setState}
                />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminPanel 
                  state={state} 
                  onUpdateSettings={updateSettings} 
                  setState={setState}
                />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
