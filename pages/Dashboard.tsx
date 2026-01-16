
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, AppSettings, Transaction, PublicChatMessage, PlanTier } from '../types';

interface DashboardProps {
  user: User;
  settings: AppSettings;
  transactions: Transaction[];
  onClaimDaily: () => void;
  onSendMessage: (text: string, isAdmin?: boolean) => void;
  onSendPublicMessage: (text: string) => void;
  onClearNotifications: () => void;
  messages: any[];
  publicChat: PublicChatMessage[];
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, settings, onSendPublicMessage, publicChat 
}) => {
  const navigate = useNavigate();
  const [chatMsg, setChatMsg] = useState('');
  const [showChat, setShowChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [onlineUsers] = useState(Math.floor(Math.random() * 100) + 412);

  useEffect(() => {
    if (showChat) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [publicChat, showChat]);

  const handleCopyRef = () => {
    const link = `${window.location.origin}/#/signup?ref=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    alert('Referral ID Secured!');
  };

  const platforms = [
    { name: 'Spotify', icon: 'fab fa-spotify', color: 'text-green-500', cat: 'Spotify' },
    { name: 'Boomplay', icon: 'fas fa-play', color: 'text-blue-500', cat: 'Boomplay' },
    { name: 'Audiomack', icon: 'fas fa-wave-square', color: 'text-orange-500', cat: 'Audiomack' },
    { name: 'Apple Music', icon: 'fab fa-apple', color: 'text-red-500', cat: 'Apple Music' }
  ];

  const menuItems = [
    { label: 'Earn', icon: 'fas fa-headphones', path: '/listen', color: 'bg-green-600' },
    { label: 'Boost', icon: 'fas fa-bolt', path: '/activation', color: 'bg-yellow-600' },
    { label: 'Payout', icon: 'fas fa-wallet', path: '/withdraw', color: 'bg-blue-600' },
    { label: 'System', icon: 'fas fa-cog', path: '/settings', color: 'bg-gray-700' },
  ];

  const handleOpenChat = () => {
    if (user.plan !== PlanTier.PREMIUM) {
      alert("UPGRADE REQUIRED: The Community Hub is an encrypted space for PREMIUM members only. Boost your rank to join.");
      return;
    }
    setShowChat(true);
  };

  return (
    <div className="flex-grow pb-32 px-5 pt-4 w-full space-y-6 page-enter">
      
      {/* Ticker Board */}
      <div className="bg-red-600/10 border border-red-600/20 rounded-2xl p-3 flex items-center gap-3 overflow-hidden shadow-lg shadow-red-600/5">
         <div className="bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest animate-pulse shrink-0 italic">NETWORK</div>
         <marquee className="text-white text-[10px] font-bold uppercase tracking-wider italic">
            {settings.announcementSubject}: {settings.announcementContent} — PAYOUT STATUS: {settings.isWithdrawalOpen ? 'ONLINE' : 'LOCKED'} — SCHEDULE: {settings.withdrawalSchedule} — MINIMUM: ${settings.minWithdrawalUSD.toFixed(2)} —
         </marquee>
      </div>

      {/* Profile/Wallet Card */}
      <div className="glass-card p-7 rounded-[2.8rem] border border-white/10 relative overflow-hidden shadow-2xl bg-gradient-to-br from-white/5 to-transparent">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
          <i className="fas fa-network-wired text-8xl rotate-12"></i>
        </div>
        <div className="relative z-10 flex items-center gap-4 mb-8">
           <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-black shadow-xl shadow-green-500/20 transform -rotate-2">
              <i className="fas fa-headphones text-3xl"></i>
           </div>
           <div>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none mb-1.5 truncate max-w-[180px]">{user.username}</h1>
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-sm shadow-green-500/50"></span>
                 <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-lg ${user.plan === PlanTier.PREMIUM ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'bg-white/10 text-gray-400'}`}>
                   {user.plan} NODE
                 </span>
              </div>
           </div>
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
           <div className="space-y-1">
              <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em]">Global Wallet</p>
              <h2 className="text-3xl font-black text-white tracking-tighter leading-none">${user.balanceUSD.toFixed(2)}</h2>
           </div>
           <div className="text-right space-y-1">
              <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em]">Settlement</p>
              <h2 className="text-xl font-black text-green-500 tracking-tighter leading-none">₦{(user.balanceUSD * settings.usdToNgnRate).toLocaleString()}</h2>
           </div>
        </div>
      </div>

      {/* Menu Grid - Android Style */}
      <div className="grid grid-cols-4 gap-3">
        {menuItems.map((item) => (
          <button 
            key={item.label} 
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-2 android-touch group"
          >
            <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-white text-xl shadow-2xl border border-white/10`}>
              <i className={item.icon}></i>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Community Access */}
      <button 
        onClick={handleOpenChat}
        className={`w-full p-4.5 rounded-[2.5rem] flex items-center justify-between shadow-2xl active:scale-95 transition-all group border ${
          user.plan === PlanTier.PREMIUM ? 'bg-blue-600 border-blue-400/20' : 'bg-white/5 border-white/5'
        }`}
      >
        <div className="flex items-center gap-3">
           <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-inner ${
             user.plan === PlanTier.PREMIUM ? 'bg-white/20' : 'bg-white/10'
           }`}>
              <i className="fas fa-earth-africa text-xl"></i>
           </div>
           <div className="text-left">
              <h3 className={`font-black uppercase italic tracking-tighter text-sm ${
                user.plan === PlanTier.PREMIUM ? 'text-white' : 'text-gray-500'
              }`}>Community Hub</h3>
              <p className={`text-[8px] font-black uppercase tracking-widest ${
                user.plan === PlanTier.PREMIUM ? 'text-white/60' : 'text-gray-700'
              }`}>{onlineUsers} Nodes Synchronized</p>
           </div>
        </div>
        <div className="flex items-center gap-2 px-3">
           {user.plan !== PlanTier.PREMIUM && <i className="fas fa-lock text-[11px] text-gray-700"></i>}
           <i className="fas fa-chevron-right text-white/30 group-hover:text-white transition-all text-sm"></i>
        </div>
      </button>

      {/* Platforms Section */}
      <div className="space-y-4">
         <div className="flex items-center justify-between px-3">
            <h3 className="text-[10px] text-gray-700 font-black uppercase tracking-[0.4em]">Mining Infrastructure</h3>
            <span className="text-[8px] text-green-500 font-black uppercase tracking-widest bg-green-500/10 px-2 py-0.5 rounded shadow-sm">Syncing...</span>
         </div>
         <div className="grid grid-cols-2 gap-3.5">
            {platforms.map(p => (
              <button 
                key={p.name}
                onClick={() => navigate(`/listen?cat=${p.cat}`)}
                className="glass-card p-5 rounded-[2.2rem] border border-white/5 flex flex-col items-center gap-3.5 android-touch shadow-xl hover:bg-white/5 transition-all"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 shadow-inner">
                   <i className={`${p.icon} ${p.color} text-4xl`}></i>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white">{p.name}</span>
              </button>
            ))}
         </div>
      </div>

      {/* Affiliate Section */}
      <div className="glass-card p-5 rounded-[2rem] border border-white/10 flex items-center justify-between bg-black/40 shadow-2xl">
         <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-purple-600/15 rounded-2xl flex items-center justify-center text-purple-500 shadow-xl border border-purple-500/10">
               <i className="fas fa-share-nodes text-lg"></i>
            </div>
            <div>
               <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1">Referral Node</p>
               <h4 className="text-white font-black text-xs uppercase italic tracking-tighter">{user.referralCode}</h4>
            </div>
         </div>
         <button onClick={handleCopyRef} className="bg-white text-black px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-green-500 active:scale-95 transition-all shadow-xl">Copy ID</button>
      </div>

      {/* Global Community Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col page-enter">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/80">
            <div className="flex items-center gap-3">
               <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-2xl border border-blue-400/20">
                  <i className="fas fa-globe text-xl"></i>
               </div>
               <div>
                  <h3 className="text-white font-black uppercase italic tracking-tight text-sm">Earner Mainframe</h3>
                  <p className="text-[9px] text-green-500 font-black uppercase tracking-widest">{onlineUsers} Nodes Linked</p>
               </div>
            </div>
            <button onClick={() => setShowChat(false)} className="w-11 h-11 bg-white/5 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-all active:scale-90 shadow-xl">
               <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto no-scrollbar p-5 space-y-4.5">
            {publicChat.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-10 text-center space-y-5 grayscale">
                <i className="fas fa-comments text-8xl"></i>
                <p className="text-[11px] font-black uppercase tracking-widest">Protocol is silent. Broadcast your earnings.</p>
              </div>
            ) : publicChat.map(m => (
              <div key={m.id} className="animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 mb-1.5 px-1">
                   <span className="bg-yellow-500 text-black text-[7px] font-black uppercase px-2 py-0.5 rounded shadow-sm">PREMIUM</span>
                   <span className="text-[10px] font-black text-white italic tracking-tight">@{m.username}</span>
                </div>
                <div className="bg-white/5 p-4.5 rounded-[2rem] rounded-tl-none border border-white/5 text-[11.5px] text-gray-300 font-medium leading-relaxed shadow-xl">
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-6 bg-black/90 border-t border-white/10 pb-14 shadow-2xl">
            <form onSubmit={(e) => { e.preventDefault(); if(chatMsg.trim()){ onSendPublicMessage(chatMsg); setChatMsg(''); } }} className="flex gap-2.5">
              <input type="text" value={chatMsg} onChange={e => setChatMsg(e.target.value)} className="flex-grow bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-4 text-white text-xs font-bold outline-none focus:border-blue-500 transition-all shadow-inner" placeholder="Type into the mainframe..." />
              <button type="submit" className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 transition-all border border-black/10">
                <i className="fas fa-paper-plane text-lg"></i>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
