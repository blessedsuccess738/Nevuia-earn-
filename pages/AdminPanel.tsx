
import React, { useState } from 'react';
import { User, Transaction, AppSettings, AccountStatus, TransactionStatus, PlanTier, MusicTrack } from '../types';
import { SONG_CATEGORIES } from '../constants';

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

  // Track Management State
  const [showAddSong, setShowAddSong] = useState(false);
  const [newTrack, setNewTrack] = useState<Partial<MusicTrack>>({
    title: '',
    artist: '',
    url: '',
    albumArt: '',
    duration: 60,
    earningUSD: 0.10,
    category: 'Trending'
  });

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...state.settings,
      usdToNgnRate: parseFloat(exchangeRate),
      minWithdrawalNGN: parseFloat(minWithdrawal),
    });
    alert("Settings updated!");
  };

  const handleAddTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const track: MusicTrack = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTrack.title || 'Untitled',
      artist: newTrack.artist || 'Unknown',
      url: newTrack.url || '',
      albumArt: newTrack.albumArt || 'https://via.placeholder.com/300',
      duration: newTrack.duration || 60,
      earningUSD: newTrack.earningUSD || 0.10,
      category: newTrack.category || 'Trending'
    };
    onUpdateTracks([...state.tracks, track]);
    setNewTrack({
      title: '',
      artist: '',
      url: '',
      albumArt: '',
      duration: 60,
      earningUSD: 0.10,
      category: 'Trending'
    });
    setShowAddSong(false);
  };

  const deleteTrack = (id: string) => {
    if (confirm("Delete this track?")) {
      onUpdateTracks(state.tracks.filter(t => t.id !== id));
    }
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Platform Admin</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Global Master Controls</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowAddSong(true)}
            className="bg-green-500 text-black font-black px-6 py-3 rounded-2xl hover:bg-green-400 transition-all uppercase tracking-widest text-xs flex items-center gap-2"
          >
            <i className="fas fa-plus"></i> Upload Song
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Column */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-card p-8 rounded-[2.5rem] border border-white/5">
            <h2 className="text-lg font-black mb-6 uppercase italic flex items-center gap-3">
              <i className="fas fa-cog text-green-500"></i> Platform Rates
            </h2>
            <form onSubmit={handleUpdateSettings} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block">USD to Naira Rate</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                  <input 
                    type="number" 
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-6 py-4 focus:border-green-500 outline-none text-white font-black"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block">Min Withdrawal (₦)</label>
                <input 
                  type="number" 
                  value={minWithdrawal}
                  onChange={(e) => setMinWithdrawal(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-green-500 outline-none text-white font-black"
                />
              </div>
              <button className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-green-500 transition-all uppercase tracking-widest text-[10px]">
                Sync Platform Config
              </button>
            </form>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] border border-white/5">
             <h2 className="text-lg font-black mb-4 uppercase italic">Stats Overview</h2>
             <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-white/5">
                   <span className="text-gray-500 text-xs font-bold uppercase">Total Users</span>
                   <span className="text-white font-black">{state.users.length}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                   <span className="text-gray-500 text-xs font-bold uppercase">Tracks Online</span>
                   <span className="text-white font-black">{state.tracks.length}</span>
                </div>
                <div className="flex justify-between py-2">
                   <span className="text-gray-500 text-xs font-bold uppercase">Active Queue</span>
                   <span className="text-blue-500 font-black">{state.transactions.filter(t => t.status === TransactionStatus.PROCESSING).length}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Tracks List Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8 rounded-[2.5rem] border border-white/5">
            <h2 className="text-lg font-black mb-6 uppercase italic flex items-center gap-3">
              <i className="fas fa-music text-blue-500"></i> Track Catalog
            </h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
               {state.tracks.length === 0 ? (
                 <div className="text-center py-20 text-gray-500 uppercase text-xs font-black tracking-widest opacity-30">Catalog is empty</div>
               ) : (
                 state.tracks.map(track => (
                   <div key={track.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                         <img src={track.albumArt} className="w-12 h-12 rounded-xl object-cover" alt="" />
                         <div className="min-w-0">
                            <h4 className="text-white font-black text-sm truncate">{track.title}</h4>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-tight">{track.artist} • {track.category}</p>
                            <p className="text-green-500 text-[9px] font-black uppercase tracking-widest mt-1">${track.earningUSD.toFixed(2)} / Song</p>
                         </div>
                      </div>
                      <button onClick={() => deleteTrack(track.id)} className="text-red-500/50 hover:text-red-500 p-2">
                         <i className="fas fa-trash"></i>
                      </button>
                   </div>
                 ))
               )}
            </div>
          </div>

          {/* Operational Queue */}
          <div className="glass-card p-8 rounded-[2.5rem] border border-white/5">
            <h2 className="text-lg font-black mb-6 uppercase italic flex items-center gap-3">
              <i className="fas fa-list text-purple-500"></i> Activation & Wallet Queue
            </h2>
            <div className="space-y-4">
              {state.transactions.filter(t => t.status === TransactionStatus.PROCESSING).length === 0 ? (
                <p className="text-center py-10 text-gray-600 font-black uppercase text-xs tracking-widest">No pending items.</p>
              ) : (
                state.transactions.filter(t => t.status === TransactionStatus.PROCESSING).map(txn => {
                  const user = state.users.find(u => u.id === txn.userId);
                  return (
                    <div key={txn.id} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase text-purple-500">{txn.type}</span>
                          <span className="text-white font-bold text-sm">@{user?.username}</span>
                        </div>
                        <p className="text-2xl font-black text-white">₦{(txn.amountUSD * state.settings.usdToNgnRate).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => updateTxnStatus(txn.id, TransactionStatus.APPROVED)} className="bg-green-500 text-black font-black px-4 py-2 rounded-lg text-[10px] uppercase">Approve</button>
                        <button onClick={() => updateTxnStatus(txn.id, TransactionStatus.REJECTED)} className="bg-red-500/20 text-red-500 font-black px-4 py-2 rounded-lg text-[10px] uppercase border border-red-500/20">Reject</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Track Modal */}
      {showAddSong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl">
           <div className="glass-card max-w-lg w-full p-8 rounded-[3rem] border border-white/10 relative">
              <button onClick={() => setShowAddSong(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white">
                 <i className="fas fa-times"></i>
              </button>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-8">Upload New Track</h3>
              <form onSubmit={handleAddTrack} className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" placeholder="Song Title" required 
                      value={newTrack.title} onChange={e => setNewTrack({...newTrack, title: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-green-500"
                    />
                    <input 
                      type="text" placeholder="Artist" required 
                      value={newTrack.artist} onChange={e => setNewTrack({...newTrack, artist: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-green-500"
                    />
                 </div>
                 <input 
                    type="text" placeholder="Audio URL (Direct MP3 Link)" required 
                    value={newTrack.url} onChange={e => setNewTrack({...newTrack, url: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-green-500"
                 />
                 <input 
                    type="text" placeholder="Album Art URL (Image Link)" required 
                    value={newTrack.albumArt} onChange={e => setNewTrack({...newTrack, albumArt: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-green-500"
                 />
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-2">Earnings (USD)</label>
                       <input 
                          type="number" step="0.01" required 
                          value={newTrack.earningUSD} onChange={e => setNewTrack({...newTrack, earningUSD: parseFloat(e.target.value)})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-black outline-none focus:border-green-500"
                       />
                    </div>
                    <div>
                       <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-2">Category</label>
                       <select 
                          value={newTrack.category} onChange={e => setNewTrack({...newTrack, category: e.target.value})}
                          className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-white font-bold outline-none"
                       >
                          {SONG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                 </div>
                 <button type="submit" className="w-full bg-green-500 text-black font-black py-5 rounded-2xl hover:bg-green-400 transition-all uppercase tracking-widest shadow-xl mt-4">
                    Publish Track Online
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
