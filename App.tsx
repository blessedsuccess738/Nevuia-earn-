
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import ListenEarn from './pages/ListenEarn';
import Withdraw from './pages/Withdraw';
import AdminPanel from './pages/AdminPanel';
import Activation from './pages/Activation';
import Settings from './pages/Settings';
import Navbar from './components/Navbar';
import { User, AppSettings, Transaction, AccountStatus, PlanTier, MusicTrack, TransactionStatus, Message, Notification, AdminNotification, PublicChatMessage } from './types';
import { stateStore } from './store';
import { ADMIN_EMAIL } from './constants';

const FallingBackground: React.FC = () => {
  const [elements, setElements] = useState<{ id: number; left: string; delay: string; duration: string; size: string; icon: string }[]>([]);

  useEffect(() => {
    const icons = ['fa-music', 'fa-headphones', 'fa-play', 'fa-bolt', 'fa-coins'];
    const newElements = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 20}s`,
      duration: `${12 + Math.random() * 18}s`,
      size: `${0.7 + Math.random() * 1.2}rem`,
      icon: icons[Math.floor(Math.random() * icons.length)]
    }));
    setElements(newElements);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {elements.map((el) => (
        <div
          key={el.id}
          className="falling-logo"
          style={{
            left: el.left,
            animationDelay: el.delay,
            animationDuration: el.duration,
            fontSize: el.size
          }}
        >
          <i className={`fas ${el.icon} opacity-10`}></i>
        </div>
      ))}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"></div>
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState(stateStore.get());
  const [showNewTrackNotify, setShowNewTrackNotify] = useState(false);
  const trackCountRef = useRef(state.tracks.length);

  useEffect(() => {
    stateStore.save(state);
    
    // Check for new tracks to show pop notification (Admin adds song)
    if (state.tracks.length > trackCountRef.current) {
      setShowNewTrackNotify(true);
      setTimeout(() => setShowNewTrackNotify(false), 7000);
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
    if (!state.currentUser || state.currentUser.plan !== PlanTier.PREMIUM) return;
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
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-black text-white">
        <FallingBackground />
        
        {/* GLOBAL NEW ASSET NOTIFICATION */}
        {showNewTrackNotify && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] w-[92%] max-w-sm pop-notification">
             <div className="bg-gradient-to-r from-green-600 to-green-800 p-4 rounded-3xl shadow-2xl border border-white/20 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-xl">
                   <i className="fas fa-plus-circle text-2xl animate-pulse"></i>
                </div>
                <div>
                   <h4 className="text-white font-black text-[11px] uppercase italic tracking-tighter leading-none">ASSET INJECTION</h4>
                   <p className="text-white/80 text-[9px] font-bold uppercase mt-1">Admin has added new high-yield pools!</p>
                </div>
                <button onClick={() => setShowNewTrackNotify(false)} className="ml-auto text-white/30"><i className="fas fa-times"></i></button>
             </div>
          </div>
        )}

        {state.currentUser && <Navbar user={state.currentUser} onLogout={logout} />}
        
        {/* CONTAINER FOR NORMAL ANDROID SIZE */}
        <main className="flex-grow flex flex-col max-w-md mx-auto w-full relative">
          <Routes>
            <Route path="/" element={<Welcome onLogin={login} onRegister={register} />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard 
                  user={state.currentUser!} 
                  settings={state.settings} 
                  transactions={state.transactions} 
                  onClaimDaily={() => {}}
                  onSendMessage={sendMessage}
                  onSendPublicMessage={sendPublicChatMessage}
                  onClearNotifications={() => {}}
                  messages={state.messages}
                  publicChat={state.publicChat || []}
                />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings user={state.currentUser!} onLogout={logout} />
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
