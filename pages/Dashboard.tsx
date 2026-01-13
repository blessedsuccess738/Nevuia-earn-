
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, AppSettings, Transaction, AccountStatus, Message } from '../types';
import { PLAN_DETAILS } from '../constants';

interface DashboardProps {
  user: User;
  settings: AppSettings;
  transactions: Transaction[];
  onClaimDaily: () => void;
  onSendMessage: (text: string, isAdmin?: boolean) => void;
  onClearNotifications: () => void;
  messages: Message[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, settings, transactions, onClaimDaily, onSendMessage, onClearNotifications, messages }) => {
  const [supportMsg, setSupportMsg] = useState('');
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const ngnBalance = user.balanceUSD * settings.usdToNgnRate;
  const userTransactions = transactions.filter(t => t.userId === user.id);
  const plan = PLAN_DETAILS[user.plan];
  const limitStr = plan.songLimit === Infinity ? 'Unlimited' : plan.songLimit.toString();
  const remainingSongs = plan.songLimit === Infinity ? '∞' : Math.max(0, plan.songLimit - user.songsListenedToday);
  
  const today = new Date().toDateString();
  const canClaimDaily = user.lastDailyRewardClaimed !== today;

  const myMessages = messages.filter(m => m.userId === user.id);

  useEffect(() => {
    if (showSupportModal) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showSupportModal, myMessages]);

  const handleSubmitSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMsg.trim()) return;
    onSendMessage(supportMsg);
    setSupportMsg('');
  };

  if (settings.maintenanceMode && user.email !== 'blessedsuccess738@gmail.com') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-500">
         <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mb-8 text-yellow-500 text-4xl border border-yellow-500/20">
            <i className="fas fa-tools"></i>
         </div>
         <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Under Maintenance</h1>
         <p className="text-gray-500 max-w-md mx-auto uppercase text-[10px] font-black tracking-widest leading-loose">
            The platform is currently undergoing scheduled optimization. All balances are safe and secure. Please check back in a few hours.
         </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24 relative">
      
      {/* Floating Buttons */}
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[60] flex flex-col gap-4">
        <button 
          onClick={() => setShowSupportModal(true)}
          className="relative group w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl shadow-[0_10px_40px_rgba(59,130,246,0.5)] hover:scale-110 active:scale-90 transition-all"
        >
          <div className="absolute -top-12 right-0 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
            Live In-App Chat
          </div>
          <i className="fas fa-comment-dots"></i>
          {myMessages.filter(m => !m.read && m.isAdmin).length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-black">!</span>
          )}
        </button>

        <a 
          href={settings.whatsappLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="relative group w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-black text-2xl shadow-[0_10px_40px_rgba(34,197,94,0.5)] hover:scale-110 active:scale-90 transition-all"
        >
          <div className="absolute -top-12 right-0 bg-green-500 text-black text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
            Chat WhatsApp Admin
          </div>
          <i className="fab fa-whatsapp"></i>
        </a>
      </div>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Hello, {user.username}</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest leading-none mt-2">Verified Network Earner</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setShowNotifications(true); }}
            className="relative px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white transition-all group"
          >
            <i className="fas fa-bell"></i>
            {user.notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-black text-[8px] font-black flex items-center justify-center rounded-full animate-bounce">
                {user.notifications.length}
              </span>
            )}
          </button>
          <div className="px-4 py-2 rounded-xl border border-white/10 text-[10px] font-black bg-white/5 flex items-center gap-2">
            <i className="fas fa-crown text-yellow-500"></i>
            {plan.name}
          </div>
          <div className={`px-4 py-2 rounded-xl border text-[10px] font-black flex items-center gap-2 ${
            user.status === AccountStatus.ACTIVATED ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-yellow-500 text-yellow-500 bg-yellow-500/10'
          }`}>
            <i className={`fas ${user.status === AccountStatus.ACTIVATED ? 'fa-check-circle' : 'fa-lock'}`}></i>
            {user.status === AccountStatus.ACTIVATED ? 'ACTIVE' : 'LOCKED'}
          </div>
        </div>
      </header>

      {/* Breaking News Announcement Section */}
      {(settings.announcementSubject || settings.announcementContent) && (
        <div className="glass-card p-6 md:p-10 rounded-[3rem] border-l-8 border-l-green-500 border border-white/5 bg-gradient-to-br from-green-500/5 to-transparent relative overflow-hidden group shadow-2xl animate-in slide-in-from-left duration-700">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-40 transition-all duration-1000 rotate-12 scale-150">
            <i className="fas fa-newspaper text-8xl"></i>
          </div>
          <div className="flex items-center gap-4 mb-6">
             <div className="flex h-3 w-3 relative">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></div>
                <div className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></div>
             </div>
             <span className="text-[12px] font-black bg-red-600 text-white px-4 py-1.5 rounded-lg uppercase tracking-[0.2em] shadow-lg shadow-red-600/20">Breaking News</span>
             <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          
          <div className="space-y-4 relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">{settings.announcementSubject}</h2>
            <div className="h-2 w-32 bg-green-500 rounded-full"></div>
            <p className="text-gray-300 text-base md:text-xl font-medium leading-relaxed uppercase tracking-tight max-w-5xl pt-4">
              {settings.announcementContent}
            </p>
          </div>

          <div className="mt-10 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
             <div className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <i className="fas fa-user-shield text-green-500"></i>
                </div>
                Authorized Network Broadcast
             </div>
             <div className="flex gap-2">
                <a href={settings.telegramChannel} target="_blank" rel="noopener" className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all">Read More on Telegram</a>
             </div>
          </div>
        </div>
      )}

      {/* Daily Reward Banner */}
      {canClaimDaily && !settings.maintenanceMode && (
        <div className="bg-gradient-to-r from-green-500/20 to-blue-500/10 border border-green-500/20 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
                 <i className="fas fa-gift text-black text-xl"></i>
              </div>
              <div>
                 <h4 className="text-white font-black text-sm uppercase italic">Loyalty Reward Ready</h4>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Claim your daily check-in bonus of ${settings.dailyRewardUSD}.</p>
              </div>
           </div>
           <button 
             onClick={onClaimDaily}
             className="bg-green-500 text-black px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-green-500/20"
           >
             Redeem Now
           </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-[2rem] border border-white/5">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-widest">Available Payout</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-black text-white">${user.balanceUSD.toFixed(2)}</h2>
          </div>
          <p className="text-green-500 text-[10px] font-black mt-1 uppercase italic">≈ ₦{ngnBalance.toLocaleString()}</p>
        </div>

        <div className="glass-card p-6 rounded-[2rem] border border-white/5">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-widest">Listening Limit</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-black text-white">{remainingSongs} <span className="text-gray-500 text-sm">/ {limitStr}</span></h2>
          </div>
          <p className="text-blue-500 text-[10px] font-black mt-1 uppercase tracking-widest italic leading-none">Refreshes in 24h</p>
        </div>

        <div className="glass-card p-6 rounded-[2rem] border border-white/5">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-widest">Referral Yield</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-black text-white">${user.referralEarningsUSD.toFixed(2)}</h2>
          </div>
          <p className="text-purple-500 text-[10px] font-black mt-1 uppercase tracking-widest italic">{user.referralsCount} Verified Signups</p>
        </div>

        <div className="glass-card p-6 rounded-[2rem] border border-white/5">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-widest">Gateway Status</p>
          <div className="flex items-baseline gap-2">
            <h2 className={`text-xl font-black ${settings.isWithdrawalOpen ? 'text-green-500' : 'text-red-500'}`}>
              {settings.isWithdrawalOpen ? 'OPEN' : 'LOCKED'}
            </h2>
          </div>
          <p className="text-gray-500 text-[9px] font-bold mt-1 uppercase leading-tight italic">
            {settings.withdrawalSchedule}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/listen" className="flex flex-col items-center justify-center p-8 glass-card rounded-3xl border border-white/5 hover:border-green-500/50 hover:bg-green-500/5 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <i className="fas fa-play text-green-500 text-xl"></i>
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-white">Earn Audio</span>
        </Link>
        <Link to="/activation" className="flex flex-col items-center justify-center p-8 glass-card rounded-3xl border border-white/5 hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <i className="fas fa-bolt text-yellow-500 text-xl"></i>
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-white">Upgrade Plan</span>
        </Link>
        <Link to="/withdraw" className="flex flex-col items-center justify-center p-8 glass-card rounded-3xl border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <i className="fas fa-wallet text-blue-500 text-xl"></i>
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-white">Payout Hub</span>
        </Link>
        <button onClick={() => setShowSupportModal(true)} className="flex flex-col items-center justify-center p-8 glass-card rounded-3xl border border-white/5 hover:border-red-500/50 hover:bg-red-500/5 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <i className="fas fa-headset text-red-500 text-xl"></i>
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-white">Live Chat</span>
        </button>
      </div>

      <div className="glass-card rounded-[3rem] p-8 border border-white/5">
        <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8">Transaction Log</h3>
        {userTransactions.length === 0 ? (
          <div className="text-center py-20 opacity-30 italic">
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">No ledger entries found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600 text-[9px] uppercase tracking-[0.3em] border-b border-white/5 font-black">
                  <th className="pb-6">Movement</th>
                  <th className="pb-6">Value</th>
                  <th className="pb-6">Status</th>
                  <th className="pb-6">Finalized</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-black">
                {userTransactions.map(txn => (
                  <tr key={txn.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="py-6 text-white uppercase tracking-tighter italic">{txn.type}</td>
                    <td className="py-6 text-green-500 font-bold">+${txn.amountUSD.toFixed(2)}</td>
                    <td className="py-6">
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        txn.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        txn.status === 'PROCESSING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                        'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="py-6 text-gray-500 tracking-widest uppercase">{new Date(txn.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Support Chat Modal */}
      {showSupportModal && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-6 backdrop-blur-2xl animate-in fade-in duration-300">
            <div className="glass-card max-w-2xl w-full h-[80vh] flex flex-col rounded-[3rem] border border-white/10 relative overflow-hidden shadow-2xl">
               <div className="p-6 md:p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-lg">
                        <i className="fas fa-headset"></i>
                     </div>
                     <div>
                        <h3 className="text-lg font-black uppercase italic tracking-tighter text-white">Live Support</h3>
                        <p className="text-[9px] text-green-500 font-black uppercase tracking-widest">Admin Team Online</p>
                     </div>
                  </div>
                  <button onClick={() => setShowSupportModal(false)} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                     <i className="fas fa-times"></i>
                  </button>
               </div>

               <div className="flex-grow overflow-y-auto no-scrollbar p-6 space-y-4">
                  {myMessages.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30 px-10">
                        <i className="fas fa-comments text-5xl"></i>
                        <p className="text-xs font-black uppercase tracking-widest">Initialize a secure terminal by sending your first message.</p>
                     </div>
                  ) : (
                     myMessages.map(m => (
                        <div key={m.id} className={`flex flex-col ${m.isAdmin ? 'items-start' : 'items-end'} animate-in fade-in slide-in-from-bottom-2`}>
                           <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium ${
                              m.isAdmin ? 'bg-white/10 text-gray-200 rounded-bl-none border border-white/5' : 'bg-blue-600 text-white rounded-br-none shadow-lg'
                           }`}>
                              {m.text}
                           </div>
                           <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-1 px-2">
                              {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                        </div>
                     ))
                  )}
                  <div ref={chatEndRef} />
               </div>

               <div className="p-6 md:p-8 bg-black/50 border-t border-white/5">
                  <form onSubmit={handleSubmitSupport} className="flex gap-3">
                     <input 
                       type="text" 
                       value={supportMsg} 
                       onChange={e => setSupportMsg(e.target.value)}
                       required
                       className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold text-sm outline-none focus:border-blue-500 transition-all"
                       placeholder="Message support staff..."
                     />
                     <button type="submit" className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-xl active:scale-90">
                        <i className="fas fa-paper-plane text-lg"></i>
                     </button>
                  </form>
               </div>
            </div>
         </div>
      )}

      {/* Notifications Modal */}
      {showNotifications && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-6 backdrop-blur-2xl animate-in fade-in duration-300">
            <div className="glass-card max-w-lg w-full p-10 rounded-[3rem] border border-white/10 relative">
               <button onClick={() => { setShowNotifications(false); onClearNotifications(); }} className="absolute top-8 right-8 text-gray-500 hover:text-white"><i className="fas fa-times"></i></button>
               <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Network Alerts</h3>
               <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-8">Updates on your activity.</p>
               
               <div className="space-y-4 max-h-[50vh] overflow-y-auto no-scrollbar pr-2">
                 {user.notifications.length === 0 ? (
                    <div className="py-20 text-center opacity-20 uppercase font-black tracking-widest text-[10px]">No new alerts.</div>
                 ) : (
                    user.notifications.map(n => (
                      <div key={n.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1">
                        <p className="text-white font-black text-xs uppercase tracking-tight italic">{n.title}</p>
                        <p className="text-gray-400 text-[10px] leading-relaxed">{n.message}</p>
                        <p className="text-[8px] text-gray-600 font-black pt-1 uppercase">{new Date(n.timestamp).toLocaleString()}</p>
                      </div>
                    ))
                 )}
               </div>
               
               <button 
                onClick={() => { setShowNotifications(false); onClearNotifications(); }}
                className="w-full bg-white text-black font-black py-4 rounded-xl uppercase tracking-widest text-xs mt-8 shadow-xl active:scale-95 transition-all"
               >
                 Close & Dismiss
               </button>
            </div>
         </div>
      )}
    </div>
  );
};

export default Dashboard;
