
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
  const [withdrawalSchedule, setWithdrawalSchedule] = useState(state.settings.withdrawalSchedule);
  
  // Social Links
  const [tgAdmin, setTgAdmin] = useState(state.settings.telegramAdmin);
  const [tgChannel, setTgChannel] = useState(state.settings.telegramChannel);
  const [waLink, setWaLink] = useState(state.settings.whatsappLink);

  const [showAddSong, setShowAddSong] = useState(false);
  const [newTrack, setNewTrack] = useState<Partial<MusicTrack>>({
    title: '', artist: '', url: '', albumArt: '', duration: 60, earningUSD: 0.10, category: 'Trending'
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
    alert("Settings updated!");
  };

  const toggleWithdrawal = () => {
    onUpdateSettings({
      ...state.settings,
      isWithdrawalOpen: !state.settings.isWithdrawalOpen
    });
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
    setShowAddSong(false);
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
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Platform Admin</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Global Master Controls</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setShowAddSong(true)} className="bg-green-500 text-black font-black px-6 py-3 rounded-2xl hover:bg-green-400 transition-all uppercase tracking-widest text-xs flex items-center gap-2">
            <i className="fas fa-plus"></i> Upload Song
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-card p-8 rounded-[2.5rem] border border-white/5">
            <h2 className="text-lg font-black mb-6 uppercase italic flex items-center gap-3">
              <i className="fas fa-cog text-green-500"></i> Platform Rates
            </h2>
            <form onSubmit={handleUpdateSettings} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block">Exchange Rate (₦/$)</label>
                <input type="number" value={exchangeRate} onChange={e => setExchangeRate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-green-500 outline-none text-white font-black" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block">Withdrawal Status</label>
                <button type="button" onClick={toggleWithdrawal} className={`w-full py-4 rounded-xl font-black text-xs uppercase transition-all ${state.settings.isWithdrawalOpen ? 'bg-green-500 text-black' : 'bg-red-500/20 text-red-500'}`}>
                  {state.settings.isWithdrawalOpen ? 'Portal: OPEN' : 'Portal: CLOSED'}
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block">Schedule Message</label>
                <input type="text" value={withdrawalSchedule} onChange={e => setWithdrawalSchedule(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-green-500 outline-none text-white font-medium" />
              </div>
              
              <div className="pt-4 border-t border-white/5 space-y-4">
                 <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Social Links</h3>
                 <input type="text" placeholder="TG Admin" value={tgAdmin} onChange={e => setTgAdmin(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white" />
                 <input type="text" placeholder="TG Channel" value={tgChannel} onChange={e => setTgChannel(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white" />
                 <input type="text" placeholder="WA Link" value={waLink} onChange={e => setWaLink(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white" />
              </div>

              <button className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-green-500 transition-all uppercase tracking-widest text-[10px]">
                Sync All Changes
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8 rounded-[2.5rem] border border-white/5">
            <h2 className="text-lg font-black mb-6 uppercase italic flex items-center gap-3">
              <i className="fas fa-users text-blue-500"></i> Earner Registry
            </h2>
            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
               <table className="w-full text-left">
                  <thead>
                     <tr className="text-[10px] text-gray-500 uppercase font-black border-b border-white/5">
                        <th className="pb-4">User</th>
                        <th className="pb-4">Tier</th>
                        <th className="pb-4">Balance</th>
                        <th className="pb-4">Status</th>
                     </tr>
                  </thead>
                  <tbody>
                     {state.users.map(u => (
                       <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                          <td className="py-4">
                             <p className="font-bold text-sm text-white">{u.username}</p>
                             <p className="text-[10px] text-gray-500">{u.email}</p>
                          </td>
                          <td className="py-4 text-[10px] font-black uppercase text-blue-500">{u.plan}</td>
                          <td className="py-4 font-black text-green-500 text-sm">${u.balanceUSD.toFixed(2)}</td>
                          <td className="py-4">
                             <span className={`px-2 py-1 rounded text-[8px] font-black uppercase ${u.status === AccountStatus.ACTIVATED ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{u.status}</span>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] border border-white/5">
            <h2 className="text-lg font-black mb-6 uppercase italic flex items-center gap-3">
              <i className="fas fa-list text-purple-500"></i> Operation Queue
            </h2>
            <div className="space-y-4">
              {state.transactions.filter(t => t.status === TransactionStatus.PROCESSING).length === 0 ? (
                <p className="text-center py-10 text-gray-600 font-black uppercase text-xs tracking-widest">Queue Clear</p>
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

      {showAddSong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl">
           <div className="glass-card max-w-lg w-full p-8 rounded-[3rem] border border-white/10 relative">
              <button onClick={() => setShowAddSong(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white"><i className="fas fa-times"></i></button>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-8 text-white">Upload Track</h3>
              <form onSubmit={handleAddTrack} className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Title" required value={newTrack.title} onChange={e => setNewTrack({...newTrack, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold outline-none" />
                    <input type="text" placeholder="Artist" required value={newTrack.artist} onChange={e => setNewTrack({...newTrack, artist: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold outline-none" />
                 </div>
                 <input type="text" placeholder="Audio URL" required value={newTrack.url} onChange={e => setNewTrack({...newTrack, url: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold outline-none" />
                 <input type="text" placeholder="Album Art URL" required value={newTrack.albumArt} onChange={e => setNewTrack({...newTrack, albumArt: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold outline-none" />
                 <div className="grid grid-cols-2 gap-4">
                    <input type="number" step="0.01" required value={newTrack.earningUSD} onChange={e => setNewTrack({...newTrack, earningUSD: parseFloat(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-black" />
                    <select value={newTrack.category} onChange={e => setNewTrack({...newTrack, category: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-white font-bold">
                       {SONG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 <button type="submit" className="w-full bg-green-500 text-black font-black py-5 rounded-2xl uppercase tracking-widest shadow-xl mt-4">Publish Track</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
