
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
  const [onlineUsers] = useState(Math.floor(Math.random() * 50) + 168);

  useEffect(() => {
    if (showChat) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [publicChat, showChat]);

  const handleCopyRef = () => {
    const link = `${window.location.origin}/#/signup?ref=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    alert('Referral link copied!');
  };

  const platforms = [
    { name: 'Spotify', icon: 'fab fa-spotify', color: 'text-[#1DB954]', cat: 'Spotify' },
    { name: 'Boomplay', icon: 'fas fa-play', color: 'text-[#00C2FF]', cat: 'Boomplay' },
    { name: 'Audiomack', icon: 'fas fa-wave-square', color: 'text-[#FFA200]', cat: 'Audiomack' },
    { name: 'Apple Music', icon: 'fab fa-apple', color: 'text-[#FC3C44]', cat: 'Apple Music' }
  ];

  const menuItems = [
    { label: 'Earn', icon: 'fas fa-headphones', path: '/listen', color: 'bg-green-500' },
    { label: 'Upgrade', icon: 'fas fa-bolt', path: '/activation', color: 'bg-yellow-500' },
    { label: 'Withdraw', icon: 'fas fa-wallet', path: '/withdraw', color: 'bg-blue-500' },
    { label: 'Settings', icon: 'fas fa-cog', path: '/settings', color: 'bg-gray-600' },
  ];

  const handleOpenChat = () => {
    if (user.plan !== PlanTier.PREMIUM) {
      alert("COMMUNITY ACCESS: This encrypted channel is exclusive to PREMIUM Tier members. Upgrade your account to join the conversation.");
      return;
    }
    setShowChat(true);
  };

  return (
    <div className="flex-grow pb-32 px-4 pt-6 max-w-md mx-auto w-full space-y-6">
      
      {/* Breaking News Ticker */}
      <div className="bg-red-600/10 border border-red-600/30 rounded-2xl p-3 flex items-center gap-3 overflow-hidden shadow-lg">
         <div className="bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded uppercase animate-pulse shrink-0">Protocol</div>
         <marquee className="text-white text-[11px] font-bold uppercase tracking-wider italic">
            {settings.announcementSubject}: {settings.announcementContent} — PAYOUT SCHEDULE: {settings.withdrawalSchedule || 'Processing Active'} — JOIN OUR TELEGRAM FOR INSTANT SUPPORT — 
         </marquee>
      </div>

      {/* Hero Profile Card */}
      <div className="glass-card p-6 rounded-[2.5rem] border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex items-center gap-4 mb-4">
           <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-black border border-white/10 shadow-lg rotate-3">
              <i className="fas fa-headphones text-2xl"></i>
           </div>
           <div>
              <h1 className="text-xl font-black italic uppercase tracking-tighter text-white leading-none mb-1 truncate max-w-[150px]">{user.username}</h1>
              <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded ${user.plan === PlanTier.PREMIUM ? 'bg-yellow-500 text-black' : 'bg-green-500/20 text-green-500'}`}>
                {user.plan} ID
              </span>
           </div>
        </div>
        <div className="relative z-10 grid grid-cols-1 gap-2 border-t border-white/5 pt-4">
           <div className="flex justify-between items-center">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Global Wallet</p>
              <h2 className="text-2xl font-black text-white tracking-tighter">${user.balanceUSD.toFixed(2)}</h2>
           </div>
           <div className="flex justify-between items-center">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Local Settlement</p>
              <h2 className="text-lg font-black text-green-500 tracking-tighter">₦{(user.balanceUSD * settings.usdToNgnRate).toLocaleString()}</h2>
           </div>
        </div>
      </div>

      {/* Main Menu Grid */}
      <div className="grid grid-cols-4 gap-2">
        {menuItems.map((item) => (
          <button 
            key={item.label} 
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-2 android-touch group"
          >
            <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-${item.color.split('-')[1]}-500/20`}>
              <i className={item.icon}></i>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Global Chat Button */}
      <button 
        onClick={handleOpenChat}
        className={`w-full p-4 rounded-3xl flex items-center justify-between shadow-2xl active:scale-95 transition-all group ${
          user.plan === PlanTier.PREMIUM ? 'bg-blue-600' : 'bg-white/5 border border-white/10'
        }`}
      >
        <div className="flex items-center gap-3">
           <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
             user.plan === PlanTier.PREMIUM ? 'bg-white/20' : 'bg-white/10'
           }`}>
              <i className="fas fa-comments"></i>
           </div>
           <div className="text-left">
              <h3 className={`font-black uppercase italic tracking-tighter text-sm ${
                user.plan === PlanTier.PREMIUM ? 'text-white' : 'text-gray-400'
              }`}>Community Lounge</h3>
              <p className="text-[9px] text-white/50 font-black uppercase tracking-widest">{onlineUsers} Active Nodes</p>
           </div>
        </div>
        <div className="flex items-center gap-2">
           {user.plan !== PlanTier.PREMIUM && <i className="fas fa-lock text-[10px] text-gray-600"></i>}
           <i className="fas fa-chevron-right text-white/50 text-sm"></i>
        </div>
      </button>

      {/* Platform Grid */}
      <div className="space-y-3">
         <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] ml-2">Verified Networks</h3>
         <div className="grid grid-cols-2 gap-3">
            {platforms.map(p => (
              <button 
                key={p.name}
                onClick={() => navigate(`/listen?cat=${p.cat}`)}
                className="glass-card p-5 rounded-3xl border border-white/5 flex flex-col items-center gap-3 android-touch shadow-lg"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 ${p.color}`}>
                   <i className={`${p.icon} text-3xl`}></i>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-white">{p.name}</span>
              </button>
            ))}
         </div>
      </div>

      {/* Referral Link Node */}
      <div className="glass-card p-5 rounded-[2rem] border border-white/10 flex items-center justify-between bg-black/40">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
               <i className="fas fa-link"></i>
            </div>
            <div>
               <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-0.5">Invite Partner</p>
               <h4 className="text-white font-black text-xs uppercase italic tracking-tighter">{user.referralCode}</h4>
            </div>
         </div>
         <button onClick={handleCopyRef} className="bg-white text-black px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-500 transition-all active:scale-90">Copy</button>
      </div>

      {/* Chat Room Overlay */}
      {showChat && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl animate-in slide-in-from-bottom-10 duration-500 flex flex-col">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/60">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                  <i className="fas fa-globe"></i>
               </div>
               <div>
                  <h3 className="text-white font-black uppercase italic tracking-tight text-sm">Encrypted Lounge</h3>
                  <p className="text-[9px] text-green-500 font-black uppercase tracking-widest">{onlineUsers} Online</p>
               </div>
            </div>
            <button onClick={() => setShowChat(false)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-all">
               <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto no-scrollbar p-5 space-y-4">
            {publicChat.map(m => (
              <div key={m.id} className="animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 mb-1">
                   <span className="bg-yellow-500 text-black text-[7px] font-black uppercase px-1.5 py-0.5 rounded">PREMIUM</span>
                   <span className="text-[9px] font-black text-white italic">@{m.username}</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5 text-[11px] text-gray-300 font-medium">
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-6 bg-black/80 border-t border-white/10 pb-10">
            <form onSubmit={(e) => { e.preventDefault(); if(chatMsg.trim()){ onSendPublicMessage(chatMsg); setChatMsg(''); } }} className="flex gap-2">
              <input type="text" value={chatMsg} onChange={e => setChatMsg(e.target.value)} className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white text-xs font-bold outline-none focus:border-blue-500" placeholder="Type message..." />
              <button type="submit" className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 transition-all">
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
