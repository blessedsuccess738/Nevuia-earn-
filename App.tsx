
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import ListenEarn from './pages/ListenEarn';
import Withdraw from './pages/Withdraw';
import AdminPanel from './pages/AdminPanel';
import Activation from './pages/Activation';
import Navbar from './components/Navbar';
import { User, AppSettings, Transaction, AccountStatus, PlanTier, MusicTrack, TransactionStatus, Message, Notification, AdminNotification, PublicChatMessage } from './types';
import { stateStore } from './store';
import { ADMIN_EMAIL } from './constants';

const App: React.FC = () => {
  const [state, setState] = useState(stateStore.get());
  const [showNewTrackNotify, setShowNewTrackNotify] = useState(false);
  const trackCountRef = useRef(state.tracks.length);

  useEffect(() => {
    stateStore.save(state);
    
    // Check for new tracks to show notification
    if (state.tracks.length > trackCountRef.current) {
      setShowNewTrackNotify(true);
      setTimeout(() => setShowNewTrackNotify(false), 5000);
    }
    trackCountRef.current = state.tracks.length;
  }, [state]);

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
      playedTracksToday: [],
      status: isAdmin ? AccountStatus.ACTIVATED : AccountStatus.NOT_ACTIVATED,
      plan: isAdmin ? PlanTier.PREMIUM : PlanTier.FREE,
      referralCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
      withdrawalEnabled: true,
      lastDailyReset: new Date().toDateString(),
      referralsCount: 0,
      referralEarningsUSD: 0,
      notifications: [],
      createdAt: new Date().toISOString()
    };

    let updatedUsers = [...state.users, newUser];

    if (referralCode) {
      const referrer = state.users.find(u => u.referralCode === referralCode.toUpperCase());
      if (referrer) {
        newUser.referredBy = referrer.id;
        const referralBonus = state.settings.referralBonusUSD;
        const updatedReferrer = {
          ...referrer,
          balanceUSD: referrer.balanceUSD + referralBonus,
          referralsCount: referrer.referralsCount + 1,
          referralEarningsUSD: referrer.referralEarningsUSD + referralBonus
        };
        updatedUsers = updatedUsers.map(u => u.id === referrer.id ? updatedReferrer : u);
      }
    }

    setState(prev => ({ ...prev, users: updatedUsers, currentUser: newUser }));
  };

  const logout = () => setState(prev => ({ ...prev, currentUser: null }));

  const sendMessage = (text: string, isAdmin: boolean = false, targetUserId?: string) => {
    const userId = isAdmin ? (targetUserId || '') : (state.currentUser?.id || '');
    if (!userId) return;

    const msg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      username: isAdmin ? 'Admin' : state.currentUser!.username,
      text,
      timestamp: new Date().toISOString(),
      read: false,
      isAdmin
    };

    setState(prev => ({ ...prev, messages: [...prev.messages, msg] }));
  };

  const sendPublicChatMessage = (text: string) => {
    if (!state.currentUser) return;
    const msg: PublicChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      userId: state.currentUser.id,
      username: state.currentUser.username,
      text,
      timestamp: new Date().toISOString(),
      tier: state.currentUser.plan
    };
    setState(prev => ({ ...prev, publicChat: [...(prev.publicChat || []), msg].slice(-50) }));
  };

  const claimDailyReward = useCallback(() => {
    if (!state.currentUser) return;
    const today = new Date().toDateString();
    if (state.currentUser.lastDailyRewardClaimed === today) return;

    const reward = state.settings.dailyRewardUSD;
    const updatedUser = { ...state.currentUser, balanceUSD: state.currentUser.balanceUSD + reward, lastDailyRewardClaimed: today };
    setState(prev => ({
      ...prev,
      currentUser: updatedUser,
      users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u),
      transactions: [{ id: Math.random().toString(36).substr(2, 9), userId: state.currentUser!.id, amountUSD: reward, type: 'DAILY_REWARD', status: TransactionStatus.APPROVED, timestamp: new Date().toISOString() }, ...prev.transactions]
    }));
  }, [state.currentUser, state.settings.dailyRewardUSD]);

  const updateBalance = (amount: number, trackId: string) => {
    if (!state.currentUser) return;
    const updatedUser = {
      ...state.currentUser,
      balanceUSD: state.currentUser.balanceUSD + amount,
      totalSongs: state.currentUser.totalSongs + 1,
      dailyEarnings: state.currentUser.dailyEarnings + amount,
      songsListenedToday: state.currentUser.songsListenedToday + 1,
      playedTracksToday: [...state.currentUser.playedTracksToday, trackId]
    };
    setState(prev => ({ ...prev, currentUser: updatedUser, users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u) }));
  };

  const addTransaction = (txn: Transaction) => setState(prev => ({ ...prev, transactions: [txn, ...prev.transactions] }));
  const updateSettings = (newSettings: AppSettings) => setState(prev => ({ ...prev, settings: newSettings }));
  const updateTracks = (newTracks: MusicTrack[]) => setState(prev => ({ ...prev, tracks: newTracks }));

  const ProtectedRoute = ({ children, adminOnly = false }: { children?: React.ReactNode, adminOnly?: boolean }) => {
    if (!state.currentUser) return <Navigate to="/" />;
    if (adminOnly && state.currentUser.email !== ADMIN_EMAIL) return <Navigate to="/dashboard" />;
    return <>{children}</>;
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {state.settings.videoBackgroundUrl && (
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="fixed inset-0 w-full h-full object-cover z-[-1] opacity-30 grayscale"
          >
            <source src={state.settings.videoBackgroundUrl} type="video/mp4" />
          </video>
        )}
        <div className="fixed inset-0 bg-[#050505]/60 z-[-1]"></div>

        {/* New Song Notification */}
        {showNewTrackNotify && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm animate-in slide-in-from-top-4 duration-500">
             <div className="bg-gradient-to-r from-red-600 to-red-900 p-4 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-600 animate-bounce">
                   <i className="fas fa-music"></i>
                </div>
                <div>
                   <h4 className="text-white font-black text-xs uppercase italic tracking-tighter leading-none">New Asset Synced</h4>
                   <p className="text-white/80 text-[10px] font-bold uppercase mt-1">Earn more royalties now!</p>
                </div>
                <button onClick={() => setShowNewTrackNotify(false)} className="ml-auto text-white/50 hover:text-white transition-all"><i className="fas fa-times"></i></button>
             </div>
          </div>
        )}

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
                  onSendMessage={sendMessage}
                  onSendPublicMessage={sendPublicChatMessage}
                  onClearNotifications={() => {}}
                  messages={state.messages}
                  publicChat={state.publicChat || []}
                />
              </ProtectedRoute>
            } />
            <Route path="/listen" element={
              <ProtectedRoute>
                <ListenEarn onReward={updateBalance} settings={state.settings} user={state.currentUser!} tracks={state.tracks} />
              </ProtectedRoute>
            } />
            <Route path="/withdraw" element={
              <ProtectedRoute>
                <Withdraw user={state.currentUser!} settings={state.settings} onTransaction={addTransaction} setState={setState} />
              </ProtectedRoute>
            } />
            <Route path="/activation" element={
              <ProtectedRoute>
                <Activation user={state.currentUser!} settings={state.settings} onTransaction={addTransaction} setState={setState} />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminPanel state={state} onUpdateSettings={updateSettings} onUpdateTracks={updateTracks} setState={setState} onSendMessage={sendMessage} />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
