
import React, { useState, useRef, useEffect } from 'react';
import { User, Transaction, AppSettings, AccountStatus, TransactionStatus, PlanTier, MusicTrack, Message, Notification, AdminNotification } from '../types';
import { SONG_CATEGORIES, PLAN_DETAILS } from '../constants';

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

type AdminTab = 'analytics' | 'transactions' | 'tracks' | 'users' | 'support' | 'settings';

const AdminPanel: React.FC<AdminPanelProps> = ({ state, onUpdateSettings, onUpdateTracks, setState, onSendMessage }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showAddSong, setShowAddSong] = useState(false);
  const [showAdminAlerts, setShowAdminAlerts] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [activeChatUser, setActiveChatUser] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [newTrack, setNewTrack] = useState<Partial<MusicTrack>>({
    title: '', artist: '', url: '', albumArt: '', duration: 60, earningUSD: 0.10, category: 'Trending', enabled: true
  });

  const [settingsForm, setSettingsForm] = useState(state.settings);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, activeChatUser]);

  const totalPlatformBalance = state.users.reduce((acc, u) => acc + u.balanceUSD, 0);
  const pendingTransactions = state.transactions.filter(t => t.status === TransactionStatus.PROCESSING);
  const totalPendingUSD = pendingTransactions.reduce((acc, t) => acc + t.amountUSD, 0);
  const activeEarnersCount = state.users.filter(u => u.status === AccountStatus.ACTIVATED).length;
  const unreadAlertsCount = state.adminNotifications.filter(n => !n.read).length;
  const unreadMessagesCount = state.messages.filter(m => !m.read).length;

  const pushNotification = (userId: string, title: string, message: string) => {
    const notification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false
    };
    setState((prev: any) => ({
      ...prev,
      users: prev.users.map((u: User) => u.id === userId ? { ...u, notifications: [notification, ...(u.notifications || [])] } : u)
    }));
  };

  const broadcastAnnouncement = () => {
    if (!settingsForm.announcementSubject || !settingsForm.announcementContent) {
      alert("Please fill in both Subject and Talk content before broadcasting.");
      return;
    }
    
    if (confirm("Broadcast this announcement to ALL users? It will appear in their private notification vaults.")) {
      setState((prev: any) => ({
        ...prev,
        users: prev.users.map((u: User) => ({
          ...u,
          notifications: [
            {
              id: Math.random().toString(36).substr(2, 9),
              title: settingsForm.announcementSubject,
              message: settingsForm.announcementContent,
              timestamp: new Date().toISOString(),
              read: false
            },
            ...u.notifications
          ]
        }))
      }));
      alert("Broadcast successful. All users have been notified.");
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
      pushNotification(txn.userId, 'Account Activated', `Your ${requestedPlan} plan is now live! Start earning today.`);
    } else if (txn.type === 'WITHDRAWAL' && status === TransactionStatus.REJECTED) {
      setState((prev: any) => ({
        ...prev,
        users: prev.users.map((u: User) => u.id === txn.userId ? { ...u, balanceUSD: u.balanceUSD + txn.amountUSD } : u),
        transactions: prev.transactions.map((t: Transaction) => t.id === txnId ? { ...t, status } : t)
      }));
      pushNotification(txn.userId, 'Withdrawal Declined', `Your withdrawal of $${txn.amountUSD.toFixed(2)} was rejected and refunded to your vault.`);
    } else if (txn.type === 'WITHDRAWAL' && status === TransactionStatus.APPROVED) {
      setState((prev: any) => ({
        ...prev,
        transactions: prev.transactions.map((t: Transaction) => t.id === txnId ? { ...t, status } : t)
      }));
      pushNotification(txn.userId, 'Withdrawal Successful', `Your payout of $${txn.amountUSD.toFixed(2)} has been processed to your bank.`);
    } else {
      setState((prev: any) => ({
        ...prev,
        transactions: prev.transactions.map((t: Transaction) => t.id === txnId ? { ...t, status } : t)
      }));
    }
  };

  const markAlertsAsRead = () => {
    setState((prev: any) => ({
      ...prev,
      adminNotifications: prev.adminNotifications.map((n: AdminNotification) => ({ ...n, read: true }))
    }));
  };

  const markMessagesAsRead = () => {
    setState((prev: any) => ({
      ...prev,
      messages: prev.messages.map((m: Message) => ({ ...m, read: true }))
    }));
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

  const handleAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeChatUser) return;
    onSendMessage(replyText, true, activeChatUser);
    setReplyText('');
  };

  const filteredUsers = state.users.filter(u => 
    u.username.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const selectedUser = state.users.find(u => u.id === selectedUserId);
  const selectedUserTransactions = state.transactions.filter(t => t.userId === selectedUserId);

  const userConversations = Array.from(new Set(state.messages.map(m => m.userId))).map(uid => {
    const userMessages = state.messages.filter(m => m.userId === uid);
    return {
      userId: uid,
      username: state.users.find(u => u.id === uid)?.username || 'Unknown',
      lastMessage: userMessages[userMessages.length - 1],
      unreadCount: userMessages.filter(m => !m.read && !m.isAdmin).length
    };
  }).sort((a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime());

  return (
    <div className="min-h-screen bg-[#050505] p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Authority Console</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Level 7 Root Access Integrated</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setShowAdminAlerts(true); markAlertsAsRead(); }}
            className="relative w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all"
          >
            <i className="fas fa-bolt"></i>
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-black text-[10px] font-black flex items-center justify-center rounded-full animate-pulse">
                {unreadAlertsCount}
              </span>
            )}
          </button>
          <div className="flex bg-white/5 border border-white/5 rounded-2xl p-1 overflow-x-auto no-scrollbar">
            {(['analytics', 'transactions', 'tracks', 'users', 'support', 'settings'] as AdminTab[]).map(tab => (
              <button 
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'support') markMessagesAsRead();
                }}
                className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap relative ${activeTab === tab ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-gray-500 hover:text-white'}`}
              >
                {tab}
                {tab === 'support' && unreadMessagesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#050505]"></span>
                )}
              </button>
            ))}
          </div>
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
           <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-[2rem] px-6 py-4">
              <i className="fas fa-search text-gray-500"></i>
              <input 
                type="text" 
                placeholder="Search user profile..." 
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-white text-sm font-bold w-full"
              />
           </div>
           <div className="glass-card rounded-[3rem] border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="text-[9px] font-black text-gray-600 uppercase tracking-widest border-b border-white/5 bg-black/40">
                       <tr>
                          <th className="p-8">Digital Identity</th>
                          <th className="p-8">Asset Holding</th>
                          <th className="p-8 text-right">Terminal Actions</th>
                       </tr>
                    </thead>
                    <tbody className="text-[11px] font-black">
                       {filteredUsers.map(u => (
                          <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 group cursor-pointer" onClick={() => setSelectedUserId(u.id)}>
                             <td className="p-8">
                                <p className="text-white uppercase italic text-sm group-hover:text-green-500 transition-colors">{u.username}</p>
                                <p className="text-[10px] text-gray-600 font-medium mt-0.5">{u.email}</p>
                             </td>
                             <td className="p-8">
                                <p className="text-xl font-black text-white">${u.balanceUSD.toFixed(2)}</p>
                             </td>
                             <td className="p-8 text-right space-x-2">
                                <button onClick={(e) => { e.stopPropagation(); setSelectedUserId(u.id); }} className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-all text-[8px] font-black uppercase tracking-widest">Open Profile</button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {selectedUserId && selectedUser && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-6 backdrop-blur-2xl animate-in fade-in duration-300">
            <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto no-scrollbar p-10 md:p-14 rounded-[4rem] border border-white/10 relative">
               <button onClick={() => setSelectedUserId(null)} className="absolute top-10 right-10 text-gray-500 hover:text-white"><i className="fas fa-times text-2xl"></i></button>
               
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                  <div>
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">@{selectedUser.username}</h2>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{selectedUser.email} • ID: {selectedUser.id}</p>
                  </div>
                  <div className="flex gap-2">
                     <button 
                       onClick={() => toggleWithdrawalControl(selectedUser.id)}
                       className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedUser.withdrawalEnabled ? 'bg-green-500 text-black border-transparent shadow-lg' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
                     >
                       Payouts: {selectedUser.withdrawalEnabled ? 'ENABLED' : 'LOCKED'}
                     </button>
                     <button onClick={() => adjustBalance(selectedUser.id)} className="bg-white/5 hover:bg-white hover:text-black text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all">Adjust Bal</button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {showAdminAlerts && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-6 backdrop-blur-2xl animate-in fade-in duration-300">
            <div className="glass-card max-w-lg w-full p-10 rounded-[3rem] border border-white/10 relative">
               <button onClick={() => setShowAdminAlerts(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white"><i className="fas fa-times"></i></button>
               <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Authority Alerts</h3>
               <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-8">Recent network events requiring attention.</p>
               <div className="space-y-4 max-h-[50vh] overflow-y-auto no-scrollbar pr-2">
                 {state.adminNotifications.map(n => (
                   <div key={n.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1">
                     <div className="flex items-center gap-2">
                       <i className={`fas ${n.type === 'WITHDRAWAL_REQUEST' ? 'fa-wallet text-blue-500' : n.type === 'NEW_MESSAGE' ? 'fa-comment text-green-500' : 'fa-bolt text-yellow-500'} text-xs`}></i>
                       <p className="text-white font-black text-xs uppercase tracking-tight italic">{n.title}</p>
                     </div>
                     <p className="text-gray-400 text-[10px] leading-relaxed">{n.message}</p>
                     <p className="text-[8px] text-gray-600 font-black pt-1 uppercase">{new Date(n.timestamp).toLocaleString()}</p>
                   </div>
                 ))}
               </div>
            </div>
         </div>
      )}

      {activeTab === 'support' && (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500 min-h-[600px]">
            <div className="lg:col-span-1 space-y-6">
               <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">Conversations</h3>
                  <button onClick={clearMessages} className="text-red-500 text-[9px] font-black uppercase tracking-widest hover:underline">Reset</button>
               </div>
               <div className="glass-card rounded-[2rem] border border-white/5 overflow-hidden flex flex-col max-h-[600px]">
                  <div className="overflow-y-auto no-scrollbar flex-grow">
                     {userConversations.map(conv => (
                        <div key={conv.userId} onClick={() => setActiveChatUser(conv.userId)} className={`p-6 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5 ${activeChatUser === conv.userId ? 'bg-white/5 border-r-4 border-r-blue-500' : ''}`}>
                           <span className="text-[11px] font-black text-white uppercase italic">@{conv.username}</span>
                           <p className="text-[10px] text-gray-500 font-medium truncate italic mt-1">"{conv.lastMessage.text}"</p>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
            <div className="lg:col-span-2 flex flex-col glass-card rounded-[3rem] border border-white/5 overflow-hidden">
               {activeChatUser ? (
                  <>
                     <div className="flex-grow overflow-y-auto no-scrollbar p-6 space-y-4 max-h-[400px]">
                        {state.messages.filter(m => m.userId === activeChatUser).map(m => (
                           <div key={m.id} className={`flex flex-col ${m.isAdmin ? 'items-end' : 'items-start'}`}>
                              <div className={`max-w-[80%] p-4 rounded-3xl text-[12px] font-bold ${m.isAdmin ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-300'}`}>
                                 {m.text}
                              </div>
                           </div>
                        ))}
                        <div ref={chatEndRef} />
                     </div>
                     <form onSubmit={handleAdminReply} className="p-6 border-t border-white/5 bg-black/40 flex gap-3">
                        <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-xs" placeholder="Reply..." />
                        <button type="submit" className="bg-white text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase">Send</button>
                     </form>
                  </>
               ) : <div className="flex-grow flex items-center justify-center opacity-20">Select a conversation</div>}
            </div>
         </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 gap-8 animate-in fade-in duration-500 pb-20">
           <div className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Global Terminal Config</h3>
                <div className="flex gap-2">
                   <button 
                     onClick={broadcastAnnouncement} 
                     className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-500 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                   >
                     <i className="fas fa-bullhorn"></i> Broadcast Subject + Talk
                   </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase font-black">Announcement Subject</label>
                    <input type="text" value={settingsForm.announcementSubject} onChange={e => setSettingsForm({...settingsForm, announcementSubject: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" placeholder="Subject Title..." />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase font-black">Official Telegram Link</label>
                    <input type="text" value={settingsForm.telegramChannel} onChange={e => setSettingsForm({...settingsForm, telegramChannel: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" placeholder="https://t.me/..." />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] text-gray-500 uppercase font-black">Announcement Talk (Content)</label>
                 <textarea value={settingsForm.announcementContent} onChange={e => setSettingsForm({...settingsForm, announcementContent: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold h-32" placeholder="Talk content..."></textarea>
                 <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-1">Note: Broadcasting will send this talk to every user's private notification vault.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase font-black">USD/NGN Rate</label>
                    <input type="number" value={settingsForm.usdToNgnRate} onChange={e => setSettingsForm({...settingsForm, usdToNgnRate: parseFloat(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase font-black">Min Withdrawal (NGN)</label>
                    <input type="number" value={settingsForm.minWithdrawalNGN} onChange={e => setSettingsForm({...settingsForm, minWithdrawalNGN: parseFloat(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase font-black">Withdrawal Open</label>
                    <select value={settingsForm.isWithdrawalOpen ? 'true' : 'false'} onChange={e => setSettingsForm({...settingsForm, isWithdrawalOpen: e.target.value === 'true'})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold h-[58px]">
                       <option value="true" className="bg-black">Open</option>
                       <option value="false" className="bg-black">Closed</option>
                    </select>
                 </div>
              </div>

              <button onClick={() => onUpdateSettings(settingsForm)} className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-500 transition-all shadow-xl">Update System Settings</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
