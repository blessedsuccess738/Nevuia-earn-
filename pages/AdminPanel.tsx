
import React, { useState } from 'react';
import { User, Transaction, AppSettings, AccountStatus, TransactionStatus, PlanTier, MusicTrack, Message } from '../types';
import { SONG_CATEGORIES, PLAN_DETAILS } from '../constants';

interface AdminPanelProps {
  state: {
    users: User[];
    transactions: Transaction[];
    settings: AppSettings;
    tracks: MusicTrack[];
    messages: Message[];
  };
  onUpdateSettings: (settings: AppSettings) => void;
  onUpdateTracks: (tracks: MusicTrack[]) => void;
  setState: React.Dispatch<React.SetStateAction<any>>;
}

type AdminTab = 'analytics' | 'transactions' | 'tracks' | 'users' | 'support' | 'settings';

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

  const adjustBalance = (userId: string) => {
    const amountStr = prompt("Enter amount to adjust (can be negative to subtract):", "0");
    if (amountStr === null) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount)) return;

    setState((prev: any) => ({
      ...prev,
      users: prev.users.map((u: User) => u.id === userId ? { ...u, balanceUSD: u.balanceUSD + amount } : u)
    }));
  };

  const toggleWithdrawalControl = (userId: string) => {
    setState((prev: any) => ({
      ...prev,
      users: prev.users.map((u: User) => u.id === userId ? { ...u, withdrawalEnabled: !u.withdrawalEnabled } : u)
    }));
  };

  const clearMessages = () => {
    if(confirm("Delete all support messages?")) {
      setState((prev: any) => ({ ...prev, messages: [] }));
    }
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
          {(['analytics', 'transactions', 'tracks', 'users', 'support', 'settings'] as AdminTab[]).map(tab => (
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
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-6 animate-in fade-in duration-500">
           <div className="glass-card rounded-[3rem] border border-white/5 overflow-hidden">
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
                                  <button onClick={() => handleTxnAction(t.id, TransactionStatus.REJECTED)} className="bg-red-500/10 text-red-500 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all tracking-widest border border-red-500/10">Decline</button>
                               </td>
                            </tr>
                          );
                       })}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in duration-500">
           <div className="glass-card rounded-[3rem] border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="text-[9px] font-black text-gray-600 uppercase tracking-widest border-b border-white/5 bg-black/40">
                       <tr>
                          <th className="p-8">Digital Identity</th>
                          <th className="p-8">Asset Holding</th>
                          <th className="p-8">Withdraw Switch</th>
                          <th className="p-8 text-right">Terminal Actions</th>
                       </tr>
                    </thead>
                    <tbody className="text-[11px] font-black">
                       {filteredUsers.map(u => (
                          <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 group">
                             <td className="p-8">
                                <p className="text-white uppercase italic text-sm">{u.username}</p>
                                <p className="text-[10px] text-gray-600 font-medium mt-0.5">{u.email}</p>
                             </td>
                             <td className="p-8">
                                <p className="text-xl font-black text-white">${u.balanceUSD.toFixed(2)}</p>
                             </td>
                             <td className="p-8">
                                <button 
                                  onClick={() => toggleWithdrawalControl(u.id)}
                                  className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${u.withdrawalEnabled ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
                                >
                                   {u.withdrawalEnabled ? 'ALLOWED' : 'LOCKED'}
                                </button>
                             </td>
                             <td className="p-8 text-right space-x-2">
                                <button onClick={() => adjustBalance(u.id)} className="p-3 rounded-2xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all"><i className="fas fa-edit"></i> Edit Bal</button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'support' && (
         <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-black uppercase italic tracking-tighter">Support Terminal</h3>
               <button onClick={clearMessages} className="text-red-500 font-black text-[10px] uppercase tracking-widest">Wipe Data</button>
            </div>
            {state.messages.length === 0 ? (
               <div className="glass-card p-32 rounded-[4rem] text-center opacity-20 italic uppercase text-[10px] font-black tracking-widest">No communications currently logged.</div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {state.messages.map(msg => (
                     <div key={msg.id} className="glass-card p-8 rounded-[3rem] border border-white/5 space-y-4">
                        <div className="flex justify-between items-start">
                           <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">@{msg.username}</span>
                           <span className="text-[8px] font-bold text-gray-600">{new Date(msg.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-white text-sm font-bold leading-relaxed">{msg.text}</p>
                        <div className="pt-4 border-t border-white/5 flex gap-2">
                           <a href={`mailto:${state.users.find(u => u.id === msg.userId)?.email}`} className="flex-grow bg-white/5 text-center py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Reply Email</a>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500 pb-20">
           <div className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-8 lg:col-span-3">
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Terminal Configurations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase font-black ml-1">WhatsApp Official</label>
                    <input type="text" value={settingsForm.whatsappLink} onChange={e => setSettingsForm({...settingsForm, whatsappLink: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" placeholder="https://wa.me/..." />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Telegram Official Admin</label>
                    <input type="text" value={settingsForm.telegramAdmin} onChange={e => setSettingsForm({...settingsForm, telegramAdmin: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" placeholder="https://t.me/..." />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Telegram Official Channel</label>
                    <input type="text" value={settingsForm.telegramChannel} onChange={e => setSettingsForm({...settingsForm, telegramChannel: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" placeholder="https://t.me/..." />
                 </div>
              </div>
              <div className="flex gap-4 pt-4 border-t border-white/5">
                 <button onClick={() => onUpdateSettings(settingsForm)} className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-500 transition-all">Update Authority Hub</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
