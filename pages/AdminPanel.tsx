
import React, { useState } from 'react';
import { User, Transaction, AppSettings, AccountStatus, TransactionStatus, PlanTier, MusicTrack } from '../types';
import { SONG_CATEGORIES, PLAN_DETAILS } from '../constants';

interface AdminPanelProps {
  state: {
    users: User[];
    transactions: Transaction[];
    settings: AppSettings;
    tracks: MusicTrack[];
  };
  onUpdateSettings: (settings: AppSettings) => void;
  onUpdateTracks: (tracks: MusicTrack[]) => void;
  setState: React.Dispatch<React.SetStateAction<any>>;
}

type AdminTab = 'analytics' | 'transactions' | 'tracks' | 'users' | 'settings';

const AdminPanel: React.FC<AdminPanelProps> = ({ state, onUpdateSettings, onUpdateTracks, setState }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [userSearch, setUserSearch] = useState('');
  const [showAddSong, setShowAddSong] = useState(false);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [newTrack, setNewTrack] = useState<Partial<MusicTrack>>({
    title: '', artist: '', url: '', albumArt: '', duration: 60, earningUSD: 0.10, category: 'Trending', enabled: true
  });

  const [settingsForm, setSettingsForm] = useState(state.settings);

  // Analytics Helpers
  const totalPlatformBalance = state.users.reduce((acc, u) => acc + u.balanceUSD, 0);
  const pendingTransactions = state.transactions.filter(t => t.status === TransactionStatus.PROCESSING);
  const totalPendingUSD = pendingTransactions.reduce((acc, t) => acc + t.amountUSD, 0);
  const activeEarnersCount = state.users.filter(u => u.status === AccountStatus.ACTIVATED).length;

  // Bulk Actions
  const resetAllDailyStats = () => {
    if (confirm("DANGEROUS: This will reset song counts and daily history for ALL USERS. Proceed?")) {
      setState((prev: any) => ({
        ...prev,
        users: prev.users.map((u: User) => ({
          ...u,
          dailyEarnings: 0,
          songsListenedToday: 0,
          playedTracksToday: []
        }))
      }));
      alert("Platform-wide daily reset completed.");
    }
  };

  const handleTxnAction = (txnId: string, status: TransactionStatus) => {
    const txn = state.transactions.find(t => t.id === txnId);
    if (!txn) return;

    if (txn.type === 'ACTIVATION' && status === TransactionStatus.APPROVED) {
      const requestedPlan = txn.planRequested || PlanTier.BASIC;
      setState((prev: any) => ({
        ...prev,
        users: prev.users.map((u: User) => u.id === txn.userId ? { ...u, status: AccountStatus.ACTIVATED, plan: requestedPlan } : u),
        transactions: prev.transactions.map((t: Transaction) => t.id === txnId ? { ...t, status } : t)
      }));
    } else if (txn.type === 'WITHDRAWAL' && status === TransactionStatus.REJECTED) {
      setState((prev: any) => ({
        ...prev,
        users: prev.users.map((u: User) => u.id === txn.userId ? { ...u, balanceUSD: u.balanceUSD + txn.amountUSD } : u),
        transactions: prev.transactions.map((t: Transaction) => t.id === txnId ? { ...t, status } : t)
      }));
    } else {
      setState((prev: any) => ({
        ...prev,
        transactions: prev.transactions.map((t: Transaction) => t.id === txnId ? { ...t, status } : t)
      }));
    }
  };

  const updateUserStatus = (userId: string, status: AccountStatus) => {
    setState((prev: any) => ({
      ...prev,
      users: prev.users.map((u: User) => u.id === userId ? { ...u, status } : u)
    }));
  };

  const adjustBalance = (userId: string, amount: number) => {
    setState((prev: any) => ({
      ...prev,
      users: prev.users.map((u: User) => u.id === userId ? { ...u, balanceUSD: u.balanceUSD + amount } : u)
    }));
  };

  const filteredUsers = state.users.filter(u => 
    u.username.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Authority Console</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Level 7 Root Access Integrated</p>
        </div>
        <div className="flex bg-white/5 border border-white/5 rounded-2xl p-1 overflow-x-auto no-scrollbar">
          {(['analytics', 'transactions', 'tracks', 'users', 'settings'] as AdminTab[]).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-gray-500 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card p-8 rounded-[3rem] border border-white/5 bg-gradient-to-br from-white/5 to-transparent">
                 <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Network Liquidity</p>
                 <h2 className="text-3xl font-black text-white">${totalPlatformBalance.toFixed(2)}</h2>
                 <p className="text-green-500 text-[10px] font-black mt-1 uppercase">Settle Ready</p>
              </div>
              <div className="glass-card p-8 rounded-[3rem] border border-white/5 bg-gradient-to-br from-white/5 to-transparent">
                 <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Active Accounts</p>
                 <h2 className="text-3xl font-black text-white">{activeEarnersCount}</h2>
                 <p className="text-blue-500 text-[10px] font-black mt-1 uppercase">Institutional Tier</p>
              </div>
              <div className="glass-card p-8 rounded-[3rem] border border-white/5 bg-gradient-to-br from-white/5 to-transparent">
                 <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Pending Assets</p>
                 <h2 className="text-3xl font-black text-white">${totalPendingUSD.toFixed(2)}</h2>
                 <p className="text-yellow-500 text-[10px] font-black mt-1 uppercase">{pendingTransactions.length} Pending Approval</p>
              </div>
              <div className="glass-card p-8 rounded-[3rem] border border-white/5 bg-gradient-to-br from-white/5 to-transparent">
                 <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Asset Inventory</p>
                 <h2 className="text-3xl font-black text-white">{state.tracks.length}</h2>
                 <p className="text-purple-500 text-[10px] font-black mt-1 uppercase">Earning Streams Active</p>
              </div>
           </div>

           <div className="glass-card p-12 rounded-[4rem] border border-white/5 text-center flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 text-3xl">
                 <i className="fas fa-satellite-dish"></i>
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Real-Time Core Synchronized</h3>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] max-w-lg">All user data, bank verifications via Nubapi, and Paystack activations are flowing through the authority ledger with zero latency.</p>
           </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-6 animate-in fade-in duration-500">
           <div className="glass-card rounded-[3rem] border border-white/5 overflow-hidden">
              <div className="p-10 border-b border-white/5 bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter">Settlement Queue</h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Manual override and validation required</p>
                 </div>
                 <div className="flex gap-2">
                    <span className="text-[9px] font-black bg-blue-500/10 text-blue-500 px-3 py-1.5 rounded-full border border-blue-500/20 uppercase tracking-widest">Withdrawals: {state.transactions.filter(t => t.type === 'WITHDRAWAL' && t.status === 'PROCESSING').length}</span>
                    <span className="text-[9px] font-black bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-full border border-yellow-500/20 uppercase tracking-widest">Activations: {state.transactions.filter(t => t.type === 'ACTIVATION' && t.status === 'PROCESSING').length}</span>
                 </div>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                 <table className="w-full text-left">
                    <thead className="text-[9px] font-black text-gray-600 uppercase tracking-widest border-b border-white/5 bg-black/40">
                       <tr>
                          <th className="p-8">Earner / Context</th>
                          <th className="p-8">Asset Value</th>
                          <th className="p-8">Verification Ledger</th>
                          <th className="p-8 text-right">Settlement Action</th>
                       </tr>
                    </thead>
                    <tbody className="text-[11px] font-bold">
                       {pendingTransactions.map(t => {
                          const user = state.users.find(u => u.id === t.userId);
                          return (
                            <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                               <td className="p-8">
                                  <p className="text-white uppercase italic text-sm">{user?.username}</p>
                                  <span className={`text-[8px] px-2 py-0.5 rounded-full font-black mt-1 inline-block tracking-widest border ${t.type === 'WITHDRAWAL' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>{t.type}</span>
                               </td>
                               <td className="p-8">
                                  <p className="text-white text-lg font-black">${t.amountUSD.toFixed(2)}</p>
                                  <p className="text-green-500 text-[9px] font-black uppercase">₦{(t.amountUSD * state.settings.usdToNgnRate).toLocaleString()}</p>
                               </td>
                               <td className="p-8">
                                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-tight leading-relaxed max-w-xs">{t.details || 'N/A'}</p>
                                  <p className="text-[8px] text-gray-600 font-black mt-1 uppercase tracking-widest">{new Date(t.timestamp).toLocaleString()}</p>
                               </td>
                               <td className="p-8 text-right space-x-2">
                                  <button onClick={() => handleTxnAction(t.id, TransactionStatus.APPROVED)} className="bg-green-500 text-black px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase hover:scale-105 transition-all shadow-lg shadow-green-500/20 tracking-widest">Approve</button>
                                  <button onClick={() => handleTxnAction(t.id, TransactionStatus.REJECTED)} className="bg-red-500/10 text-red-500 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all tracking-widest border border-red-500/10">Deny</button>
                               </td>
                            </tr>
                          );
                       })}
                       {pendingTransactions.length === 0 && (
                          <tr><td colSpan={4} className="p-32 text-center opacity-20 italic font-black uppercase text-xs tracking-[0.5em]">Command Queue Empty. All settlements finalized.</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in duration-500">
           <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative group w-full max-w-xl">
                 <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors"></i>
                 <input 
                   type="text" 
                   placeholder="Scan Network via Username or Email Hash..." 
                   value={userSearch}
                   onChange={e => setUserSearch(e.target.value)}
                   className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 pl-14 pr-6 text-white text-sm font-bold focus:border-blue-500 outline-none transition-all placeholder-gray-700"
                 />
              </div>
              <button 
                onClick={resetAllDailyStats}
                className="bg-red-500/10 text-red-500 border border-red-500/20 px-8 py-4 rounded-[2rem] text-[9px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all"
              >
                 Master Daily Reset
              </button>
           </div>

           <div className="glass-card rounded-[3rem] border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="text-[9px] font-black text-gray-600 uppercase tracking-widest border-b border-white/5 bg-black/40">
                       <tr>
                          <th className="p-8">Digital Identity</th>
                          <th className="p-8">Plan Hierarchy</th>
                          <th className="p-8">Asset Holding</th>
                          <th className="p-8">Plays Today</th>
                          <th className="p-8 text-right">Terminal Actions</th>
                       </tr>
                    </thead>
                    <tbody className="text-[11px] font-black">
                       {filteredUsers.map(u => (
                          <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 group">
                             <td className="p-8">
                                <p className="text-white uppercase italic text-sm">{u.username}</p>
                                <p className="text-[10px] text-gray-600 font-medium lowercase mt-0.5">{u.email}</p>
                             </td>
                             <td className="p-8">
                                <div className="flex flex-col gap-1.5">
                                   <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full w-fit border border-blue-500/10">{u.plan}</span>
                                   <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full w-fit border ${u.status === AccountStatus.ACTIVATED ? 'text-green-500 bg-green-500/10 border-green-500/10' : 'text-yellow-500 bg-yellow-500/10 border-yellow-500/10'}`}>{u.status}</span>
                                </div>
                             </td>
                             <td className="p-8">
                                <p className="text-xl font-black text-white">${u.balanceUSD.toFixed(2)}</p>
                                <p className="text-gray-600 text-[9px] font-black uppercase">₦{(u.balanceUSD * state.settings.usdToNgnRate).toLocaleString()}</p>
                             </td>
                             <td className="p-8">
                                <span className="text-white text-lg">{u.songsListenedToday}</span>
                                <span className="text-gray-600 ml-1">/ {PLAN_DETAILS[u.plan].songLimit === Infinity ? '∞' : PLAN_DETAILS[u.plan].songLimit}</span>
                             </td>
                             <td className="p-8 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => adjustBalance(u.id, 1)} className="p-3 rounded-2xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all"><i className="fas fa-plus-circle"></i></button>
                                <button onClick={() => updateUserStatus(u.id, u.status === AccountStatus.BANNED ? AccountStatus.ACTIVATED : AccountStatus.BANNED)} className={`p-3 rounded-2xl transition-all ${u.status === AccountStatus.BANNED ? 'bg-green-500 text-black' : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'}`}>
                                   <i className={`fas ${u.status === AccountStatus.BANNED ? 'fa-unlock' : 'fa-user-slash'}`}></i>
                                </button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500 pb-20">
           
           <div className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-8 flex flex-col justify-between">
              <div>
                 <h3 className="text-xl font-black uppercase italic tracking-tighter mb-8">Protocol Controls</h3>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                       <div>
                          <p className="text-[10px] text-white font-black uppercase tracking-widest">Maintenance Mode</p>
                          <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest mt-0.5">Locks non-admin access</p>
                       </div>
                       <button 
                         onClick={() => setSettingsForm({...settingsForm, maintenanceMode: !settingsForm.maintenanceMode})}
                         className={`w-12 h-6 rounded-full transition-all relative ${settingsForm.maintenanceMode ? 'bg-red-500' : 'bg-gray-800'}`}
                       >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settingsForm.maintenanceMode ? 'left-7' : 'left-1'}`}></div>
                       </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                       <div>
                          <p className="text-[10px] text-white font-black uppercase tracking-widest">Withdrawal Portal</p>
                          <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest mt-0.5">Master payout toggle</p>
                       </div>
                       <button 
                         onClick={() => setSettingsForm({...settingsForm, isWithdrawalOpen: !settingsForm.isWithdrawalOpen})}
                         className={`w-12 h-6 rounded-full transition-all relative ${settingsForm.isWithdrawalOpen ? 'bg-green-500' : 'bg-gray-800'}`}
                       >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settingsForm.isWithdrawalOpen ? 'left-7' : 'left-1'}`}></div>
                       </button>
                    </div>
                 </div>
              </div>
              <button 
                onClick={() => { onUpdateSettings(settingsForm); alert("Network Status Updated."); }}
                className="w-full bg-white text-black font-black py-5 rounded-2xl uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all text-sm mt-8"
              >
                 Synchronize All
              </button>
           </div>

           <div className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-8 lg:col-span-2">
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Global Announcement Ledger</h3>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Live News Ticker Message</label>
                    <textarea 
                      value={settingsForm.announcement} 
                      onChange={e => setSettingsForm({...settingsForm, announcement: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white font-bold text-sm h-32 outline-none focus:border-green-500 transition-all resize-none"
                      placeholder="Enter global notification text..."
                    ></textarea>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[9px] text-gray-600 uppercase font-black ml-1">Exchange rate (₦/$)</label>
                       <input type="number" value={settingsForm.usdToNgnRate} onChange={e => setSettingsForm({...settingsForm, usdToNgnRate: parseFloat(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-black" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] text-gray-600 uppercase font-black ml-1">Nubapi Authorization</label>
                       <input type="password" value={settingsForm.nubapiKey} onChange={e => setSettingsForm({...settingsForm, nubapiKey: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-mono text-xs" placeholder="Bearer..." />
                    </div>
                 </div>
              </div>
              <p className="text-[8px] text-gray-700 font-black uppercase tracking-[0.3em] text-center pt-4">Encryption Level: AES-256 Authority Channel</p>
           </div>

        </div>
      )}

      {/* Tracks Tab remains similar but with updated inventory UI from previous turn */}
      {activeTab === 'tracks' && (
        <div className="space-y-6 animate-in fade-in duration-500">
           <div className="flex justify-between items-center bg-white/5 p-8 rounded-[3rem] border border-white/5">
              <div>
                 <h3 className="text-xl font-black uppercase italic tracking-tighter">Audio Inventory</h3>
                 <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Manage earning-enabled media assets</p>
              </div>
              <button onClick={() => setShowAddSong(true)} className="bg-green-500 text-black px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-green-500/20 active:scale-95 transition-all">Deploy Asset</button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.tracks.map(track => (
                 <div key={track.id} className="glass-card p-8 rounded-[3rem] border border-white/5 space-y-6 hover:border-green-500/30 transition-all">
                    <div className="flex gap-6 items-center">
                       <img src={track.albumArt} className="w-20 h-20 rounded-3xl object-cover shadow-2xl border border-white/10" />
                       <div className="min-w-0">
                          <h4 className="text-white font-black uppercase italic truncate text-lg">{track.title}</h4>
                          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest truncate">{track.artist}</p>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-[10px] font-black uppercase">
                       <div className="p-4 bg-white/5 rounded-2xl text-green-500 border border-white/5">${track.earningUSD} payout</div>
                       <div className="p-4 bg-white/5 rounded-2xl text-gray-500 border border-white/5">{track.category}</div>
                    </div>
                    <div className="flex gap-3">
                       <button onClick={() => { setEditingTrackId(track.id); setNewTrack(track); setShowAddSong(true); }} className="flex-grow bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-green-500 transition-all">Modify</button>
                       <button onClick={() => onUpdateTracks(state.tracks.filter(t => t.id !== track.id))} className="px-6 py-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-trash-alt"></i></button>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      {showAddSong && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="glass-card max-w-xl w-full p-12 rounded-[4rem] border border-white/10 relative shadow-2xl">
              <button onClick={() => { setShowAddSong(false); setEditingTrackId(null); }} className="absolute top-10 right-10 text-gray-500 hover:text-white transition-colors"><i className="fas fa-times text-xl"></i></button>
              <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-10 text-white leading-none">{editingTrackId ? 'Sync Digital Asset' : 'Deploy To Network'}</h3>
              <form onSubmit={(e) => {
                 e.preventDefault();
                 if (editingTrackId) {
                   onUpdateTracks(state.tracks.map(t => t.id === editingTrackId ? { ...t, ...newTrack } : t) as MusicTrack[]);
                 } else {
                   const track: MusicTrack = {
                     id: Math.random().toString(36).substr(2, 9),
                     title: newTrack.title || 'Untitled',
                     artist: newTrack.artist || 'Unknown',
                     url: newTrack.url || '',
                     albumArt: newTrack.albumArt || '',
                     duration: newTrack.duration || 60,
                     earningUSD: newTrack.earningUSD || 0.10,
                     category: newTrack.category || 'Trending',
                     enabled: true
                   };
                   onUpdateTracks([...state.tracks, track]);
                 }
                 setShowAddSong(false);
                 setEditingTrackId(null);
              }} className="space-y-8">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Asset Name</label>
                       <input type="text" required value={newTrack.title} onChange={e => setNewTrack({...newTrack, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-sm font-bold outline-none focus:border-green-500 transition-all" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Creator/Artist</label>
                       <input type="text" required value={newTrack.artist} onChange={e => setNewTrack({...newTrack, artist: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-sm font-bold outline-none focus:border-green-500 transition-all" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Audio Stream Source (URL)</label>
                    <input type="text" required value={newTrack.url} onChange={e => setNewTrack({...newTrack, url: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-sm font-bold outline-none focus:border-green-500 transition-all" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Visual Asset (Album Art URL)</label>
                    <input type="text" required value={newTrack.albumArt} onChange={e => setNewTrack({...newTrack, albumArt: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-sm font-bold outline-none focus:border-green-500 transition-all" />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Yield Value ($)</label>
                       <input type="number" step="0.01" required value={newTrack.earningUSD} onChange={e => setNewTrack({...newTrack, earningUSD: parseFloat(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-black focus:border-green-500 transition-all" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] text-gray-600 font-black uppercase ml-1">Market Category</label>
                       <select value={newTrack.category} onChange={e => setNewTrack({...newTrack, category: e.target.value})} className="w-full h-[66px] bg-[#111] border border-white/10 rounded-2xl px-5 text-white text-sm font-bold outline-none focus:border-green-500 transition-all">
                          {SONG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                 </div>
                 <button type="submit" className="w-full bg-green-500 text-black font-black py-6 rounded-[2rem] uppercase tracking-[0.3em] shadow-2xl shadow-green-500/30 active:scale-95 transition-all text-lg mt-4">
                    {editingTrackId ? 'Synchronize Data' : 'Initialize Asset'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
