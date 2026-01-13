
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import ListenEarn from './pages/ListenEarn';
import Withdraw from './pages/Withdraw';
import AdminPanel from './pages/AdminPanel';
import Activation from './pages/Activation';
import Navbar from './components/Navbar';
import { User, AppSettings, Transaction, AccountStatus, PlanTier, MusicTrack, TransactionStatus } from './types';
import { stateStore } from './store';
import { ADMIN_EMAIL } from './constants';

const App: React.FC = () => {
  const [state, setState] = useState(stateStore.get());

  useEffect(() => {
    stateStore.save(state);
  }, [state]);

  useEffect(() => {
    if (state.currentUser) {
      const lastReset = state.currentUser.lastDailyReset;
      const today = new Date().toDateString();
      
      if (lastReset !== today) {
        const updatedUser = {
          ...state.currentUser,
          dailyEarnings: 0,
          songsListenedToday: 0,
          lastDailyReset: today
        };
        
        setState(prev => ({
          ...prev,
          currentUser: updatedUser,
          users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u)
        }));
      }
    }
  }, [state.currentUser?.id]);

  const login = (email: string) => {
    const user = state.users.find(u => u.email === email);
    if (user) {
      setState(prev => ({ ...prev, currentUser: user }));
      return true;
    }
    return false;
  };

  const register = (username: string, email: string, referralCode?: string) => {
    const isAdmin = email === ADMIN_EMAIL;
    const userId = Math.random().toString(36).substr(2, 9);
    
    const newUser: User = {
      id: userId,
      username,
      email,
      balanceUSD: 0,
      totalSongs: 0,
      dailyEarnings: 0,
      songsListenedToday: 0,
      status: isAdmin ? AccountStatus.ACTIVATED : AccountStatus.NOT_ACTIVATED,
      plan: isAdmin ? PlanTier.PREMIUM : PlanTier.FREE,
      referralCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
      withdrawalEnabled: true,
      lastDailyReset: new Date().toDateString(),
      referralsCount: 0,
      referralEarningsUSD: 0
    };

    let updatedUsers = [...state.users, newUser];

    if (referralCode) {
      const referrer = state.users.find(u => u.referralCode === referralCode.toUpperCase());
      if (referrer) {
        newUser.referredBy = referrer.id;
        // Referrer bonus is handled on sign up in this model
        const referralBonus = state.settings.referralBonusUSD;
        const updatedReferrer = {
          ...referrer,
          balanceUSD: referrer.balanceUSD + referralBonus,
          referralsCount: referrer.referralsCount + 1,
          referralEarningsUSD: referrer.referralEarningsUSD + referralBonus
        };
        
        updatedUsers = updatedUsers.map(u => u.id === referrer.id ? updatedReferrer : u);
        
        // Add transaction record for referrer
        const referralTxn: Transaction = {
          id: Math.random().toString(36).substr(2, 9),
          userId: referrer.id,
          amountUSD: referralBonus,
          type: 'REFERRAL',
          status: TransactionStatus.APPROVED,
          timestamp: new Date().toISOString(),
          details: `Referral Bonus for @${username}`
        };
        
        setState(prev => ({
          ...prev,
          users: updatedUsers,
          currentUser: newUser,
          transactions: [referralTxn, ...prev.transactions]
        }));
        return;
      }
    }

    setState(prev => ({
      ...prev,
      users: updatedUsers,
      currentUser: newUser
    }));
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
  };

  const claimDailyReward = useCallback(() => {
    if (!state.currentUser) return;
    const today = new Date().toDateString();
    if (state.currentUser.lastDailyRewardClaimed === today) return;

    const reward = state.settings.dailyRewardUSD;
    const updatedUser = {
      ...state.currentUser,
      balanceUSD: state.currentUser.balanceUSD + reward,
      lastDailyRewardClaimed: today
    };

    const rewardTxn: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: state.currentUser.id,
      amountUSD: reward,
      type: 'DAILY_REWARD',
      status: TransactionStatus.APPROVED,
      timestamp: new Date().toISOString(),
      details: 'Daily Log-in Reward'
    };

    setState(prev => ({
      ...prev,
      currentUser: updatedUser,
      users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u),
      transactions: [rewardTxn, ...prev.transactions]
    }));
  }, [state.currentUser, state.settings.dailyRewardUSD]);

  const updateBalance = (amount: number) => {
    if (!state.currentUser) return;
    const updatedUser = {
      ...state.currentUser,
      balanceUSD: state.currentUser.balanceUSD + amount,
      totalSongs: state.currentUser.totalSongs + 1,
      dailyEarnings: state.currentUser.dailyEarnings + amount,
      songsListenedToday: state.currentUser.songsListenedToday + 1
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

  const updateTracks = (newTracks: MusicTrack[]) => {
    setState(prev => ({ ...prev, tracks: newTracks }));
  };

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
                <Dashboard 
                  user={state.currentUser!} 
                  settings={state.settings} 
                  transactions={state.transactions} 
                  onClaimDaily={claimDailyReward}
                />
              </ProtectedRoute>
            } />
            <Route path="/activation" element={
              <ProtectedRoute>
                <Activation user={state.currentUser!} settings={state.settings} onTransaction={addTransaction} setState={setState} />
              </ProtectedRoute>
            } />
            <Route path="/listen" element={
              <ProtectedRoute>
                <ListenEarn onReward={updateBalance} settings={state.settings} user={state.currentUser!} tracks={state.tracks} />
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
                  onUpdateTracks={updateTracks}
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
