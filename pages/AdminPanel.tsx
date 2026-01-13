
import React, { useState } from 'react';
import { User, Transaction, AppSettings, AccountStatus, TransactionStatus, PlanTier, MusicTrack } from '../types';
// Add PLAN_DETAILS to the import list from constants
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

const AdminPanel: React.FC<AdminPanelProps> = ({ state, onUpdateSettings, onUpdateTracks, setState }) => {
  const [exchangeRate, setExchangeRate] = useState(state.settings.usdToNgnRate.toString());
  const [minWithdrawal, setMinWithdrawal] = useState(state.settings.minWithdrawalNGN.toString());
  const [withdrawalSchedule, setWithdrawalSchedule] = useState(state.settings.withdrawalSchedule);
  
  const [tgAdmin, setTgAdmin] = useState(state.settings.telegramAdmin);
  const [tgChannel, setTgChannel] = useState(state.settings.telegramChannel);
  const [waLink, setWaLink] = useState(state.settings.whatsappLink);

  const [showAddSong, setShowAddSong] = useState(false);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [newTrack, setNewTrack] = useState<Partial<MusicTrack>>({
    title: '', artist: '', url: '', albumArt: '', duration: 60, earningUSD: 0.10, category: 'Trending', enabled: true
  });

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...state.settings,
      usdToNgnRate: parseFloat(exchangeRate),
      minWithdrawalNGN: parseFloat(minWithdrawal),
      withdrawalSchedule,
      telegramAdmin: tgAdmin,
      telegramChannel: tgChannel,
      whatsappLink: waLink
    });
    alert("Platform settings synchronized successfully!");
  };

  const toggleTrackStatus = (trackId: string) => {
    const updated = state.tracks.map(t => t.id === trackId ? { ...t, enabled: !t.enabled } : t);
    onUpdateTracks(updated);
  };

  const removeTrack = (trackId: string) => {
    if (confirm("Permanently delete this track?")) {
      const updated = state.tracks.filter(t => t.id !== trackId);
      onUpdateTracks(updated);
    }
  };

  const handleAddTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTrackId) {
      const updated = state.tracks.map(t => t.id === editingTrackId ? { ...t, ...newTrack } : t);
      onUpdateTracks(updated as MusicTrack[]);
    } else {
      const track: MusicTrack = {
        id: Math.random().toString(36).substr(2, 9),
        title: newTrack.title || 'Untitled',
        artist: newTrack.artist || 'Unknown',
        url: newTrack.url || '',
        albumArt: newTrack.albumArt || 'https://via.placeholder.com/300',
        duration: newTrack.duration || 60,
        earningUSD: newTrack.earningUSD || 0.10,
        category: newTrack.category || 'Trending',
        enabled: true
      };
      onUpdateTracks([...state.tracks, track]);
    }
    setShowAddSong(false);
    setEditingTrackId(null);
    setNewTrack({ title: '', artist: '', url: '', albumArt: '', duration: 60, earningUSD: 0.10, category: 'Trending', enabled: true });
  };

  const editTrack = (track: MusicTrack) => {
    setNewTrack(track);
    setEditingTrackId(track.id);
    setShowAddSong(true);
  };

  const updateTxnStatus = (txnId: string, status: TransactionStatus) => {
    const txn = state.transactions.find(t => t.id === txnId);
    if (!txn) return;
    if (txn.type === 'ACTIVATION' && status === TransactionStatus.APPROVED) {
      const requestedPlan = txn.planRequested || PlanTier.BASIC;
      setState((prev: any) => ({
        ...prev,
        users: prev.users.map((u: User) => u.id === txn.userId ? { ...u, status: AccountStatus.ACTIVATED, plan: requestedPlan } : u),
        transactions: prev.transactions.map((t: Transaction) => t.id === txnId ? { ...t, status } : t),
        currentUser: prev.currentUser?.id === txn.userId ? { ...prev.currentUser, status: AccountStatus.ACTIVATED, plan: requestedPlan } : prev.currentUser
      }));
    } else {
      setState((prev: any) => ({
        ...prev,
        transactions: prev.transactions.map((t: Transaction) => t.id === txnId ? { ...t, status } : t)
      }));
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">Command Center</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Full Platform Authority</p>
        </div>
        <button onClick={() => { setEditingTrackId(null); setNewTrack({ title: '', artist: '', url: '', albumArt: '', duration: 60, earningUSD: 0.10, category: 'Trending', enabled: true }); setShowAddSong(true); }} className="bg-green-500 text-black font-black px-6 py-4 rounded-2xl hover:bg-green-400 transition-all uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg shadow-green-500/20">
          <i className="fas fa-plus"></i> UPLOAD NEW SONG
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Platform Settings */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-card p-8 rounded-[2.5rem] border border-white/5">
            <h2 className="text-lg font-black mb-6 uppercase italic flex items-center gap-3">
              <i className="fas fa-sliders-h text-green-500"></i> Platform Config
            </h2>
            <form onSubmit={handleUpdateSettings} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block">Withdrawal Portal</label>
                <button 
                  type="button" 
                  onClick={() => onUpdateSettings({...state.settings, isWithdrawalOpen: !state.settings.isWithdrawalOpen})} 
                  className={`w-full py-4 rounded-xl font-black text-xs uppercase transition-all shadow-md ${state.settings.isWithdrawalOpen ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}
                >
                  {state.settings.isWithdrawalOpen ? 'Portal Status: OPEN' : 'Portal Status: CLOSED'}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block">Withdrawal Note</label>
                <input type="text" value={withdrawalSchedule} onChange={e => setWithdrawalSchedule(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-green-500 outline-none text-white font-medium" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block">Rate (₦/$)</label>
                  <input type="number" value={exchangeRate} onChange={e => setExchangeRate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-green-500 outline-none text-white font-black" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block">Min (₦)</label>
                  <input type="number" value={minWithdrawal} onChange={e => setMinWithdrawal(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-green-500 outline-none text-white font-black" />
                </div>
              </div>

              <button className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-green-500 transition-all uppercase tracking-widest text-[10px] shadow-xl">
                SAVE ALL CHANGES
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Songs & Users */}
        <div className="lg:col-span-2 space-y-8">
          {/* Song Management List */}
          <div className="glass-card p-8 rounded-[2.5rem] border border-white/5">
             <h2 className="text-lg font-black mb-6 uppercase italic flex items-center gap-3">
               <i className="fas fa-music text-purple-500"></i> Track Inventory
             </h2>
             <div className="max-h-[400px] overflow-y-auto no-scrollbar space-y-3">
                {state.tracks.map(track => (
                  <div key={track.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between gap-4">
                     <div className="flex items-center gap-4 min-w-0">
                        <img src={track.albumArt} alt="Art" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                        <div className="min-w-0">
                           <h4 className="text-white font-black text-sm truncate uppercase tracking-tighter italic">{track.title}</h4>
                           <p className="text-gray-500 text-[10px] uppercase font-bold truncate">@{track.artist} • ${track.earningUSD}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleTrackStatus(track.id)}
                          className={`p-2.5 rounded-xl text-xs transition-all ${track.enabled ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}
                          title={track.enabled ? "Enabled" : "Disabled"}
                        >
                           <i className={`fas ${track.enabled ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                        </button>
                        <button onClick={() => editTrack(track)} className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 text-xs"><i className="fas fa-edit"></i></button>
                        <button onClick={() => removeTrack(track.id)} className="p-2.5 rounded-xl bg-red-500/10 text-red-500 text-xs"><i className="fas fa-trash"></i></button>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          {/* User Management */}
          <div className="glass-card p-8 rounded-[2.5rem] border border-white/5">
            <h2 className="text-lg font-black mb-6 uppercase italic flex items-center gap-3">
              <i className="fas fa-user-friends text-blue-500"></i> Earner Directory
            </h2>
            <div className="max-h-[350px] overflow-y-auto no-scrollbar">
               <table className="w-full text-left">
                  <thead>
                     <tr className="text-[10px] text-gray-500 uppercase font-black border-b border-white/5">
                        <th className="pb-4">Earner</th>
                        <th className="pb-4">Plan</th>
                        <th className="pb-4">Balance</th>
                        <th className="pb-4">Plays (Today)</th>
                     </tr>
                  </thead>
                  <tbody>
                     {state.users.map(u => (
                       <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                          <td className="py-4">
                             <p className="font-black text-sm text-white">{u.username}</p>
                             <p className="text-[10px] text-gray-500 font-medium lowercase">{u.email}</p>
                          </td>
                          <td className="py-4">
                            <span className="text-[10px] font-black uppercase text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md">{u.plan}</span>
                          </td>
                          <td className="py-4 font-black text-green-500 text-sm">${u.balanceUSD.toFixed(2)}</td>
                          <td className="py-4 font-black text-white text-sm">
                             {u.songsListenedToday} / {PLAN_DETAILS[u.plan].songLimit === Infinity ? '∞' : PLAN_DETAILS[u.plan].songLimit}
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        </div>
      </div>

      {showAddSong && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl">
           <div className="glass-card max-w-lg w-full p-8 rounded-[3rem] border border-white/10 relative">
              <button onClick={() => { setShowAddSong(false); setEditingTrackId(null); }} className="absolute top-8 right-8 text-gray-500 hover:text-white"><i className="fas fa-times"></i></button>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-8 text-white">{editingTrackId ? 'Modify Song' : 'Deploy New Track'}</h3>
              <form onSubmit={handleAddTrack} className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Track Title" required value={newTrack.title} onChange={e => setNewTrack({...newTrack, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm font-bold outline-none" />
                    <input type="text" placeholder="Artist Name" required value={newTrack.artist} onChange={e => setNewTrack({...newTrack, artist: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm font-bold outline-none" />
                 </div>
                 <input type="text" placeholder="Direct MP3 Audio Link" required value={newTrack.url} onChange={e => setNewTrack({...newTrack, url: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm font-bold outline-none" />
                 <input type="text" placeholder="Cover Art Thumbnail Link" required value={newTrack.albumArt} onChange={e => setNewTrack({...newTrack, albumArt: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm font-bold outline-none" />
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Reward (USD)</label>
                       <input type="number" step="0.01" required value={newTrack.earningUSD} onChange={e => setNewTrack({...newTrack, earningUSD: parseFloat(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-black" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Genre</label>
                       <select value={newTrack.category} onChange={e => setNewTrack({...newTrack, category: e.target.value})} className="w-full h-[54px] bg-[#111] border border-white/10 rounded-xl px-4 text-white text-sm font-bold">
                          {SONG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                 </div>
                 <button type="submit" className="w-full bg-green-500 text-black font-black py-5 rounded-2xl uppercase tracking-widest shadow-xl mt-4 active:scale-95 transition-all">
                    {editingTrackId ? 'CONFIRM CHANGES' : 'PUBLISH TRACK'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
