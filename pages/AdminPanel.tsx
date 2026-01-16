
import React, { useState, useRef, useEffect } from 'react';
import { User, Transaction, AppSettings, AccountStatus, TransactionStatus, PlanTier, MusicTrack, Message, Notification, AdminNotification } from '../types';

interface AdminPanelProps {
  state: {
    users: User[];
    transactions: Transaction[];
    settings: AppSettings;
    tracks: MusicTrack[];
    messages: Message[];
    adminNotifications: AdminNotification[];
  };
  onUpdateSettings: (settings: AppSettings) => void;
  onUpdateTracks: (tracks: MusicTrack[]) => void;
  setState: React.Dispatch<React.SetStateAction<any>>;
  onSendMessage: (text: string, isAdmin: boolean, targetUserId: string) => void;
}

type AdminTab = 'analytics' | 'transactions' | 'tracks' | 'settings';

const AdminPanel: React.FC<AdminPanelProps> = ({ state, onUpdateSettings, onUpdateTracks, setState, onSendMessage }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [settingsForm, setSettingsForm] = useState(state.settings);

  const [newTrack, setNewTrack] = useState<Partial<MusicTrack>>({
    title: '', artist: '', url: '', albumArt: '', duration: 60, earningUSD: 0.10, category: 'Spotify', enabled: true
  });

  const handleAddTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const track: MusicTrack = { ...newTrack as MusicTrack, id: Math.random().toString(36).substr(2, 9) };
    onUpdateTracks([...state.tracks, track]);
    setShowAddTrack(false);
    setNewTrack({ title: '', artist: '', url: '', albumArt: '', duration: 60, earningUSD: 0.10, category: 'Spotify', enabled: true });
  };

  const handleTxnAction = (txnId: string, status: TransactionStatus) => {
    const txn = state.transactions.find(t => t.id === txnId);
    if (!txn) return;
    setState((prev: any) => ({
      ...prev,
      transactions: prev.transactions.map((t: Transaction) => t.id === txnId ? { ...t, status } : t)
    }));
    
    if (status === TransactionStatus.APPROVED && txn.type === 'ACTIVATION' && txn.planRequested) {
      setState((prev: any) => ({
        ...prev,
        users: prev.users.map((u: User) => u.id === txn.userId ? { ...u, status: AccountStatus.ACTIVATED, plan: txn.planRequested! } : u)
      }));
    }
  };

  return (
    <div className="flex-grow pb-32 px-4 pt-6 max-w-lg mx-auto w-full space-y-6">
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">Protocol Admin</h1>
        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 overflow-x-auto no-scrollbar">
          {(['analytics', 'transactions', 'tracks', 'settings'] as AdminTab[]).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-grow ${activeTab === tab ? 'bg-white text-black' : 'text-gray-500'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-2 gap-4">
           <div className="glass-card p-6 rounded-3xl border border-white/5 text-center">
              <p className="text-[8px] text-gray-500 font-black uppercase mb-1">Network Liquidity</p>
              <h2 className="text-xl font-black text-white">${state.users.reduce((acc, u) => acc + u.balanceUSD, 0).toFixed(2)}</h2>
           </div>
           <div className="glass-card p-6 rounded-3xl border border-white/5 text-center">
              <p className="text-[8px] text-gray-500 font-black uppercase mb-1">Active Nodes</p>
              <h2 className="text-xl font-black text-white">{state.users.length}</h2>
           </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase italic text-gray-400 px-2">Pending Ops</h3>
          {state.transactions.filter(t => t.status === TransactionStatus.PROCESSING).map(txn => {
            const u = state.users.find(u => u.id === txn.userId);
            return (
              <div key={txn.id} className="glass-card p-5 rounded-3xl border border-white/5 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                   <div>
                      <p className="text-[8px] font-black uppercase text-green-500 mb-1">{txn.type}</p>
                      <h4 className="text-white font-black text-sm">@{u?.username || 'Node'}</h4>
                      <p className="text-[9px] text-gray-500 uppercase font-bold">${txn.amountUSD.toFixed(2)}</p>
                   </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => handleTxnAction(txn.id, TransactionStatus.APPROVED)} className="flex-grow bg-green-500 text-black py-3 rounded-xl text-[9px] font-black uppercase tracking-widest">Approve</button>
                   <button onClick={() => handleTxnAction(txn.id, TransactionStatus.REJECTED)} className="flex-grow bg-red-500/10 text-red-500 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest">Reject</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'tracks' && (
        <div className="space-y-4">
          <button onClick={() => setShowAddTrack(true)} className="w-full py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest">Deploy New Asset</button>
          <div className="grid grid-cols-1 gap-3">
             {state.tracks.map(t => (
               <div key={t.id} className="glass-card p-4 rounded-3xl border border-white/5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                     <i className="fas fa-headphones text-green-500"></i>
                  </div>
                  <div className="flex-grow min-w-0">
                     <h4 className="text-white font-black text-xs uppercase truncate italic">{t.title}</h4>
                     <p className="text-[8px] text-gray-500 font-bold uppercase">{t.artist}</p>
                  </div>
                  <button onClick={() => onUpdateTracks(state.tracks.filter(tr => tr.id !== t.id))} className="text-red-500/50 hover:text-red-500 p-2"><i className="fas fa-trash-alt text-xs"></i></button>
               </div>
             ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-6">
           <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Global Params</h3>
           <div className="space-y-4">
              <div className="space-y-2">
                 <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Withdrawal Schedule</label>
                 <input type="text" value={settingsForm.withdrawalSchedule} onChange={e => setSettingsForm({...settingsForm, withdrawalSchedule: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-xs" placeholder="e.g. Fridays & Mondays Only" />
              </div>
              <div className="space-y-2">
                 <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest">USD to NGN Rate</label>
                 <input type="number" value={settingsForm.usdToNgnRate} onChange={e => setSettingsForm({...settingsForm, usdToNgnRate: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => setSettingsForm({...settingsForm, isWithdrawalOpen: !settingsForm.isWithdrawalOpen})} className={`py-4 rounded-xl text-[9px] font-black uppercase tracking-widest ${settingsForm.isWithdrawalOpen ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    Gateway: {settingsForm.isWithdrawalOpen ? 'OPEN' : 'CLOSED'}
                 </button>
                 <button onClick={() => onUpdateSettings(settingsForm)} className="bg-white text-black py-4 rounded-xl text-[9px] font-black uppercase tracking-widest">Apply Sync</button>
              </div>
           </div>
        </div>
      )}

      {showAddTrack && (
        <div className="fixed inset-0 z-[100] bg-black/95 p-6 backdrop-blur-3xl animate-in fade-in duration-300 flex items-center justify-center">
           <div className="glass-card max-w-sm w-full p-8 rounded-[3rem] border border-white/10 relative">
              <button onClick={() => setShowAddTrack(false)} className="absolute top-8 right-8 text-gray-500"><i className="fas fa-times"></i></button>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-8">Deploy Asset</h3>
              <form onSubmit={handleAddTrack} className="space-y-4">
                 <input type="text" required placeholder="Track Title" value={newTrack.title} onChange={e => setNewTrack({...newTrack, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-xs" />
                 <input type="text" required placeholder="Artist Name" value={newTrack.artist} onChange={e => setNewTrack({...newTrack, artist: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-xs" />
                 <input type="text" required placeholder="Audio Link (MP3)" value={newTrack.url} onChange={e => setNewTrack({...newTrack, url: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-xs" />
                 <div className="grid grid-cols-2 gap-3">
                    <input type="number" step="0.01" required placeholder="Earnings ($)" value={newTrack.earningUSD} onChange={e => setNewTrack({...newTrack, earningUSD: parseFloat(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-xs" />
                    <select value={newTrack.category} onChange={e => setNewTrack({...newTrack, category: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-3 text-white font-bold text-xs appearance-none">
                       <option value="Spotify">Spotify</option>
                       <option value="Boomplay">Boomplay</option>
                       <option value="Audiomack">Audiomack</option>
                       <option value="Apple Music">Apple Music</option>
                    </select>
                 </div>
                 <button type="submit" className="w-full bg-green-500 text-black py-4 rounded-xl font-black uppercase tracking-widest text-[10px] mt-4">Initialize Protocol</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
