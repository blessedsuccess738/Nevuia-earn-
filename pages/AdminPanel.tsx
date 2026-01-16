
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

type AdminTab = 'stats' | 'ops' | 'assets' | 'nodes' | 'sync';

const AdminPanel: React.FC<AdminPanelProps> = ({ state, onUpdateSettings, onUpdateTracks, setState, onSendMessage }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('stats');
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [settingsForm, setSettingsForm] = useState(state.settings);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [newTrack, setNewTrack] = useState<Partial<MusicTrack>>({
    title: '', artist: '', url: '', albumArt: 'N/A', duration: 45, earningUSD: 0.15, category: 'Spotify', enabled: true
  });

  const handleAddTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const track: MusicTrack = { 
      ...newTrack as MusicTrack, 
      id: Math.random().toString(36).substr(2, 9)
    };
    onUpdateTracks([...state.tracks, track]);
    setShowAddTrack(false);
    setNewTrack({ title: '', artist: '', url: '', albumArt: 'N/A', duration: 45, earningUSD: 0.15, category: 'Spotify', enabled: true });
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

  const handleUserUpdate = (userId: string, updates: Partial<User>) => {
    setState((prev: any) => ({
      ...prev,
      users: prev.users.map((u: User) => u.id === userId ? { ...u, ...updates } : u)
    }));
    if (editingUser?.id === userId) {
      setEditingUser(prev => prev ? ({ ...prev, ...updates }) : null);
    }
  };

  const handleManualReset = (userId: string) => {
    handleUserUpdate(userId, { songsListenedToday: 0, dailyEarnings: 0, playedTracksToday: [] });
    alert("User session reset successful.");
  };

  return (
    <div className="flex-grow pb-32 px-5 pt-4 w-full space-y-6 page-enter">
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">Root Console</h1>
        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 overflow-x-auto no-scrollbar gap-1 shadow-inner">
          {(['stats', 'ops', 'assets', 'nodes', 'sync'] as AdminTab[]).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-grow ${activeTab === tab ? 'bg-white text-black shadow-lg' : 'text-gray-500'}`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'stats' && (
        <div className="grid grid-cols-2 gap-4">
           <div className="glass-card p-6 rounded-[2rem] border border-white/5 text-center shadow-xl">
              <p className="text-[8px] text-gray-500 font-black uppercase mb-1">Ecosystem Liquidity</p>
              <h2 className="text-xl font-black text-white">${state.users.reduce((acc, u) => acc + u.balanceUSD, 0).toFixed(2)}</h2>
           </div>
           <div className="glass-card p-6 rounded-[2rem] border border-white/5 text-center shadow-xl">
              <p className="text-[8px] text-gray-500 font-black uppercase mb-1">Network Nodes</p>
              <h2 className="text-xl font-black text-white">{state.users.length}</h2>
           </div>
           <div className="glass-card p-6 rounded-[2rem] border border-white/5 text-center shadow-xl col-span-2">
              <p className="text-[8px] text-gray-500 font-black uppercase mb-1">Audio Pools Synced</p>
              <h2 className="text-2xl font-black text-green-500">{state.tracks.length}</h2>
           </div>
        </div>
      )}

      {activeTab === 'ops' && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase italic text-gray-500 px-2 tracking-[0.2em]">Pending Requests</h3>
          {state.transactions.filter(t => t.status === TransactionStatus.PROCESSING).length === 0 ? (
             <div className="py-20 text-center opacity-20 text-[10px] font-black uppercase tracking-widest italic">Mainframe clear.</div>
          ) : state.transactions.filter(t => t.status === TransactionStatus.PROCESSING).map(txn => {
            const u = state.users.find(u => u.id === txn.userId);
            return (
              <div key={txn.id} className="glass-card p-5 rounded-3xl border border-white/5 flex flex-col gap-4 shadow-2xl">
                <div className="flex justify-between items-start">
                   <div>
                      <p className={`text-[8px] font-black uppercase mb-1 px-2 py-0.5 rounded-full inline-block ${txn.type === 'WITHDRAWAL' ? 'bg-blue-600/10 text-blue-500' : 'bg-green-600/10 text-green-500'}`}>{txn.type}</p>
                      <h4 className="text-white font-black text-sm uppercase italic mt-1">@{u?.username || 'Node'}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">${txn.amountUSD.toFixed(2)} • {txn.details}</p>
                   </div>
                   <p className="text-[8px] text-gray-600 font-black uppercase">{new Date(txn.timestamp).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => handleTxnAction(txn.id, TransactionStatus.APPROVED)} className="flex-grow bg-white text-black py-4 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 shadow-lg">APPROVE</button>
                   <button onClick={() => handleTxnAction(txn.id, TransactionStatus.REJECTED)} className="flex-grow bg-red-500/10 text-red-500 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95">REJECT</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'assets' && (
        <div className="space-y-4">
          <button onClick={() => setShowAddTrack(true)} className="w-full py-5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all">START ECOSYSTEM SYNC</button>
          <div className="grid grid-cols-1 gap-3">
             {state.tracks.map(t => (
               <div key={t.id} className="glass-card p-4 rounded-3xl border border-white/5 flex items-center gap-4 shadow-lg">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 text-green-500 shadow-inner">
                     <i className="fas fa-headphones text-lg"></i>
                  </div>
                  <div className="flex-grow min-w-0">
                     <h4 className="text-white font-black text-xs uppercase truncate italic">{t.title}</h4>
                     <p className="text-[8px] text-gray-500 font-bold uppercase truncate">{t.artist} • +${t.earningUSD.toFixed(2)}</p>
                  </div>
                  <button onClick={() => onUpdateTracks(state.tracks.filter(tr => tr.id !== t.id))} className="text-red-500/30 hover:text-red-500 p-2 transition-colors"><i className="fas fa-trash-alt text-xs"></i></button>
               </div>
             ))}
          </div>
        </div>
      )}

      {activeTab === 'nodes' && (
        <div className="space-y-3">
           <h3 className="text-[10px] font-black uppercase italic text-gray-500 px-2 tracking-[0.2em]">Node Registry</h3>
           {state.users.map(u => (
              <div key={u.id} className="glass-card p-4 rounded-3xl border border-white/5 flex items-center justify-between shadow-lg">
                 <div>
                    <h4 className="text-white font-black text-xs uppercase italic tracking-tight">@{u.username}</h4>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">${u.balanceUSD.toFixed(2)} • {u.plan}</p>
                 </div>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingUser(u)}
                      className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 border border-white/10 active:scale-90"
                    >
                       <i className="fas fa-edit text-[10px]"></i>
                    </button>
                    <button 
                      onClick={() => handleUserUpdate(u.id, { status: u.status === AccountStatus.BANNED ? AccountStatus.ACTIVATED : AccountStatus.BANNED })}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border active:scale-90 transition-all ${u.status === AccountStatus.BANNED ? 'bg-red-500 border-transparent text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                    >
                       <i className="fas fa-ban text-[10px]"></i>
                    </button>
                 </div>
              </div>
           ))}
        </div>
      )}

      {activeTab === 'sync' && (
        <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 space-y-8 shadow-2xl">
           <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Mainframe Config</h3>
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest ml-2">Settlement Schedule</label>
                 <input type="text" value={settingsForm.withdrawalSchedule} onChange={e => setSettingsForm({...settingsForm, withdrawalSchedule: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white font-bold text-xs outline-none focus:border-green-500 shadow-inner" />
              </div>
              <div className="space-y-2">
                 <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest ml-2">Ecosystem Exchange (USD/NGN)</label>
                 <input type="number" value={settingsForm.usdToNgnRate} onChange={e => setSettingsForm({...settingsForm, usdToNgnRate: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white font-bold text-xs outline-none focus:border-green-500 shadow-inner" />
              </div>
              <div className="space-y-2">
                 <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest ml-2">Protocol Ticker Message</label>
                 <textarea value={settingsForm.announcementContent} onChange={e => setSettingsForm({...settingsForm, announcementContent: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white font-bold text-xs outline-none focus:border-green-500 h-24 shadow-inner" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => setSettingsForm({...settingsForm, isWithdrawalOpen: !settingsForm.isWithdrawalOpen})} className={`py-5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${settingsForm.isWithdrawalOpen ? 'bg-green-500/10 text-green-500 border border-green-500/20 shadow-lg' : 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-lg'}`}>
                    GATEWAY: {settingsForm.isWithdrawalOpen ? 'ONLINE' : 'LOCKED'}
                 </button>
                 <button onClick={() => onUpdateSettings(settingsForm)} className="bg-white text-black py-5 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg">COMMIT SYNC</button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL: EDIT USER (FULL CONTROL) */}
      {editingUser && (
        <div className="fixed inset-0 z-[200] bg-black/95 p-6 backdrop-blur-3xl animate-in fade-in duration-300 flex items-center justify-center">
           <div className="glass-card max-w-sm w-full p-8 rounded-[3rem] border border-white/10 relative shadow-2xl pop-notification">
              <button onClick={() => setEditingUser(null)} className="absolute top-8 right-8 text-gray-500"><i className="fas fa-times"></i></button>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-8 leading-none">Node Overwrite</h3>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[9px] text-gray-500 font-black uppercase ml-2 tracking-widest">Global Balance ($)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={editingUser.balanceUSD} 
                      onChange={e => handleUserUpdate(editingUser.id, { balanceUSD: parseFloat(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white font-bold text-xs shadow-inner"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] text-gray-500 font-black uppercase ml-2 tracking-widest">Tier Rank</label>
                    <select 
                      value={editingUser.plan}
                      onChange={e => handleUserUpdate(editingUser.id, { plan: e.target.value as PlanTier })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-black text-[9px] uppercase tracking-widest shadow-inner appearance-none"
                    >
                       <option value={PlanTier.FREE}>FREE NODE</option>
                       <option value={PlanTier.BASIC}>BASIC NODE</option>
                       <option value={PlanTier.STANDARD}>STANDARD NODE</option>
                       <option value={PlanTier.PREMIUM}>PREMIUM NODE</option>
                    </select>
                 </div>
                 <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => handleManualReset(editingUser.id)}
                      className="w-full bg-yellow-600/10 text-yellow-500 py-4 rounded-xl font-black uppercase tracking-widest text-[9px] border border-yellow-500/20"
                    >
                       Reset Daily Yield Counters
                    </button>
                    <button 
                      onClick={() => { onSendMessage("Your account has been updated by administration.", true, editingUser.id); alert("System ping sent."); }}
                      className="w-full bg-blue-600/10 text-blue-500 py-4 rounded-xl font-black uppercase tracking-widest text-[9px] border border-blue-500/20"
                    >
                       Ping Node Terminal
                    </button>
                 </div>
                 <button onClick={() => setEditingUser(null)} className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] mt-2 active:scale-95 shadow-xl">Close Terminal</button>
              </div>
           </div>
        </div>
      )}

      {showAddTrack && (
        <div className="fixed inset-0 z-[150] bg-black/95 p-6 backdrop-blur-3xl animate-in fade-in duration-300 flex items-center justify-center">
           <div className="glass-card max-w-sm w-full p-8 rounded-[3rem] border border-white/10 relative shadow-2xl pop-notification">
              <button onClick={() => setShowAddTrack(false)} className="absolute top-8 right-8 text-gray-500"><i className="fas fa-times"></i></button>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-8 leading-none">Inject Asset</h3>
              <form onSubmit={handleAddTrack} className="space-y-4">
                 <input type="text" required placeholder="Audio Title" value={newTrack.title} onChange={e => setNewTrack({...newTrack, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white font-bold text-xs shadow-inner" />
                 <input type="text" required placeholder="Network Provider" value={newTrack.artist} onChange={e => setNewTrack({...newTrack, artist: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white font-bold text-xs shadow-inner" />
                 <input type="text" required placeholder="Direct Stream Link" value={newTrack.url} onChange={e => setNewTrack({...newTrack, url: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white font-bold text-xs shadow-inner" />
                 <div className="grid grid-cols-2 gap-3">
                    <input type="number" step="0.01" required placeholder="Earning ($)" value={newTrack.earningUSD} onChange={e => setNewTrack({...newTrack, earningUSD: parseFloat(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white font-bold text-xs shadow-inner" />
                    <select value={newTrack.category} onChange={e => setNewTrack({...newTrack, category: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white font-black text-[9px] uppercase tracking-widest shadow-inner appearance-none">
                       <option value="Spotify">Spotify</option>
                       <option value="Boomplay">Boomplay</option>
                       <option value="Audiomack">Audiomack</option>
                       <option value="Apple Music">Apple Music</option>
                    </select>
                 </div>
                 <button type="submit" className="w-full bg-green-500 text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] mt-6 shadow-2xl active:scale-95">START SYNC</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
