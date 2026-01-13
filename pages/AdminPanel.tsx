
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

  // Local settings state
  const [settingsForm, setSettingsForm] = useState(state.settings);

  // Analytics Helpers
  const totalPlatformBalance = state.users.reduce((acc, u) => acc + u.balanceUSD, 0);
  const pendingWithdrawals = state.transactions.filter(t => t.type === 'WITHDRAWAL' && t.status === TransactionStatus.PROCESSING);
  const totalPendingUSD = pendingWithdrawals.reduce((acc, t) => acc + t.amountUSD, 0);
  const activeEarnersCount = state.users.filter(u => u.status === AccountStatus.ACTIVATED).length;

  // Transaction Actions
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
      // Refund balance if withdrawal is rejected
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

  // User Actions
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
    <div className="min-h-screen bg-[#050505] p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Admin Authority</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Platform Integrity Console</p>
        </div>
        <div className="flex bg-white/5 border border-white/5 rounded-2xl p-1">
          {(['analytics', 'transactions', 'tracks', 'users', 'settings'] as AdminTab[]).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Analytics View */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card p-8 rounded-[2.5rem] border border-white/5">
                 <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Platform Liquidity</p>
                 <h2 className="text-3xl font-black text-white">${totalPlatformBalance.toFixed(2)}</h2>
                 <p className="text-green-500 text-[10px] font-black mt-1">₦{(totalPlatformBalance * state.settings.usdToNgnRate).toLocaleString()}</p>
              </div>
              <div className="glass-card p-8 rounded-[2.5rem] border border-white/5">
                 <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Active Earners</p>
                 <h2 className="text-3xl font-black text-white">{activeEarnersCount}</h2>
                 <p className="text-blue-500 text-[10px] font-black mt-1">Institutional Verified</p>
              </div>
              <div className="glass-card p-8 rounded-[2.5rem] border border-white/5">
                 <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Pending Payouts</p>
                 <h2 className="text-3xl font-black text-white">${totalPendingUSD.toFixed(2)}</h2>
                 <p className="text-yellow-500 text-[10px] font-black mt-1">{pendingWithdrawals.length} Requests</p>
              </div>
              <div className="glass-card p-8 rounded-[2.5rem] border border-white/5">
                 <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Music Assets</p>
                 <h2 className="text-3xl font-black text-white">{state.tracks.length}</h2>
                 <p className="text-purple-500 text-[10px] font-black mt-1">{state.tracks.filter(t => t.enabled).length} Enabled</p>
              </div>
           </div>

           <div className="glass-card p-10 rounded-[4rem] border border-white/5 text-center">
              <i className="fas fa-microchip text-4xl text-green-500/30 mb-4"></i>
              <h3 className="text-xl font-black uppercase italic italic tracking-tighter text-gray-400">System Monitoring Operational</h3>
              <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest max-w-md mx-auto mt-2">All payout settlemet logic and user behavior tracking is active and secured via institutional bridge.</p>
           </div>
        </div>
      )}

      {/* Transactions Hub */}
      {activeTab === 'transactions' && (
        <div className="space-y-6 animate-in fade-in duration-500">
           <div className="glass-card rounded-[3rem] border border-white/5 overflow-hidden">
              <div className="p-8 border-b border-white/5 bg-white/5">
                 <h3 className="text-lg font-black uppercase italic tracking-tighter">Settlement Queue</h3>
                 <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Manual verification required for payouts and activations</p>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">
                       <tr>
                          <th className="p-8">Earner / Type</th>
                          <th className="p-8">Amount</th>
                          <th className="p-8">Details</th>
                          <th className="p-8">Timestamp</th>
                          <th className="p-8 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="text-sm font-bold">
                       {state.transactions.filter(t => t.status === TransactionStatus.PROCESSING).map(t => {
                          const user = state.users.find(u => u.id === t.userId);
                          return (
                            <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                               <td className="p-8">
                                  <p className="text-white uppercase italic">{user?.username}</p>
                                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-black ${t.type === 'WITHDRAWAL' ? 'bg-blue-500/10 text-blue-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{t.type}</span>
                               </td>
                               <td className="p-8">
                                  <p className="text-white">${t.amountUSD.toFixed(2)}</p>
                                  <p className="text-green-500 text-[10px]">₦{(t.amountUSD * state.settings.usdToNgnRate).toLocaleString()}</p>
                               </td>
                               <td className="p-8 text-[10px] text-gray-500 font-medium uppercase tracking-tight">{t.details || 'No details'}</td>
                               <td className="p-8 text-[10px] text-gray-500 font-black">{new Date(t.timestamp).toLocaleString()}</td>
                               <td className="p-8 text-right space-x-2">
                                  <button onClick={() => handleTxnAction(t.id, TransactionStatus.APPROVED)} className="bg-green-500 text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-all">Settle</button>
                                  <button onClick={() => handleTxnAction(t.id, TransactionStatus.REJECTED)} className="bg-red-500/10 text-red-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">Reject</button>
                               </td>
                            </tr>
                          );
                       })}
                       {state.transactions.filter(t => t.status === TransactionStatus.PROCESSING).length === 0 && (
                          <tr><td colSpan={5} className="p-20 text-center opacity-30 italic font-black uppercase text-[10px]">Queue Clear. All settlements finalized.</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {/* Music Management */}
      {activeTab === 'tracks' && (
        <div className="space-y-6 animate-in fade-in duration-500">
           <div className="flex justify-between items-center">
              <h3 className="text-lg font-black uppercase italic tracking-tighter">Content Inventory</h3>
              <button onClick={() => setShowAddSong(true)} className="bg-green-500 text-black px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20">Upload Asset</button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.tracks.map(track => (
                 <div key={track.id} className="glass-card p-6 rounded-[2.5rem] border border-white/5 space-y-4">
                    <div className="flex gap-4 items-center">
                       <img src={track.albumArt} className="w-16 h-16 rounded-2xl object-cover shadow-2xl" />
                       <div className="min-w-0">
                          <h4 className="text-white font-black uppercase italic truncate">{track.title}</h4>
                          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{track.artist}</p>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[9px] font-black uppercase">
                       <div className="p-3 bg-white/5 rounded-xl text-green-500">${track.earningUSD} Earn</div>
                       <div className="p-3 bg-white/5 rounded-xl text-gray-500">{track.category}</div>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => { setEditingTrackId(track.id); setNewTrack(track); setShowAddSong(true); }} className="flex-grow bg-white/5 text-white py-3 rounded-xl text-[9px] font-black uppercase hover:bg-white/10">Edit Asset</button>
                       <button onClick={() => onUpdateTracks(state.tracks.filter(t => t.id !== track.id))} className="px-4 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"><i className="fas fa-trash text-[10px]"></i></button>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      {/* Earner Directory */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in duration-500">
           <div className="relative group">
              <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-gray-600"></i>
              <input 
                type="text" 
                placeholder="Lookup Earner via Username or Email..." 
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 pl-14 pr-6 text-white text-sm font-bold focus:border-blue-500 outline-none transition-all"
              />
           </div>
           <div className="glass-card rounded-[3rem] border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 bg-white/5">
                       <tr>
                          <th className="p-8">Earner Details</th>
                          <th className="p-8">Plan / Status</th>
                          <th className="p-8">Wallet</th>
                          <th className="p-8">Plays (Today)</th>
                          <th className="p-8 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="text-sm font-bold">
                       {filteredUsers.map(u => (
                          <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                             <td className="p-8">
                                <p className="text-white uppercase italic">{u.username}</p>
                                <p className="text-[10px] text-gray-500 font-medium lowercase">{u.email}</p>
                             </td>
                             <td className="p-8">
                                <div className="flex flex-col gap-1">
                                   <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">Tier: {u.plan}</span>
                                   <span className={`text-[9px] font-black uppercase tracking-widest ${u.status === AccountStatus.ACTIVATED ? 'text-green-500' : 'text-red-500'}`}>Status: {u.status}</span>
                                </div>
                             </td>
                             <td className="p-8 text-white">
                                <p className="text-xl font-black">${u.balanceUSD.toFixed(2)}</p>
                                <p className="text-gray-500 text-[10px]">₦{(u.balanceUSD * state.settings.usdToNgnRate).toLocaleString()}</p>
                             </td>
                             <td className="p-8 font-black text-white">{u.songsListenedToday} <span className="text-gray-600">/ {PLAN_DETAILS[u.plan].songLimit}</span></td>
                             <td className="p-8 text-right space-x-2">
                                <button onClick={() => adjustBalance(u.id, 1)} className="p-2.5 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all"><i className="fas fa-plus-circle"></i></button>
                                <button onClick={() => updateUserStatus(u.id, u.status === AccountStatus.BANNED ? AccountStatus.ACTIVATED : AccountStatus.BANNED)} className={`p-2.5 rounded-xl transition-all ${u.status === AccountStatus.BANNED ? 'bg-green-500 text-black' : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'}`}>
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

      {/* Settings Panel */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500 pb-20">
           <div className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-8">
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Settlement Config</h3>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Exchange Rate (₦/$)</label>
                    <input type="number" value={settingsForm.usdToNgnRate} onChange={e => setSettingsForm({...settingsForm, usdToNgnRate: parseFloat(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-black" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Minimum Withdrawal (₦)</label>
                    <input type="number" value={settingsForm.minWithdrawalNGN} onChange={e => setSettingsForm({...settingsForm, minWithdrawalNGN: parseFloat(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-black" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Withdrawal Schedule Note</label>
                    <input type="text" value={settingsForm.withdrawalSchedule} onChange={e => setSettingsForm({...settingsForm, withdrawalSchedule: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" />
                 </div>
              </div>
           </div>

           <div className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-8">
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Verification API (Nubapi)</h3>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Nubapi Authorization Key</label>
                    <div className="relative">
                       <i className="fas fa-key absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"></i>
                       <input 
                         type="password" 
                         value={settingsForm.nubapiKey} 
                         onChange={e => setSettingsForm({...settingsForm, nubapiKey: e.target.value})} 
                         className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white font-mono text-xs" 
                         placeholder="Paste your nubapi bearer token here..."
                       />
                    </div>
                    <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mt-1">Used for automated bank account verification during withdrawals.</p>
                 </div>
              </div>
              <button 
                onClick={() => { onUpdateSettings(settingsForm); alert("System Synced."); }}
                className="w-full bg-white text-black font-black py-5 rounded-2xl uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all"
              >
                 Synchronize All Configs
              </button>
           </div>
        </div>
      )}

      {/* Upload Song Modal */}
      {showAddSong && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-2xl">
           <div className="glass-card max-w-xl w-full p-10 rounded-[4rem] border border-white/10 relative">
              <button onClick={() => { setShowAddSong(false); setEditingTrackId(null); }} className="absolute top-8 right-8 text-gray-500 hover:text-white"><i className="fas fa-times"></i></button>
              <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-8 text-white">{editingTrackId ? 'Modify Digital Asset' : 'Deploy New Track'}</h3>
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
              }} className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Track Name" required value={newTrack.title} onChange={e => setNewTrack({...newTrack, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-sm font-bold outline-none" />
                    <input type="text" placeholder="Artist" required value={newTrack.artist} onChange={e => setNewTrack({...newTrack, artist: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-sm font-bold outline-none" />
                 </div>
                 <input type="text" placeholder="MP3 / Audio URL" required value={newTrack.url} onChange={e => setNewTrack({...newTrack, url: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-sm font-bold outline-none" />
                 <input type="text" placeholder="Cover Art Image URL" required value={newTrack.albumArt} onChange={e => setNewTrack({...newTrack, albumArt: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-sm font-bold outline-none" />
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Payout ($)</label>
                       <input type="number" step="0.01" required value={newTrack.earningUSD} onChange={e => setNewTrack({...newTrack, earningUSD: parseFloat(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-black" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Genre</label>
                       <select value={newTrack.category} onChange={e => setNewTrack({...newTrack, category: e.target.value})} className="w-full h-[66px] bg-[#111] border border-white/10 rounded-2xl px-5 text-white text-sm font-bold">
                          {SONG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                 </div>
                 <button type="submit" className="w-full bg-green-500 text-black font-black py-6 rounded-3xl uppercase tracking-widest shadow-2xl active:scale-95 transition-all">
                    {editingTrackId ? 'Synchronize Asset' : 'Deploy to Network'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
